import * as FileSystem from 'expo-file-system/legacy';
import * as Crypto from 'expo-crypto';
import * as DocumentPicker from 'expo-document-picker';
import { BookFormat } from '../../types';
import { getBookByHash, insertBook } from '../../db/queries/books';
import { fetchBookMetadataOnline } from '../metadata/metadataService';

export const BOOKS_DIR = `${(FileSystem as any).documentDirectory || ''}books/`;
export const COVERS_DIR = `${(FileSystem as any).documentDirectory || ''}covers/`;

export async function ensureAppDirectories(): Promise<void> {
  if (!(FileSystem as any).documentDirectory) return;
  const booksDirInfo = await FileSystem.getInfoAsync(BOOKS_DIR);
  if (!booksDirInfo.exists) {
    await FileSystem.makeDirectoryAsync(BOOKS_DIR, { intermediates: true });
  }

  const coversDirInfo = await FileSystem.getInfoAsync(COVERS_DIR);
  if (!coversDirInfo.exists) {
    await FileSystem.makeDirectoryAsync(COVERS_DIR, { intermediates: true });
  }
}

export function detectFormatFromFilename(filename: string): BookFormat {
  const ext = filename.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'epub':
      return 'epub';
    case 'pdf':
      return 'pdf';
    case 'md':
    case 'markdown':
      return 'md';
    case 'cbz':
      return 'cbz';
    case 'cbr':
      return 'cbr';
    case 'mobi':
    case 'prc':
      return 'mobi';
    case 'azw3':
    case 'azw':
      return 'azw3';
    case 'fb2':
      return 'fb2';
    case 'docx':
      return 'docx';
    case 'rtf':
      return 'rtf';
    case 'html':
    case 'htm':
    case 'xhtml':
      return 'html';
    default:
      return 'txt';
  }
}

export async function readUriAsBase64(uri: string): Promise<string> {
  // 1. Try FileSystem.readAsStringAsync
  if (FileSystem && typeof (FileSystem as any).readAsStringAsync === 'function') {
    try {
      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: (FileSystem as any).EncodingType?.Base64 || 'base64',
      });
      if (base64 && base64.length > 0) return base64;
    } catch {
      // Direct FileSystem read rejected by OS, proceed to ContentResolver fetch stream
    }
  }

  // 2. Try fetch(uri) -> blob -> FileReader -> base64
  // Bypasses Android File.canRead() restrictions by accessing ContentResolver directly
  const res = await fetch(uri);
  const blob = await res.blob();
  return await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      const b64 = result.includes(',') ? result.split(',')[1] : result;
      resolve(b64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

export async function copyFileResilient(sourceUri: string, destinationPath: string): Promise<void> {
  // 1. First attempt: standard FileSystem.copyAsync
  try {
    await FileSystem.copyAsync({
      from: sourceUri,
      to: destinationPath,
    });
    return;
  } catch {
    // Native copy rejected by OS, proceed to stream copy fallback
  }

  // 2. Fallback: Stream read via readUriAsBase64 and write into app's writable document sandbox
  const base64Data = await readUriAsBase64(sourceUri);
  await FileSystem.writeAsStringAsync(destinationPath, base64Data, {
    encoding: (FileSystem as any).EncodingType?.Base64 || 'base64',
  });
}

export async function calculateFileHash(uri: string): Promise<string> {
  try {
    const fileContent = await readUriAsBase64(uri);
    return await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      fileContent
    );
  } catch {
    // Fallback pseudo-hash for web/testing
    return `hash_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }
}

export interface ImportResult {
  success: boolean;
  bookId?: string;
  isDuplicate?: boolean;
  error?: string;
}

export async function importBookFromUri(
  sourceUri: string,
  filename: string,
  providedTitle?: string,
  providedAuthor?: string,
  providedCoverUrl?: string
): Promise<ImportResult> {
  try {
    await ensureAppDirectories();
    const format = detectFormatFromFilename(filename);
    const fileHash = await calculateFileHash(sourceUri);

    // 1. Check for duplicates
    const existing = await getBookByHash(fileHash);
    if (existing) {
      return {
        success: false,
        isDuplicate: true,
        bookId: existing.id,
        error: 'This book is already in your library.',
      };
    }

    // 2. Deterministic file path in sandbox with resilient copying
    const destinationPath = `${BOOKS_DIR}${fileHash}.${format}`;
    await copyFileResilient(sourceUri, destinationPath);

    const fileInfo = await FileSystem.getInfoAsync(destinationPath);
    const fileSizeBytes = fileInfo.exists && 'size' in fileInfo ? (fileInfo as any).size || 1024 : 1024;

    const bookId = `book_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    let cleanTitle = providedTitle || filename.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
    let authorName = providedAuthor || 'Unknown Author';

    // Auto-extract real title & author from EPUB archive if not explicitly provided
    if (format === 'epub') {
      try {
        const { parseEpubArchive } = await import('../reader/epubParser');
        const parsed = await parseEpubArchive(destinationPath, cleanTitle);
        if (parsed.title && parsed.title.trim().length > 0 && parsed.title !== cleanTitle) {
          cleanTitle = parsed.title;
        }
        if (parsed.author && parsed.author !== 'Unknown Author') {
          authorName = parsed.author;
        }
      } catch {}
    }

    // Auto-fetch public metadata and cover art if not explicitly provided
    let coverImagePath: string | undefined = providedCoverUrl;
    if (!coverImagePath) {
      try {
        const meta = await fetchBookMetadataOnline(cleanTitle, authorName !== 'Unknown Author' ? authorName : undefined);
        if (meta && meta.coverUrl) {
          coverImagePath = meta.coverUrl;
        }
      } catch {}
    }

    // Insert Book into SQLite
    await insertBook(
      {
        id: bookId,
        fileHash,
        title: cleanTitle,
        originalFilename: filename,
        filePath: destinationPath,
        coverImagePath,
        fileFormat: format,
        fileSizeBytes,
        pageCount: 1,
        progressPercentage: 0.0,
        status: 'unread',
        isFavorite: false,
        totalTimeReadSeconds: 0,
      },
      [{ name: authorName }],
      [{ title: 'Beginning', playOrder: 1, level: 0 }]
    );

    return {
      success: true,
      bookId,
    };
  } catch (err: any) {
    return {
      success: false,
      error: err?.message || 'Failed to import book.',
    };
  }
}

export async function pickAndImportBook(): Promise<ImportResult | null> {
  try {
    const result = await DocumentPicker.getDocumentAsync({
      type: ['*/*', 'application/epub+zip', 'application/epub', 'application/octet-stream', 'application/pdf', 'text/plain', 'text/markdown'],
      copyToCacheDirectory: true,
    });

    if (result.canceled || !result.assets || result.assets.length === 0) {
      return null;
    }

    const asset = result.assets[0];
    return await importBookFromUri(asset.uri, asset.name);
  } catch (err: any) {
    return {
      success: false,
      error: err?.message || 'File picker failed',
    };
  }
}
