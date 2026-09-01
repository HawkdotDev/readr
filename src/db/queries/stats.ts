import { eq, desc, gte, lte, sql } from 'drizzle-orm';
import { getDatabase } from '../client';
import * as schema from '../schema';
import { ReadingSession } from '../../types';
import { getReadingGoals, updateReadingGoals } from './settings';

export async function logReadingSession(
  bookId: string,
  startTime: Date,
  endTime: Date,
  startLocation?: string,
  endLocation?: string,
  pagesRead: number = 0
): Promise<ReadingSession> {
  const { sqlite } = await getDatabase();
  const id = `sess_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const durationSeconds = Math.max(1, Math.round((endTime.getTime() - startTime.getTime()) / 1000));
  const startSec = Math.floor(startTime.getTime() / 1000);
  const endSec = Math.floor(endTime.getTime() / 1000);

  if (sqlite) {
    await sqlite.runAsync(
      `INSERT INTO reading_sessions (id, book_id, start_time, end_time, duration_seconds, start_location, end_location, pages_read)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?);`,
      [id, bookId, startSec, endSec, durationSeconds, startLocation || null, endLocation || null, pagesRead]
    );

    // Update streak and last active date
    await updateStreakOnSession(endTime);
  }

  return {
    id,
    bookId,
    startTime,
    endTime,
    durationSeconds,
    startLocation,
    endLocation,
    pagesRead,
  };
}

async function updateStreakOnSession(sessionDate: Date): Promise<void> {
  const todayStr = sessionDate.toISOString().split('T')[0];
  const goals = await getReadingGoals();

  if (goals.lastActiveDate === todayStr) {
    // Already logged today
    return;
  }

  const yesterday = new Date(sessionDate);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  let nextStreak = 1;
  if (goals.lastActiveDate === yesterdayStr) {
    nextStreak = goals.currentStreakDays + 1;
  }

  const longest = Math.max(goals.longestStreakDays, nextStreak);

  await updateReadingGoals({
    currentStreakDays: nextStreak,
    longestStreakDays: longest,
    lastActiveDate: todayStr,
  });
}

export interface EnrichedReadingSession extends ReadingSession {
  bookTitle?: string;
  bookAuthor?: string;
  coverImagePath?: string | null;
  fileFormat?: string;
}

export async function getRecentSessions(limit: number = 30): Promise<ReadingSession[]> {
  const { db } = await getDatabase();
  if (!db) return [];

  return db
    .select()
    .from(schema.readingSessions)
    .orderBy(desc(schema.readingSessions.startTime))
    .limit(limit);
}

export async function getRecentSessionsWithBooks(limit: number = 20): Promise<EnrichedReadingSession[]> {
  const { sqlite } = await getDatabase();
  if (!sqlite) return [];

  try {
    const rows = (await sqlite.getAllAsync(
      `SELECT 
        s.id,
        s.book_id,
        s.start_time,
        s.end_time,
        s.duration_seconds,
        s.start_location,
        s.end_location,
        s.pages_read,
        b.title AS book_title,
        b.cover_image_path,
        b.file_format,
        (SELECT a.name FROM book_authors ba JOIN authors a ON ba.author_id = a.id WHERE ba.book_id = b.id LIMIT 1) AS book_author
       FROM reading_sessions s
       LEFT JOIN books b ON s.book_id = b.id
       ORDER BY s.start_time DESC
       LIMIT ?;`,
      [limit]
    )) as any[];

    return rows.map((r) => ({
      id: r.id,
      bookId: r.book_id,
      startTime: new Date(r.start_time * 1000),
      endTime: new Date(r.end_time * 1000),
      durationSeconds: r.duration_seconds || 0,
      startLocation: r.start_location,
      endLocation: r.end_location,
      pagesRead: r.pages_read || 0,
      bookTitle: r.book_title || 'Reading Session',
      bookAuthor: r.book_author || 'Unknown Author',
      coverImagePath: r.cover_image_path,
      fileFormat: r.file_format || 'epub',
    }));
  } catch (e) {
    console.warn('Failed to query recent sessions with books, fallback to basic:', e);
    const basic = await getRecentSessions(limit);
    return basic.map((b) => ({
      ...b,
      bookTitle: 'Reading Session',
      bookAuthor: 'Readr',
      coverImagePath: null,
      fileFormat: 'epub',
    }));
  }
}

export interface DayActivity {
  date: string; // YYYY-MM-DD
  minutesRead: number;
  pagesRead: number;
  count: number;
}

export async function getActivityHistory(daysCount: number = 365): Promise<DayActivity[]> {
  const { sqlite } = await getDatabase();
  if (!sqlite) return [];

  const rows = (await sqlite.getAllAsync(
    `SELECT 
      strftime('%Y-%m-%d', datetime(start_time, 'unixepoch')) AS day,
      SUM(duration_seconds) AS total_seconds,
      SUM(pages_read) AS total_pages,
      COUNT(*) AS session_count
     FROM reading_sessions
     WHERE start_time >= strftime('%s', 'now', ?)
     GROUP BY day
     ORDER BY day ASC;`,
    [`-${daysCount} days`]
  )) as { day: string; total_seconds: number; total_pages: number; session_count: number }[];

  return rows.map((r: { day: string; total_seconds: number; total_pages: number; session_count: number }) => ({
    date: r.day,
    minutesRead: Math.round(r.total_seconds / 60),
    pagesRead: r.total_pages,
    count: r.session_count,
  }));
}

export interface LifetimeStats {
  totalBooksRead: number;
  totalTimeSeconds: number;
  totalHighlights: number;
  totalNotes: number;
  totalPages: number;
  currentStreakDays: number;
}

export async function getLifetimeStats(): Promise<LifetimeStats> {
  const { sqlite } = await getDatabase();
  const goals = await getReadingGoals();

  if (!sqlite) {
    return {
      totalBooksRead: 0,
      totalTimeSeconds: 0,
      totalHighlights: 0,
      totalNotes: 0,
      totalPages: 0,
      currentStreakDays: goals.currentStreakDays,
    };
  }

  const bookRow = (await sqlite.getFirstAsync(
    `SELECT 
      COUNT(CASE WHEN status = 'finished' THEN 1 END) AS count,
      COALESCE(SUM(total_time_read_seconds), 0) AS total_time
     FROM books;`
  )) as { count: number; total_time: number } | null;

  const hlRow = (await sqlite.getFirstAsync(`SELECT COUNT(*) AS count FROM highlights;`)) as { count: number } | null;
  const noteRow = (await sqlite.getFirstAsync(`SELECT COUNT(*) AS count FROM notes;`)) as { count: number } | null;
  const pagesRow = (await sqlite.getFirstAsync(`SELECT COALESCE(SUM(pages_read), 0) AS count FROM reading_sessions;`)) as { count: number } | null;

  return {
    totalBooksRead: bookRow?.count ?? 0,
    totalTimeSeconds: bookRow?.total_time ?? 0,
    totalHighlights: hlRow?.count ?? 0,
    totalNotes: noteRow?.count ?? 0,
    totalPages: pagesRow?.count ?? 0,
    currentStreakDays: goals.currentStreakDays,
  };
}
