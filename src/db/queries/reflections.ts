import { eq, desc, gte } from 'drizzle-orm';
import { getDatabase } from '../client';
import * as schema from '../schema';

export interface Reflection {
  id: string;
  bookId?: string | null;
  prompt: string;
  response: string;
  createdAt: Date;
}

export async function saveReflection(
  prompt: string,
  response: string,
  bookId?: string | null
): Promise<Reflection> {
  const { sqlite } = await getDatabase();
  const id = `refl_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const now = Math.floor(Date.now() / 1000);

  if (sqlite) {
    await sqlite.runAsync(
      `INSERT INTO reflections (id, book_id, prompt, response, created_at)
       VALUES (?, ?, ?, ?, ?);`,
      [id, bookId || null, prompt, response, now]
    );
  }

  return {
    id,
    bookId: bookId || null,
    prompt,
    response,
    createdAt: new Date(now * 1000),
  };
}

export async function getRecentReflections(limit: number = 20): Promise<Reflection[]> {
  const { db } = await getDatabase();
  if (!db) return [];

  try {
    const rows = await db
      .select()
      .from(schema.reflections)
      .orderBy(desc(schema.reflections.createdAt))
      .limit(limit);

    return rows.map((r) => ({
      id: r.id,
      bookId: r.bookId,
      prompt: r.prompt,
      response: r.response,
      createdAt: r.createdAt instanceof Date ? r.createdAt : new Date((r.createdAt as any) * 1000),
    }));
  } catch {
    return [];
  }
}

export async function getTodayReflection(): Promise<Reflection | null> {
  const { db } = await getDatabase();
  if (!db) return null;

  try {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const rows = await db
      .select()
      .from(schema.reflections)
      .where(gte(schema.reflections.createdAt, startOfToday))
      .orderBy(desc(schema.reflections.createdAt))
      .limit(1);

    if (rows.length === 0) return null;

    const r = rows[0];
    return {
      id: r.id,
      bookId: r.bookId,
      prompt: r.prompt,
      response: r.response,
      createdAt: r.createdAt instanceof Date ? r.createdAt : new Date((r.createdAt as any) * 1000),
    };
  } catch {
    return null;
  }
}

export async function deleteReflection(id: string): Promise<void> {
  const { sqlite } = await getDatabase();
  if (sqlite) {
    await sqlite.runAsync(`DELETE FROM reflections WHERE id = ?;`, [id]);
  }
}
