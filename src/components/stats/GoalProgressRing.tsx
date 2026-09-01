import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../common/ThemeProvider';
import { Target, CheckCircle2, Clock, BookOpen, Flame } from 'lucide-react-native';
import { FONTS } from '../../utils/typography';

export interface GoalProgressRingProps {
  currentMinutes: number;
  targetMinutes: number;
  currentPages: number;
  targetPages: number;
}

export function GoalProgressRing({
  currentMinutes,
  targetMinutes,
  currentPages,
  targetPages,
}: GoalProgressRingProps) {
  const { colors } = useTheme();

  const minProgress = Math.min(100, Math.round((currentMinutes / Math.max(1, targetMinutes)) * 100));
  const pageProgress = Math.min(100, Math.round((currentPages / Math.max(1, targetPages)) * 100));
  const isGoalCompleted = minProgress >= 100;
  const minutesLeft = Math.max(0, targetMinutes - currentMinutes);

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
      {/* Top Tag Row */}
      <View style={styles.topRow}>
        <View style={styles.tagWrapper}>
          <Target size={14} color={colors.accent} style={{ marginRight: 5 }} />
          <Text style={[styles.sectionTag, { color: colors.textSecondary }]}>TODAY'S TARGET</Text>
        </View>

        {isGoalCompleted ? (
          <View
            style={[
              styles.statusPill,
              { backgroundColor: colors.isDark ? '#1C2E24' : '#DCFCE7', borderColor: colors.isDark ? '#22543D' : '#86EFAC' },
            ]}
          >
            <CheckCircle2 size={13} color="#16A34A" style={{ marginRight: 4 }} />
            <Text style={[styles.statusPillText, { color: '#16A34A' }]}>Completed</Text>
          </View>
        ) : (
          <View style={[styles.percentBadge, { backgroundColor: colors.canvas, borderColor: colors.border }]}>
            <Text style={[styles.percentText, { color: colors.accent }]}>{minProgress}%</Text>
          </View>
        )}
      </View>

      {/* Main Big Number Display */}
      <View style={styles.heroNumberRow}>
        <View style={styles.numberGroup}>
          <Text style={[styles.bigNumber, { color: colors.textPrimary }]}>{currentMinutes}</Text>
          <Text style={[styles.unitText, { color: colors.textSecondary }]}>/ {targetMinutes} mins</Text>
        </View>

        <Text style={[styles.motivationSubtext, { color: colors.textSecondary }]}>
          {isGoalCompleted
            ? 'Daily reading goal accomplished! 🎉'
            : minutesLeft > 0
            ? `${minutesLeft} min${minutesLeft === 1 ? '' : 's'} to hit daily goal`
            : 'Keep the reading momentum going'}
        </Text>
      </View>

      {/* Progress Bars Section */}
      <View style={styles.progressSection}>
        {/* Minutes Progress Bar */}
        <View style={styles.barItem}>
          <View style={styles.barLabelRow}>
            <View style={styles.labelWithIcon}>
              <Clock size={13} color={colors.textSecondary} style={{ marginRight: 5 }} />
              <Text style={[styles.barLabel, { color: colors.textSecondary }]}>Reading Time</Text>
            </View>
            <Text style={[styles.barValue, { color: colors.textPrimary }]}>
              {currentMinutes}m / {targetMinutes}m
            </Text>
          </View>
          <View style={[styles.track, { backgroundColor: colors.canvas, borderColor: colors.border }]}>
            <View
              style={[
                styles.fill,
                { width: `${minProgress}%`, backgroundColor: colors.accent },
              ]}
            />
          </View>
        </View>

        {/* Pages Progress Bar */}
        <View style={[styles.barItem, { marginTop: 12 }]}>
          <View style={styles.barLabelRow}>
            <View style={styles.labelWithIcon}>
              <BookOpen size={13} color={colors.textSecondary} style={{ marginRight: 5 }} />
              <Text style={[styles.barLabel, { color: colors.textSecondary }]}>Pages Turned</Text>
            </View>
            <Text style={[styles.barValue, { color: colors.textPrimary }]}>
              {currentPages} / {targetPages} pgs
            </Text>
          </View>
          <View style={[styles.track, { backgroundColor: colors.canvas, borderColor: colors.border }]}>
            <View
              style={[
                styles.fill,
                {
                  width: `${pageProgress}%`,
                  backgroundColor: colors.isDark ? '#71717A' : '#52525B',
                },
              ]}
            />
          </View>
        </View>
      </View>
    </View>
  );
}

export default GoalProgressRing;

const styles = StyleSheet.create({
  container: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 18,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  tagWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionTag: {
    fontFamily: FONTS.mono.bold,
    fontSize: 11,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 9,
    paddingVertical: 3.5,
    borderRadius: 12,
    borderWidth: 1,
  },
  statusPillText: {
    fontFamily: FONTS.mona.bold,
    fontSize: 11.5,
    letterSpacing: -0.1,
  },
  percentBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
  },
  percentText: {
    fontFamily: FONTS.mono.bold,
    fontSize: 12,
    letterSpacing: 0.2,
  },
  heroNumberRow: {
    marginBottom: 16,
  },
  numberGroup: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
  },
  bigNumber: {
    fontFamily: FONTS.hubot.bold,
    fontSize: 34,
    letterSpacing: -1,
    lineHeight: 38,
  },
  unitText: {
    fontFamily: FONTS.mona.medium,
    fontSize: 15,
    letterSpacing: -0.2,
  },
  motivationSubtext: {
    fontFamily: FONTS.mona.regular,
    fontSize: 13,
    marginTop: 4,
    letterSpacing: -0.1,
  },
  progressSection: {
    marginTop: 4,
  },
  barItem: {},
  barLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  labelWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  barLabel: {
    fontFamily: FONTS.mona.medium,
    fontSize: 12.5,
    letterSpacing: -0.1,
  },
  barValue: {
    fontFamily: FONTS.mono.bold,
    fontSize: 12,
  },
  track: {
    height: 7,
    borderRadius: 4,
    borderWidth: 0.8,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 4,
  },
});

export const DailyTargetCard = GoalProgressRing;
export type DailyTargetCardProps = GoalProgressRingProps;
