import { Book } from '../../types';

export interface PaceForecastOption {
  minutesPerDay: number;
  label: string; // 'Relaxed (15m)', 'Steady (30m)', 'Intensive (60m)'
  daysNeeded: number;
  finishDate: Date;
  formattedDate: string;
}

export interface ReadingVelocityForecast {
  bookId: string;
  bookTitle: string;
  wpm: number;
  pagesPerHour: number;
  remainingPages: number;
  remainingMinutes: number;
  formattedTimeRemaining: string;
  forecasts: PaceForecastOption[];
  primaryForecast: {
    daysRemaining: number;
    finishDate: Date;
    formattedDate: string;
    summary: string;
  };
}

export const DEFAULT_WPM = 220;
export const WORDS_PER_PAGE = 250;

/**
 * Formats a date into a clean human-readable representation like "Tuesday, Sep 8"
 */
export function formatForecastDate(date: Date, referenceDate: Date = new Date()): string {
  const ref = new Date(referenceDate.getFullYear(), referenceDate.getMonth(), referenceDate.getDate());
  const target = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diffDays = Math.round((target.getTime() - ref.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays <= 0) return 'Today';
  if (diffDays === 1) return 'Tomorrow';

  const dayName = target.toLocaleDateString('en-US', { weekday: 'short' });
  const monthName = target.toLocaleDateString('en-US', { month: 'short' });
  const dayNumber = target.getDate();

  return `${dayName}, ${monthName} ${dayNumber}`;
}

/**
 * Calculates velocity and finish-date forecasts for a given book
 */
export function calculateReadingVelocity(
  book: Book,
  customWpm: number = DEFAULT_WPM,
  dailyPaceMinutes: number = 30,
  referenceDate: Date = new Date()
): ReadingVelocityForecast {
  const wpm = customWpm > 0 ? customWpm : DEFAULT_WPM;
  const progressPct = Math.max(0, Math.min(100, book.progressPercentage || 0));
  const totalPages = (book.pageCount && book.pageCount > 0) ? book.pageCount : 250; // default 250 pages if unstated
  const remainingPct = (100 - progressPct) / 100;
  const remainingPages = Math.max(0, Math.ceil(totalPages * remainingPct));

  // Words remaining calculation
  const totalRemainingWords = remainingPages * WORDS_PER_PAGE;
  const remainingMinutes = Math.max(0, Math.ceil(totalRemainingWords / wpm));

  // Pages per hour based on WPM
  const pagesPerHour = Math.round((wpm * 60) / WORDS_PER_PAGE);

  // Time remaining formatted string
  let formattedTimeRemaining: string;
  if (remainingMinutes === 0) {
    formattedTimeRemaining = 'Completed';
  } else if (remainingMinutes < 60) {
    formattedTimeRemaining = `${remainingMinutes}m left`;
  } else {
    const hours = Math.floor(remainingMinutes / 60);
    const mins = remainingMinutes % 60;
    formattedTimeRemaining = mins > 0 ? `${hours}h ${mins}m left` : `${hours}h left`;
  }

  // Pre-calculate 3 distinct pace options: Relaxed (15m), Steady (30m), Intensive (60m)
  const paceConfigs = [
    { minutesPerDay: 15, label: 'Relaxed (15m/d)' },
    { minutesPerDay: Math.max(20, dailyPaceMinutes), label: `Current (${dailyPaceMinutes}m/d)` },
    { minutesPerDay: 60, label: 'Sprint (60m/d)' },
  ];

  // Remove duplicates if user daily pace matches 15 or 60
  const uniqueConfigs = paceConfigs.filter(
    (cfg, idx, self) => self.findIndex((c) => c.minutesPerDay === cfg.minutesPerDay) === idx
  );

  const forecasts: PaceForecastOption[] = uniqueConfigs.map((cfg) => {
    const daysNeeded = Math.max(1, Math.ceil(remainingMinutes / cfg.minutesPerDay));
    const targetDate = new Date(referenceDate);
    targetDate.setDate(targetDate.getDate() + (remainingMinutes === 0 ? 0 : daysNeeded));
    return {
      minutesPerDay: cfg.minutesPerDay,
      label: cfg.label,
      daysNeeded: remainingMinutes === 0 ? 0 : daysNeeded,
      finishDate: targetDate,
      formattedDate: remainingMinutes === 0 ? 'Today' : formatForecastDate(targetDate, referenceDate),
    };
  });

  const activePaceMinutes = dailyPaceMinutes > 0 ? dailyPaceMinutes : 30;
  const daysRemaining = remainingMinutes === 0 ? 0 : Math.max(1, Math.ceil(remainingMinutes / activePaceMinutes));
  const primaryDate = new Date(referenceDate);
  primaryDate.setDate(primaryDate.getDate() + daysRemaining);
  const formattedPrimaryDate = remainingMinutes === 0 ? 'Today' : formatForecastDate(primaryDate, referenceDate);

  const summary = remainingMinutes === 0
    ? 'You have finished this book!'
    : daysRemaining === 1
      ? `At ${activePaceMinutes}m/day, you'll finish tomorrow!`
      : `At ${activePaceMinutes}m/day, you'll finish in ${daysRemaining} days (${formattedPrimaryDate})`;

  return {
    bookId: book.id,
    bookTitle: book.title,
    wpm,
    pagesPerHour,
    remainingPages,
    remainingMinutes,
    formattedTimeRemaining,
    forecasts,
    primaryForecast: {
      daysRemaining,
      finishDate: primaryDate,
      formattedDate: formattedPrimaryDate,
      summary,
    },
  };
}
