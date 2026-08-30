import { drizzle } from 'drizzle-orm/expo-sqlite';
import * as SQLite from 'expo-sqlite';
import * as schema from './schema';

let expoDb: SQLite.SQLiteDatabase | null = null;
let drizzleDb: ReturnType<typeof drizzle<typeof schema>> | null = null;

export const DB_NAME = 'readr.db';

export async function getDatabase() {
  if (drizzleDb && expoDb) {
    return { db: drizzleDb, sqlite: expoDb };
  }

  try {
    expoDb = await SQLite.openDatabaseAsync(DB_NAME);
    // Enable foreign keys and WAL mode for optimal performance and safety
    await expoDb.execAsync('PRAGMA foreign_keys = ON;');
    await expoDb.execAsync('PRAGMA journal_mode = WAL;');

    drizzleDb = drizzle(expoDb, { schema });
    await initializeTables(expoDb);

    return { db: drizzleDb, sqlite: expoDb };
  } catch (error) {
    console.warn('SQLite init warning (falling back if in test/web):', error);
    // Return mockable structure for headless testing
    return {
      db: drizzleDb as any,
      sqlite: expoDb as any,
    };
  }
}

export async function initializeTables(sqlite: SQLite.SQLiteDatabase) {
  await sqlite.execAsync(`
    CREATE TABLE IF NOT EXISTS books (
      id TEXT PRIMARY KEY,
      file_hash TEXT NOT NULL UNIQUE,
      title TEXT NOT NULL,
      subtitle TEXT,
      description TEXT,
      publisher TEXT,
      published_date TEXT,
      isbn TEXT,
      language TEXT DEFAULT 'en',
      original_filename TEXT NOT NULL,
      file_path TEXT NOT NULL,
      file_format TEXT NOT NULL,
      cover_image_path TEXT,
      file_size_bytes INTEGER NOT NULL,
      page_count INTEGER DEFAULT 0 NOT NULL,
      last_read_location TEXT,
      progress_percentage REAL DEFAULT 0.0 NOT NULL,
      status TEXT DEFAULT 'unread' NOT NULL,
      is_favorite INTEGER DEFAULT 0 NOT NULL,
      total_time_read_seconds INTEGER DEFAULT 0 NOT NULL,
      created_at INTEGER DEFAULT (strftime('%s', 'now')) NOT NULL,
      updated_at INTEGER DEFAULT (strftime('%s', 'now')) NOT NULL,
      last_read_at INTEGER
    );

    CREATE TABLE IF NOT EXISTS authors (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      sort_name TEXT
    );

    CREATE TABLE IF NOT EXISTS book_authors (
      book_id TEXT NOT NULL REFERENCES books(id) ON DELETE CASCADE,
      author_id TEXT NOT NULL REFERENCES authors(id) ON DELETE CASCADE,
      order_index INTEGER DEFAULT 0 NOT NULL,
      PRIMARY KEY (book_id, author_id)
    );

    CREATE TABLE IF NOT EXISTS toc_entries (
      id TEXT PRIMARY KEY,
      book_id TEXT NOT NULL REFERENCES books(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      href TEXT,
      cfi TEXT,
      page_number INTEGER,
      play_order INTEGER NOT NULL,
      level INTEGER DEFAULT 0 NOT NULL,
      parent_id TEXT
    );

    CREATE TABLE IF NOT EXISTS reading_sessions (
      id TEXT PRIMARY KEY,
      book_id TEXT NOT NULL REFERENCES books(id) ON DELETE CASCADE,
      start_time INTEGER NOT NULL,
      end_time INTEGER NOT NULL,
      duration_seconds INTEGER NOT NULL,
      start_location TEXT,
      end_location TEXT,
      pages_read INTEGER DEFAULT 0 NOT NULL
    );

    CREATE TABLE IF NOT EXISTS bookmarks (
      id TEXT PRIMARY KEY,
      book_id TEXT NOT NULL REFERENCES books(id) ON DELETE CASCADE,
      location_cfi TEXT,
      page_number INTEGER,
      title TEXT NOT NULL,
      snippet TEXT,
      created_at INTEGER DEFAULT (strftime('%s', 'now')) NOT NULL
    );

    CREATE TABLE IF NOT EXISTS highlights (
      id TEXT PRIMARY KEY,
      book_id TEXT NOT NULL REFERENCES books(id) ON DELETE CASCADE,
      location_cfi TEXT,
      page_number INTEGER,
      selected_text TEXT NOT NULL,
      color TEXT DEFAULT 'yellow' NOT NULL,
      created_at INTEGER DEFAULT (strftime('%s', 'now')) NOT NULL,
      updated_at INTEGER DEFAULT (strftime('%s', 'now')) NOT NULL
    );

    CREATE TABLE IF NOT EXISTS notes (
      id TEXT PRIMARY KEY,
      highlight_id TEXT NOT NULL UNIQUE REFERENCES highlights(id) ON DELETE CASCADE,
      content TEXT NOT NULL,
      created_at INTEGER DEFAULT (strftime('%s', 'now')) NOT NULL,
      updated_at INTEGER DEFAULT (strftime('%s', 'now')) NOT NULL
    );

    CREATE TABLE IF NOT EXISTS collections (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      icon TEXT DEFAULT 'bookmark',
      order_index INTEGER DEFAULT 0 NOT NULL,
      created_at INTEGER DEFAULT (strftime('%s', 'now')) NOT NULL
    );

    CREATE TABLE IF NOT EXISTS book_collections (
      book_id TEXT NOT NULL REFERENCES books(id) ON DELETE CASCADE,
      collection_id TEXT NOT NULL REFERENCES collections(id) ON DELETE CASCADE,
      PRIMARY KEY (book_id, collection_id)
    );

    CREATE TABLE IF NOT EXISTS tags (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      color TEXT DEFAULT '#64748B'
    );

    CREATE TABLE IF NOT EXISTS book_tags (
      book_id TEXT NOT NULL REFERENCES books(id) ON DELETE CASCADE,
      tag_id TEXT NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
      PRIMARY KEY (book_id, tag_id)
    );

    CREATE TABLE IF NOT EXISTS user_settings (
      id TEXT PRIMARY KEY,
      active_theme TEXT DEFAULT 'system' NOT NULL,
      warmth_level REAL DEFAULT 0.0 NOT NULL,
      font_family TEXT DEFAULT 'Literata' NOT NULL,
      font_size INTEGER DEFAULT 18 NOT NULL,
      line_height REAL DEFAULT 1.5 NOT NULL,
      margin_horizontal INTEGER DEFAULT 20 NOT NULL,
      text_align TEXT DEFAULT 'left' NOT NULL,
      keep_awake INTEGER DEFAULT 1 NOT NULL,
      haptic_feedback INTEGER DEFAULT 1 NOT NULL,
      tts_voice TEXT,
      tts_rate REAL DEFAULT 1.0 NOT NULL,
      tts_pitch REAL DEFAULT 1.0 NOT NULL,
      online_metadata_enabled INTEGER DEFAULT 0 NOT NULL
    );

    CREATE TABLE IF NOT EXISTS reading_goals (
      id TEXT PRIMARY KEY,
      target_daily_minutes INTEGER DEFAULT 30 NOT NULL,
      target_daily_pages INTEGER DEFAULT 20 NOT NULL,
      current_streak_days INTEGER DEFAULT 0 NOT NULL,
      longest_streak_days INTEGER DEFAULT 0 NOT NULL,
      last_active_date TEXT
    );

    -- Insert default user settings and goals if not present
    INSERT OR IGNORE INTO user_settings (id, active_theme, warmth_level, font_family, font_size, line_height, margin_horizontal, text_align, keep_awake, haptic_feedback, tts_rate, tts_pitch, online_metadata_enabled)
    VALUES ('default_user', 'system', 0.0, 'Literata', 18, 1.5, 20, 'left', 1, 1, 1.0, 1.0, 0);

    INSERT OR IGNORE INTO reading_goals (id, target_daily_minutes, target_daily_pages, current_streak_days, longest_streak_days)
    VALUES ('default_user', 30, 20, 0, 0);
  `);
}
