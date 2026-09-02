import { sqliteTable, text, integer, real, primaryKey, index, uniqueIndex } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

// 1. Books Table
export const books = sqliteTable('books', {
  id: text('id').primaryKey(),
  fileHash: text('file_hash').notNull().unique(),
  title: text('title').notNull(),
  subtitle: text('subtitle'),
  description: text('description'),
  publisher: text('publisher'),
  publishedDate: text('published_date'),
  isbn: text('isbn'),
  language: text('language').default('en'),
  originalFilename: text('original_filename').notNull(),
  filePath: text('file_path').notNull(),
  fileFormat: text('file_format', {
    enum: ['epub', 'pdf', 'txt', 'md', 'cbz', 'cbr', 'mobi', 'azw3', 'fb2', 'docx', 'rtf', 'html'],
  }).notNull(),
  coverImagePath: text('cover_image_path'),
  fileSizeBytes: integer('file_size_bytes').notNull(),
  pageCount: integer('page_count').default(0).notNull(),
  lastReadLocation: text('last_read_location'),
  progressPercentage: real('progress_percentage').default(0.0).notNull(),
  status: text('status', { enum: ['unread', 'reading', 'finished', 'abandoned'] }).default('unread').notNull(),
  isFavorite: integer('is_favorite', { mode: 'boolean' }).default(false).notNull(),
  rating: integer('rating').default(0).notNull(), // 0 = unrated, 1 - 5 stars
  totalTimeReadSeconds: integer('total_time_read_seconds').default(0).notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`).notNull(),
  lastReadAt: integer('last_read_at', { mode: 'timestamp' }),
}, (table) => [
  uniqueIndex('books_file_hash_idx').on(table.fileHash),
  index('books_status_idx').on(table.status),
  index('books_last_read_idx').on(table.lastReadAt),
  index('books_favorite_idx').on(table.isFavorite),
  index('books_rating_idx').on(table.rating),
]);

// 2. Authors Table
export const authors = sqliteTable('authors', {
  id: text('id').primaryKey(),
  name: text('name').notNull().unique(),
  sortName: text('sort_name'),
});

// Book Authors Junction Table
export const bookAuthors = sqliteTable('book_authors', {
  bookId: text('book_id').notNull().references(() => books.id, { onDelete: 'cascade' }),
  authorId: text('author_id').notNull().references(() => authors.id, { onDelete: 'cascade' }),
  orderIndex: integer('order_index').default(0).notNull(),
}, (table) => [
  primaryKey({ columns: [table.bookId, table.authorId] }),
  index('book_authors_author_idx').on(table.authorId),
]);

// 3. Table of Contents Entries
export const tocEntries = sqliteTable('toc_entries', {
  id: text('id').primaryKey(),
  bookId: text('book_id').notNull().references(() => books.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  href: text('href'),
  cfi: text('cfi'),
  pageNumber: integer('page_number'),
  playOrder: integer('play_order').notNull(),
  level: integer('level').default(0).notNull(),
  parentId: text('parent_id'),
}, (table) => [
  index('toc_entries_book_idx').on(table.bookId, table.playOrder),
]);

// 4. Reading Sessions
export const readingSessions = sqliteTable('reading_sessions', {
  id: text('id').primaryKey(),
  bookId: text('book_id').notNull().references(() => books.id, { onDelete: 'cascade' }),
  startTime: integer('start_time', { mode: 'timestamp' }).notNull(),
  endTime: integer('end_time', { mode: 'timestamp' }).notNull(),
  durationSeconds: integer('duration_seconds').notNull(),
  startLocation: text('start_location'),
  endLocation: text('end_location'),
  pagesRead: integer('pages_read').default(0).notNull(),
}, (table) => [
  index('reading_sessions_book_idx').on(table.bookId),
  index('reading_sessions_time_idx').on(table.startTime),
]);

// 5. Bookmarks
export const bookmarks = sqliteTable('bookmarks', {
  id: text('id').primaryKey(),
  bookId: text('book_id').notNull().references(() => books.id, { onDelete: 'cascade' }),
  locationCfi: text('location_cfi'),
  pageNumber: integer('page_number'),
  title: text('title').notNull(),
  snippet: text('snippet'),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`).notNull(),
}, (table) => [
  index('bookmarks_book_idx').on(table.bookId),
]);

// 6. Highlights & Notes
export const highlights = sqliteTable('highlights', {
  id: text('id').primaryKey(),
  bookId: text('book_id').notNull().references(() => books.id, { onDelete: 'cascade' }),
  locationCfi: text('location_cfi'),
  pageNumber: integer('page_number'),
  selectedText: text('selected_text').notNull(),
  color: text('color', { enum: ['yellow', 'amber', 'mint', 'sky', 'coral'] }).default('yellow').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`).notNull(),
}, (table) => [
  index('highlights_book_idx').on(table.bookId),
]);

export const notes = sqliteTable('notes', {
  id: text('id').primaryKey(),
  highlightId: text('highlight_id').notNull().references(() => highlights.id, { onDelete: 'cascade' }),
  content: text('content').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`).notNull(),
}, (table) => [
  uniqueIndex('notes_highlight_idx').on(table.highlightId),
]);

// 7. Collections & Tags
export const collections = sqliteTable('collections', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  icon: text('icon').default('bookmark'),
  orderIndex: integer('order_index').default(0).notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`).notNull(),
});

export const bookCollections = sqliteTable('book_collections', {
  bookId: text('book_id').notNull().references(() => books.id, { onDelete: 'cascade' }),
  collectionId: text('collection_id').notNull().references(() => collections.id, { onDelete: 'cascade' }),
}, (table) => [
  primaryKey({ columns: [table.bookId, table.collectionId] }),
]);

export const tags = sqliteTable('tags', {
  id: text('id').primaryKey(),
  name: text('name').notNull().unique(),
  color: text('color').default('#64748B'),
});

export const bookTags = sqliteTable('book_tags', {
  bookId: text('book_id').notNull().references(() => books.id, { onDelete: 'cascade' }),
  tagId: text('tag_id').notNull().references(() => tags.id, { onDelete: 'cascade' }),
}, (table) => [
  primaryKey({ columns: [table.bookId, table.tagId] }),
]);

// 8. User Settings & Reading Goals
export const userSettings = sqliteTable('user_settings', {
  id: text('id').primaryKey(),
  activeTheme: text('active_theme', { enum: ['light', 'sepia', 'dark', 'oled', 'system'] }).default('light').notNull(),
  warmthLevel: real('warmth_level').default(0.0).notNull(),
  fontFamily: text('font_family').default('Literata').notNull(),
  fontSize: integer('font_size').default(18).notNull(),
  lineHeight: real('line_height').default(1.5).notNull(),
  marginHorizontal: integer('margin_horizontal').default(20).notNull(),
  textAlign: text('text_align', { enum: ['left', 'justify'] }).default('left').notNull(),
  keepAwake: integer('keep_awake', { mode: 'boolean' }).default(true).notNull(),
  hapticFeedback: integer('haptic_feedback', { mode: 'boolean' }).default(true).notNull(),
  ttsVoice: text('tts_voice'),
  ttsRate: real('tts_rate').default(1.0).notNull(),
  ttsPitch: real('tts_pitch').default(1.0).notNull(),
  onlineMetadataEnabled: integer('online_metadata_enabled', { mode: 'boolean' }).default(false).notNull(),
});

export const readingGoals = sqliteTable('reading_goals', {
  id: text('id').primaryKey(),
  targetDailyMinutes: integer('target_daily_minutes').default(30).notNull(),
  targetDailyPages: integer('target_daily_pages').default(20).notNull(),
  currentStreakDays: integer('current_streak_days').default(0).notNull(),
  longestStreakDays: integer('longest_streak_days').default(0).notNull(),
  lastActiveDate: text('last_active_date'),
});

// 9. Custom OPDS Catalogs
export const opdsServers = sqliteTable('opds_servers', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  url: text('url').notNull(),
  username: text('username'),
  password: text('password'),
  icon: text('icon').default('server'),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`).notNull(),
});

// 10. Per-Book Custom Settings
export const bookSettings = sqliteTable('book_settings', {
  bookId: text('book_id').primaryKey().references(() => books.id, { onDelete: 'cascade' }),
  fontFamily: text('font_family'),
  fontSize: integer('font_size'),
  lineHeight: real('line_height'),
  marginHorizontal: integer('margin_horizontal'),
  textAlign: text('text_align', { enum: ['left', 'justify'] }),
  activeTheme: text('active_theme'),
  paragraphIndent: real('paragraph_indent'),
  paragraphSpacing: real('paragraph_spacing'),
  dropCaps: integer('drop_caps', { mode: 'boolean' }),
  readingRulerEnabled: integer('reading_ruler_enabled', { mode: 'boolean' }),
  readingRulerMode: text('reading_ruler_mode'),
  bionicReadingEnabled: integer('bionic_reading_enabled', { mode: 'boolean' }),
  bionicFixation: text('bionic_fixation', { enum: ['low', 'medium', 'high'] }),
  readingDirection: text('reading_direction', { enum: ['horizontal', 'vertical'] }),
  pageTurnStyle: text('page_turn_style', { enum: ['slide', 'curl', 'fade', 'none'] }),
  dualPageMode: text('dual_page_mode'),
  warmthLevel: real('warmth_level'),
  autoScrollSpeed: integer('auto_scroll_speed'),
  autoScrollMode: text('auto_scroll_mode', { enum: ['smooth', 'line', 'pageTimer', 'pixel', 'wave'] }),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`).notNull(),
});


// 11. Per-Book Name Replacements & Role Reversal Rules
export const bookNameReplacements = sqliteTable('book_name_replacements', {
  id: text('id').primaryKey(),
  bookId: text('book_id').notNull().references(() => books.id, { onDelete: 'cascade' }),
  findText: text('find_text').notNull(),
  replaceText: text('replace_text').notNull(),
  matchCase: integer('match_case', { mode: 'boolean' }).default(false).notNull(),
  wholeWord: integer('whole_word', { mode: 'boolean' }).default(true).notNull(),
  isActive: integer('is_active', { mode: 'boolean' }).default(true).notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`).notNull(),
}, (table) => [
  index('book_name_replacements_book_idx').on(table.bookId, table.isActive),
]);

