import { eq, and } from 'drizzle-orm';
import { getDatabase } from '../client';
import { tags, bookTags, books } from '../schema';
import { Tag, Book } from '../../types';

export async function getAllTags(): Promise<Tag[]> {
  try {
    const { db } = await getDatabase();
    if (!db) return [];
    const results = await db.select().from(tags).all();
    return results.map((t) => ({
      id: t.id,
      name: t.name,
      color: t.color,
    }));
  } catch (error) {
    console.warn('Failed to fetch tags:', error);
    return [];
  }
}

export async function createTag(name: string, color?: string): Promise<Tag> {
  const { db } = await getDatabase();
  const id = `tag_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const cleanName = name.trim();
  const tagColor = color || '#64748B';

  const newTag = {
    id,
    name: cleanName,
    color: tagColor,
  };

  if (db) {
    await db.insert(tags).values(newTag).run();
  }

  return newTag;
}

export async function deleteTag(id: string): Promise<void> {
  try {
    const { db } = await getDatabase();
    if (!db) return;
    await db.delete(tags).where(eq(tags.id, id)).run();
  } catch (error) {
    console.warn('Failed to delete tag:', error);
  }
}

export async function addTagToBook(bookId: string, tagId: string): Promise<void> {
  try {
    const { db } = await getDatabase();
    if (!db) return;
    await db
      .insert(bookTags)
      .values({ bookId, tagId })
      .onConflictDoNothing()
      .run();
  } catch (error) {
    console.warn('Failed to add tag to book:', error);
  }
}

export async function removeTagFromBook(bookId: string, tagId: string): Promise<void> {
  try {
    const { db } = await getDatabase();
    if (!db) return;
    await db
      .delete(bookTags)
      .where(and(eq(bookTags.bookId, bookId), eq(bookTags.tagId, tagId)))
      .run();
  } catch (error) {
    console.warn('Failed to remove tag from book:', error);
  }
}

export async function getBookTags(bookId: string): Promise<Tag[]> {
  try {
    const { db } = await getDatabase();
    if (!db) return [];
    const rows = await db
      .select({
        id: tags.id,
        name: tags.name,
        color: tags.color,
      })
      .from(bookTags)
      .innerJoin(tags, eq(bookTags.tagId, tags.id))
      .where(eq(bookTags.bookId, bookId))
      .all();

    return rows.map((r) => ({
      id: r.id,
      name: r.name,
      color: r.color,
    }));
  } catch (error) {
    console.warn('Failed to get tags for book:', error);
    return [];
  }
}
