import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import * as Crypto from 'expo-crypto';
import { getAllBooks, getBookmarks, getHighlights } from '../../db/queries/books';
import { getRecentSessions, getLifetimeStats } from '../../db/queries/stats';
import { getUserSettings, getReadingGoals } from '../../db/queries/settings';
import { getAllCollections } from '../../db/queries/collections';
import { BackupManifest } from '../../types';

import { getDatabase } from '../../db/client';

export const BACKUP_VERSION = 1;
export const BACKUPS_DIR = `${(FileSystem as any).documentDirectory || ''}backups/`;

export interface BackupBundleData {
  manifest: BackupManifest;
  books: any[];
  bookmarks: any[];
  highlights: any[];
  readingSessions: any[];
  collections: any[];
  bookCollections?: any[];
  userSettings: any;
  readingGoals: any;
}

export interface RestoreResult {
  success: boolean;
  booksRestored: number;
  bookmarksRestored: number;
  highlightsRestored: number;
  sessionsRestored: number;
  collectionsRestored: number;
  error?: string;
}

const toUnixTimestamp = (val: any): number => {
  if (!val) return Math.floor(Date.now() / 1000);
  if (typeof val === 'number') return val > 1e11 ? Math.floor(val / 1000) : Math.floor(val);
  const parsed = new Date(val).getTime();
  return isNaN(parsed) ? Math.floor(Date.now() / 1000) : Math.floor(parsed / 1000);
};

const toUnixTimestampOrNull = (val: any): number | null => {
  if (val === null || val === undefined) return null;
  if (typeof val === 'number') return val > 1e11 ? Math.floor(val / 1000) : Math.floor(val);
  const parsed = new Date(val).getTime();
  return isNaN(parsed) ? null : Math.floor(parsed / 1000);
};

export async function generateBackup(): Promise<{ uri: string; filename: string; stats: BackupManifest['stats'] }> {
  if ((FileSystem as any).documentDirectory) {
    const backupDirInfo = await FileSystem.getInfoAsync(BACKUPS_DIR);
    if (!backupDirInfo.exists) {
      await FileSystem.makeDirectoryAsync(BACKUPS_DIR, { intermediates: true });
    }
  }

  const allBooks = await getAllBooks();
  const settings = await getUserSettings();
  const goals = await getReadingGoals();
  const collections = await getAllCollections();
  const sessions = await getRecentSessions(200);

  const { sqlite } = await getDatabase();
  let allBookCollections: any[] = [];
  if (sqlite && typeof (sqlite as any).getAllAsync === 'function') {
    try {
      allBookCollections = await sqlite.getAllAsync(`SELECT book_id, collection_id FROM book_collections;`);
    } catch {}
  }

  const [bookmarksArrays, highlightsArrays] = await Promise.all([
    Promise.all(allBooks.map((b) => getBookmarks(b.id))),
    Promise.all(allBooks.map((b) => getHighlights(b.id))),
  ]);

  const allBookmarks = bookmarksArrays.flat();
  const allHighlights = highlightsArrays.flat();

  const lifeStats = await getLifetimeStats();

  const manifest: BackupManifest = {
    $schema: 'https://readr.app/schemas/backup-v1.json',
    version: BACKUP_VERSION,
    appVersion: '1.1.0-beta',
    createdAt: new Date().toISOString(),
    deviceInfo: {
      platform: 'mobile',
    },
    stats: {
      totalBooks: allBooks.length,
      totalHighlights: allHighlights.length,
      totalNotes: lifeStats.totalNotes,
      totalReadingSeconds: lifeStats.totalTimeSeconds,
    },
    checksums: {
      database: `sha256_${Date.now()}`,
      manifest: `sha256_${allBooks.length}_${allHighlights.length}`,
    },
  };

  const bundleData: BackupBundleData = {
    manifest,
    books: allBooks,
    bookmarks: allBookmarks,
    highlights: allHighlights,
    readingSessions: sessions,
    collections,
    bookCollections: allBookCollections,
    userSettings: settings,
    readingGoals: goals,
  };

  const timestampStr = new Date().toISOString().replace(/-/g, '').replace(/:/g, '').replace('T', '').substring(0, 14);
  const filename = `Readr_Backup_${timestampStr}.readr`;
  const backupFilePath = `${BACKUPS_DIR}${filename}`;

  const jsonContent = JSON.stringify(bundleData, null, 2);
  await FileSystem.writeAsStringAsync(backupFilePath, jsonContent);

  return {
    uri: backupFilePath,
    filename,
    stats: manifest.stats,
  };
}

export async function shareBackupFile(uri: string): Promise<boolean> {
  const isAvailable = await Sharing.isAvailableAsync();
  if (!isAvailable) return false;
  await Sharing.shareAsync(uri, {
    mimeType: 'application/json',
    dialogTitle: 'Export Readr Sanctuary Backup (.readr)',
  });
  return true;
}

export async function parseAndValidateBackup(backupContent: string): Promise<{ valid: boolean; data?: BackupBundleData; error?: string }> {
  try {
    const data = JSON.parse(backupContent) as BackupBundleData;
    if (!data.manifest || typeof data.manifest.version !== 'number') {
      return { valid: false, error: 'Invalid or missing manifest in backup file.' };
    }
    if (data.manifest.version > BACKUP_VERSION) {
      return { valid: false, error: `Backup was created with a newer version (v${data.manifest.version}) of Readr.` };
    }
    return { valid: true, data };
  } catch (err: any) {
    return { valid: false, error: 'Failed to parse .readr backup file.' };
  }
}

export async function restoreBackup(data: BackupBundleData): Promise<RestoreResult> {
  try {
    const { sqlite } = await getDatabase();
    if (!sqlite) {
      return {
        success: false,
        booksRestored: 0,
        bookmarksRestored: 0,
        highlightsRestored: 0,
        sessionsRestored: 0,
        collectionsRestored: 0,
        error: 'Database is not initialized or accessible.',
      };
    }

    if (typeof sqlite.execAsync === 'function') {
      try {
        await sqlite.execAsync('BEGIN TRANSACTION;');
      } catch {}
    }

    let booksRestored = 0;
    let bookmarksRestored = 0;
    let highlightsRestored = 0;
    let sessionsRestored = 0;
    let collectionsRestored = 0;

    // 1. Restore Books
    if (Array.isArray(data.books)) {
      for (const b of data.books) {
        if (!b || !b.id) continue;

        const id = b.id;
        const fileHash = b.fileHash ?? b.file_hash ?? id;
        const title = b.title ?? 'Untitled Book';
        const subtitle = b.subtitle ?? null;
        const description = b.description ?? null;
        const publisher = b.publisher ?? null;
        const publishedDate = b.publishedDate ?? b.published_date ?? null;
        const isbn = b.isbn ?? null;
        const language = b.language ?? 'en';
        const originalFilename = b.originalFilename ?? b.original_filename ?? `${title}.epub`;
        const filePath = b.filePath ?? b.file_path ?? '';
        const fileFormat = b.fileFormat ?? b.file_format ?? 'epub';
        const coverImagePath = b.coverImagePath ?? b.cover_image_path ?? null;
        const fileSizeBytes = b.fileSizeBytes ?? b.file_size_bytes ?? 0;
        const pageCount = b.pageCount ?? b.page_count ?? 0;
        const lastReadLocation = b.lastReadLocation ?? b.last_read_location ?? null;
        const progressPercentage = b.progressPercentage ?? b.progress_percentage ?? 0.0;
        const status = b.status ?? 'unread';
        const isFavorite = (b.isFavorite ?? b.is_favorite) ? 1 : 0;
        const rating = b.rating ?? 0;
        const totalTimeReadSeconds = b.totalTimeReadSeconds ?? b.total_time_read_seconds ?? 0;
        const createdAt = toUnixTimestamp(b.createdAt ?? b.created_at);
        const updatedAt = toUnixTimestamp(b.updatedAt ?? b.updated_at);
        const lastReadAt = toUnixTimestampOrNull(b.lastReadAt ?? b.last_read_at);

        await sqlite.runAsync(
          `INSERT OR REPLACE INTO books (
            id, file_hash, title, subtitle, description, publisher, published_date,
            isbn, language, original_filename, file_path, file_format, cover_image_path,
            file_size_bytes, page_count, last_read_location, progress_percentage,
            status, is_favorite, rating, total_time_read_seconds, created_at, updated_at, last_read_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
          [
            id, fileHash, title, subtitle, description, publisher, publishedDate,
            isbn, language, originalFilename, filePath, fileFormat, coverImagePath,
            fileSizeBytes, pageCount, lastReadLocation, progressPercentage,
            status, isFavorite, rating, totalTimeReadSeconds, createdAt, updatedAt, lastReadAt
          ]
        );

        // Authors
        if (Array.isArray(b.authors)) {
          for (let i = 0; i < b.authors.length; i++) {
            const a = b.authors[i];
            const authorName = typeof a === 'string' ? a : (a?.name || 'Unknown Author');
            const authorId = (typeof a === 'object' && a?.id) ? a.id : `author_${authorName.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
            const sortName = (typeof a === 'object' && (a?.sortName || a?.sort_name)) ? (a.sortName || a.sort_name) : null;
            await sqlite.runAsync(
              `INSERT OR IGNORE INTO authors (id, name, sort_name) VALUES (?, ?, ?);`,
              [authorId, authorName, sortName]
            );
            await sqlite.runAsync(
              `INSERT OR REPLACE INTO book_authors (book_id, author_id, order_index) VALUES (?, ?, ?);`,
              [id, authorId, i]
            );
          }
        }

        // Tags
        if (Array.isArray(b.tags)) {
          for (const t of b.tags) {
            const tagName = typeof t === 'string' ? t : (t?.name || 'Tag');
            const tagId = (typeof t === 'object' && t?.id) ? t.id : `tag_${tagName.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
            const tagColor = (typeof t === 'object' && t?.color) ? t.color : '#64748B';
            await sqlite.runAsync(
              `INSERT OR IGNORE INTO tags (id, name, color) VALUES (?, ?, ?);`,
              [tagId, tagName, tagColor]
            );
            await sqlite.runAsync(
              `INSERT OR REPLACE INTO book_tags (book_id, tag_id) VALUES (?, ?);`,
              [id, tagId]
            );
          }
        }

        booksRestored++;
      }
    }

    // 2. Restore Bookmarks
    if (Array.isArray(data.bookmarks)) {
      for (const bm of data.bookmarks) {
        if (!bm || !bm.id) continue;
        const bmId = bm.id;
        const bookId = bm.bookId ?? bm.book_id;
        if (!bookId) continue;
        const locationCfi = bm.locationCfi ?? bm.location_cfi ?? null;
        const pageNumber = bm.pageNumber ?? bm.page_number ?? null;
        const title = bm.title ?? 'Bookmark';
        const snippet = bm.snippet ?? null;
        const createdAt = toUnixTimestamp(bm.createdAt ?? bm.created_at);

        await sqlite.runAsync(
          `INSERT OR REPLACE INTO bookmarks (id, book_id, location_cfi, page_number, title, snippet, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?);`,
          [bmId, bookId, locationCfi, pageNumber, title, snippet, createdAt]
        );
        bookmarksRestored++;
      }
    }

    // 3. Restore Highlights & Notes
    if (Array.isArray(data.highlights)) {
      for (const hl of data.highlights) {
        if (!hl || !hl.id) continue;
        const hlId = hl.id;
        const bookId = hl.bookId ?? hl.book_id;
        const selectedText = hl.selectedText ?? hl.selected_text ?? '';
        if (!bookId || !selectedText) continue;

        const locationCfi = hl.locationCfi ?? hl.location_cfi ?? null;
        const pageNumber = hl.pageNumber ?? hl.page_number ?? null;
        const color = hl.color ?? 'yellow';
        const createdAt = toUnixTimestamp(hl.createdAt ?? hl.created_at);
        const updatedAt = toUnixTimestamp(hl.updatedAt ?? hl.updated_at);

        await sqlite.runAsync(
          `INSERT OR REPLACE INTO highlights (id, book_id, location_cfi, page_number, selected_text, color, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?);`,
          [hlId, bookId, locationCfi, pageNumber, selectedText, color, createdAt, updatedAt]
        );
        highlightsRestored++;

        const note = hl.note;
        if (note && typeof note === 'object' && (note.content || note.text)) {
          const noteId = note.id || `note_${hlId}`;
          const content = note.content || note.text || '';
          const noteCreatedAt = toUnixTimestamp(note.createdAt ?? note.created_at);
          const noteUpdatedAt = toUnixTimestamp(note.updatedAt ?? note.updated_at);
          await sqlite.runAsync(
            `INSERT OR REPLACE INTO notes (id, highlight_id, content, created_at, updated_at)
             VALUES (?, ?, ?, ?, ?);`,
            [noteId, hlId, content, noteCreatedAt, noteUpdatedAt]
          );
        }
      }
    }

    // 4. Restore Reading Sessions
    if (Array.isArray(data.readingSessions)) {
      for (const s of data.readingSessions) {
        if (!s || !s.id) continue;
        const sId = s.id;
        const bookId = s.bookId ?? s.book_id;
        if (!bookId) continue;
        const startTime = toUnixTimestamp(s.startTime ?? s.start_time);
        const endTime = toUnixTimestamp(s.endTime ?? s.end_time);
        const durationSeconds = s.durationSeconds ?? s.duration_seconds ?? Math.max(0, endTime - startTime);
        const startLocation = s.startLocation ?? s.start_location ?? null;
        const endLocation = s.endLocation ?? s.end_location ?? null;
        const pagesRead = s.pagesRead ?? s.pages_read ?? 0;

        await sqlite.runAsync(
          `INSERT OR REPLACE INTO reading_sessions (id, book_id, start_time, end_time, duration_seconds, start_location, end_location, pages_read)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?);`,
          [sId, bookId, startTime, endTime, durationSeconds, startLocation, endLocation, pagesRead]
        );
        sessionsRestored++;
      }
    }

    // 5. Restore Collections
    if (Array.isArray(data.collections)) {
      for (const col of data.collections) {
        if (!col || !col.id) continue;
        const colId = col.id;
        const name = col.name || 'Collection';
        const description = col.description ?? null;
        const icon = col.icon || 'bookmark';
        const orderIndex = col.orderIndex ?? col.order_index ?? 0;
        const createdAt = toUnixTimestamp(col.createdAt ?? col.created_at);

        await sqlite.runAsync(
          `INSERT OR REPLACE INTO collections (id, name, description, icon, order_index, created_at)
           VALUES (?, ?, ?, ?, ?, ?);`,
          [colId, name, description, icon, orderIndex, createdAt]
        );
        collectionsRestored++;

        if (Array.isArray(col.bookIds)) {
          for (const bId of col.bookIds) {
            await sqlite.runAsync(
              `INSERT OR IGNORE INTO book_collections (book_id, collection_id) VALUES (?, ?);`,
              [bId, colId]
            );
          }
        }
      }
    }

    // 6. Restore Book Collections Junction
    if (Array.isArray(data.bookCollections)) {
      for (const bc of data.bookCollections) {
        const bookId = bc?.bookId ?? bc?.book_id;
        const colId = bc?.collectionId ?? bc?.collection_id;
        if (bookId && colId) {
          await sqlite.runAsync(
            `INSERT OR IGNORE INTO book_collections (book_id, collection_id) VALUES (?, ?);`,
            [bookId, colId]
          );
        }
      }
    }

    // 7. Restore User Settings
    if (data.userSettings && typeof data.userSettings === 'object') {
      const s = data.userSettings;
      const sId = s.id || 'default_user';
      await sqlite.runAsync(
        `INSERT OR REPLACE INTO user_settings (
          id, active_theme, warmth_level, font_family, font_size, line_height,
          margin_horizontal, text_align, keep_awake, haptic_feedback, reading_mode,
          hyphenation_enabled, justification_enabled, bionic_reading_enabled,
          tts_voice, tts_rate, tts_pitch, online_metadata_enabled
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
        [
          sId,
          s.activeTheme ?? s.active_theme ?? 'light',
          s.warmthLevel ?? s.warmth_level ?? 0.0,
          s.fontFamily ?? s.font_family ?? 'Literata',
          s.fontSize ?? s.font_size ?? 18,
          s.lineHeight ?? s.line_height ?? 1.5,
          s.marginHorizontal ?? s.margin_horizontal ?? 20,
          s.textAlign ?? s.text_align ?? 'left',
          (s.keepAwake ?? s.keep_awake ?? 1) ? 1 : 0,
          (s.hapticFeedback ?? s.haptic_feedback ?? 1) ? 1 : 0,
          s.readingMode ?? s.reading_mode ?? 'paginated',
          (s.hyphenationEnabled ?? s.hyphenation_enabled ?? 1) ? 1 : 0,
          (s.justificationEnabled ?? s.justification_enabled ?? 0) ? 1 : 0,
          (s.bionicReadingEnabled ?? s.bionic_reading_enabled ?? 0) ? 1 : 0,
          s.ttsVoice ?? s.tts_voice ?? null,
          s.ttsRate ?? s.tts_rate ?? 1.0,
          s.ttsPitch ?? s.tts_pitch ?? 1.0,
          (s.onlineMetadataEnabled ?? s.online_metadata_enabled ?? 0) ? 1 : 0,
        ]
      );
    }

    // 8. Restore Reading Goals
    if (data.readingGoals && typeof data.readingGoals === 'object') {
      const g = data.readingGoals;
      const gId = g.id || 'default_user';
      await sqlite.runAsync(
        `INSERT OR REPLACE INTO reading_goals (
          id, target_daily_minutes, target_daily_pages, current_streak_days,
          longest_streak_days, last_active_date
        ) VALUES (?, ?, ?, ?, ?, ?);`,
        [
          gId,
          g.targetDailyMinutes ?? g.target_daily_minutes ?? 30,
          g.targetDailyPages ?? g.target_daily_pages ?? 20,
          g.currentStreakDays ?? g.current_streak_days ?? 0,
          g.longestStreakDays ?? g.longest_streak_days ?? 0,
          g.lastActiveDate ?? g.last_active_date ?? null,
        ]
      );
    }

    if (typeof sqlite.execAsync === 'function') {
      try {
        await sqlite.execAsync('COMMIT;');
      } catch {}
    }

    return {
      success: true,
      booksRestored,
      bookmarksRestored,
      highlightsRestored,
      sessionsRestored,
      collectionsRestored,
    };
  } catch (err: any) {
    try {
      const { sqlite } = await getDatabase();
      if (sqlite && typeof sqlite.execAsync === 'function') {
        await sqlite.execAsync('ROLLBACK;');
      }
    } catch {}
    return {
      success: false,
      booksRestored: 0,
      bookmarksRestored: 0,
      highlightsRestored: 0,
      sessionsRestored: 0,
      collectionsRestored: 0,
      error: err?.message || 'Restore operation failed.',
    };
  }
}

