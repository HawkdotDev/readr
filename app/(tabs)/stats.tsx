import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, RefreshControl, StyleSheet } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { useTheme } from '../../src/components/common/ThemeProvider';
import { StreakHeatmap } from '../../src/components/stats/StreakHeatmap';
import { StatCard } from '../../src/components/stats/StatCard';
import { GoalProgressRing } from '../../src/components/stats/GoalProgressRing';
import { getLifetimeStats, getActivityHistory, getRecentSessions, LifetimeStats, DayActivity } from '../../src/db/queries/stats';
import { getReadingGoals } from '../../src/db/queries/settings';
import { ReadingGoal, ReadingSession } from '../../src/types';
import { formatDurationSeconds, formatRelativeDate } from '../../src/utils/time';
import { BookOpen, Clock, FileText, Bookmark, Flame, Zap } from 'lucide-react-native';

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

  // Calculate today's reading minutes
  const todayStr = new Date().toISOString().split('T')[0];
  const todayAct = activity.find((a) => a.date === todayStr);
  const todayMinutes = todayAct ? todayAct.minutesRead : 0;
  const todayPages = todayAct ? todayAct.pagesRead : 0;

  return (
    <View style={[styles.container, { backgroundColor: colors.canvas }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <View>
          <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Reading Journey</Text>
          <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
            Local statistics & habit metrics
          </Text>
        </View>
        <Flame size={28} color="#F59E0B" />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent} />}
      >
        {/* Daily Goal Progress */}
        <GoalProgressRing
          currentMinutes={todayMinutes}
          targetMinutes={goals.targetDailyMinutes}
          currentPages={todayPages}
          targetPages={goals.targetDailyPages}
        />

        {/* 16-Week Consistency Heatmap */}
        <StreakHeatmap
          activity={activity}
          currentStreak={goals.currentStreakDays}
          longestStreak={goals.longestStreakDays}
        />

        {/* Metric Cards Grid */}
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>LIFETIME METRICS</Text>
        <View style={styles.metricsGrid}>
          <View style={styles.metricRow}>
            <StatCard
              label="Total Time"
              value={formatDurationSeconds(lifetime.totalTimeSeconds)}
              icon={<Clock size={20} color={colors.accent} />}
            />
            <StatCard
              label="Books Completed"
              value={lifetime.totalBooksRead}
              icon={<BookOpen size={20} color="#16A34A" />}
            />
          </View>

          <View style={styles.metricRow}>
            <StatCard
              label="Highlights"
              value={lifetime.totalHighlights}
              icon={<Bookmark size={20} color="#F59E0B" />}
            />
            <StatCard
              label="Pages Read"
              value={lifetime.totalPages}
              icon={<FileText size={20} color="#8B5CF6" />}
            />
          </View>
        </View>

        {/* Recent Session History */}
        <Text style={[styles.sectionTitle, { color: colors.textSecondary, marginTop: 24 }]}>
          RECENT SESSIONS
        </Text>
        {recentSessions.length === 0 ? (
          <View style={[styles.emptySessions, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              Open any book to begin recording reading sessions.
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
              <View style={styles.sessionHeader}>
                <View style={styles.sessionTimeTag}>
                  <Zap size={14} color={colors.accent} style={{ marginRight: 4 }} />
                  <Text style={[styles.sessionDuration, { color: colors.textPrimary }]}>
                    {formatDurationSeconds(sess.durationSeconds)} of reading
                  </Text>
                </View>
                <Text style={[styles.sessionDate, { color: colors.textSecondary }]}>
                  {formatRelativeDate(sess.startTime)}
                </Text>
              </View>

              {sess.pagesRead > 0 && (
                <Text style={[styles.sessionPages, { color: colors.textSecondary }]}>
                  {sess.pagesRead} {sess.pagesRead === 1 ? 'page' : 'pages'} turned
                </Text>
              )}
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

import { FONTS } from '../../src/utils/typography';

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
  headerSubtitle: {
    fontFamily: FONTS.mono.medium,
    fontSize: 12,
    marginTop: 3,
    letterSpacing: 0.2,
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
  sessionCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    marginBottom: 10,
  },
  sessionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sessionTimeTag: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sessionDuration: {
    fontFamily: FONTS.mona.bold,
    fontSize: 14,
    letterSpacing: -0.2,
  },
  sessionDate: {
    fontFamily: FONTS.mono.medium,
    fontSize: 12,
  },
  sessionPages: {
    fontFamily: FONTS.mono.regular,
    fontSize: 12,
    marginTop: 4,
  },
  emptySessions: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 24,
    alignItems: 'center',
  },
  emptyText: {
    fontFamily: FONTS.mona.regular,
    fontSize: 14,
  },
});
