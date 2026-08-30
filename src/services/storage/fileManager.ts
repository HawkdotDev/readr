import * as FileSystem from 'expo-file-system/legacy';
import * as Crypto from 'expo-crypto';
import * as DocumentPicker from 'expo-document-picker';
import { BookFormat } from '../../types';
import { getBookByHash, insertBook } from '../../db/queries/books';

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
      return 'md';
    case 'cbz':
      return 'cbz';
    default:
      return 'txt';
  }
}

export async function calculateFileHash(uri: string): Promise<string> {
  try {
    const fileContent = await FileSystem.readAsStringAsync(uri, {
      encoding: (FileSystem as any).EncodingType?.Base64 || 'base64',
    });
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
  providedAuthor?: string
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

    // 2. Deterministic file path in sandbox
    const destinationPath = `${BOOKS_DIR}${fileHash}.${format}`;
    await FileSystem.copyAsync({
      from: sourceUri,
      to: destinationPath,
    });

    const fileInfo = await FileSystem.getInfoAsync(destinationPath);
    const fileSizeBytes = fileInfo.exists && 'size' in fileInfo ? (fileInfo as any).size || 1024 : 1024;

    const bookId = `book_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const cleanTitle = providedTitle || filename.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
    const authorName = providedAuthor || 'Unknown Author';

    // Insert Book into SQLite
    await insertBook(
      {
        id: bookId,
        fileHash,
        title: cleanTitle,
        originalFilename: filename,
        filePath: destinationPath,
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
      type: ['application/epub+zip', 'application/pdf', 'text/plain', 'text/markdown'],
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
