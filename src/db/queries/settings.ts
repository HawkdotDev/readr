import { eq } from 'drizzle-orm';
import { getDatabase } from '../client';
import * as schema from '../schema';
import { UserSettings, ReadingGoal } from '../../types';

export async function getUserSettings(): Promise<UserSettings> {
  const { db, sqlite } = await getDatabase();
  const defaultSettings: UserSettings = {
    id: 'default_user',
    activeTheme: 'light',
    warmthLevel: 0.0,
    fontFamily: 'Literata',
    fontSize: 18,
    lineHeight: 1.5,
    marginHorizontal: 20,
    textAlign: 'left',
    keepAwake: true,
    hapticFeedback: true,
    ttsRate: 1.0,
    ttsPitch: 1.0,
    onlineMetadataEnabled: false,
  };

  if (!db) return defaultSettings;

  try {
    const rows = await db.select().from(schema.userSettings).where(eq(schema.userSettings.id, 'default_user')).limit(1);
    if (rows.length === 0) return defaultSettings;
    const r = rows[0];
    return {
      ...r,
      activeTheme: r.activeTheme as any,
      textAlign: r.textAlign as any,
      keepAwake: Boolean(r.keepAwake),
      hapticFeedback: Boolean(r.hapticFeedback),
      onlineMetadataEnabled: Boolean(r.onlineMetadataEnabled),
    };
  } catch {
    return defaultSettings;
  }
}

export async function updateUserSettings(partial: Partial<UserSettings>): Promise<void> {
  const { sqlite } = await getDatabase();
  if (!sqlite) return;

  const current = await getUserSettings();
  const next = { ...current, ...partial };

  await sqlite.runAsync(
    `INSERT OR REPLACE INTO user_settings (
      id, active_theme, warmth_level, font_family, font_size, line_height, margin_horizontal, text_align, keep_awake, haptic_feedback, tts_voice, tts_rate, tts_pitch, online_metadata_enabled
    ) VALUES ('default_user', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
    [
      next.activeTheme ?? 'light',
      next.warmthLevel ?? 0.0,
      next.fontFamily ?? 'Literata',
      next.fontSize ?? 18,
      next.lineHeight ?? 1.5,
      next.marginHorizontal ?? 20,
      next.textAlign ?? 'left',
      next.keepAwake ? 1 : 0,
      next.hapticFeedback ? 1 : 0,
      next.ttsVoice || null,
      next.ttsRate ?? 1.0,
      next.ttsPitch ?? 1.0,
      next.onlineMetadataEnabled ? 1 : 0,
    ]
  );
}

export async function getReadingGoals(): Promise<ReadingGoal> {
  const { db } = await getDatabase();
  const defaultGoals: ReadingGoal = {
    id: 'default_user',
    targetDailyMinutes: 30,
    targetDailyPages: 20,
    currentStreakDays: 0,
    longestStreakDays: 0,
    lastActiveDate: null,
  };

  if (!db) return defaultGoals;

  try {
    const rows = await db.select().from(schema.readingGoals).where(eq(schema.readingGoals.id, 'default_user')).limit(1);
    if (rows.length === 0) return defaultGoals;
    return rows[0];
  } catch {
    return defaultGoals;
  }
}

export async function updateReadingGoals(partial: Partial<ReadingGoal>): Promise<void> {
  const { sqlite } = await getDatabase();
  if (!sqlite) return;

  const current = await getReadingGoals();
  const next = { ...current, ...partial };

  await sqlite.runAsync(
    `INSERT OR REPLACE INTO reading_goals (
      id, target_daily_minutes, target_daily_pages, current_streak_days, longest_streak_days, last_active_date
    ) VALUES ('default_user', ?, ?, ?, ?, ?);`,
    [
      next.targetDailyMinutes ?? 30,
      next.targetDailyPages ?? 20,
      next.currentStreakDays ?? 0,
      next.longestStreakDays ?? 0,
      next.lastActiveDate ?? null,
    ]
  );
}
