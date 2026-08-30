import { eq, asc } from 'drizzle-orm';
import { getDatabase } from '../client';
import * as schema from '../schema';
import { Collection } from '../../types';

export async function getAllCollections(): Promise<Collection[]> {
  const { db, sqlite } = await getDatabase();
  if (!db || !sqlite) return [];

  const cols = await db.select().from(schema.collections).orderBy(asc(schema.collections.orderIndex));
  const result: Collection[] = [];

  for (const c of cols) {
    const countRow = (await sqlite.getFirstAsync(
      `SELECT COUNT(*) AS count FROM book_collections WHERE collection_id = ?;`,
      [c.id]
    )) as { count: number } | null;

    result.push({
      ...c,
      bookCount: countRow?.count ?? 0,
    });
  }

  return result;
}

export async function createCollection(name: string, description?: string, icon: string = 'bookmark'): Promise<Collection> {
  const { sqlite } = await getDatabase();
  const id = `col_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const now = Math.floor(Date.now() / 1000);

  if (sqlite) {
    await sqlite.runAsync(
      `INSERT INTO collections (id, name, description, icon, order_index, created_at)
       VALUES (?, ?, ?, ?, (SELECT COALESCE(MAX(order_index) + 1, 0) FROM collections), ?);`,
      [id, name, description || null, icon, now]
    );
  }

  return {
    id,
    name,
    description,
    icon,
    orderIndex: 0,
    createdAt: new Date(now * 1000),
    bookCount: 0,
  };
}

export async function deleteCollection(id: string): Promise<void> {
  const { sqlite } = await getDatabase();
  if (sqlite) {
    await sqlite.runAsync(`DELETE FROM collections WHERE id = ?;`, [id]);
  }
}

export async function addBookToCollection(bookId: string, collectionId: string): Promise<void> {
  const { sqlite } = await getDatabase();
  if (sqlite) {
    await sqlite.runAsync(`INSERT OR IGNORE INTO book_collections (book_id, collection_id) VALUES (?, ?);`, [bookId, collectionId]);
  }
}

export async function removeBookFromCollection(bookId: string, collectionId: string): Promise<void> {
  const { sqlite } = await getDatabase();
  if (sqlite) {
    await sqlite.runAsync(`DELETE FROM book_collections WHERE book_id = ? AND collection_id = ?;`, [bookId, collectionId]);
  }
}

export async function getBooksInCollection(collectionId: string): Promise<string[]> {
  const { sqlite } = await getDatabase();
  if (!sqlite) return [];

  const rows = (await sqlite.getAllAsync(
    `SELECT book_id FROM book_collections WHERE collection_id = ?;`,
    [collectionId]
  )) as { book_id: string }[];

  return rows.map((r: { book_id: string }) => r.book_id);
}
