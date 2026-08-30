import { describe, it, expect } from 'bun:test';
import { parseAndValidateBackup, BACKUP_VERSION } from '../../src/services/backup/backupService';

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
});
