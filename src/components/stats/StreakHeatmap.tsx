import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useTheme } from '../common/ThemeProvider';
import { DayActivity } from '../../db/queries/stats';

export interface StreakHeatmapProps {
  activity: DayActivity[];
  currentStreak: number;
  longestStreak: number;
}

export const StreakHeatmap: React.FC<StreakHeatmapProps> = ({
  activity,
  currentStreak,
  longestStreak,
}) => {
  const { colors } = useTheme();

  // Create a map of activity by date
  const activityMap = new Map<string, number>();
  activity.forEach((a) => activityMap.set(a.date, a.minutesRead));

  // Generate trailing 16 weeks (112 days) for mobile view
  const days: { date: string; minutes: number }[] = [];
  const today = new Date();
  for (let i = 111; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    days.push({
      date: dateStr,
      minutes: activityMap.get(dateStr) || 0,
    });
  }

  // Chunk into columns of 7 days (weeks)
  const weeks: { date: string; minutes: number }[][] = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }

  const getCellColor = (minutes: number): string => {
    if (minutes === 0) return colors.border;
    if (minutes < 15) return colors.isDark ? '#3F3F46' : '#D4D4D8';
    if (minutes < 30) return colors.isDark ? '#71717A' : '#A1A1AA';
    if (minutes < 60) return colors.isDark ? '#A1A1AA' : '#52525B';
    return colors.accent;
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
        },
      ]}
    >
      {/* Header */}
      <View style={styles.headerRow}>
        <View>
          <Text style={[styles.title, { color: colors.textPrimary }]}>Reading Consistency</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Past 16 Weeks</Text>
        </View>

        <View style={styles.streakBadge}>
          <Text style={[styles.streakNumber, { color: colors.accent }]}>{currentStreak}</Text>
          <Text style={[styles.streakLabel, { color: colors.textSecondary }]}>Day Streak</Text>
        </View>
      </View>

      {/* 16-Week Activity Grid */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.gridContent}>
        {weeks.map((week, wIdx) => (
          <View key={`week_${wIdx}`} style={styles.weekColumn}>
            {week.map((day) => (
              <View
                key={day.date}
                style={[
                  styles.cell,
                  {
                    backgroundColor: getCellColor(day.minutes),
                  },
                ]}
              />
            ))}
          </View>
        ))}
      </ScrollView>

      {/* Legend & Longest Streak */}
      <View style={[styles.footerRow, { borderTopColor: colors.border }]}>
        <Text style={[styles.longestText, { color: colors.textSecondary }]}>
          Longest Streak: <Text style={{ color: colors.textPrimary, fontWeight: '700' }}>{longestStreak} days</Text>
        </Text>

        <View style={styles.legend}>
          <Text style={[styles.legendText, { color: colors.textSecondary }]}>Less</Text>
          <View style={[styles.legendCell, { backgroundColor: colors.border }]} />
          <View style={[styles.legendCell, { backgroundColor: colors.isDark ? '#3F3F46' : '#D4D4D8' }]} />
          <View style={[styles.legendCell, { backgroundColor: colors.isDark ? '#71717A' : '#A1A1AA' }]} />
          <View style={[styles.legendCell, { backgroundColor: colors.accent }]} />
          <Text style={[styles.legendText, { color: colors.textSecondary }]}>More</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  subtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  streakBadge: {
    alignItems: 'flex-end',
  },
  streakNumber: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  streakLabel: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  gridContent: {
    flexDirection: 'row',
    gap: 4,
    paddingVertical: 6,
  },
  weekColumn: {
    gap: 4,
  },
  cell: {
    width: 14,
    height: 14,
    borderRadius: 3,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  longestText: {
    fontSize: 12,
  },
  legend: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  legendText: {
    fontSize: 10,
  },
  legendCell: {
    width: 10,
    height: 10,
    borderRadius: 2,
  },
});
