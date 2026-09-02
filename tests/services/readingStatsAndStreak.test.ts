import { describe, it, expect } from 'bun:test';

describe('Reading Statistics, Goal Tracking & Streak Calculation Logic', () => {
  function computeNextStreak(
    lastActiveDate: string | null,
    currentStreakDays: number,
    longestStreakDays: number,
    sessionDate: Date
  ): { nextStreak: number; nextLongest: number; isSameDay: boolean } {
    const todayStr = sessionDate.toISOString().split('T')[0];

    if (lastActiveDate === todayStr) {
      return { nextStreak: currentStreakDays, nextLongest: longestStreakDays, isSameDay: true };
    }

    const yesterday = new Date(sessionDate);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    let nextStreak = 1;
    if (lastActiveDate === yesterdayStr) {
      nextStreak = currentStreakDays + 1;
    }

    const nextLongest = Math.max(longestStreakDays, nextStreak);
    return { nextStreak, nextLongest, isSameDay: false };
  }

  it('starts a new streak at 1 on the user first ever reading session', () => {
    const today = new Date('2026-09-02T10:00:00Z');
    const { nextStreak, nextLongest, isSameDay } = computeNextStreak(null, 0, 0, today);

    expect(nextStreak).toBe(1);
    expect(nextLongest).toBe(1);
    expect(isSameDay).toBe(false);
  });

  it('increments streak when reading on consecutive days', () => {
    const yesterdayDate = new Date('2026-09-01T10:00:00Z');
    const today = new Date('2026-09-02T10:00:00Z');

    const { nextStreak, nextLongest } = computeNextStreak(
      '2026-09-01',
      5,
      12,
      today
    );

    expect(nextStreak).toBe(6);
    expect(nextLongest).toBe(12);
  });

  it('updates longest streak when current streak surpasses previous record', () => {
    const today = new Date('2026-09-02T10:00:00Z');
    const { nextStreak, nextLongest } = computeNextStreak(
      '2026-09-01',
      12,
      12,
      today
    );

    expect(nextStreak).toBe(13);
    expect(nextLongest).toBe(13);
  });

  it('maintains streak on multiple reading sessions within the same calendar day', () => {
    const today = new Date('2026-09-02T16:00:00Z');
    const { nextStreak, nextLongest, isSameDay } = computeNextStreak(
      '2026-09-02',
      7,
      15,
      today
    );

    expect(nextStreak).toBe(7);
    expect(nextLongest).toBe(15);
    expect(isSameDay).toBe(true);
  });

  it('resets streak to 1 after missing one or more days while preserving longest streak record', () => {
    const today = new Date('2026-09-05T10:00:00Z'); // 3 days gap since last active
    const { nextStreak, nextLongest } = computeNextStreak(
      '2026-09-01',
      10,
      25,
      today
    );

    expect(nextStreak).toBe(1);
    expect(nextLongest).toBe(25);
  });

  it('aggregates daily reading activity into day minutes and page counts', () => {
    const rawSessions = [
      { start_time: 1725270000, duration_seconds: 1800, pages_read: 25 },
      { start_time: 1725280000, duration_seconds: 1200, pages_read: 15 },
    ];

    const totalDuration = rawSessions.reduce((acc, s) => acc + s.duration_seconds, 0);
    const totalPages = rawSessions.reduce((acc, s) => acc + s.pages_read, 0);

    expect(Math.round(totalDuration / 60)).toBe(50); // 50 minutes total
    expect(totalPages).toBe(40);
  });

  it('calculates daily goal completion percentage accurately', () => {
    const targetMinutes = 30;
    const minutesRead = 45;
    const completionRatio = Math.min(1.0, minutesRead / targetMinutes);
    const percentage = Math.round(completionRatio * 100);

    expect(percentage).toBe(100);

    const partialMinutes = 15;
    const partialRatio = partialMinutes / targetMinutes;
    expect(Math.round(partialRatio * 100)).toBe(50);
  });
});
