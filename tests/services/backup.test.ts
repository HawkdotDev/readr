import { describe, it, expect } from 'bun:test';
import { parseAndValidateBackup, restoreBackup, BACKUP_VERSION } from '../../src/services/backup/backupService';

describe('Backup Service', () => {
  it('validates a compliant .readr backup file', async () => {
    const validJson = JSON.stringify({
      manifest: {
        $schema: 'https://readr.app/schemas/backup-v1.json',
        version: 1,
        appVersion: '1.0.0',
        createdAt: '2026-08-30T12:00:00Z',
        deviceInfo: { platform: 'mobile' },
        stats: {
          totalBooks: 4,
          totalHighlights: 12,
          totalNotes: 3,
          totalReadingSeconds: 4200,
        },
        checksums: {
          database: 'sha256_test',
          manifest: 'sha256_manifest',
        },
      },
      books: [],
      bookmarks: [],
      highlights: [],
      readingSessions: [],
      collections: [],
      userSettings: {},
      readingGoals: {},
    });

    const res = await parseAndValidateBackup(validJson);
    expect(res.valid).toBe(true);
    expect(res.data?.manifest.stats.totalBooks).toBe(4);
  });

  it('rejects corrupt or unparseable JSON files', async () => {
    const res = await parseAndValidateBackup('invalid json content');
    expect(res.valid).toBe(false);
    expect(res.error).toBeDefined();
  });

  it('rejects backups with newer unsupported schema versions', async () => {
    const futureJson = JSON.stringify({
      manifest: {
        version: BACKUP_VERSION + 99,
      },
    });
    const res = await parseAndValidateBackup(futureJson);
    expect(res.valid).toBe(false);
    expect(res.error).toContain('newer version');
  });

  it('restores backup data into SQLite tables successfully', async () => {
    const backupBundle = {
      manifest: {
        $schema: 'https://readr.app/schemas/backup-v1.json',
        version: 1,
        appVersion: '1.1.0',
        createdAt: new Date().toISOString(),
        deviceInfo: { platform: 'mobile' },
        stats: {
          totalBooks: 1,
          totalHighlights: 1,
          totalNotes: 1,
          totalReadingSeconds: 120,
        },
        checksums: {
          database: 'test_db_hash',
          manifest: 'test_manifest_hash',
        },
      },
      books: [
        {
          id: 'test_book_restore_1',
          fileHash: 'hash_restore_1',
          title: 'Restored Masterpiece',
          originalFilename: 'masterpiece.epub',
          filePath: '/mock/masterpiece.epub',
          fileFormat: 'epub',
          authors: [{ name: 'Famous Author' }],
          tags: [{ name: 'Philosophy', color: '#10B981' }],
        },
      ],
      bookmarks: [
        {
          id: 'bm_restore_1',
          bookId: 'test_book_restore_1',
          title: 'Key Chapter',
          locationCfi: 'epubcfi(/6/4)',
        },
      ],
      highlights: [
        {
          id: 'hl_restore_1',
          bookId: 'test_book_restore_1',
          selectedText: 'A deep philosophical thought',
          color: 'mint',
          note: {
            id: 'note_restore_1',
            content: 'Remember this quote.',
          },
        },
      ],
      readingSessions: [
        {
          id: 'session_restore_1',
          bookId: 'test_book_restore_1',
          startTime: 1700000000,
          endTime: 1700000120,
          durationSeconds: 120,
          pagesRead: 4,
        },
      ],
      collections: [
        {
          id: 'col_restore_1',
          name: 'Classics',
          description: 'Timeless works',
        },
      ],
      bookCollections: [
        {
          bookId: 'test_book_restore_1',
          collectionId: 'col_restore_1',
        },
      ],
      userSettings: {
        fontSize: 20,
      },
      readingGoals: {
        targetDailyMinutes: 45,
      },
    };

    const res = await restoreBackup(backupBundle as any);
    expect(res.success).toBe(true);
    expect(res.booksRestored).toBe(1);
    expect(res.bookmarksRestored).toBe(1);
    expect(res.highlightsRestored).toBe(1);
    expect(res.sessionsRestored).toBe(1);
    expect(res.collectionsRestored).toBe(1);
  });
});

