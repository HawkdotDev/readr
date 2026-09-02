import { describe, it, expect } from 'bun:test';
import * as schema from '../../src/db/schema';
import {
  TABLE_CREATION_STATEMENTS,
  MIGRATION_STATEMENTS,
  INDEX_STATEMENTS,
  SEED_STATEMENTS,
  PERFORMANCE_PRAGMAS,
  DB_NAME,
} from '../../src/db/client';

describe('Database Schema & DDL Statements Integrity', () => {
  it('defines the correct database filename and memory performance pragmas', () => {
    expect(DB_NAME).toBe('readr.db');
    expect(PERFORMANCE_PRAGMAS).toContain('PRAGMA journal_mode = WAL;');
    expect(PERFORMANCE_PRAGMAS).toContain('PRAGMA foreign_keys = ON;');
    expect(PERFORMANCE_PRAGMAS).toContain('PRAGMA synchronous = NORMAL;');
  });

  it('contains DDL statements for all core entities', () => {
    const requiredTables = [
      'books',
      'authors',
      'book_authors',
      'toc_entries',
      'reading_sessions',
      'bookmarks',
      'highlights',
      'notes',
      'collections',
      'book_collections',
      'tags',
      'book_tags',
      'user_settings',
      'reading_goals',
      'opds_servers',
      'book_settings',
      'book_name_replacements',
    ];

    const joinedStatements = TABLE_CREATION_STATEMENTS.join('\n');

    for (const table of requiredTables) {
      expect(joinedStatements).toContain(`CREATE TABLE IF NOT EXISTS ${table}`);
    }
  });

  it('contains required index statements for query performance', () => {
    const requiredIndexes = [
      'idx_books_file_hash',
      'idx_books_status',
      'idx_books_favorite',
      'idx_books_rating',
      'idx_books_last_read',
      'idx_books_updated_at',
      'idx_authors_name',
      'idx_book_authors_author',
      'idx_toc_entries_book',
      'idx_reading_sessions_book',
      'idx_reading_sessions_time',
      'idx_bookmarks_book',
      'idx_highlights_book',
      'idx_notes_highlight',
      'idx_book_name_replacements_book',
    ];

    const joinedIndexes = INDEX_STATEMENTS.join('\n');

    for (const indexName of requiredIndexes) {
      expect(joinedIndexes).toContain(`CREATE INDEX IF NOT EXISTS ${indexName}`);
    }
  });

  it('contains safe column migration statements', () => {
    const joinedMigrations = MIGRATION_STATEMENTS.join('\n');
    expect(joinedMigrations).toContain('ALTER TABLE books ADD COLUMN rating');
    expect(joinedMigrations).toContain('ALTER TABLE book_settings ADD COLUMN bionic_reading_enabled');
    expect(joinedMigrations).toContain('ALTER TABLE book_settings ADD COLUMN reading_direction');
    expect(joinedMigrations).toContain('ALTER TABLE book_settings ADD COLUMN auto_scroll_mode');
  });

  it('seeds default user settings and reading goals', () => {
    const joinedSeeds = SEED_STATEMENTS.join('\n');
    expect(joinedSeeds).toContain('INSERT OR IGNORE INTO user_settings');
    expect(joinedSeeds).toContain('INSERT OR IGNORE INTO reading_goals');
  });

  it('validates Drizzle ORM schema table exports', () => {
    expect(schema.books).toBeDefined();
    expect(schema.authors).toBeDefined();
    expect(schema.bookAuthors).toBeDefined();
    expect(schema.tocEntries).toBeDefined();
    expect(schema.readingSessions).toBeDefined();
    expect(schema.bookmarks).toBeDefined();
    expect(schema.highlights).toBeDefined();
    expect(schema.notes).toBeDefined();
    expect(schema.collections).toBeDefined();
    expect(schema.bookCollections).toBeDefined();
    expect(schema.tags).toBeDefined();
    expect(schema.bookTags).toBeDefined();
    expect(schema.userSettings).toBeDefined();
    expect(schema.readingGoals).toBeDefined();
    expect(schema.opdsServers).toBeDefined();
    expect(schema.bookSettings).toBeDefined();
    expect(schema.bookNameReplacements).toBeDefined();
  });
});
