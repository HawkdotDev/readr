import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useTheme } from '../common/ThemeProvider';
import { DayActivity } from '../../db/queries/stats';
import { Calendar, Trophy } from 'lucide-react-native';
import { FONTS } from '../../utils/typography';

export interface StreakHeatmapProps {
  activity: DayActivity[];
  currentStreak: number;
  longestStreak: number;
}

export function StreakHeatmap({
  activity,
  currentStreak,
  longestStreak,
}: StreakHeatmapProps) {
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
    if (minutes === 0) return colors.isDark ? '#27272A' : '#E4E4E7';
    if (minutes < 15) return colors.isDark ? '#3F3F46' : '#CBD5E1';
    if (minutes < 30) return colors.isDark ? '#71717A' : '#94A3B8';
    if (minutes < 60) return colors.isDark ? '#A1A1AA' : '#64748B';
    return colors.accent;
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerRow}>
        <View style={styles.titleWithIcon}>
          <Calendar size={15} color={colors.accent} style={{ marginRight: 6 }} />
          <Text style={[styles.title, { color: colors.textPrimary }]}>Reading Graph</Text>
        </View>

        <View style={styles.longestRow}>
          <Trophy size={13} color="#F59E0B" style={{ marginRight: 4 }} />
          <Text style={[styles.longestText, { color: colors.textSecondary }]}>
            Best: <Text style={{ color: colors.textPrimary, fontFamily: FONTS.mono.bold }}>{longestStreak}d</Text>
          </Text>
        </View>
      </View>

      {/* 16-Week Activity Grid */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.gridContent}
      >
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

      {/* Footer Info: Legend */}
      <View style={styles.footerRow}>
        <Text style={[styles.subHint, { color: colors.textSecondary }]}>Past 16 weeks activity</Text>

        <View style={styles.legend}>
          <Text style={[styles.legendText, { color: colors.textSecondary }]}>Less</Text>
          <View style={[styles.legendCell, { backgroundColor: colors.isDark ? '#27272A' : '#E4E4E7' }]} />
          <View style={[styles.legendCell, { backgroundColor: colors.isDark ? '#3F3F46' : '#CBD5E1' }]} />
          <View style={[styles.legendCell, { backgroundColor: colors.isDark ? '#71717A' : '#94A3B8' }]} />
          <View style={[styles.legendCell, { backgroundColor: colors.accent }]} />
          <Text style={[styles.legendText, { color: colors.textSecondary }]}>More</Text>
        </View>
      </View>
    </View>
  );
}

export default StreakHeatmap;

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
    marginTop: 4,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  titleWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontFamily: FONTS.mona.bold,
    fontSize: 16,
    letterSpacing: -0.2,
  },
  longestRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  longestText: {
    fontFamily: FONTS.mona.regular,
    fontSize: 12,
  },
  gridContent: {
    flexDirection: 'row',
    gap: 4.5,
    paddingVertical: 2,
  },
  weekColumn: {
    gap: 4.5,
  },
  cell: {
    width: 14,
    height: 14,
    borderRadius: 3.5,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  subHint: {
    fontFamily: FONTS.mona.regular,
    fontSize: 11.5,
  },
  legend: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  legendText: {
    fontFamily: FONTS.mona.regular,
    fontSize: 11,
    marginHorizontal: 2,
  },
  legendCell: {
    width: 10,
    height: 10,
    borderRadius: 2.5,
  },
});

export const ReadingGraph = StreakHeatmap;
export type ReadingGraphProps = StreakHeatmapProps;
