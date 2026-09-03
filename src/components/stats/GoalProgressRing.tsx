import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../common/ThemeProvider';
import { Target, CheckCircle2, Clock, BookOpen, Flame, Zap } from 'lucide-react-native';
import { FONTS } from '../../utils/typography';

export interface GoalProgressRingProps {
  currentMinutes: number;
  targetMinutes: number;
  currentPages: number;
  targetPages: number;
  currentStreak?: number;
  longestStreak?: number;
  todaySessionsCount?: number;
  isCard?: boolean;
  blackBackgroundInLightMode?: boolean;
  adaptiveContrastBanner?: boolean;
}

export function GoalProgressRing({
  currentMinutes,
  targetMinutes,
  currentPages,
  targetPages,
  currentStreak = 0,
  todaySessionsCount = 0,
}: GoalProgressRingProps) {
  const { colors } = useTheme();

  const minProgress = Math.min(100, Math.round((currentMinutes / Math.max(1, targetMinutes)) * 100));
  const pageProgress = Math.min(100, Math.round((currentPages / Math.max(1, targetPages)) * 100));
  const isGoalCompleted = minProgress >= 100;
  const minutesLeft = Math.max(0, targetMinutes - currentMinutes);
  const pagesLeft = Math.max(0, targetPages - currentPages);

  const pagesPerHour =
    currentMinutes > 0 && currentPages > 0
      ? Math.round((currentPages / currentMinutes) * 60)
      : 0;

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
          shadowColor: '#000',
          shadowOpacity: colors.isDark ? 0.28 : 0.06,
        },
      ]}
      accessible={true}
      accessibilityLabel={`Today's target: ${currentMinutes} of ${targetMinutes} minutes read, ${currentPages} of ${targetPages} pages`}
    >
      {/* Top Accent Highlight */}
      <View style={[styles.topAccentBar, { backgroundColor: colors.accent }]} />

      {/* Header Row */}
      <View style={styles.headerRow}>
        <View style={styles.headerLeft}>
          <View
            style={[
              styles.iconCircle,
              {
                backgroundColor: `${colors.accent}16`,
                borderColor: `${colors.accent}30`,
              },
            ]}
          >
            <Target size={17} color={colors.accent} />
          </View>
          <View style={styles.headerTextCol}>
            <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
              Today's target
            </Text>
            <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
              {isGoalCompleted
                ? 'Daily reading goal reached'
                : minutesLeft > 0
                ? `${minutesLeft}m left to complete goal`
                : 'Keep your momentum going'}
            </Text>
          </View>
        </View>

        {isGoalCompleted ? (
          <View style={[styles.statusBadge, { backgroundColor: '#10B98118', borderColor: '#10B98135' }]}>
            <CheckCircle2 size={13} color="#10B981" style={{ marginRight: 4 }} />
            <Text style={[styles.statusBadgeText, { color: '#10B981' }]}>Completed 🎉</Text>
          </View>
        ) : (
          <View style={[styles.statusBadge, { backgroundColor: colors.canvas, borderColor: colors.border }]}>
            <Flame size={13} color="#F59E0B" style={{ marginRight: 4 }} />
            <Text style={[styles.statusBadgeText, { color: colors.textPrimary }]}>
              {minProgress}%
            </Text>
          </View>
        )}
      </View>

      {/* Dual Progress Tiles */}
      <View style={styles.tilesRow}>
        {/* Time Tile */}
        <View style={[styles.tile, { backgroundColor: colors.canvas, borderColor: colors.border }]}>
          <View style={styles.tileHeader}>
            <Clock size={14} color={colors.accent} style={{ marginRight: 5 }} />
            <Text style={[styles.tileLabel, { color: colors.textSecondary }]}>Reading Time</Text>
          </View>

          <View style={styles.numberGroup}>
            <Text style={[styles.bigNumber, { color: colors.textPrimary }]}>
              {currentMinutes}
            </Text>
            <Text style={[styles.unitText, { color: colors.textSecondary }]}>
              / {targetMinutes}m
            </Text>
          </View>

          {/* Progress Track */}
          <View style={[styles.track, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View
              style={[
                styles.fill,
                { width: `${minProgress}%`, backgroundColor: colors.accent },
              ]}
            />
          </View>

          <View style={styles.tileMetaRow}>
            <Text style={[styles.tileMeta, { color: colors.textSecondary }]}>
              {minProgress}% done
            </Text>
            <Text
              style={[
                styles.tileMeta,
                { color: minProgress >= 100 ? '#10B981' : colors.textSecondary },
              ]}
            >
              {minutesLeft > 0 ? `${minutesLeft}m left` : 'Met! 🎉'}
            </Text>
          </View>
        </View>

        {/* Pages Tile */}
        <View style={[styles.tile, { backgroundColor: colors.canvas, borderColor: colors.border }]}>
          <View style={styles.tileHeader}>
            <BookOpen size={14} color="#8B5CF6" style={{ marginRight: 5 }} />
            <Text style={[styles.tileLabel, { color: colors.textSecondary }]}>Pages Read</Text>
          </View>

          <View style={styles.numberGroup}>
            <Text style={[styles.bigNumber, { color: colors.textPrimary }]}>
              {currentPages}
            </Text>
            <Text style={[styles.unitText, { color: colors.textSecondary }]}>
              / {targetPages}p
            </Text>
          </View>

          {/* Progress Track */}
          <View style={[styles.track, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View
              style={[
                styles.fill,
                { width: `${pageProgress}%`, backgroundColor: '#8B5CF6' },
              ]}
            />
          </View>

          <View style={styles.tileMetaRow}>
            <Text style={[styles.tileMeta, { color: colors.textSecondary }]}>
              {pageProgress}% done
            </Text>
            <Text
              style={[
                styles.tileMeta,
                { color: pageProgress >= 100 ? '#10B981' : colors.textSecondary },
              ]}
            >
              {pagesLeft > 0 ? `${pagesLeft}p left` : 'Met! 🎉'}
            </Text>
          </View>
        </View>
      </View>

      {/* Sub-Metrics Footer Strip */}
      <View style={[styles.statsStrip, { borderTopColor: colors.border }]}>
        {/* Pace */}
        <View style={styles.statStripItem}>
          <Zap size={13} color="#F59E0B" style={{ marginRight: 4 }} />
          <Text style={[styles.statStripValue, { color: colors.textPrimary }]}>
            {pagesPerHour > 0 ? `${pagesPerHour}` : '—'}
          </Text>
          <Text style={[styles.statStripLabel, { color: colors.textSecondary }]}> p/h pace</Text>
        </View>

        <View style={[styles.statDivider, { backgroundColor: colors.border }]} />

        {/* Sessions */}
        <View style={styles.statStripItem}>
          <Clock size={13} color={colors.accent} style={{ marginRight: 4 }} />
          <Text style={[styles.statStripValue, { color: colors.textPrimary }]}>
            {todaySessionsCount}
          </Text>
          <Text style={[styles.statStripLabel, { color: colors.textSecondary }]}>
            {todaySessionsCount === 1 ? ' session' : ' sessions'}
          </Text>
        </View>

        <View style={[styles.statDivider, { backgroundColor: colors.border }]} />

        {/* Streak */}
        <View style={styles.statStripItem}>
          <Flame size={13} color="#EF4444" style={{ marginRight: 4 }} />
          <Text style={[styles.statStripValue, { color: colors.textPrimary }]}>
            {currentStreak}d
          </Text>
          <Text style={[styles.statStripLabel, { color: colors.textSecondary }]}> streak</Text>
        </View>
      </View>
    </View>
  );
}

export default GoalProgressRing;

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
    marginBottom: 20,
    marginTop: 4,
    position: 'relative',
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 10,
    elevation: 3,
  },
  topAccentBar: {
    position: 'absolute',
    top: 0,
    left: 20,
    right: 20,
    height: 2.5,
    borderBottomLeftRadius: 2,
    borderBottomRightRadius: 2,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
    marginTop: 2,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconCircle: {
    width: 34,
    height: 34,
    borderRadius: 11,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  headerTextCol: {
    flex: 1,
  },
  headerTitle: {
    fontFamily: FONTS.mona.bold,
    fontSize: 16,
    letterSpacing: -0.3,
  },
  headerSubtitle: {
    fontFamily: FONTS.mona.regular,
    fontSize: 11.5,
    letterSpacing: -0.1,
    marginTop: 1,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 9,
    paddingVertical: 4.5,
    borderRadius: 12,
    borderWidth: 1,
  },
  statusBadgeText: {
    fontFamily: FONTS.mona.bold,
    fontSize: 11.5,
    letterSpacing: -0.1,
  },
  tilesRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  tile: {
    flex: 1,
    borderRadius: 14,
    borderWidth: 1,
    padding: 12,
  },
  tileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  tileLabel: {
    fontFamily: FONTS.mona.medium,
    fontSize: 12,
    letterSpacing: -0.1,
  },
  numberGroup: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 3,
    marginBottom: 8,
  },
  bigNumber: {
    fontFamily: FONTS.hubot.bold,
    fontSize: 24,
    letterSpacing: -0.6,
    lineHeight: 28,
  },
  unitText: {
    fontFamily: FONTS.mona.medium,
    fontSize: 12,
    letterSpacing: -0.1,
  },
  track: {
    height: 5,
    borderRadius: 2.5,
    borderWidth: 0.5,
    overflow: 'hidden',
    width: '100%',
    marginBottom: 6,
  },
  fill: {
    height: '100%',
    borderRadius: 2.5,
  },
  tileMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  tileMeta: {
    fontFamily: FONTS.mona.regular,
    fontSize: 10.5,
    letterSpacing: -0.1,
  },
  statsStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingTop: 11,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  statStripItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statStripValue: {
    fontFamily: FONTS.hubot.bold,
    fontSize: 12.5,
    letterSpacing: -0.2,
  },
  statStripLabel: {
    fontFamily: FONTS.mona.regular,
    fontSize: 11,
    letterSpacing: -0.1,
  },
  statDivider: {
    width: 1,
    height: 14,
    opacity: 0.6,
  },
});

export const DailyTargetCard = GoalProgressRing;
export type DailyTargetCardProps = GoalProgressRingProps;
