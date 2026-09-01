import { eq } from 'drizzle-orm';
import { getDatabase } from '../client';
import { bookSettings } from '../schema';
import { BookSettings } from '../../types';

export async function getBookSettings(bookId: string): Promise<BookSettings | null> {
  try {
    const { db } = await getDatabase();
    if (!db) return null;
    const rows = await db.select().from(bookSettings).where(eq(bookSettings.bookId, bookId)).all();
    if (!rows || rows.length === 0) return null;

    const row = rows[0];
    return {
      bookId: row.bookId,
      fontFamily: row.fontFamily,
      fontSize: row.fontSize,
      lineHeight: row.lineHeight,
      marginHorizontal: row.marginHorizontal,
      textAlign: row.textAlign as any,
      activeTheme: row.activeTheme,
      paragraphIndent: row.paragraphIndent,
      paragraphSpacing: row.paragraphSpacing,
      dropCaps: row.dropCaps,
      readingRulerEnabled: row.readingRulerEnabled,
      readingRulerMode: row.readingRulerMode,
      updatedAt: row.updatedAt,
    };
  } catch (error) {
    console.warn('Failed to load book settings:', error);
    return null;
  }
}

export async function saveBookSettings(bookId: string, settings: Partial<BookSettings>): Promise<void> {
  try {
    const { db } = await getDatabase();
    if (!db) return;

    const payload: any = {
      bookId,
      updatedAt: new Date(),
    };

    if (settings.fontFamily !== undefined) payload.fontFamily = settings.fontFamily;
    if (settings.fontSize !== undefined) payload.fontSize = settings.fontSize;
    if (settings.lineHeight !== undefined) payload.lineHeight = settings.lineHeight;
    if (settings.marginHorizontal !== undefined) payload.marginHorizontal = settings.marginHorizontal;
    if (settings.textAlign !== undefined) payload.textAlign = settings.textAlign;
    if (settings.activeTheme !== undefined) payload.activeTheme = settings.activeTheme;
    if (settings.paragraphIndent !== undefined) payload.paragraphIndent = settings.paragraphIndent;
    if (settings.paragraphSpacing !== undefined) payload.paragraphSpacing = settings.paragraphSpacing;
    if (settings.dropCaps !== undefined) payload.dropCaps = settings.dropCaps;
    if (settings.readingRulerEnabled !== undefined) payload.readingRulerEnabled = settings.readingRulerEnabled;
    if (settings.readingRulerMode !== undefined) payload.readingRulerMode = settings.readingRulerMode;

    await db
      .insert(bookSettings)
      .values(payload)
      .onConflictDoUpdate({
        target: bookSettings.bookId,
        set: payload,
      })
      .run();
  } catch (error) {
    console.warn('Failed to save book settings:', error);
  }
}
