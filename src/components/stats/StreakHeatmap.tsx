import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useTheme } from '../common/ThemeProvider';
import { DayActivity } from '../../db/queries/stats';
import { Calendar, Trophy, Sparkles } from 'lucide-react-native';
import { FONTS } from '../../utils/typography';
import * as Haptics from 'expo-haptics';

export interface StreakHeatmapProps {
  activity: DayActivity[];
  currentStreak: number;
  longestStreak: number;
}

function formatTooltipDate(dateStr: string): string {
  try {
    const [y, m, d] = dateStr.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

export function StreakHeatmap({
  activity,
  currentStreak,
  longestStreak,
}: StreakHeatmapProps) {
  const { colors } = useTheme();

  // Create a map of activity by date
  const activityMap = useMemo(() => {
    const map = new Map<string, number>();
    activity.forEach((a) => map.set(a.date, a.minutesRead));
    return map;
  }, [activity]);

  // Generate 16 weeks aligned to day-of-week (Sunday to Saturday)
  const today = useMemo(() => new Date(), []);
  const todayStr = useMemo(() => today.toISOString().split('T')[0], [today]);

  const [selectedDate, setSelectedDate] = useState<string | null>(todayStr);

  const { weeks, activeDaysCount, totalMinutesInPeriod } = useMemo(() => {
    // Determine the Sunday of the current week
    const currentWeekSunday = new Date(today);
    currentWeekSunday.setDate(today.getDate() - today.getDay());

    // Go back 15 weeks from that Sunday to have 16 full calendar columns
    const startDate = new Date(currentWeekSunday);
    startDate.setDate(currentWeekSunday.getDate() - 15 * 7);

    const generatedWeeks: {
      weekIndex: number;
      monthLabel?: string;
      days: { date: string; minutes: number; isToday: boolean; isFuture: boolean }[];
    }[] = [];

    let activeCount = 0;
    let totalMins = 0;
    let lastMonth = -1;

    for (let w = 0; w < 16; w++) {
      const weekDays: { date: string; minutes: number; isToday: boolean; isFuture: boolean }[] = [];
      let weekMonthLabel: string | undefined = undefined;

      for (let d = 0; d < 7; d++) {
        const cellDate = new Date(startDate);
        cellDate.setDate(startDate.getDate() + w * 7 + d);
        const dateStr = cellDate.toISOString().split('T')[0];

        const isToday = dateStr === todayStr;
        const isFuture = cellDate > today && !isToday;
        const minutes = isFuture ? 0 : activityMap.get(dateStr) || 0;

        if (!isFuture && minutes > 0) {
          activeCount++;
          totalMins += minutes;
        }

        // Detect month changes on Sunday (d === 0) or week 0
        if (d === 0) {
          const currentMonth = cellDate.getMonth();
          if (w === 0 || currentMonth !== lastMonth) {
            weekMonthLabel = cellDate.toLocaleDateString('en-US', { month: 'short' });
            lastMonth = currentMonth;
          }
        }

        weekDays.push({
          date: dateStr,
          minutes,
          isToday,
          isFuture,
        });
      }

      generatedWeeks.push({
        weekIndex: w,
        monthLabel: weekMonthLabel,
        days: weekDays,
      });
    }

    return {
      weeks: generatedWeeks,
      activeDaysCount: activeCount,
      totalMinutesInPeriod: totalMins,
    };
  }, [activityMap, today, todayStr]);

  const selectedDayInfo = useMemo(() => {
    const targetDate = selectedDate || todayStr;
    const mins = activityMap.get(targetDate) || 0;
    return {
      date: targetDate,
      minutes: mins,
      isToday: targetDate === todayStr,
    };
  }, [selectedDate, todayStr, activityMap]);

  const getCellColor = (minutes: number, isFuture: boolean): string => {
    if (isFuture) return 'transparent';
    if (minutes === 0) return colors.isDark ? '#27272A' : '#E4E4E7';
    if (minutes < 15) return colors.isDark ? '#064E3B' : '#BBF7D0';
    if (minutes < 30) return colors.isDark ? '#047857' : '#4ADE80';
    if (minutes < 60) return colors.isDark ? '#10B981' : '#22C55E';
    return colors.isDark ? '#34D399' : '#15803D';
  };

  const getCellBorderColor = (
    dateStr: string,
    isToday: boolean,
    isFuture: boolean
  ): string => {
    if (isFuture) return 'transparent';
    if (selectedDate === dateStr) return colors.textPrimary;
    if (isToday) return colors.accent;
    return colors.isDark ? '#3F3F46' : '#D4D4D8';
  };

  return (
    <View style={styles.container}>
      {/* Section Header matching "Books you started" and "Today's target" */}
      <View style={styles.headerRow}>
        <View style={styles.titleWithIcon}>
          <Calendar size={18} color={colors.accent} style={{ marginRight: 8 }} />
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
            Metrics
          </Text>
        </View>

        <View style={[styles.bestPill, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Trophy size={13} color="#F59E0B" style={{ marginRight: 5 }} />
          <Text style={[styles.bestLabel, { color: colors.textSecondary }]}>Best streak: </Text>
          <Text style={[styles.bestValue, { color: colors.textPrimary }]}>{longestStreak}d</Text>
        </View>
      </View>

      {/* Main Heatmap Card */}
      <View
        style={[
          styles.card,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
          },
        ]}
      >
        {/* 3-Stat Summary Strip */}
        <View style={[styles.summaryRow, { borderBottomColor: colors.border }]}>
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryNumber, { color: colors.textPrimary }]}>
              {activeDaysCount}
              <Text style={[styles.summaryUnit, { color: colors.textSecondary }]}> / 112</Text>
            </Text>
            <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Active Days</Text>
          </View>

          <View style={[styles.summaryDivider, { backgroundColor: colors.border }]} />

          <View style={styles.summaryItem}>
            <Text style={[styles.summaryNumber, { color: colors.textPrimary }]}>
              {(totalMinutesInPeriod / 60).toFixed(1)}
              <Text style={[styles.summaryUnit, { color: colors.textSecondary }]}> hrs</Text>
            </Text>
            <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Total Time</Text>
          </View>

          <View style={[styles.summaryDivider, { backgroundColor: colors.border }]} />

          <View style={styles.summaryItem}>
            <Text style={[styles.summaryNumber, { color: colors.textPrimary }]}>
              {Math.round((activeDaysCount / 112) * 100)}
              <Text style={[styles.summaryUnit, { color: colors.textSecondary }]}>%</Text>
            </Text>
            <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Consistency</Text>
          </View>
        </View>

        {/* Interactive Selected Day Detail Pill */}
        <View
          style={[
            styles.detailPill,
            {
              backgroundColor: colors.canvas,
              borderColor: colors.border,
            },
          ]}
        >
          <View style={styles.detailLeft}>
            <View
              style={[
                styles.detailDot,
                {
                  backgroundColor: getCellColor(selectedDayInfo.minutes, false),
                },
              ]}
            />
            <Text style={[styles.detailDate, { color: colors.textPrimary }]}>
              {formatTooltipDate(selectedDayInfo.date)}
              {selectedDayInfo.isToday ? ' (Today)' : ''}
            </Text>
          </View>

          <Text
            style={[
              styles.detailMinutes,
              {
                color:
                  selectedDayInfo.minutes > 0
                    ? colors.isDark
                      ? '#34D399'
                      : '#15803D'
                    : colors.textSecondary,
              },
            ]}
          >
            {selectedDayInfo.minutes > 0 ? `${selectedDayInfo.minutes} mins read` : 'No reading recorded'}
          </Text>
        </View>

        {/* Heatmap Grid with Weekdays and Month Headers */}
        <View style={styles.gridWrapper}>
          {/* Weekday Column (Mon, Wed, Fri) */}
          <View style={styles.weekdayColumn}>
            <View style={{ height: 14 }} />
            <Text style={[styles.weekdayLabel, { color: colors.textSecondary }]}>Mon</Text>
            <View style={{ height: 14 }} />
            <Text style={[styles.weekdayLabel, { color: colors.textSecondary }]}>Wed</Text>
            <View style={{ height: 14 }} />
            <Text style={[styles.weekdayLabel, { color: colors.textSecondary }]}>Fri</Text>
            <View style={{ height: 14 }} />
          </View>

          {/* Horizontally Scrollable 16-Week Grid */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.gridScroll}
          >
            {weeks.map((week) => (
              <View key={`col_${week.weekIndex}`} style={styles.columnWithHeader}>
                {/* Month Label above column */}
                <View style={styles.monthHeader}>
                  <Text
                    style={[styles.monthText, { color: colors.textSecondary }]}
                    numberOfLines={1}
                  >
                    {week.monthLabel || ''}
                  </Text>
                </View>

                {/* 7 Days of Week */}
                <View style={styles.weekColumn}>
                  {week.days.map((day) => {
                    const isSelected = selectedDate === day.date;
                    return (
                      <TouchableOpacity
                        key={day.date}
                        activeOpacity={day.isFuture ? 1 : 0.7}
                        disabled={day.isFuture}
                        onPress={() => {
                          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
                          setSelectedDate(day.date);
                        }}
                        style={[
                          styles.cell,
                          {
                            backgroundColor: getCellColor(day.minutes, day.isFuture),
                            borderColor: getCellBorderColor(day.date, day.isToday, day.isFuture),
                            borderWidth: isSelected ? 2 : day.isToday ? 1.5 : 0.6,
                          },
                        ]}
                      />
                    );
                  })}
                </View>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* Footer: Subtitle & Legend */}
        <View style={[styles.footerRow, { borderTopColor: colors.border }]}>
          <Text style={[styles.subHint, { color: colors.textSecondary }]}>
            Past 16 weeks activity
          </Text>

          <View style={styles.legend}>
            <Text style={[styles.legendText, { color: colors.textSecondary }]}>Less</Text>
            <View style={[styles.legendCell, { backgroundColor: getCellColor(0, false) }]} />
            <View style={[styles.legendCell, { backgroundColor: getCellColor(10, false) }]} />
            <View style={[styles.legendCell, { backgroundColor: getCellColor(25, false) }]} />
            <View style={[styles.legendCell, { backgroundColor: getCellColor(45, false) }]} />
            <View style={[styles.legendCell, { backgroundColor: getCellColor(65, false) }]} />
            <Text style={[styles.legendText, { color: colors.textSecondary }]}>More</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

export default StreakHeatmap;

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 4,
    marginBottom: 24,
    marginTop: 6,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  titleWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionTitle: {
    fontFamily: FONTS.mona.bold,
    fontSize: 18,
    letterSpacing: -0.4,
  },
  bestPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4.5,
    borderRadius: 12,
    borderWidth: 1,
  },
  bestLabel: {
    fontFamily: FONTS.mona.medium,
    fontSize: 11.5,
    letterSpacing: -0.1,
  },
  bestValue: {
    fontFamily: FONTS.mono.bold,
    fontSize: 12,
  },
  card: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingBottom: 14,
    marginBottom: 12,
    borderBottomWidth: 1,
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryNumber: {
    fontFamily: FONTS.hubot.bold,
    fontSize: 18,
    letterSpacing: -0.5,
    lineHeight: 22,
  },
  summaryUnit: {
    fontFamily: FONTS.mona.medium,
    fontSize: 11.5,
    letterSpacing: -0.1,
  },
  summaryLabel: {
    fontFamily: FONTS.mona.regular,
    fontSize: 11,
    letterSpacing: -0.1,
    marginTop: 2,
  },
  summaryDivider: {
    width: 1,
    height: 24,
  },
  detailPill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 14,
  },
  detailLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  detailDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  detailDate: {
    fontFamily: FONTS.mona.medium,
    fontSize: 12,
    letterSpacing: -0.1,
  },
  detailMinutes: {
    fontFamily: FONTS.mono.bold,
    fontSize: 12,
  },
  gridWrapper: {
    flexDirection: 'row',
  },
  weekdayColumn: {
    justifyContent: 'flex-start',
    paddingTop: 18, // matches month header height
    paddingRight: 6,
    gap: 4.5,
  },
  weekdayLabel: {
    fontFamily: FONTS.mona.medium,
    fontSize: 9.5,
    lineHeight: 14,
    height: 14,
    letterSpacing: -0.2,
  },
  gridScroll: {
    paddingVertical: 2,
  },
  columnWithHeader: {
    alignItems: 'center',
    marginRight: 4.5,
  },
  monthHeader: {
    height: 16,
    justifyContent: 'center',
    marginBottom: 2,
  },
  monthText: {
    fontFamily: FONTS.mono.bold,
    fontSize: 9.5,
    letterSpacing: -0.2,
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
    marginTop: 14,
    paddingTop: 10,
    borderTopWidth: 1,
  },
  subHint: {
    fontFamily: FONTS.mona.regular,
    fontSize: 11,
    letterSpacing: -0.1,
  },
  legend: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  legendText: {
    fontFamily: FONTS.mona.regular,
    fontSize: 10.5,
    marginHorizontal: 2,
    letterSpacing: -0.1,
  },
  legendCell: {
    width: 10,
    height: 10,
    borderRadius: 2.5,
    borderWidth: 0.5,
    borderColor: 'rgba(0,0,0,0.06)',
  },
});

export const ReadingGraph = StreakHeatmap;
export type ReadingGraphProps = StreakHeatmapProps;
