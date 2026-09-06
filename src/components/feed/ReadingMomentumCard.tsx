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
  Compass,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { calculateChapterMilestone } from '../../utils/chapterMilestones';

export interface ReadingMomentumCardProps {
  todayMinutes: number;
  targetMinutes: number;
  todayPages: number;
  currentStreakDays: number;
  activeBook: Book | null;
  onResumePress: (bookId: string) => void;
  onExplorePress: () => void;
}

/**
 * Whitens a hex color by 10% towards #FFFFFF.
 * Adapts dynamically to light and dark themes to ensure a visibly 10% whiter appearance.
 */
function whitenColor(hex: string, isDark: boolean): string {
  if (!hex || typeof hex !== 'string' || !hex.startsWith('#')) return hex;
  const cleanHex = hex.replace('#', '');
  if (cleanHex.length !== 6) return hex;
  const r = parseInt(cleanHex.slice(0, 2), 16);
  const g = parseInt(cleanHex.slice(2, 4), 16);
  const b = parseInt(cleanHex.slice(4, 6), 16);
  if (isNaN(r) || isNaN(g) || isNaN(b)) return hex;

  const factor = isDark ? 0.10 : 0.65;
  const newR = Math.min(255, Math.round(r + (255 - r) * factor));
  const newG = Math.min(255, Math.round(g + (255 - g) * factor));
  const newB = Math.min(255, Math.round(b + (255 - b) * factor));
  return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
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

  const bookProgressPct = Math.max(
    0,
    Math.min(100, Math.round(activeBook?.progressPercentage || 0))
  );

  const chapterMilestone = React.useMemo(() => {
    if (!activeBook) return null;
    return calculateChapterMilestone(activeBook, activeBook.toc);
  }, [activeBook]);

  // Make the card 10% whiter than standard surface/canvas
  const cardBg = React.useMemo(
    () => whitenColor(colors.surface, colors.isDark),
    [colors.surface, colors.isDark]
  );
  const inProgressBg = React.useMemo(
    () => whitenColor(colors.canvas, colors.isDark),
    [colors.canvas, colors.isDark]
  );

  // When loading bar has not started, use a softer/lighter track tone
  const unstartedBarBg = React.useMemo(() => {
    if (colors.isDark) {
      return 'rgba(255, 255, 255, 0.08)';
    }
    if (colors.border.startsWith('#') && colors.border.length === 7) {
      return `${colors.border}80`;
    }
    return 'rgba(0, 0, 0, 0.05)';
  }, [colors.border, colors.isDark]);

  const hasGoalStarted = goalProgressPct > 0;
  const hasBookStarted = bookProgressPct > 0;

  return (
    <View style={styles.container}>
      {/* Main Glassmorphic Card */}
      <View
        style={[
          styles.cardContainer,
          {
            backgroundColor: cardBg,
            borderColor: colors.border,
            shadowColor: '#000',
            shadowOpacity: colors.isDark ? 0.28 : 0.07,
          },
        ]}
      >
        {/* In-Progress Book Feature Banner (CONTINUE) or Explore Prompt */}
        {activeBook ? (
          <View
            style={[
              styles.inProgressContainer,
              {
                borderBottomColor: colors.border,
                backgroundColor: inProgressBg,
              },
            ]}
          >
            <View style={styles.resumeContentRow}>
              <TouchableOpacity
                activeOpacity={0.88}
                onPress={() => {
                  Haptics.selectionAsync().catch(() => {});
                  onResumePress(activeBook.id);
                }}
                style={[
                  styles.coverBox,
                  {
                    backgroundColor: cardBg,
                    borderColor: colors.border,
                  },
                ]}
                accessible={true}
                accessibilityLabel={`Resume reading ${activeBook.title}`}
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
                      { backgroundColor: cardBg },
                    ]}
                  >
                    <BookOpen size={28} color={colors.accent} />
                  </View>
                )}
                {/* 3D spine curvature highlight */}
                <View style={styles.spineHighlight} />
              </TouchableOpacity>

              <View style={styles.inProgressDetails}>
                <TouchableOpacity
                  activeOpacity={0.88}
                  onPress={() => {
                    Haptics.selectionAsync().catch(() => {});
                    onResumePress(activeBook.id);
                  }}
                  style={styles.detailsTop}
                >
                  <Text
                    style={[styles.inProgressTitle, { color: colors.textPrimary }]}
                    numberOfLines={2}
                  >
                    {activeBook.title}
                  </Text>
                  <Text
                    style={[styles.inProgressAuthor, { color: colors.textSecondary }]}
                    numberOfLines={1}
                  >
                    {activeBook.authors?.map((a) => a.name).join(', ') || 'In Library'}
                  </Text>
                </TouchableOpacity>

                <View style={styles.detailsBottom}>
                  {/* Completion Bar Section (Just Over Resume Button) */}
                  <View style={styles.completionBarSection}>
                    <View style={styles.completionBarMeta}>
                      <Text style={[styles.completionBarLabel, { color: colors.textSecondary }]}>
                        Progress
                      </Text>
                      <Text style={[styles.completionBarPercent, { color: colors.accent }]}>
                        {bookProgressPct}%
                      </Text>
                    </View>
                    <View
                      style={[
                        styles.completionBarBg,
                        { backgroundColor: hasBookStarted ? colors.border : unstartedBarBg },
                      ]}
                    >
                      <View
                        style={[
                          styles.completionBarFill,
                          {
                            width: `${hasBookStarted ? Math.max(4, bookProgressPct) : 0}%`,
                            backgroundColor: bookProgressPct >= 100 ? (colors.isMonochrome ? '#FFFFFF' : '#10B981') : colors.accent,
                          },
                        ]}
                      />
                    </View>
                  </View>

                  {/* Chapter number beside resume button (left) */}
                  <View style={styles.resumeActionRow}>
                    <View style={styles.chapterBadge}>
                      <Text
                        style={[styles.chapterText, { color: colors.textSecondary }]}
                        numberOfLines={1}
                      >
                        Chapter {chapterMilestone?.chapterNumber || 1}
                      </Text>
                    </View>

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
                        numberOfLines={1}
                      >
                        Resume Reading
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
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
                borderBottomColor: colors.border,
                backgroundColor: inProgressBg,
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

        {/* Metrics Triptych (Stats) */}
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
              <Flame size={11} color={colors.isMonochrome ? colors.textPrimary : '#F59E0B'} style={{ marginRight: 4 }} />
              <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>
                STREAK
              </Text>
            </View>
            <View style={styles.metricValueRow}>
              <Text style={[styles.metricBig, { color: colors.isMonochrome ? colors.textPrimary : '#F59E0B' }]}>
                {currentStreakDays}
              </Text>
              <Text style={[styles.metricUnit, { color: colors.isMonochrome ? colors.textPrimary : '#F59E0B' }]}>
                days
              </Text>
            </View>
            <Text style={[styles.metricSubLabel, { color: colors.textSecondary }]}>
              {currentStreakDays > 0 ? 'Consistent habit' : 'Read today to start'}
            </Text>
          </View>
        </View>

        {/* Progress Track & Pace Indicator */}
        <View style={[styles.progressSection, { borderTopColor: colors.border }]}>
          <View
            style={[
              styles.progressBarBg,
              { backgroundColor: hasGoalStarted ? colors.border : unstartedBarBg },
            ]}
          >
            <View
              style={[
                styles.progressBarFill,
                {
                  width: `${goalProgressPct}%`,
                  backgroundColor: isGoalCompleted ? (colors.isMonochrome ? '#FFFFFF' : '#10B981') : colors.accent,
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
                  color: isGoalCompleted ? (colors.isMonochrome ? '#FFFFFF' : '#10B981') : colors.accent,
                  fontFamily: FONTS.mono.bold,
                },
              ]}
            >
              {goalProgressPct}%
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 11,
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
    paddingTop: 14,
    paddingBottom: 16,
    borderTopWidth: 1,
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
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  resumeContentRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  coverBox: {
    width: 100,
    height: 143,
    borderRadius: 9,
    borderWidth: 1,
    overflow: 'hidden',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.16,
    shadowRadius: 5,
    elevation: 3,
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
    width: 3.8,
    backgroundColor: 'rgba(255,255,255,0.22)',
  },
  inProgressDetails: {
    marginLeft: 15,
    flex: 1,
    justifyContent: 'space-between',
    paddingVertical: 1,
  },
  detailsTop: {
    flex: 1,
  },
  inProgressTitle: {
    fontFamily: FONTS.mona.bold,
    fontSize: 15,
    lineHeight: 20,
    letterSpacing: -0.25,
  },
  inProgressAuthor: {
    fontFamily: FONTS.mona.medium,
    fontSize: 12,
    marginTop: 2.5,
    flexShrink: 1,
  },
  detailsBottom: {
    marginTop: 'auto',
  },
  completionBarSection: {
    marginBottom: 8,
  },
  completionBarMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  completionBarLabel: {
    fontFamily: FONTS.mono.bold,
    fontSize: 9.5,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  completionBarPercent: {
    fontFamily: FONTS.mono.bold,
    fontSize: 10.5,
  },
  completionBarBg: {
    height: 5,
    borderRadius: 2.5,
    overflow: 'hidden',
  },
  completionBarFill: {
    height: '100%',
    borderRadius: 2.5,
  },
  resumeActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  chapterBadge: {
    flex: 1,
    marginRight: 8,
  },
  chapterText: {
    fontFamily: FONTS.mona.semiBold,
    fontSize: 12,
    letterSpacing: -0.2,
  },
  primaryActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
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
    borderBottomWidth: 1,
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
