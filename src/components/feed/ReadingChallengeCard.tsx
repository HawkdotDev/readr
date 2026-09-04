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
  CheckCircle2,
  BookOpen,
  Sparkles,
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

  const pacingColor =
    challenge.pacing.status === 'ahead'
      ? '#10B981'
      : challenge.pacing.status === 'behind'
        ? '#F59E0B'
        : colors.accent;

  return (
    <View style={styles.container}>
      {/* Header Row */}
      <View style={styles.headerRow}>
        <View style={styles.eyebrowRow}>
          <Trophy size={14} color="#F59E0B" style={{ marginRight: 6 }} />
          <Text style={[styles.eyebrowText, { color: colors.textSecondary }]}>
            {challenge.year} READING CHALLENGE
          </Text>
        </View>

        {/* Pacing Pill */}
        <View style={[styles.pacingPill, { backgroundColor: colors.surface, borderColor: pacingColor }]}>
          <Text style={[styles.pacingPillText, { color: pacingColor }]}>
            {challenge.pacing.message}
          </Text>
        </View>
      </View>

      {/* Main Card */}
      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        {/* Metric Row */}
        <View style={styles.metricRow}>
          <View style={styles.metricLeft}>
            <Text style={[styles.bigCount, { color: colors.textPrimary }]}>
              {challenge.completedCount}
              <Text style={[styles.targetCount, { color: colors.textSecondary }]}>
                /{challenge.targetBooks}
              </Text>
            </Text>
            <Text style={[styles.metricSubtext, { color: colors.textSecondary }]}>
              Books finished in {challenge.year}
            </Text>
          </View>

          <View style={[styles.percentageCircle, { borderColor: colors.accent, backgroundColor: colors.canvas }]}>
            <Text style={[styles.percentageText, { color: colors.textPrimary }]}>
              {challenge.percentage}%
            </Text>
          </View>
        </View>

        {/* Segmented Milestone Progress Bar */}
        <View style={[styles.progressBarBg, { backgroundColor: colors.canvas }]}>
          <View
            style={[
              styles.progressBarFill,
              {
                width: `${challenge.percentage}%`,
                backgroundColor: challenge.isCompleted ? '#10B981' : colors.accent,
              },
            ]}
          />
        </View>

        {/* Milestone Indicator Pips */}
        <View style={styles.milestoneRow}>
          <Text style={[styles.milestonePip, { color: challenge.milestones.q1 ? colors.accent : colors.textSecondary }]}>
            25%
          </Text>
          <Text style={[styles.milestonePip, { color: challenge.milestones.q2 ? colors.accent : colors.textSecondary }]}>
            50%
          </Text>
          <Text style={[styles.milestonePip, { color: challenge.milestones.q3 ? colors.accent : colors.textSecondary }]}>
            75%
          </Text>
          <Text style={[styles.milestonePip, { color: challenge.milestones.q4 ? '#10B981' : colors.textSecondary }]}>
            100%
          </Text>
        </View>

        {/* Quick Goal Preset & Adjuster */}
        <View style={[styles.adjusterSection, { borderTopColor: colors.border }]}>
          <Text style={[styles.adjusterLabel, { color: colors.textSecondary }]}>
            Goal Target:
          </Text>

          <View style={styles.adjusterControls}>
            <TouchableOpacity
              onPress={() => handleAdjustTarget(-1)}
              style={[styles.stepperBtn, { borderColor: colors.border }]}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Minus size={12} color={colors.textSecondary} />
            </TouchableOpacity>

            <Text style={[styles.targetNumber, { color: colors.textPrimary }]}>
              {challenge.targetBooks}
            </Text>

            <TouchableOpacity
              onPress={() => handleAdjustTarget(1)}
              style={[styles.stepperBtn, { borderColor: colors.border }]}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Plus size={12} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Preset Buttons */}
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
                      backgroundColor: isSelected ? colors.accent : colors.canvas,
                      borderColor: isSelected ? colors.accent : colors.border,
                    },
                  ]}
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

        {/* Completed Books Shelf */}
        <View style={[styles.shelfSection, { borderTopColor: colors.border, backgroundColor: colors.canvas }]}>
          <View style={styles.shelfHeaderRow}>
            <Text style={[styles.shelfHeader, { color: colors.textSecondary }]}>
              COMPLETED THIS YEAR ({challenge.completedCount})
            </Text>
            {challenge.isCompleted && (
              <View style={styles.completedBadge}>
                <Sparkles size={12} color="#10B981" style={{ marginRight: 4 }} />
                <Text style={styles.completedBadgeText}>Challenge Met!</Text>
              </View>
            )}
          </View>

          {challenge.completedBooks.length > 0 ? (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.shelfScrollContent}
            >
              {challenge.completedBooks.map((book) => (
                <TouchableOpacity
                  key={book.id}
                  onPress={() => {
                    Haptics.selectionAsync().catch(() => {});
                    onBookPress(book.id);
                  }}
                  style={styles.bookThumbWrapper}
                  activeOpacity={0.8}
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
                        { backgroundColor: colors.surface, borderColor: colors.border },
                      ]}
                    >
                      <BookOpen size={14} color={colors.accent} />
                    </View>
                  )}
                  <View style={styles.checkBadge}>
                    <CheckCircle2 size={12} color="#FFFFFF" fill="#10B981" />
                  </View>
                  <Text
                    style={[styles.shelfBookTitle, { color: colors.textPrimary }]}
                    numberOfLines={1}
                  >
                    {book.title}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          ) : (
            <Text style={[styles.emptyShelfText, { color: colors.textSecondary }]}>
              Books you finish in {challenge.year} will be celebrated on this shelf.
            </Text>
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
    marginBottom: 10,
  },
  eyebrowRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  eyebrowText: {
    fontFamily: FONTS.mono.bold,
    fontSize: 11,
    letterSpacing: 1.1,
    textTransform: 'uppercase',
  },
  pacingPill: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 1,
  },
  pacingPillText: {
    fontFamily: FONTS.mona.bold,
    fontSize: 11,
    letterSpacing: -0.1,
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
    paddingTop: 16,
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 14,
  },
  metricLeft: {
    flex: 1,
  },
  bigCount: {
    fontFamily: FONTS.hubot.bold,
    fontSize: 34,
    letterSpacing: -0.8,
  },
  targetCount: {
    fontFamily: FONTS.mona.medium,
    fontSize: 18,
  },
  metricSubtext: {
    fontFamily: FONTS.mona.medium,
    fontSize: 12,
    marginTop: 2,
  },
  percentageCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  percentageText: {
    fontFamily: FONTS.mono.bold,
    fontSize: 13,
  },
  progressBarBg: {
    height: 6,
    borderRadius: 3,
    marginHorizontal: 16,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  milestoneRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginTop: 6,
    marginBottom: 14,
  },
  milestonePip: {
    fontFamily: FONTS.mono.medium,
    fontSize: 10,
  },
  adjusterSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderTopWidth: 1,
  },
  adjusterLabel: {
    fontFamily: FONTS.mona.semiBold,
    fontSize: 12,
    marginRight: 8,
  },
  adjusterControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  stepperBtn: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  targetNumber: {
    fontFamily: FONTS.mono.bold,
    fontSize: 13,
    minWidth: 20,
    textAlign: 'center',
  },
  presetChipsRow: {
    flexDirection: 'row',
    gap: 6,
    marginLeft: 'auto',
  },
  goalPresetChip: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
  },
  goalPresetText: {
    fontFamily: FONTS.mona.semiBold,
    fontSize: 11,
  },
  shelfSection: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
  },
  shelfHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  shelfHeader: {
    fontFamily: FONTS.mono.bold,
    fontSize: 10,
    letterSpacing: 1,
    textTransform: 'uppercase',
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
  },
  bookThumbWrapper: {
    width: 48,
    position: 'relative',
  },
  shelfCover: {
    width: 48,
    height: 70,
    borderRadius: 4,
  },
  shelfCoverFallback: {
    width: 48,
    height: 70,
    borderRadius: 4,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    borderRadius: 6,
  },
  shelfBookTitle: {
    fontFamily: FONTS.mona.medium,
    fontSize: 10,
    marginTop: 4,
  },
  emptyShelfText: {
    fontFamily: FONTS.mona.medium,
    fontSize: 12,
    fontStyle: 'italic',
    paddingVertical: 6,
  },
});
