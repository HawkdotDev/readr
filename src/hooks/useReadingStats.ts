import { useState, useCallback, useEffect } from 'react';
import { ReadingGoal, ReadingSession } from '../types';
import { getReadingGoals, updateReadingGoals } from '../db/queries/settings';
import { getRecentSessions, getLifetimeStats, LifetimeStats } from '../db/queries/stats';

export interface UseReadingStatsResult {
  goals: ReadingGoal | null;
  sessions: ReadingSession[];
  lifetime: LifetimeStats;
  loading: boolean;
  refresh: () => Promise<void>;
  updateGoal: (partial: Partial<ReadingGoal>) => Promise<void>;
}

export function useReadingStats(): UseReadingStatsResult {
  const [goals, setGoals] = useState<ReadingGoal | null>(null);
  const [sessions, setSessions] = useState<ReadingSession[]>([]);
  const [lifetime, setLifetime] = useState<LifetimeStats>({
    totalBooksRead: 0,
    totalTimeSeconds: 0,
    totalHighlights: 0,
    totalNotes: 0,
    totalPages: 0,
    currentStreakDays: 0,
  });
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      const [goalsData, recentSessions, statsSummary] = await Promise.all([
        getReadingGoals(),
        getRecentSessions(30),
        getLifetimeStats(),
      ]);

      setGoals(goalsData);
      setSessions(recentSessions);
      setLifetime(statsSummary);
    } catch (e) {
      console.warn('Failed to load reading stats in useReadingStats:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const updateGoal = async (partial: Partial<ReadingGoal>) => {
    await updateReadingGoals(partial);
    setGoals((prev) => (prev ? { ...prev, ...partial } : null));
  };

  return {
    goals,
    sessions,
    lifetime,
    loading,
    refresh,
    updateGoal,
  };
}
