import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, RefreshControl, StyleSheet, TouchableOpacity } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { useTheme } from '../../src/components/common/ThemeProvider';
import { StreakHeatmap } from '../../src/components/stats/StreakHeatmap';
import { StatCard } from '../../src/components/stats/StatCard';
import { GoalProgressRing } from '../../src/components/stats/GoalProgressRing';
import {
  getLifetimeStats,
  getActivityHistory,
  getRecentSessions,
  LifetimeStats,
  DayActivity,
} from '../../src/db/queries/stats';
import { getReadingGoals } from '../../src/db/queries/settings';
import { ReadingGoal, ReadingSession } from '../../src/types';
import { formatDurationSeconds, formatRelativeDate } from '../../src/utils/time';
import { BookOpen, Clock, FileText, Bookmark, Flame, Zap, Compass, Award } from 'lucide-react-native';
import { FONTS } from '../../src/utils/typography';

export default function StatsScreen() {
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

  const [recentSessions, setRecentSessions] = useState<ReadingSession[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    try {
      const [lStats, act, g, sess] = await Promise.all([
        getLifetimeStats(),
        getActivityHistory(112),
        getReadingGoals(),
        getRecentSessions(10),
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

        {/* 16-Week Consistency & Habit Heatmap */}
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
        {recentSessions.length === 0 ? (
          <View
            style={[
              styles.emptySessions,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <Clock size={28} color={colors.textSecondary} style={{ marginBottom: 8 }} />
            <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>No Sessions Recorded Yet</Text>
            <Text style={[styles.emptySub, { color: colors.textSecondary }]}>
              Open any book in your library to automatically track reading time and speed.
            </Text>
          </View>
        ) : (
          recentSessions.map((sess) => (
            <View
              key={sess.id}
              style={[
                styles.sessionCard,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                },
              ]}
            >
              <View style={styles.sessionLeft}>
                <View style={[styles.sessionIconBox, { backgroundColor: colors.canvas, borderColor: colors.border }]}>
                  <Zap size={14} color={colors.accent} />
                </View>
                <View>
                  <Text style={[styles.sessionDuration, { color: colors.textPrimary }]}>
                    {formatDurationSeconds(sess.durationSeconds)} of reading
                  </Text>
                  {sess.pagesRead > 0 && (
                    <Text style={[styles.sessionPages, { color: colors.textSecondary }]}>
                      {sess.pagesRead} {sess.pagesRead === 1 ? 'page' : 'pages'} turned
                    </Text>
                  )}
                </View>
              </View>

              <Text style={[styles.sessionDate, { color: colors.textSecondary }]}>
                {formatRelativeDate(sess.startTime)}
              </Text>
            </View>
          ))
        )}
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
  emptySessions: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontFamily: FONTS.mona.bold,
    fontSize: 15,
    marginBottom: 4,
  },
  emptySub: {
    fontFamily: FONTS.mona.regular,
    fontSize: 12.5,
    textAlign: 'center',
    lineHeight: 18,
  },
  sessionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 2,
  },
  sessionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  sessionIconBox: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sessionDuration: {
    fontFamily: FONTS.mona.bold,
    fontSize: 14,
    letterSpacing: -0.2,
  },
  sessionPages: {
    fontFamily: FONTS.mona.regular,
    fontSize: 12,
    marginTop: 1,
  },
  sessionDate: {
    fontFamily: FONTS.mono.medium,
    fontSize: 11.5,
  },
});
