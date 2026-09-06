import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { useTheme } from '../common/ThemeProvider';
import { OptimizedImage } from '../common/OptimizedImage';
import { Book } from '../../types';
import { FONTS } from '../../utils/typography';
import {
  calculateReadingChallenge,
  ANNUAL_CHALLENGE_PRESETS,
} from '../../services/editorial/readingChallengeService';
import {
  Trophy,
  Plus,
  Minus,
  Check,
  CheckCircle2,
  BookOpen,
  Sparkles,
  Award,
  Bookmark,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

export interface ReadingChallengeCardProps {
  books: Book[];
  targetAnnualBooks: number;
  onTargetChange: (newTarget: number) => void;
  onBookPress: (bookId: string) => void;
}

export const ReadingChallengeCard: React.FC<ReadingChallengeCardProps> = ({
  books,
  targetAnnualBooks,
  onTargetChange,
  onBookPress,
}) => {
  const { colors } = useTheme();
  const challenge = calculateReadingChallenge(books, targetAnnualBooks);

  const handleAdjustTarget = (delta: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    const next = Math.max(1, Math.min(100, targetAnnualBooks + delta));
    onTargetChange(next);
  };

  const handleSelectPreset = (preset: number) => {
    Haptics.selectionAsync().catch(() => {});
    onTargetChange(preset);
  };

  const pacingColor = colors.isMonochrome
    ? colors.textPrimary
    : challenge.pacing.status === 'ahead'
      ? '#10B981'
      : challenge.pacing.status === 'behind'
        ? '#F59E0B'
        : colors.accent;

  const remainingBooks = Math.max(0, challenge.targetBooks - challenge.completedCount);

  // 4 Quarterly Milestone Segments (0-25%, 25-50%, 50-75%, 75-100%)
  const q1Fill = Math.min(100, Math.max(0, (challenge.percentage / 25) * 100));
  const q2Fill = Math.min(100, Math.max(0, ((challenge.percentage - 25) / 25) * 100));
  const q3Fill = Math.min(100, Math.max(0, ((challenge.percentage - 50) / 25) * 100));
  const q4Fill = Math.min(100, Math.max(0, ((challenge.percentage - 75) / 25) * 100));

  return (
    <View style={styles.container}>
      {/* Editorial Header Row */}
      <View style={styles.headerRow}>
        <View style={styles.headerLeft}>
          <View
            style={[
              styles.trophyIconCircle,
              {
                backgroundColor: colors.isMonochrome ? `${colors.accent}16` : '#F59E0B16',
                borderColor: colors.isMonochrome ? `${colors.accent}36` : '#F59E0B36',
              },
            ]}
          >
            <Trophy size={14} color={colors.isMonochrome ? colors.textPrimary : '#F59E0B'} />
          </View>
          <View style={styles.headerTitleCol}>
            <View style={styles.titleWithYearRow}>
              <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
                Reading Challenge
              </Text>
              <View
                style={[
                  styles.yearPill,
                  {
                    backgroundColor: colors.canvas,
                    borderColor: colors.border,
                  },
                ]}
              >
                <Text style={[styles.yearText, { color: colors.textSecondary }]}>
                  {challenge.year}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Pacing Badge */}
        <View
          style={[
            styles.pacingPill,
            {
              backgroundColor: colors.surface,
              borderColor: `${pacingColor}40`,
            },
          ]}
        >
          <View style={[styles.pacingDot, { backgroundColor: pacingColor }]} />
          <Text style={[styles.pacingPillText, { color: pacingColor }]}>
            {challenge.pacing.status === 'ahead'
              ? `${challenge.pacing.diff} ahead`
              : challenge.pacing.status === 'behind'
                ? `${challenge.pacing.diff} behind`
                : 'On track'}
          </Text>
        </View>
      </View>

      {/* Main Glassmorphic Card */}
      <View
        style={[
          styles.card,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
            shadowColor: '#000',
            shadowOpacity: colors.isDark ? 0.28 : 0.07,
          },
        ]}
      >
        {/* Metric Spotlight Row */}
        <View style={styles.metricRow}>
          <View style={styles.metricLeft}>
            <View style={styles.countRow}>
              <Text style={[styles.bigCount, { color: colors.textPrimary }]}>
                {challenge.completedCount}
              </Text>
              <Text style={[styles.targetCount, { color: colors.textSecondary }]}>
                /{challenge.targetBooks}
              </Text>
              <Text style={[styles.booksLabel, { color: colors.textSecondary }]}>
                books
              </Text>
            </View>
            <Text style={[styles.metricSubtext, { color: colors.textSecondary }]}>
              {challenge.isCompleted
                ? '✦ Annual goal completed! Stellar literary pace.'
                : remainingBooks === 1
                  ? '1 final book to achieve your annual ambition'
                  : `${remainingBooks} books to reach your annual ambition`}
            </Text>
          </View>

          {/* Radial Metric Ring Badge */}
          <View
            style={[
              styles.percentageRing,
              {
                borderColor: challenge.isCompleted ? (colors.isMonochrome ? '#FFFFFF' : '#10B981') : colors.accent,
                backgroundColor: colors.canvas,
              },
            ]}
          >
            <Text style={[styles.percentageNumber, { color: colors.textPrimary }]}>
              {challenge.percentage}%
            </Text>
            <Text style={[styles.percentageDoneLabel, { color: colors.textSecondary }]}>
              DONE
            </Text>
          </View>
        </View>

        {/* 4 Quarterly Segmented Progress Bars */}
        <View style={styles.progressSection}>
          <View style={styles.segmentTrackRow}>
            {/* Q1 */}
            <View style={[styles.segmentTrack, { backgroundColor: colors.canvas }]}>
              <View
                style={[
                  styles.segmentFill,
                  {
                    width: `${q1Fill}%`,
                    backgroundColor: challenge.isCompleted ? (colors.isMonochrome ? '#FFFFFF' : '#10B981') : colors.accent,
                  },
                ]}
              />
            </View>

            {/* Q2 */}
            <View style={[styles.segmentTrack, { backgroundColor: colors.canvas }]}>
              <View
                style={[
                  styles.segmentFill,
                  {
                    width: `${q2Fill}%`,
                    backgroundColor: challenge.isCompleted ? (colors.isMonochrome ? '#FFFFFF' : '#10B981') : colors.accent,
                  },
                ]}
              />
            </View>

            {/* Q3 */}
            <View style={[styles.segmentTrack, { backgroundColor: colors.canvas }]}>
              <View
                style={[
                  styles.segmentFill,
                  {
                    width: `${q3Fill}%`,
                    backgroundColor: challenge.isCompleted ? (colors.isMonochrome ? '#FFFFFF' : '#10B981') : colors.accent,
                  },
                ]}
              />
            </View>

            {/* Q4 */}
            <View style={[styles.segmentTrack, { backgroundColor: colors.canvas }]}>
              <View
                style={[
                  styles.segmentFill,
                  {
                    width: `${q4Fill}%`,
                    backgroundColor: colors.isMonochrome ? '#FFFFFF' : '#10B981',
                  },
                ]}
              />
            </View>
          </View>

          {/* Quarterly Milestone Indicators */}
          <View style={styles.milestoneRow}>
            <View style={styles.milestoneItem}>
              {challenge.milestones.q1 && (
                <Check size={9} color={colors.accent} style={{ marginRight: 2 }} />
              )}
              <Text
                style={[
                  styles.milestoneText,
                  {
                    color: challenge.milestones.q1 ? colors.accent : colors.textSecondary,
                    fontFamily: challenge.milestones.q1 ? FONTS.mono.bold : FONTS.mono.medium,
                  },
                ]}
              >
                Q1 · 25%
              </Text>
            </View>

            <View style={styles.milestoneItem}>
              {challenge.milestones.q2 && (
                <Check size={9} color={colors.accent} style={{ marginRight: 2 }} />
              )}
              <Text
                style={[
                  styles.milestoneText,
                  {
                    color: challenge.milestones.q2 ? colors.accent : colors.textSecondary,
                    fontFamily: challenge.milestones.q2 ? FONTS.mono.bold : FONTS.mono.medium,
                  },
                ]}
              >
                Q2 · 50%
              </Text>
            </View>

            <View style={styles.milestoneItem}>
              {challenge.milestones.q3 && (
                <Check size={9} color={colors.accent} style={{ marginRight: 2 }} />
              )}
              <Text
                style={[
                  styles.milestoneText,
                  {
                    color: challenge.milestones.q3 ? colors.accent : colors.textSecondary,
                    fontFamily: challenge.milestones.q3 ? FONTS.mono.bold : FONTS.mono.medium,
                  },
                ]}
              >
                Q3 · 75%
              </Text>
            </View>

            <View style={styles.milestoneItem}>
              {challenge.milestones.q4 ? (
                <Sparkles size={9} color={colors.isMonochrome ? '#FFFFFF' : '#10B981'} style={{ marginRight: 2 }} />
              ) : null}
              <Text
                style={[
                  styles.milestoneText,
                  {
                    color: challenge.milestones.q4 ? (colors.isMonochrome ? '#FFFFFF' : '#10B981') : colors.textSecondary,
                    fontFamily: challenge.milestones.q4 ? FONTS.mono.bold : FONTS.mono.medium,
                  },
                ]}
              >
                Goal · 100%
              </Text>
            </View>
          </View>
        </View>

        {/* Integrated Goal Target Controller Strip */}
        <View
          style={[
            styles.adjusterSection,
            {
              backgroundColor: colors.canvas,
              borderTopColor: colors.border,
              borderBottomColor: colors.border,
            },
          ]}
        >
          <View style={styles.adjusterLeft}>
            <Text style={[styles.adjusterLabel, { color: colors.textSecondary }]}>
              TARGET
            </Text>
            <View style={styles.stepperGroup}>
              <TouchableOpacity
                onPress={() => handleAdjustTarget(-1)}
                style={[
                  styles.stepperBtn,
                  {
                    borderColor: colors.border,
                    backgroundColor: colors.surface,
                  },
                ]}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                accessibilityLabel="Decrease annual book target"
              >
                <Minus size={11} color={colors.textSecondary} />
              </TouchableOpacity>

              <Text style={[styles.targetNumber, { color: colors.textPrimary }]}>
                {challenge.targetBooks}
              </Text>

              <TouchableOpacity
                onPress={() => handleAdjustTarget(1)}
                style={[
                  styles.stepperBtn,
                  {
                    borderColor: colors.border,
                    backgroundColor: colors.surface,
                  },
                ]}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                accessibilityLabel="Increase annual book target"
              >
                <Plus size={11} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Quick Preset Chips */}
          <View style={styles.presetChipsRow}>
            {ANNUAL_CHALLENGE_PRESETS.slice(0, 4).map((preset) => {
              const isSelected = challenge.targetBooks === preset;
              return (
                <TouchableOpacity
                  key={preset}
                  onPress={() => handleSelectPreset(preset)}
                  style={[
                    styles.goalPresetChip,
                    {
                      backgroundColor: isSelected ? colors.accent : colors.surface,
                      borderColor: isSelected ? colors.accent : colors.border,
                    },
                  ]}
                  activeOpacity={0.75}
                  accessibilityLabel={`Set target to ${preset} books`}
                >
                  <Text
                    style={[
                      styles.goalPresetText,
                      {
                        color: isSelected
                          ? colors.isDark
                            ? '#000000'
                            : '#FFFFFF'
                          : colors.textSecondary,
                        fontFamily: isSelected ? FONTS.mona.bold : FONTS.mona.medium,
                      },
                    ]}
                  >
                    {preset}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Literary Trophy Shelf */}
        <View style={styles.shelfSection}>
          <View style={styles.shelfHeaderRow}>
            <View style={styles.shelfHeaderLeft}>
              <Bookmark size={12} color={colors.accent} style={{ marginRight: 5 }} />
              <Text style={[styles.shelfHeader, { color: colors.textSecondary }]}>
                LITERARY TROPHY SHELF ({challenge.completedCount})
              </Text>
            </View>
            {challenge.isCompleted ? (
              <View style={styles.completedBadge}>
                <Sparkles size={11} color={colors.isMonochrome ? '#FFFFFF' : '#10B981'} style={{ marginRight: 4 }} />
                <Text style={[styles.completedBadgeText, { color: colors.isMonochrome ? '#FFFFFF' : '#10B981' }]}>Challenge Met!</Text>
              </View>
            ) : (
              <Text style={[styles.shelfCounterText, { color: colors.textSecondary }]}>
                {challenge.completedCount}/{challenge.targetBooks} Shelved
              </Text>
            )}
          </View>

          {challenge.completedBooks.length > 0 ? (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.shelfScrollContent}
            >
              {challenge.completedBooks.map((book) => {
                const authorName = book.authors?.[0]?.name;
                return (
                  <TouchableOpacity
                    key={book.id}
                    onPress={() => {
                      Haptics.selectionAsync().catch(() => {});
                      onBookPress(book.id);
                    }}
                    style={styles.bookThumbWrapper}
                    activeOpacity={0.82}
                    accessible={true}
                    accessibilityLabel={`Read finished book: ${book.title}${authorName ? ` by ${authorName}` : ''}`}
                  >
                    <View
                      style={[
                        styles.shelfCoverBox,
                        {
                          backgroundColor: colors.canvas,
                          borderColor: colors.border,
                        },
                      ]}
                    >
                      {book.coverImagePath ? (
                        <OptimizedImage
                          source={{ uri: book.coverImagePath }}
                          style={styles.shelfCover}
                          contentFit="cover"
                        />
                      ) : (
                        <View
                          style={[
                            styles.shelfCoverFallback,
                            {
                              backgroundColor: colors.canvas,
                              borderColor: colors.border,
                            },
                          ]}
                        >
                          <BookOpen size={16} color={colors.accent} />
                        </View>
                      )}

                      {/* Hardcover spine 3D curvature highlight */}
                      <View style={styles.spineHighlight} />

                      {/* Completion laurel stamp */}
                      <View style={styles.checkBadge}>
                        <CheckCircle2
                          size={13}
                          color={colors.isMonochrome ? '#000000' : '#FFFFFF'}
                          fill={colors.isMonochrome ? '#FFFFFF' : '#10B981'}
                        />
                      </View>
                    </View>

                    <Text
                      style={[styles.shelfBookTitle, { color: colors.textPrimary }]}
                      numberOfLines={1}
                    >
                      {book.title}
                    </Text>
                    {authorName ? (
                      <Text
                        style={[styles.shelfBookAuthor, { color: colors.textSecondary }]}
                        numberOfLines={1}
                      >
                        {authorName}
                      </Text>
                    ) : null}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          ) : (
            <View
              style={[
                styles.emptyShelfContainer,
                {
                  backgroundColor: colors.canvas,
                  borderColor: colors.border,
                },
              ]}
            >
              <View style={styles.emptyGhostBooksRow}>
                <View
                  style={[
                    styles.ghostBookSlot,
                    { borderColor: colors.border },
                  ]}
                >
                  <BookOpen size={14} color={colors.textSecondary} />
                </View>
                <View
                  style={[
                    styles.ghostBookSlot,
                    { borderColor: colors.border },
                  ]}
                >
                  <Sparkles size={14} color={colors.textSecondary} />
                </View>
                <View
                  style={[
                    styles.ghostBookSlot,
                    { borderColor: colors.border },
                  ]}
                >
                  <Trophy size={14} color={colors.textSecondary} />
                </View>
              </View>
              <Text style={[styles.emptyShelfHeading, { color: colors.textPrimary }]}>
                Your trophy gallery awaits
              </Text>
              <Text style={[styles.emptyShelfText, { color: colors.textSecondary }]}>
                Books you finish in {challenge.year} will be enshrined here with completion dates.
              </Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trophyIconCircle: {
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
  titleWithYearRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  headerTitle: {
    fontFamily: FONTS.mona.bold,
    fontSize: 16,
    letterSpacing: -0.3,
  },
  yearPill: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 5,
    borderWidth: 1,
  },
  yearText: {
    fontFamily: FONTS.mono.bold,
    fontSize: 10,
    letterSpacing: 0.3,
  },
  pacingPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  pacingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 5,
  },
  pacingPillText: {
    fontFamily: FONTS.mona.bold,
    fontSize: 11,
    letterSpacing: -0.1,
  },
  card: {
    borderRadius: 22,
    borderWidth: 1,
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    elevation: 3,
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 14,
  },
  metricLeft: {
    flex: 1,
    paddingRight: 12,
  },
  countRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  bigCount: {
    fontFamily: FONTS.hubot.extraBold,
    fontSize: 38,
    lineHeight: 42,
    letterSpacing: -1,
  },
  targetCount: {
    fontFamily: FONTS.mona.medium,
    fontSize: 18,
    marginLeft: 3,
  },
  booksLabel: {
    fontFamily: FONTS.mona.semiBold,
    fontSize: 13,
    marginLeft: 6,
  },
  metricSubtext: {
    fontFamily: FONTS.mona.medium,
    fontSize: 12,
    lineHeight: 16,
    marginTop: 4,
  },
  percentageRing: {
    width: 58,
    height: 58,
    borderRadius: 29,
    borderWidth: 2.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  percentageNumber: {
    fontFamily: FONTS.mono.bold,
    fontSize: 14,
    lineHeight: 16,
  },
  percentageDoneLabel: {
    fontFamily: FONTS.mono.bold,
    fontSize: 8,
    letterSpacing: 0.8,
    marginTop: 1,
  },
  progressSection: {
    paddingHorizontal: 18,
    marginBottom: 16,
  },
  segmentTrackRow: {
    flexDirection: 'row',
    gap: 5,
    height: 7,
  },
  segmentTrack: {
    flex: 1,
    height: '100%',
    borderRadius: 4,
    overflow: 'hidden',
  },
  segmentFill: {
    height: '100%',
    borderRadius: 4,
  },
  milestoneRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 7,
  },
  milestoneItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  milestoneText: {
    fontSize: 10,
    letterSpacing: 0.1,
  },
  adjusterSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderBottomWidth: 1,
  },
  adjusterLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  adjusterLabel: {
    fontFamily: FONTS.mono.bold,
    fontSize: 9.5,
    letterSpacing: 0.9,
    marginRight: 6,
  },
  stepperGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  stepperBtn: {
    width: 25,
    height: 25,
    borderRadius: 7,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  targetNumber: {
    fontFamily: FONTS.mono.bold,
    fontSize: 13,
    minWidth: 22,
    textAlign: 'center',
  },
  presetChipsRow: {
    flexDirection: 'row',
    gap: 5,
  },
  goalPresetChip: {
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderRadius: 7,
    borderWidth: 1,
  },
  goalPresetText: {
    fontSize: 11,
    letterSpacing: -0.1,
  },
  shelfSection: {
    paddingHorizontal: 18,
    paddingTop: 14,
    paddingBottom: 16,
  },
  shelfHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  shelfHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  shelfHeader: {
    fontFamily: FONTS.mono.bold,
    fontSize: 10,
    letterSpacing: 0.9,
    textTransform: 'uppercase',
  },
  shelfCounterText: {
    fontFamily: FONTS.mono.medium,
    fontSize: 10.5,
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  completedBadgeText: {
    fontFamily: FONTS.mona.bold,
    fontSize: 11,
    color: '#10B981',
  },
  shelfScrollContent: {
    gap: 12,
    paddingRight: 8,
    paddingTop: 2,
  },
  bookThumbWrapper: {
    width: 60,
  },
  shelfCoverBox: {
    width: 60,
    height: 88,
    borderRadius: 7,
    borderWidth: 1,
    overflow: 'hidden',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 2,
  },
  shelfCover: {
    width: '100%',
    height: '100%',
  },
  shelfCoverFallback: {
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
    width: 3,
    backgroundColor: 'rgba(255,255,255,0.18)',
  },
  checkBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.25,
    shadowRadius: 2,
    elevation: 2,
  },
  shelfBookTitle: {
    fontFamily: FONTS.mona.semiBold,
    fontSize: 10.5,
    marginTop: 5,
  },
  shelfBookAuthor: {
    fontFamily: FONTS.mona.regular,
    fontSize: 9.5,
    marginTop: 1,
  },
  emptyShelfContainer: {
    paddingVertical: 18,
    paddingHorizontal: 16,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyGhostBooksRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },
  ghostBookSlot: {
    width: 38,
    height: 52,
    borderRadius: 5,
    borderWidth: 1,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.5,
  },
  emptyShelfHeading: {
    fontFamily: FONTS.mona.semiBold,
    fontSize: 12.5,
    marginBottom: 3,
  },
  emptyShelfText: {
    fontFamily: FONTS.mona.regular,
    fontSize: 11,
    textAlign: 'center',
    lineHeight: 15,
  },
});
