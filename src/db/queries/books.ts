import { eq, desc, asc, like, and, or, sql } from 'drizzle-orm';
import { getDatabase } from '../client';
import * as schema from '../schema';
import { Book, Bookmark, Highlight, Note, TOCEntry, Author, HighlightColor } from '../../types';

export async function getAllBooks(): Promise<Book[]> {
  try {
    const { db } = await getDatabase();
    if (!db) return [];

    const rawBooks = await db.select().from(schema.books).orderBy(desc(schema.books.lastReadAt), desc(schema.books.createdAt));

    const result: Book[] = [];
    for (const b of rawBooks) {
      const bookAuthorsList = await db
        .select({
          id: schema.authors.id,
          name: schema.authors.name,
          sortName: schema.authors.sortName,
        })
        .from(schema.bookAuthors)
        .innerJoin(schema.authors, eq(schema.bookAuthors.authorId, schema.authors.id))
        .where(eq(schema.bookAuthors.bookId, b.id))
        .orderBy(asc(schema.bookAuthors.orderIndex));

      // Get tags for book
      const bookTagsList = await db
        .select({
          id: schema.tags.id,
          name: schema.tags.name,
          color: schema.tags.color,
        })
        .from(schema.bookTags)
        .innerJoin(schema.tags, eq(schema.bookTags.tagId, schema.tags.id))
        .where(eq(schema.bookTags.bookId, b.id));

      result.push({
        ...b,
        progressPercentage: b.progressPercentage ?? 0,
        pageCount: b.pageCount ?? 0,
        totalTimeReadSeconds: b.totalTimeReadSeconds ?? 0,
        isFavorite: Boolean(b.isFavorite),
        rating: b.rating ?? 0,
        authors: bookAuthorsList,
        tags: bookTagsList,
      });
    }

    return result;
  } catch (error) {
    console.warn('Failed to get all books:', error);
    return [];
  }
}

export async function getBookById(id: string): Promise<Book | null> {
  try {
    const { db } = await getDatabase();
    if (!db) return null;

    const rows = await db.select().from(schema.books).where(eq(schema.books.id, id)).limit(1);
    if (rows.length === 0) return null;

    const b = rows[0];
    const bookAuthorsList = await db
      .select({
        id: schema.authors.id,
        name: schema.authors.name,
        sortName: schema.authors.sortName,
      })
      .from(schema.bookAuthors)
      .innerJoin(schema.authors, eq(schema.bookAuthors.authorId, schema.authors.id))
      .where(eq(schema.bookAuthors.bookId, b.id))
      .orderBy(asc(schema.bookAuthors.orderIndex));

    const bookTagsList = await db
      .select({
        id: schema.tags.id,
        name: schema.tags.name,
        color: schema.tags.color,
      })
      .from(schema.bookTags)
      .innerJoin(schema.tags, eq(schema.bookTags.tagId, schema.tags.id))
      .where(eq(schema.bookTags.bookId, b.id));

    return {
      ...b,
      progressPercentage: b.progressPercentage ?? 0,
      pageCount: b.pageCount ?? 0,
      totalTimeReadSeconds: b.totalTimeReadSeconds ?? 0,
      isFavorite: Boolean(b.isFavorite),
      rating: b.rating ?? 0,
      authors: bookAuthorsList,
      tags: bookTagsList,
    };
  } catch (error) {
    console.warn('Failed to get book by id:', error);
    return null;
  }
}

export async function getBookByHash(fileHash: string): Promise<Book | null> {
  const { db } = await getDatabase();
  if (!db) return null;

  const rows = await db.select().from(schema.books).where(eq(schema.books.fileHash, fileHash)).limit(1);
  if (rows.length === 0) return null;
  return getBookById(rows[0].id);
}

export async function insertBook(
  bookData: typeof schema.books.$inferInsert,
  authorsList: { name: string; sortName?: string }[] = [],
  toc: { title: string; href?: string; cfi?: string; pageNumber?: number; playOrder: number; level: number; parentId?: string }[] = []
): Promise<string> {
  const { db, sqlite } = await getDatabase();
  if (!db || !sqlite) throw new Error('Database not available');

  // Insert book
  await db.insert(schema.books).values(bookData);

  // Insert authors and junction records
  for (let i = 0; i < authorsList.length; i++) {
    const authorData = authorsList[i];
    const authorId = `author_${authorData.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;

    await sqlite.runAsync(
      `INSERT OR IGNORE INTO authors (id, name, sort_name) VALUES (?, ?, ?);`,
      [authorId, authorData.name, authorData.sortName || null]
    );

    await sqlite.runAsync(
      `INSERT OR REPLACE INTO book_authors (book_id, author_id, order_index) VALUES (?, ?, ?);`,
      [bookData.id, authorId, i]
    );
  }

  // Insert TOC entries
  for (const item of toc) {
    const tocId = `${bookData.id}_toc_${item.playOrder}`;
    await sqlite.runAsync(
      `INSERT OR REPLACE INTO toc_entries (id, book_id, title, href, cfi, page_number, play_order, level, parent_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);`,
      [tocId, bookData.id, item.title, item.href || null, item.cfi || null, item.pageNumber || null, item.playOrder, item.level || 0, item.parentId || null]
    );
  }

  return bookData.id;
}

export async function updateBookProgress(
  id: string,
  location: string,
  progressPercentage: number,
  readingTimeDeltaSeconds: number = 0
): Promise<void> {
  const { db, sqlite } = await getDatabase();
  if (!db || !sqlite) return;

  const status = progressPercentage >= 99.5 ? 'finished' : 'reading';

  await sqlite.runAsync(
    `UPDATE books 
     SET last_read_location = ?,
         progress_percentage = ?,
         status = CASE WHEN status = 'finished' AND ? < 99.5 THEN 'reading' ELSE ? END,
         total_time_read_seconds = total_time_read_seconds + ?,
         updated_at = strftime('%s', 'now'),
         last_read_at = strftime('%s', 'now')
     WHERE id = ?;`,
    [location, progressPercentage, progressPercentage, status, readingTimeDeltaSeconds, id]
  );
}

export async function toggleBookFavorite(id: string, current: boolean): Promise<boolean> {
  const { sqlite } = await getDatabase();
  if (!sqlite) return !current;

  const nextVal = current ? 0 : 1;
  await sqlite.runAsync(`UPDATE books SET is_favorite = ?, updated_at = strftime('%s', 'now') WHERE id = ?;`, [nextVal, id]);
  return !current;
}

export async function deleteBook(id: string): Promise<void> {
  const { sqlite } = await getDatabase();
  if (!sqlite) return;
  await sqlite.runAsync(`DELETE FROM books WHERE id = ?;`, [id]);
}

export async function updateBookStatus(id: string, status: 'unread' | 'reading' | 'finished'): Promise<void> {
  const { sqlite } = await getDatabase();
  if (!sqlite) return;
  const progress = status === 'finished' ? 100 : (status === 'unread' ? 0 : 50);
  await sqlite.runAsync(
    `UPDATE books SET status = ?, progress_percentage = ?, updated_at = strftime('%s', 'now') WHERE id = ?;`,
    [status, progress, id]
  );
}

export async function getBookTOC(bookId: string): Promise<TOCEntry[]> {
  const { db } = await getDatabase();
  if (!db) return [];

  return db
    .select()
    .from(schema.tocEntries)
    .where(eq(schema.tocEntries.bookId, bookId))
    .orderBy(asc(schema.tocEntries.playOrder));
}

// Bookmarks
export async function getBookmarks(bookId: string): Promise<Bookmark[]> {
  const { db } = await getDatabase();
  if (!db) return [];

  return db
    .select()
    .from(schema.bookmarks)
    .where(eq(schema.bookmarks.bookId, bookId))
    .orderBy(desc(schema.bookmarks.createdAt));
}

export async function addBookmark(bookId: string, title: string, locationCfi?: string, pageNumber?: number, snippet?: string): Promise<Bookmark> {
  const { sqlite } = await getDatabase();
  const id = `bm_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const now = Math.floor(Date.now() / 1000);

  if (sqlite) {
    await sqlite.runAsync(
      `INSERT INTO bookmarks (id, book_id, location_cfi, page_number, title, snippet, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?);`,
      [id, bookId, locationCfi || null, pageNumber || null, title, snippet || null, now]
    );
  }

  return {
    id,
    bookId,
    title,
    locationCfi,
    pageNumber,
    snippet,
    createdAt: new Date(now * 1000),
  };
}

export async function deleteBookmark(id: string): Promise<void> {
  const { sqlite } = await getDatabase();
  if (sqlite) {
    await sqlite.runAsync(`DELETE FROM bookmarks WHERE id = ?;`, [id]);
  }
}

// Highlights & Notes
export async function getHighlights(bookId: string): Promise<Highlight[]> {
  const { db } = await getDatabase();
  if (!db) return [];

  const rawHighlights = await db
    .select()
    .from(schema.highlights)
    .where(eq(schema.highlights.bookId, bookId))
    .orderBy(desc(schema.highlights.createdAt));

  const result: Highlight[] = [];
  for (const h of rawHighlights) {
    const noteRows = await db.select().from(schema.notes).where(eq(schema.notes.highlightId, h.id)).limit(1);
    result.push({
      ...h,
      color: h.color as HighlightColor,
      note: noteRows.length > 0 ? noteRows[0] : null,
    });
  }

  return result;
}

export async function addHighlight(
  bookId: string,
  selectedText: string,
  color: HighlightColor = 'yellow',
  locationCfi?: string,
  pageNumber?: number,
  noteContent?: string
): Promise<Highlight> {
  const { sqlite } = await getDatabase();
  const highlightId = `hl_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const now = Math.floor(Date.now() / 1000);

  if (sqlite) {
    await sqlite.runAsync(
      `INSERT INTO highlights (id, book_id, location_cfi, page_number, selected_text, color, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?);`,
      [highlightId, bookId, locationCfi || null, pageNumber || null, selectedText, color, now, now]
    );

    if (noteContent && noteContent.trim()) {
      const noteId = `note_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      await sqlite.runAsync(
        `INSERT INTO notes (id, highlight_id, content, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?);`,
        [noteId, highlightId, noteContent.trim(), now, now]
      );
    }
  }

  return {
    id: highlightId,
    bookId,
    selectedText,
    color,
    locationCfi,
    pageNumber,
    note: noteContent ? { id: `note_${Date.now()}`, highlightId, content: noteContent, createdAt: new Date(), updatedAt: new Date() } : null,
    createdAt: new Date(now * 1000),
    updatedAt: new Date(now * 1000),
  };
}

export async function deleteHighlight(id: string): Promise<void> {
  const { sqlite } = await getDatabase();
  if (sqlite) {
    await sqlite.runAsync(`DELETE FROM highlights WHERE id = ?;`, [id]);
  }
}

export async function updateBookCover(id: string, coverImagePath: string): Promise<void> {
  const { sqlite } = await getDatabase();
  if (sqlite) {
    await sqlite.runAsync(
      `UPDATE books SET cover_image_path = ?, updated_at = strftime('%s', 'now') WHERE id = ?;`,
      [coverImagePath, id]
    );
  }
}

export async function updateBookRating(id: string, rating: number): Promise<void> {
  const { sqlite } = await getDatabase();
  const clampedRating = Math.max(0, Math.min(5, Math.round(rating)));
  if (sqlite) {
    await sqlite.runAsync(
      `UPDATE books SET rating = ?, updated_at = strftime('%s', 'now') WHERE id = ?;`,
      [clampedRating, id]
    );
  }
}

