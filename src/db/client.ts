import { drizzle } from 'drizzle-orm/expo-sqlite';
import * as SQLite from 'expo-sqlite';
import * as schema from './schema';

let expoDb: SQLite.SQLiteDatabase | null = null;
let drizzleDb: ReturnType<typeof drizzle<typeof schema>> | null = null;
let initPromise: Promise<{ db: ReturnType<typeof drizzle<typeof schema>>; sqlite: SQLite.SQLiteDatabase }> | null = null;
let isInitialized = false;

export const DB_NAME = 'readr.db';

export const PERFORMANCE_PRAGMAS = [
  'PRAGMA journal_mode = WAL;',
  'PRAGMA synchronous = NORMAL;',
  'PRAGMA foreign_keys = ON;',
  'PRAGMA cache_size = -64000;', // 64MB memory page cache
  'PRAGMA temp_store = MEMORY;',
  'PRAGMA mmap_size = 268435456;', // 256MB memory mapping
];

export const TABLE_CREATION_STATEMENTS = [
  `CREATE TABLE IF NOT EXISTS books (
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
    rating INTEGER DEFAULT 0 NOT NULL,
    total_time_read_seconds INTEGER DEFAULT 0 NOT NULL,
    created_at INTEGER DEFAULT (strftime('%s', 'now')) NOT NULL,
    updated_at INTEGER DEFAULT (strftime('%s', 'now')) NOT NULL,
    last_read_at INTEGER
  );`,

  `CREATE TABLE IF NOT EXISTS authors (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    sort_name TEXT
  );`,

  `CREATE TABLE IF NOT EXISTS book_authors (
    book_id TEXT NOT NULL REFERENCES books(id) ON DELETE CASCADE,
    author_id TEXT NOT NULL REFERENCES authors(id) ON DELETE CASCADE,
    order_index INTEGER DEFAULT 0 NOT NULL,
    PRIMARY KEY (book_id, author_id)
  );`,

  `CREATE TABLE IF NOT EXISTS toc_entries (
    id TEXT PRIMARY KEY,
    book_id TEXT NOT NULL REFERENCES books(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    href TEXT,
    cfi TEXT,
    page_number INTEGER,
    play_order INTEGER NOT NULL,
    level INTEGER DEFAULT 0 NOT NULL,
    parent_id TEXT
  );`,

  `CREATE TABLE IF NOT EXISTS reading_sessions (
    id TEXT PRIMARY KEY,
    book_id TEXT NOT NULL REFERENCES books(id) ON DELETE CASCADE,
    start_time INTEGER NOT NULL,
    end_time INTEGER NOT NULL,
    duration_seconds INTEGER NOT NULL,
    start_location TEXT,
    end_location TEXT,
    pages_read INTEGER DEFAULT 0 NOT NULL
  );`,

  `CREATE TABLE IF NOT EXISTS bookmarks (
    id TEXT PRIMARY KEY,
    book_id TEXT NOT NULL REFERENCES books(id) ON DELETE CASCADE,
    location_cfi TEXT,
    page_number INTEGER,
    title TEXT NOT NULL,
    snippet TEXT,
    created_at INTEGER DEFAULT (strftime('%s', 'now')) NOT NULL
  );`,

  `CREATE TABLE IF NOT EXISTS highlights (
    id TEXT PRIMARY KEY,
    book_id TEXT NOT NULL REFERENCES books(id) ON DELETE CASCADE,
    location_cfi TEXT,
    page_number INTEGER,
    selected_text TEXT NOT NULL,
    color TEXT DEFAULT 'yellow' NOT NULL,
    created_at INTEGER DEFAULT (strftime('%s', 'now')) NOT NULL,
    updated_at INTEGER DEFAULT (strftime('%s', 'now')) NOT NULL
  );`,

  `CREATE TABLE IF NOT EXISTS notes (
    id TEXT PRIMARY KEY,
    highlight_id TEXT NOT NULL UNIQUE REFERENCES highlights(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at INTEGER DEFAULT (strftime('%s', 'now')) NOT NULL,
    updated_at INTEGER DEFAULT (strftime('%s', 'now')) NOT NULL
  );`,

  `CREATE TABLE IF NOT EXISTS collections (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    icon TEXT DEFAULT 'bookmark',
    order_index INTEGER DEFAULT 0 NOT NULL,
    created_at INTEGER DEFAULT (strftime('%s', 'now')) NOT NULL
  );`,

  `CREATE TABLE IF NOT EXISTS book_collections (
    book_id TEXT NOT NULL REFERENCES books(id) ON DELETE CASCADE,
    collection_id TEXT NOT NULL REFERENCES collections(id) ON DELETE CASCADE,
    PRIMARY KEY (book_id, collection_id)
  );`,

  `CREATE TABLE IF NOT EXISTS tags (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    color TEXT DEFAULT '#64748B'
  );`,

  `CREATE TABLE IF NOT EXISTS book_tags (
    book_id TEXT NOT NULL REFERENCES books(id) ON DELETE CASCADE,
    tag_id TEXT NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (book_id, tag_id)
  );`,

  `CREATE TABLE IF NOT EXISTS user_settings (
    id TEXT PRIMARY KEY,
    active_theme TEXT DEFAULT 'light' NOT NULL,
    warmth_level REAL DEFAULT 0.0 NOT NULL,
    font_family TEXT DEFAULT 'Literata' NOT NULL,
    font_size INTEGER DEFAULT 18 NOT NULL,
    line_height REAL DEFAULT 1.5 NOT NULL,
    margin_horizontal INTEGER DEFAULT 20 NOT NULL,
    text_align TEXT DEFAULT 'left' NOT NULL,
    keep_awake INTEGER DEFAULT 1 NOT NULL,
    haptic_feedback INTEGER DEFAULT 1 NOT NULL,
    reading_mode TEXT DEFAULT 'paginated' NOT NULL,
    hyphenation_enabled INTEGER DEFAULT 1 NOT NULL,
    justification_enabled INTEGER DEFAULT 0 NOT NULL,
    bionic_reading_enabled INTEGER DEFAULT 0 NOT NULL,
    tts_voice TEXT,
    tts_rate REAL DEFAULT 1.0 NOT NULL,
    tts_pitch REAL DEFAULT 1.0 NOT NULL,
    online_metadata_enabled INTEGER DEFAULT 0 NOT NULL
  );`,

  `CREATE TABLE IF NOT EXISTS reading_goals (
    id TEXT PRIMARY KEY,
    target_daily_minutes INTEGER DEFAULT 30 NOT NULL,
    target_daily_pages INTEGER DEFAULT 20 NOT NULL,
    current_streak_days INTEGER DEFAULT 0 NOT NULL,
    longest_streak_days INTEGER DEFAULT 0 NOT NULL,
    last_active_date TEXT
  );`,

  `CREATE TABLE IF NOT EXISTS opds_servers (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    url TEXT NOT NULL,
    username TEXT,
    password TEXT,
    icon TEXT DEFAULT 'server',
    created_at INTEGER DEFAULT (strftime('%s', 'now')) NOT NULL
  );`,

  `CREATE TABLE IF NOT EXISTS book_settings (
    book_id TEXT PRIMARY KEY REFERENCES books(id) ON DELETE CASCADE,
    font_family TEXT,
    font_size INTEGER,
    line_height REAL,
    margin_horizontal INTEGER,
    text_align TEXT,
    active_theme TEXT,
    paragraph_indent REAL,
    paragraph_spacing REAL,
    drop_caps INTEGER,
    reading_ruler_enabled INTEGER,
    reading_ruler_mode TEXT,
    updated_at INTEGER DEFAULT (strftime('%s', 'now')) NOT NULL
  );`,
];

export const MIGRATION_STATEMENTS = [
  'ALTER TABLE books ADD COLUMN rating INTEGER DEFAULT 0 NOT NULL;',
];

export const INDEX_STATEMENTS = [
  `CREATE INDEX IF NOT EXISTS idx_books_file_hash ON books (file_hash);`,
  `CREATE INDEX IF NOT EXISTS idx_books_status ON books (status);`,
  `CREATE INDEX IF NOT EXISTS idx_books_favorite ON books (is_favorite);`,
  `CREATE INDEX IF NOT EXISTS idx_books_rating ON books (rating);`,
  `CREATE INDEX IF NOT EXISTS idx_books_last_read ON books (last_read_at);`,
  `CREATE INDEX IF NOT EXISTS idx_books_updated_at ON books (updated_at);`,
  `CREATE INDEX IF NOT EXISTS idx_authors_name ON authors (name);`,
  `CREATE INDEX IF NOT EXISTS idx_book_authors_author ON book_authors (author_id);`,
  `CREATE INDEX IF NOT EXISTS idx_toc_entries_book ON toc_entries (book_id, play_order);`,
  `CREATE INDEX IF NOT EXISTS idx_reading_sessions_book ON reading_sessions (book_id);`,
  `CREATE INDEX IF NOT EXISTS idx_reading_sessions_time ON reading_sessions (start_time);`,
  `CREATE INDEX IF NOT EXISTS idx_bookmarks_book ON bookmarks (book_id, created_at);`,
  `CREATE INDEX IF NOT EXISTS idx_highlights_book ON highlights (book_id);`,
  `CREATE INDEX IF NOT EXISTS idx_notes_highlight ON notes (highlight_id);`,
];

export const SEED_STATEMENTS = [
  `INSERT OR IGNORE INTO user_settings (id, active_theme, warmth_level, font_family, font_size, line_height, margin_horizontal, text_align, keep_awake, haptic_feedback, tts_rate, tts_pitch, online_metadata_enabled)
   VALUES ('default_user', 'light', 0.0, 'Literata', 18, 1.5, 20, 'left', 1, 1, 1.0, 1.0, 0);`,
  `INSERT OR IGNORE INTO reading_goals (id, target_daily_minutes, target_daily_pages, current_streak_days, longest_streak_days)
   VALUES ('default_user', 30, 20, 0, 0);`,
];

export const TABLE_STATEMENTS = [
  ...TABLE_CREATION_STATEMENTS,
  ...INDEX_STATEMENTS,
  ...SEED_STATEMENTS,
];

export async function getDatabase(): Promise<{ db: ReturnType<typeof drizzle<typeof schema>>; sqlite: SQLite.SQLiteDatabase }> {
  if (drizzleDb && expoDb && isInitialized) {
    return { db: drizzleDb, sqlite: expoDb };
  }

  if (initPromise) {
    return initPromise;
  }

  initPromise = (async () => {
    try {
      if (!expoDb) {
        if (typeof SQLite.openDatabaseAsync === 'function') {
          expoDb = await SQLite.openDatabaseAsync(DB_NAME);
        } else if (typeof SQLite.openDatabaseSync === 'function') {
          expoDb = SQLite.openDatabaseSync(DB_NAME);
        }
      }

      if (!isInitialized && expoDb) {
        // Apply performance pragmas
        for (const pragma of PERFORMANCE_PRAGMAS) {
          try {
            if (typeof expoDb.execAsync === 'function') {
              await expoDb.execAsync(pragma);
            }
          } catch {}
        }

        await initializeTables(expoDb);
        isInitialized = true;
      }

      if (!drizzleDb && expoDb) {
        drizzleDb = drizzle(expoDb, { schema });
      }

      return { db: drizzleDb as any, sqlite: expoDb as any };
    } catch (error) {
      console.warn('SQLite init warning (falling back if in test/web):', error);
      return {
        db: drizzleDb as any,
        sqlite: expoDb as any,
      };
    } finally {
      initPromise = null;
    }
  })();

  return initPromise;
}

export async function initializeTables(sqlite: SQLite.SQLiteDatabase) {
  // 1. Create all tables
  for (const stmt of TABLE_CREATION_STATEMENTS) {
    try {
      if (typeof sqlite.execAsync === 'function') {
        await sqlite.execAsync(stmt);
      } else if (typeof (sqlite as any).execSync === 'function') {
        (sqlite as any).execSync(stmt);
      }
    } catch (err) {
      console.warn('Failed to execute table creation statement:', err);
    }
  }

  // 2. Execute safe column migrations before index creation
  for (const migration of MIGRATION_STATEMENTS) {
    try {
      if (typeof sqlite.execAsync === 'function') {
        await sqlite.execAsync(migration);
      } else if (typeof (sqlite as any).execSync === 'function') {
        (sqlite as any).execSync(migration);
      }
    } catch {
      // Column already exists or table was just created with column - completely safe
    }
  }

  // 3. Create all indexes (columns are guaranteed to exist now)
  for (const stmt of INDEX_STATEMENTS) {
    try {
      if (typeof sqlite.execAsync === 'function') {
        await sqlite.execAsync(stmt);
      } else if (typeof (sqlite as any).execSync === 'function') {
        (sqlite as any).execSync(stmt);
      }
    } catch (err) {
      console.warn('Failed to execute index statement:', err);
    }
  }

  // 4. Seed initial rows
  for (const stmt of SEED_STATEMENTS) {
    try {
      if (typeof sqlite.execAsync === 'function') {
        await sqlite.execAsync(stmt);
      } else if (typeof (sqlite as any).execSync === 'function') {
        (sqlite as any).execSync(stmt);
      }
    } catch (err) {
      console.warn('Failed to execute seed statement:', err);
    }
  }
}
