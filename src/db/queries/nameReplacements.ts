import { eq, and } from 'drizzle-orm';
import * as Crypto from 'expo-crypto';
import { getDatabase } from '../client';
import { bookNameReplacements } from '../schema';
import { NameReplacementRule } from '../../types';

export async function getBookNameReplacements(bookId: string): Promise<NameReplacementRule[]> {
  try {
    const { db } = await getDatabase();
    if (!db) return [];

    const rows = await db
      .select()
      .from(bookNameReplacements)
      .where(eq(bookNameReplacements.bookId, bookId))
      .all();

    return rows.map((row) => ({
      id: row.id,
      bookId: row.bookId,
      findText: row.findText,
      replaceText: row.replaceText,
      matchCase: !!row.matchCase,
      wholeWord: !!row.wholeWord,
      isActive: !!row.isActive,
      createdAt: row.createdAt ? new Date(row.createdAt) : new Date(),
      updatedAt: row.updatedAt ? new Date(row.updatedAt) : new Date(),
    }));
  } catch (error) {
    console.warn('Failed to load book name replacements from SQLite:', error);
    return [];
  }
}

export async function saveBookNameReplacement(
  bookId: string,
  rule: {
    id?: string;
    findText: string;
    replaceText: string;
    matchCase?: boolean;
    wholeWord?: boolean;
    isActive?: boolean;
  }
): Promise<NameReplacementRule | null> {
  try {
    const { db } = await getDatabase();
    if (!db) return null;

    const id = rule.id || Crypto.randomUUID();
    const now = new Date();

    const payload = {
      id,
      bookId,
      findText: rule.findText.trim(),
      replaceText: rule.replaceText.trim(),
      matchCase: rule.matchCase ?? false,
      wholeWord: rule.wholeWord ?? true,
      isActive: rule.isActive ?? true,
      updatedAt: now,
    };

    await db
      .insert(bookNameReplacements)
      .values({
        ...payload,
        createdAt: now,
      })
      .onConflictDoUpdate({
        target: bookNameReplacements.id,
        set: payload,
      })
      .run();

    return {
      ...payload,
      createdAt: now,
    };
  } catch (error) {
    console.warn('Failed to save book name replacement in SQLite:', error);
    return null;
  }
}

export async function toggleBookNameReplacement(id: string, isActive: boolean): Promise<void> {
  try {
    const { db } = await getDatabase();
    if (!db) return;

    await db
      .update(bookNameReplacements)
      .set({
        isActive,
        updatedAt: new Date(),
      })
      .where(eq(bookNameReplacements.id, id))
      .run();
  } catch (error) {
    console.warn('Failed to toggle book name replacement in SQLite:', error);
  }
}

export async function deleteBookNameReplacement(id: string): Promise<void> {
  try {
    const { db } = await getDatabase();
    if (!db) return;

    await db
      .delete(bookNameReplacements)
      .where(eq(bookNameReplacements.id, id))
      .run();
  } catch (error) {
    console.warn('Failed to delete book name replacement from SQLite:', error);
  }
}

export async function clearBookNameReplacements(bookId: string): Promise<void> {
  try {
    const { db } = await getDatabase();
    if (!db) return;

    await db
      .delete(bookNameReplacements)
      .where(eq(bookNameReplacements.bookId, bookId))
      .run();
  } catch (error) {
    console.warn('Failed to clear book name replacements from SQLite:', error);
  }
}

export async function saveAllBookNameReplacements(
  bookId: string,
  rules: Array<{
    id?: string;
    findText: string;
    replaceText: string;
    matchCase?: boolean;
    wholeWord?: boolean;
    isActive?: boolean;
  }>
): Promise<NameReplacementRule[]> {
  try {
    const { db } = await getDatabase();
    if (!db) return [];

    await clearBookNameReplacements(bookId);

    const saved: NameReplacementRule[] = [];
    for (const rule of rules) {
      const item = await saveBookNameReplacement(bookId, rule);
      if (item) {
        saved.push(item);
      }
    }
    return saved;
  } catch (error) {
    console.warn('Failed to save all book name replacements to SQLite:', error);
    return [];
  }
}
