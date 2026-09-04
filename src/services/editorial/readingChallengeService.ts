import { Book } from '../../types';

export interface ChallengePacingStatus {
  status: 'ahead' | 'on_track' | 'behind';
  diff: number; // difference in books compared to expected pace
  message: string;
}

export interface ReadingChallengeProgress {
  year: number;
  targetBooks: number;
  completedBooks: Book[];
  completedCount: number;
  percentage: number;
  isCompleted: boolean;
  pacing: ChallengePacingStatus;
  milestones: {
    q1: boolean; // 25%
    q2: boolean; // 50%
    q3: boolean; // 75%
    q4: boolean; // 100%
  };
}

export const ANNUAL_CHALLENGE_PRESETS = [12, 24, 36, 50, 52] as const;
export const DEFAULT_ANNUAL_TARGET = 24;

/**
 * Calculates day of the year (1 - 366) for pacing calculations
 */
export function getDayOfYear(date: Date): number {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - start.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  return Math.floor(diff / oneDay);
}

/**
 * Checks if a given year is a leap year
 */
export function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

/**
 * Total days in the year
 */
export function getTotalDaysInYear(year: number): number {
  return isLeapYear(year) ? 366 : 365;
}

/**
 * Calculates the comprehensive Annual Reading Challenge progress for the given library books
 */
export function calculateReadingChallenge(
  books: Book[],
  targetBooks: number = DEFAULT_ANNUAL_TARGET,
  referenceDate: Date = new Date()
): ReadingChallengeProgress {
  const currentYear = referenceDate.getFullYear();
  const dayOfYear = getDayOfYear(referenceDate);
  const totalDays = getTotalDaysInYear(currentYear);

  // Filter books finished in the current year
  const completedBooks = books.filter((book) => {
    if (book.status !== 'finished') return false;

    // Check lastReadAt or updatedAt
    const dateToCheck = book.lastReadAt || book.updatedAt;
    if (dateToCheck) {
      const finishYear = new Date(dateToCheck).getFullYear();
      return finishYear === currentYear;
    }
    // If no date recorded, count it toward current challenge if finished
    return true;
  });

  const completedCount = completedBooks.length;
  const target = Math.max(1, targetBooks);
  const percentage = Math.min(100, Math.round((completedCount / target) * 100));
  const isCompleted = completedCount >= target;

  // Expected pace at this point in the year
  const expectedPace = (dayOfYear / totalDays) * target;
  const rawDiff = completedCount - expectedPace;

  let pacing: ChallengePacingStatus;
  if (rawDiff >= 1.0) {
    const aheadBy = Math.max(1, Math.round(rawDiff));
    pacing = {
      status: 'ahead',
      diff: aheadBy,
      message: `${aheadBy} book${aheadBy > 1 ? 's' : ''} ahead of schedule`,
    };
  } else if (rawDiff <= -1.0) {
    const behindBy = Math.max(1, Math.round(Math.abs(rawDiff)));
    pacing = {
      status: 'behind',
      diff: behindBy,
      message: `${behindBy} book${behindBy > 1 ? 's' : ''} behind schedule`,
    };
  } else {
    pacing = {
      status: 'on_track',
      diff: 0,
      message: 'Right on schedule!',
    };
  }

  return {
    year: currentYear,
    targetBooks: target,
    completedBooks,
    completedCount,
    percentage,
    isCompleted,
    pacing,
    milestones: {
      q1: percentage >= 25,
      q2: percentage >= 50,
      q3: percentage >= 75,
      q4: percentage >= 100,
    },
  };
}
