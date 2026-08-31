export interface ReadingSession {
  id: string;
  bookId: string;
  startTime: Date;
  endTime: Date;
  durationSeconds: number;
  startLocation?: string | null;
  endLocation?: string | null;
  pagesRead: number;
}

export interface ReadingGoal {
  id: string;
  targetDailyMinutes: number;
  targetDailyPages: number;
  targetMinutesPerDay?: number;
  targetPagesPerDay?: number;
  currentStreakDays: number;
  longestStreakDays: number;
  lastActiveDate?: string | null; // YYYY-MM-DD
}

export interface StreakDay {
  date: string; // YYYY-MM-DD
  minutesRead: number;
  pagesRead: number;
  goalMet: boolean;
}

export interface ReadingStatsSummary {
  totalSecondsRead: number;
  totalPagesRead: number;
  totalBooksCompleted: number;
  currentStreak: number;
  longestStreak: number;
}
