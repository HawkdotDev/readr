import { eq } from 'drizzle-orm';
import { getDatabase } from '../client';
import { bookSettings } from '../schema';
import { BookSettings } from '../../types';

const BOOK_SETTINGS_CACHE = new Map<string, BookSettings>();
const MAX_BOOK_SETTINGS_CACHE = 64;

export async function getBookSettings(bookId: string): Promise<BookSettings | null> {
  const cached = BOOK_SETTINGS_CACHE.get(bookId);
  if (cached) return { ...cached };

  try {
    const { db } = await getDatabase();
    if (!db) return null;
    const rows = await db.select().from(bookSettings).where(eq(bookSettings.bookId, bookId)).all();
    if (!rows || rows.length === 0) return null;

    const row = rows[0];
    const resolved: BookSettings = {
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
      bionicReadingEnabled: row.bionicReadingEnabled,
      bionicFixation: row.bionicFixation as any,
      readingDirection: row.readingDirection as any,
      pageTurnStyle: row.pageTurnStyle as any,
      dualPageMode: row.dualPageMode === 'true' ? true : row.dualPageMode === 'false' ? false : (row.dualPageMode as any),
      warmthLevel: row.warmthLevel,
      autoScrollSpeed: row.autoScrollSpeed,
      autoScrollMode: row.autoScrollMode as any,
      updatedAt: row.updatedAt,
    };

    if (BOOK_SETTINGS_CACHE.size >= MAX_BOOK_SETTINGS_CACHE) {
      const oldestKey = BOOK_SETTINGS_CACHE.keys().next().value;
      if (oldestKey) BOOK_SETTINGS_CACHE.delete(oldestKey);
    }
    BOOK_SETTINGS_CACHE.set(bookId, resolved);

    return resolved;
  } catch (error) {
    console.warn('Failed to load book settings:', error);
    return null;
  }
}

export async function saveBookSettings(bookId: string, settings: Partial<BookSettings>): Promise<void> {
  // Update memory cache immediately
  const existing = BOOK_SETTINGS_CACHE.get(bookId);
  if (existing) {
    BOOK_SETTINGS_CACHE.set(bookId, { ...existing, ...settings, updatedAt: new Date() });
  }
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
    if (settings.bionicReadingEnabled !== undefined) payload.bionicReadingEnabled = settings.bionicReadingEnabled;
    if (settings.bionicFixation !== undefined) payload.bionicFixation = settings.bionicFixation;
    if (settings.readingDirection !== undefined) payload.readingDirection = settings.readingDirection;
    if (settings.pageTurnStyle !== undefined) payload.pageTurnStyle = settings.pageTurnStyle;
    if (settings.dualPageMode !== undefined) payload.dualPageMode = String(settings.dualPageMode);
    if (settings.warmthLevel !== undefined) payload.warmthLevel = settings.warmthLevel;
    if (settings.autoScrollSpeed !== undefined) payload.autoScrollSpeed = settings.autoScrollSpeed;
    if (settings.autoScrollMode !== undefined) payload.autoScrollMode = settings.autoScrollMode;

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

