import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../common/ThemeProvider';
import { Target, CheckCircle2 } from 'lucide-react-native';
import { FONTS } from '../../utils/typography';

export interface GoalProgressRingProps {
  currentMinutes: number;
  targetMinutes: number;
  currentPages: number;
  targetPages: number;
}

export const GoalProgressRing = React.memo<GoalProgressRingProps>(({
  currentMinutes,
  targetMinutes,
  currentPages,
  targetPages,
}) => {
  const { colors } = useTheme();

  const minProgress = Math.min(100, Math.round((currentMinutes / Math.max(1, targetMinutes)) * 100));
  const pageProgress = Math.min(100, Math.round((currentPages / Math.max(1, targetPages)) * 100));

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
      <View style={styles.headerRow}>
        <View style={styles.titleWithIcon}>
          <Target size={18} color={colors.accent} style={{ marginRight: 6 }} />
          <Text style={[styles.title, { color: colors.textPrimary }]}>Daily Reading Goals</Text>
        </View>
        {minProgress >= 100 && pageProgress >= 100 ? (
          <View style={[styles.goalAchieved, { backgroundColor: colors.isDark ? '#27272A' : '#E4E4E7' }]}>
            <CheckCircle2 size={16} color={colors.textPrimary} style={{ marginRight: 4 }} />
            <Text style={[styles.goalAchievedText, { color: colors.textPrimary }]}>Goal Met!</Text>
          </View>
        ) : null}
      </View>

      {/* Minutes Goal Progress Bar */}
      <View style={styles.goalItem}>
        <View style={styles.goalLabelRow}>
          <Text style={[styles.goalLabel, { color: colors.textSecondary }]}>Time Target</Text>
          <Text style={[styles.goalValue, { color: colors.textPrimary }]}>
            {currentMinutes} / {targetMinutes} mins ({minProgress}%)
          </Text>
        </View>
        <View style={[styles.track, { backgroundColor: colors.border }]}>
          <View
            style={[
              styles.fill,
              { width: `${minProgress}%`, backgroundColor: colors.accent },
            ]}
          />
        </View>
      </View>

      {/* Pages Goal Progress Bar */}
      <View style={[styles.goalItem, { marginTop: 14 }]}>
        <View style={styles.goalLabelRow}>
          <Text style={[styles.goalLabel, { color: colors.textSecondary }]}>Pages Target</Text>
          <Text style={[styles.goalValue, { color: colors.textPrimary }]}>
            {currentPages} / {targetPages} pages ({pageProgress}%)
          </Text>
        </View>
        <View style={[styles.track, { backgroundColor: colors.border }]}>
          <View
            style={[
              styles.fill,
              { width: `${pageProgress}%`, backgroundColor: colors.isDark ? '#71717A' : '#52525B' },
            ]}
          />
        </View>
      </View>
    </View>
  );
});

export default GoalProgressRing;

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
    marginBottom: 14,
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
  goalAchieved: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  goalAchievedText: {
    fontFamily: FONTS.mono.bold,
    fontSize: 11,
    letterSpacing: 0.2,
  },
  goalItem: {},
  goalLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  goalLabel: {
    fontFamily: FONTS.mona.medium,
    fontSize: 13,
  },
  goalValue: {
    fontFamily: FONTS.mono.bold,
    fontSize: 13,
  },
  track: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 4,
  },
});
