import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, RefreshControl, StyleSheet } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useTheme } from '../../src/components/common/ThemeProvider';
import { StreakHeatmap } from '../../src/components/stats/StreakHeatmap';
import { StatCard } from '../../src/components/stats/StatCard';
import { GoalProgressRing } from '../../src/components/stats/GoalProgressRing';
import { RecentSessionsList } from '../../src/components/stats/RecentSessionsList';
import {
  getLifetimeStats,
  getActivityHistory,
  getRecentSessionsWithBooks,
  LifetimeStats,
  DayActivity,
  EnrichedReadingSession,
} from '../../src/db/queries/stats';
import { getReadingGoals } from '../../src/db/queries/settings';
import { ReadingGoal } from '../../src/types';
import { formatDurationSeconds } from '../../src/utils/time';
import { BookOpen, Clock, FileText, Bookmark, Flame } from 'lucide-react-native';
import { FONTS } from '../../src/utils/typography';

export default function StatsScreen() {
  const router = useRouter();
  const { colors } = useTheme();

  const [lifetime, setLifetime] = useState<LifetimeStats>({
    totalBooksRead: 0,
    totalTimeSeconds: 0,
    totalHighlights: 0,
    totalNotes: 0,
    totalPages: 0,
    currentStreakDays: 0,
  });

  const [activity, setActivity] = useState<DayActivity[]>([]);
  const [goals, setGoals] = useState<ReadingGoal>({
    id: 'default_user',
    targetDailyMinutes: 30,
    targetDailyPages: 20,
    currentStreakDays: 0,
    longestStreakDays: 0,
  });

  const [recentSessions, setRecentSessions] = useState<EnrichedReadingSession[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    try {
      const [lStats, act, g, sess] = await Promise.all([
        getLifetimeStats(),
        getActivityHistory(112),
        getReadingGoals(),
        getRecentSessionsWithBooks(15),
      ]);
      setLifetime(lStats);
      setActivity(act);
      setGoals(g);
      setRecentSessions(sess);
    } catch (e) {
      console.warn('Failed to load stats:', e);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  // Calculate today's reading metrics
  const todayStr = new Date().toISOString().split('T')[0];
  const todayAct = activity.find((a) => a.date === todayStr);
  const todayMinutes = todayAct ? todayAct.minutesRead : 0;
  const todayPages = todayAct ? todayAct.pagesRead : 0;

  return (
    <View style={[styles.container, { backgroundColor: colors.canvas }]}>
      {/* Header matching Home & Library */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Stats</Text>

        <View style={[styles.streakPill, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Flame size={16} color="#F59E0B" style={{ marginRight: 4 }} />
          <Text style={[styles.streakPillText, { color: colors.textPrimary }]}>
            {goals.currentStreakDays}d streak
          </Text>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.accent}
          />
        }
      >
        {/* Daily Goal & Momentum Hero Card */}
        <GoalProgressRing
          currentMinutes={todayMinutes}
          targetMinutes={goals.targetDailyMinutes}
          currentPages={todayPages}
          targetPages={goals.targetDailyPages}
        />

        {/* 16-Week Consistency & Habit Graph */}
        <StreakHeatmap
          activity={activity}
          currentStreak={goals.currentStreakDays}
          longestStreak={goals.longestStreakDays}
        />

        {/* Lifetime Metrics Section */}
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>LIFETIME METRICS</Text>
        <View style={styles.metricsGrid}>
          <View style={styles.metricRow}>
            <StatCard
              label="Reading Time"
              value={formatDurationSeconds(lifetime.totalTimeSeconds)}
              icon={<Clock size={16} color={colors.accent} />}
            />
            <StatCard
              label="Completed"
              value={lifetime.totalBooksRead}
              subtitle="books finished"
              icon={<BookOpen size={16} color="#16A34A" />}
            />
          </View>

          <View style={styles.metricRow}>
            <StatCard
              label="Highlights"
              value={lifetime.totalHighlights}
              subtitle="saved passages"
              icon={<Bookmark size={16} color="#F59E0B" />}
            />
            <StatCard
              label="Pages Read"
              value={lifetime.totalPages}
              subtitle="total pages"
              icon={<FileText size={16} color="#8B5CF6" />}
            />
          </View>
        </View>

        {/* Recent Reading Sessions */}
        <Text style={[styles.sectionTitle, { color: colors.textSecondary, marginTop: 24 }]}>
          RECENT SESSIONS
        </Text>
        <RecentSessionsList
          sessions={recentSessions}
          onSessionPress={(sess) => {
            if (sess.bookId) {
              router.push(`/reader/${sess.bookId}` as any);
            }
          }}
          onExplorePress={() => router.push('/explore')}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 56,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontFamily: FONTS.mona.extraBold,
    fontSize: 28,
    letterSpacing: -0.8,
  },
  streakPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
  },
  streakPillText: {
    fontFamily: FONTS.mona.bold,
    fontSize: 13,
    letterSpacing: -0.2,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 110,
  },
  sectionTitle: {
    fontFamily: FONTS.mono.bold,
    fontSize: 11,
    letterSpacing: 1.2,
    marginBottom: 10,
    textTransform: 'uppercase',
  },
  metricsGrid: {
    gap: 12,
  },
  metricRow: {
    flexDirection: 'row',
    gap: 12,
  },
});
