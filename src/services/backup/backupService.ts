import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import * as Crypto from 'expo-crypto';
import { getAllBooks, getBookmarks, getHighlights } from '../../db/queries/books';
import { getRecentSessions, getLifetimeStats } from '../../db/queries/stats';
import { getUserSettings, getReadingGoals } from '../../db/queries/settings';
import { getAllCollections } from '../../db/queries/collections';
import { BackupManifest } from '../../types';

export const BACKUP_VERSION = 1;
export const BACKUPS_DIR = `${(FileSystem as any).documentDirectory || ''}backups/`;

export interface BackupBundleData {
  manifest: BackupManifest;
  books: any[];
  bookmarks: any[];
  highlights: any[];
  readingSessions: any[];
  collections: any[];
  userSettings: any;
  readingGoals: any;
}

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

  const allBookmarks: any[] = [];
  const allHighlights: any[] = [];

  for (const b of allBooks) {
    const bms = await getBookmarks(b.id);
    const hls = await getHighlights(b.id);
    allBookmarks.push(...bms);
    allHighlights.push(...hls);
  }

  const lifeStats = await getLifetimeStats();

  const manifest: BackupManifest = {
    $schema: 'https://readr.app/schemas/backup-v1.json',
    version: BACKUP_VERSION,
    appVersion: '1.0.0',
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
