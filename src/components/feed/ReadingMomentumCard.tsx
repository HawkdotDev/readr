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
  Flame,
  CheckCircle2,
  Sparkles,
  Compass,
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
  const isGoalCompleted = todayMinutes >= goalMinutes;
  const remainingMinutes = Math.max(0, goalMinutes - todayMinutes);

  return (
    <View style={styles.container}>
      {/* Editorial Section Header Row */}
      <View style={styles.sectionHeaderRow}>
        <View style={styles.headerLeft}>
          <View
            style={[
              styles.iconCircle,
              {
                backgroundColor: isGoalCompleted ? '#10B98116' : '#F59E0B16',
                borderColor: isGoalCompleted ? '#10B98136' : '#F59E0B36',
              },
            ]}
          >
            {isGoalCompleted ? (
              <Sparkles size={14} color="#10B981" />
            ) : (
              <Flame size={14} color="#F59E0B" />
            )}
          </View>
          <View style={styles.headerTitleCol}>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
              Reading Momentum
            </Text>
          </View>
        </View>

        {/* Goal Badge */}
        <View
          style={[
            styles.goalBadge,
            {
              backgroundColor: colors.surface,
              borderColor: isGoalCompleted ? '#10B98150' : colors.border,
            },
          ]}
        >
          {isGoalCompleted ? (
            <>
              <CheckCircle2 size={11} color="#10B981" style={{ marginRight: 4 }} />
              <Text style={[styles.goalBadgeText, { color: '#10B981' }]}>
                Goal Met!
              </Text>
            </>
          ) : (
            <>
              <View style={[styles.goalDot, { backgroundColor: colors.accent }]} />
              <Text style={[styles.goalBadgeText, { color: colors.accent }]}>
                {goalProgressPct}% of {goalMinutes}m
              </Text>
            </>
          )}
        </View>
      </View>

      {/* Main Glassmorphic Card */}
      <View
        style={[
          styles.cardContainer,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
            shadowColor: '#000',
            shadowOpacity: colors.isDark ? 0.28 : 0.07,
          },
        ]}
      >
        {/* Top Metrics Triptych */}
        <View style={styles.triptychContainer}>
          {/* Metric 1: Minutes Read */}
          <View style={styles.triptychCol}>
            <View style={styles.metricIconRow}>
              <Clock size={11} color={colors.accent} style={{ marginRight: 4 }} />
              <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>
                READING TIME
              </Text>
            </View>
            <View style={styles.metricValueRow}>
              <Text style={[styles.metricBig, { color: colors.textPrimary }]}>
                {todayMinutes}
              </Text>
              <Text style={[styles.metricUnit, { color: colors.textSecondary }]}>
                /{goalMinutes}m
              </Text>
            </View>
            <Text style={[styles.metricSubLabel, { color: colors.textSecondary }]}>
              {isGoalCompleted ? 'Target achieved' : `${remainingMinutes}m remaining`}
            </Text>
          </View>

          {/* Hairline Divider */}
          <View style={[styles.triptychDivider, { backgroundColor: colors.border }]} />

          {/* Metric 2: Pages Logged */}
          <View style={styles.triptychCol}>
            <View style={styles.metricIconRow}>
              <BookOpen size={11} color={colors.textSecondary} style={{ marginRight: 4 }} />
              <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>
                VOLUME
              </Text>
            </View>
            <View style={styles.metricValueRow}>
              <Text style={[styles.metricBig, { color: colors.textPrimary }]}>
                {todayPages}
              </Text>
              <Text style={[styles.metricUnit, { color: colors.textSecondary }]}>
                pgs
              </Text>
            </View>
            <Text style={[styles.metricSubLabel, { color: colors.textSecondary }]}>
              Logged today
            </Text>
          </View>

          {/* Hairline Divider */}
          <View style={[styles.triptychDivider, { backgroundColor: colors.border }]} />

          {/* Metric 3: Active Streak */}
          <View style={styles.triptychCol}>
            <View style={styles.metricIconRow}>
              <Flame size={11} color="#F59E0B" style={{ marginRight: 4 }} />
              <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>
                STREAK
              </Text>
            </View>
            <View style={styles.metricValueRow}>
              <Text style={[styles.metricBig, { color: '#F59E0B' }]}>
                {currentStreakDays}
              </Text>
              <Text style={[styles.metricUnit, { color: '#F59E0B' }]}>
                days
              </Text>
            </View>
            <Text style={[styles.metricSubLabel, { color: colors.textSecondary }]}>
              {currentStreakDays > 0 ? 'Consistent habit' : 'Read today to start'}
            </Text>
          </View>
        </View>

        {/* Progress Track & Pace Indicator */}
        <View style={styles.progressSection}>
          <View style={[styles.progressBarBg, { backgroundColor: colors.canvas }]}>
            <View
              style={[
                styles.progressBarFill,
                {
                  width: `${goalProgressPct}%`,
                  backgroundColor: isGoalCompleted ? '#10B981' : colors.accent,
                },
              ]}
            />
          </View>

          <View style={styles.progressMetaRow}>
            <Text style={[styles.progressHint, { color: colors.textSecondary }]}>
              {isGoalCompleted
                ? '★ Daily reading habit secured for today'
                : `${remainingMinutes}m needed to keep your streak burning`}
            </Text>
            <Text
              style={[
                styles.progressPctText,
                {
                  color: isGoalCompleted ? '#10B981' : colors.accent,
                  fontFamily: FONTS.mono.bold,
                },
              ]}
            >
              {goalProgressPct}%
            </Text>
          </View>
        </View>

        {/* In-Progress Book Feature Banner */}
        {activeBook ? (
          <View
            style={[
              styles.inProgressContainer,
              {
                borderTopColor: colors.border,
                backgroundColor: colors.canvas,
              },
            ]}
          >
            <View style={styles.resumeHeaderRow}>
              <Text style={[styles.resumeHeading, { color: colors.textSecondary }]}>
                CONTINUE
              </Text>
            </View>

            <View style={styles.resumeContentRow}>
              <View style={styles.inProgressLeft}>
                <View
                  style={[
                    styles.coverBox,
                    {
                      backgroundColor: colors.surface,
                      borderColor: colors.border,
                    },
                  ]}
                >
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
                        { backgroundColor: colors.surface },
                      ]}
                    >
                      <BookOpen size={16} color={colors.accent} />
                    </View>
                  )}
                  {/* 3D spine curvature highlight */}
                  <View style={styles.spineHighlight} />
                </View>

                <View style={styles.inProgressDetails}>
                  <Text
                    style={[styles.inProgressTitle, { color: colors.textPrimary }]}
                    numberOfLines={1}
                  >
                    {activeBook.title}
                  </Text>
                  <View style={styles.authorAndProgressRow}>
                    <Text
                      style={[styles.inProgressAuthor, { color: colors.textSecondary }]}
                      numberOfLines={1}
                    >
                      {activeBook.authors?.map((a) => a.name).join(', ') || 'In Library'}
                    </Text>
                    <View style={[styles.progressTag, { backgroundColor: `${colors.accent}18` }]}>
                      <Text style={[styles.progressTagText, { color: colors.accent }]}>
                        {Math.round(activeBook.progressPercentage || 0)}%
                      </Text>
                    </View>
                  </View>
                </View>
              </View>

              {/* Quick Resume Button */}
              <TouchableOpacity
                onPress={() => {
                  Haptics.selectionAsync().catch(() => {});
                  onResumePress(activeBook.id);
                }}
                style={[
                  styles.primaryActionBtn,
                  { backgroundColor: colors.accent },
                ]}
                activeOpacity={0.82}
                accessible={true}
                accessibilityLabel={`Resume reading ${activeBook.title}`}
              >
                <Play
                  size={11}
                  color={colors.isDark ? '#000000' : '#FFFFFF'}
                  fill={colors.isDark ? '#000000' : '#FFFFFF'}
                  style={{ marginRight: 5 }}
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
          </View>
        ) : (
          <TouchableOpacity
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
              onExplorePress();
            }}
            style={[
              styles.explorePromptRow,
              {
                borderTopColor: colors.border,
                backgroundColor: colors.canvas,
              },
            ]}
            activeOpacity={0.8}
            accessible={true}
            accessibilityLabel="Explore public domain library"
          >
            <View style={styles.explorePromptLeft}>
              <Compass size={16} color={colors.accent} style={{ marginRight: 10 }} />
              <View>
                <Text style={[styles.explorePromptTitle, { color: colors.textPrimary }]}>
                  Start a fresh reading session
                </Text>
                <Text style={[styles.explorePromptText, { color: colors.textSecondary }]}>
                  Browse thousands of free public domain masterworks
                </Text>
              </View>
            </View>
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
    marginBottom: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 9,
  },
  headerTitleCol: {
    justifyContent: 'center',
  },
  sectionTitle: {
    fontFamily: FONTS.mona.bold,
    fontSize: 16,
    letterSpacing: -0.3,
  },
  goalBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  goalDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 5,
  },
  goalBadgeText: {
    fontFamily: FONTS.mona.bold,
    fontSize: 11,
    letterSpacing: -0.1,
  },
  cardContainer: {
    borderRadius: 22,
    borderWidth: 1,
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    elevation: 3,
  },
  triptychContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 14,
  },
  triptychCol: {
    flex: 1,
    alignItems: 'center',
  },
  triptychDivider: {
    width: StyleSheet.hairlineWidth,
    height: 36,
    opacity: 0.8,
  },
  metricIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  metricLabel: {
    fontFamily: FONTS.mono.bold,
    fontSize: 9.5,
    letterSpacing: 0.8,
  },
  metricValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  metricBig: {
    fontFamily: FONTS.hubot.extraBold,
    fontSize: 26,
    letterSpacing: -0.6,
  },
  metricUnit: {
    fontFamily: FONTS.mona.medium,
    fontSize: 12.5,
    marginLeft: 2,
  },
  metricSubLabel: {
    fontFamily: FONTS.mona.medium,
    fontSize: 10.5,
    marginTop: 2,
  },
  progressSection: {
    paddingHorizontal: 18,
    paddingBottom: 16,
  },
  progressBarBg: {
    height: 7,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
  },
  progressHint: {
    fontFamily: FONTS.mona.medium,
    fontSize: 11,
    flex: 1,
    paddingRight: 8,
  },
  progressPctText: {
    fontSize: 11,
    letterSpacing: -0.1,
  },
  inProgressContainer: {
    paddingHorizontal: 18,
    paddingTop: 11,
    paddingBottom: 13,
    borderTopWidth: 1,
  },
  resumeHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  resumeHeading: {
    fontFamily: FONTS.mono.bold,
    fontSize: 9.5,
    letterSpacing: 0.9,
    textTransform: 'uppercase',
  },
  resumeContentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  inProgressLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  coverBox: {
    width: 38,
    height: 54,
    borderRadius: 5,
    borderWidth: 1,
    overflow: 'hidden',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 3,
    elevation: 2,
  },
  inProgressCover: {
    width: '100%',
    height: '100%',
  },
  inProgressCoverFallback: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  spineHighlight: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 2.5,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  inProgressDetails: {
    marginLeft: 12,
    flex: 1,
  },
  inProgressTitle: {
    fontFamily: FONTS.mona.bold,
    fontSize: 13,
    letterSpacing: -0.2,
  },
  authorAndProgressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 3,
    gap: 6,
  },
  inProgressAuthor: {
    fontFamily: FONTS.mona.medium,
    fontSize: 11,
    flexShrink: 1,
  },
  progressTag: {
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
  },
  progressTagText: {
    fontFamily: FONTS.mono.bold,
    fontSize: 9.5,
  },
  primaryActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 13,
    paddingVertical: 7,
    borderRadius: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 2,
  },
  primaryActionBtnText: {
    fontFamily: FONTS.mona.bold,
    fontSize: 12,
    letterSpacing: -0.1,
  },
  explorePromptRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderTopWidth: 1,
  },
  explorePromptLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  explorePromptTitle: {
    fontFamily: FONTS.mona.semiBold,
    fontSize: 12.5,
    letterSpacing: -0.2,
  },
  explorePromptText: {
    fontFamily: FONTS.mona.regular,
    fontSize: 11,
    marginTop: 1,
  },
});
