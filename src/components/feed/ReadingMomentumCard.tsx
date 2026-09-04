import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useTheme } from '../common/ThemeProvider';
import { OptimizedImage } from '../common/OptimizedImage';
import { Book } from '../../types';
import { FONTS } from '../../utils/typography';
import {
  Clock,
  BookOpen,
  ChevronRight,
  Play,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

export interface ReadingMomentumCardProps {
  todayMinutes: number;
  targetMinutes: number;
  todayPages: number;
  currentStreakDays: number;
  activeBook: Book | null;
  onResumePress: (bookId: string) => void;
  onExplorePress: () => void;
}

export const ReadingMomentumCard: React.FC<ReadingMomentumCardProps> = ({
  todayMinutes,
  targetMinutes,
  todayPages,
  currentStreakDays,
  activeBook,
  onResumePress,
  onExplorePress,
}) => {
  const { colors } = useTheme();

  const goalMinutes = targetMinutes > 0 ? targetMinutes : 30;
  const goalProgressPct = Math.min(100, Math.round((todayMinutes / goalMinutes) * 100));

  return (
    <View style={styles.container}>
      <View style={styles.sectionHeaderRow}>
        <View style={styles.eyebrowRow}>
          <Clock size={13} color={colors.accent} style={{ marginRight: 6 }} />
          <Text style={[styles.sectionEyebrow, { color: colors.textSecondary }]}>
            DAILY READING MOMENTUM
          </Text>
        </View>
        <Text style={[styles.sectionMeta, { color: colors.accent }]}>
          {goalProgressPct}% of Goal
        </Text>
      </View>

      <View
        style={[
          styles.cardContainer,
          { backgroundColor: colors.surface, borderColor: colors.border },
        ]}
      >
        <View style={styles.momentumTopRow}>
          <View style={styles.momentumMetric}>
            <Text style={[styles.metricBig, { color: colors.textPrimary }]}>
              {todayMinutes}
              <Text style={[styles.metricUnit, { color: colors.textSecondary }]}>
                /{goalMinutes}m
              </Text>
            </Text>
            <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>
              Read Today
            </Text>
          </View>

          <View style={styles.momentumMetric}>
            <Text style={[styles.metricBig, { color: colors.textPrimary }]}>
              {todayPages}
            </Text>
            <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>
              Pages Logged
            </Text>
          </View>

          <View style={styles.momentumMetric}>
            <Text style={[styles.metricBig, { color: '#F59E0B' }]}>
              {currentStreakDays}d
            </Text>
            <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>
              Active Streak
            </Text>
          </View>
        </View>

        {/* Progress Bar */}
        <View style={[styles.progressBarBg, { backgroundColor: colors.canvas }]}>
          <View
            style={[
              styles.progressBarFill,
              {
                width: `${goalProgressPct}%`,
                backgroundColor: goalProgressPct >= 100 ? '#10B981' : colors.accent,
              },
            ]}
          />
        </View>

        {/* In-Progress Book Widget */}
        {activeBook ? (
          <View
            style={[
              styles.inProgressContainer,
              { borderTopColor: colors.border, backgroundColor: colors.surface },
            ]}
          >
            <View style={styles.inProgressLeft}>
              {activeBook.coverImagePath ? (
                <OptimizedImage
                  source={{ uri: activeBook.coverImagePath }}
                  style={styles.inProgressCover}
                  contentFit="cover"
                />
              ) : (
                <View
                  style={[
                    styles.inProgressCoverFallback,
                    { backgroundColor: colors.canvas, borderColor: colors.border },
                  ]}
                >
                  <BookOpen size={16} color={colors.accent} />
                </View>
              )}
              <View style={styles.inProgressDetails}>
                <Text
                  style={[styles.inProgressTitle, { color: colors.textPrimary }]}
                  numberOfLines={1}
                >
                  {activeBook.title}
                </Text>
                <Text
                  style={[styles.inProgressAuthor, { color: colors.textSecondary }]}
                  numberOfLines={1}
                >
                  {activeBook.authors?.map((a) => a.name).join(', ') || 'In Library'}
                  {' · '}
                  <Text style={{ color: colors.accent, fontWeight: '600' }}>
                    {Math.round(activeBook.progressPercentage || 0)}%
                  </Text>
                </Text>
              </View>
            </View>

            <TouchableOpacity
              onPress={() => {
                Haptics.selectionAsync().catch(() => {});
                onResumePress(activeBook.id);
              }}
              style={[styles.primaryActionBtn, { backgroundColor: colors.accent }]}
              activeOpacity={0.8}
            >
              <Play
                size={12}
                color={colors.isDark ? '#000000' : '#FFFFFF'}
                fill={colors.isDark ? '#000000' : '#FFFFFF'}
                style={{ marginRight: 4 }}
              />
              <Text
                style={[
                  styles.primaryActionBtnText,
                  { color: colors.isDark ? '#000000' : '#FFFFFF' },
                ]}
              >
                Resume
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            onPress={onExplorePress}
            style={[
              styles.explorePromptRow,
              { borderTopColor: colors.border, backgroundColor: colors.surface },
            ]}
          >
            <Text style={[styles.explorePromptText, { color: colors.textSecondary }]}>
              No book in progress — explore public domain classics
            </Text>
            <ChevronRight size={14} color={colors.accent} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  eyebrowRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionEyebrow: {
    fontFamily: FONTS.mono.bold,
    fontSize: 11,
    letterSpacing: 1.1,
    textTransform: 'uppercase',
  },
  sectionMeta: {
    fontFamily: FONTS.mono.bold,
    fontSize: 11,
  },
  cardContainer: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  momentumTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
  },
  momentumMetric: {
    alignItems: 'center',
    flex: 1,
  },
  metricBig: {
    fontFamily: FONTS.hubot.bold,
    fontSize: 26,
    letterSpacing: -0.5,
  },
  metricUnit: {
    fontFamily: FONTS.mona.medium,
    fontSize: 14,
  },
  metricLabel: {
    fontFamily: FONTS.mona.medium,
    fontSize: 11,
    marginTop: 2,
  },
  progressBarBg: {
    height: 6,
    marginHorizontal: 16,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 16,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  inProgressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderTopWidth: 1,
  },
  inProgressLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  inProgressCover: {
    width: 32,
    height: 48,
    borderRadius: 4,
  },
  inProgressCoverFallback: {
    width: 32,
    height: 48,
    borderRadius: 4,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inProgressDetails: {
    marginLeft: 10,
    flex: 1,
  },
  inProgressTitle: {
    fontFamily: FONTS.mona.bold,
    fontSize: 13,
  },
  inProgressAuthor: {
    fontFamily: FONTS.mona.medium,
    fontSize: 11,
    marginTop: 2,
  },
  primaryActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
  },
  primaryActionBtnText: {
    fontFamily: FONTS.mona.bold,
    fontSize: 12,
  },
  explorePromptRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderTopWidth: 1,
  },
  explorePromptText: {
    fontFamily: FONTS.mona.medium,
    fontSize: 12,
  },
});
