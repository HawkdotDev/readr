import React, { useState, useEffect } from 'react';
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
  Zap,
  Play,
  Pause,
  RotateCcw,
  BookOpen,
  ChevronRight,
  CheckCircle2,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

export interface FocusSprintCardProps {
  activeBook: Book | null;
  onSprintComplete: (minutes: number) => void;
  onOpenReader: (bookId: string) => void;
  onExplorePress: () => void;
}

const SPRINT_PRESETS = [10, 15, 25, 45] as const;

export const FocusSprintCard: React.FC<FocusSprintCardProps> = ({
  activeBook,
  onSprintComplete,
  onOpenReader,
  onExplorePress,
}) => {
  const { colors } = useTheme();

  const [durationMinutes, setDurationMinutes] = useState<number>(15);
  const [secondsLeft, setSecondsLeft] = useState<number>(15 * 60);
  const [isActive, setIsActive] = useState<boolean>(false);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  // Timer countdown hook
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    if (isActive && secondsLeft > 0) {
      interval = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            if (interval) clearInterval(interval);
            setIsActive(false);
            setIsCompleted(true);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
            onSprintComplete(durationMinutes);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, secondsLeft, durationMinutes, onSprintComplete]);

  const handleSelectPreset = (mins: number) => {
    Haptics.selectionAsync().catch(() => {});
    setDurationMinutes(mins);
    setSecondsLeft(mins * 60);
    setIsActive(false);
    setIsCompleted(false);
  };

  const handleToggleTimer = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    if (secondsLeft === 0) {
      setSecondsLeft(durationMinutes * 60);
      setIsCompleted(false);
    }
    setIsActive((prev) => !prev);
  };

  const handleResetTimer = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    setIsActive(false);
    setIsCompleted(false);
    setSecondsLeft(durationMinutes * 60);
  };

  const minutesDisplay = Math.floor(secondsLeft / 60)
    .toString()
    .padStart(2, '0');
  const secondsDisplay = (secondsLeft % 60).toString().padStart(2, '0');

  const totalDurationSeconds = durationMinutes * 60;
  const elapsedSeconds = totalDurationSeconds - secondsLeft;
  const progressPct = Math.min(100, Math.round((elapsedSeconds / totalDurationSeconds) * 100));

  return (
    <View style={styles.container}>
      {/* Header Row */}
      <View style={styles.headerRow}>
        <View style={styles.eyebrowRow}>
          <Zap size={14} color="#F59E0B" style={{ marginRight: 6 }} />
          <Text style={[styles.eyebrowText, { color: colors.textSecondary }]}>
            FOCUS READING SPRINT
          </Text>
        </View>
        <View style={[styles.badge, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.badgeText, { color: colors.accent }]}>
            {durationMinutes}m Interval
          </Text>
        </View>
      </View>

      {/* Main Card Container */}
      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        {/* Preset Selector Buttons */}
        <View style={styles.presetRow}>
          {SPRINT_PRESETS.map((mins) => {
            const isSelected = durationMinutes === mins;
            return (
              <TouchableOpacity
                key={mins}
                onPress={() => handleSelectPreset(mins)}
                style={[
                  styles.presetChip,
                  {
                    backgroundColor: isSelected ? colors.accent : colors.canvas,
                    borderColor: isSelected ? colors.accent : colors.border,
                  },
                ]}
                activeOpacity={0.75}
              >
                <Text
                  style={[
                    styles.presetChipText,
                    {
                      color: isSelected
                        ? colors.isDark
                          ? '#000000'
                          : '#FFFFFF'
                        : colors.textSecondary,
                    },
                  ]}
                >
                  {mins === 25 ? '25m (Pomo)' : `${mins}m`}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Big Timer Clock Display */}
        <View style={styles.clockSection}>
          <Text style={[styles.clockDigits, { color: colors.textPrimary }]}>
            {minutesDisplay}:{secondsDisplay}
          </Text>
          <Text style={[styles.clockLabel, { color: colors.textSecondary }]}>
            {isCompleted
              ? '🎉 Sprint Completed!'
              : isActive
                ? 'Deep Reading in Progress...'
                : 'Ready for deep reading'}
          </Text>

          {/* Progress Line */}
          <View style={[styles.trackBg, { backgroundColor: colors.canvas }]}>
            <View
              style={[
                styles.trackFill,
                {
                  width: `${progressPct}%`,
                  backgroundColor: isCompleted ? '#10B981' : colors.accent,
                },
              ]}
            />
          </View>
        </View>

        {/* Completion Notice */}
        {isCompleted && (
          <View style={[styles.completionBox, { backgroundColor: colors.canvas, borderColor: '#10B981' }]}>
            <CheckCircle2 size={16} color="#10B981" style={{ marginRight: 8 }} />
            <Text style={[styles.completionText, { color: colors.textPrimary }]}>
              Brilliant work! {durationMinutes}m added to today's reading momentum.
            </Text>
          </View>
        )}

        {/* Action Controls */}
        <View style={styles.actionRow}>
          <TouchableOpacity
            onPress={handleToggleTimer}
            style={[
              styles.primaryBtn,
              {
                backgroundColor: isActive ? '#EF4444' : colors.accent,
              },
            ]}
            activeOpacity={0.8}
          >
            {isActive ? (
              <>
                <Pause
                  size={14}
                  color={colors.isDark ? '#000000' : '#FFFFFF'}
                  style={{ marginRight: 6 }}
                />
                <Text
                  style={[
                    styles.btnText,
                    { color: colors.isDark ? '#000000' : '#FFFFFF' },
                  ]}
                >
                  Pause Sprint
                </Text>
              </>
            ) : (
              <>
                <Play
                  size={14}
                  color={colors.isDark ? '#000000' : '#FFFFFF'}
                  fill={colors.isDark ? '#000000' : '#FFFFFF'}
                  style={{ marginRight: 6 }}
                />
                <Text
                  style={[
                    styles.btnText,
                    { color: colors.isDark ? '#000000' : '#FFFFFF' },
                  ]}
                >
                  {secondsLeft < totalDurationSeconds ? 'Resume Sprint' : 'Start Sprint'}
                </Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleResetTimer}
            style={[styles.secondaryBtn, { borderColor: colors.border }]}
            activeOpacity={0.7}
          >
            <RotateCcw size={14} color={colors.textSecondary} style={{ marginRight: 4 }} />
            <Text style={[styles.secondaryBtnText, { color: colors.textSecondary }]}>
              Reset
            </Text>
          </TouchableOpacity>
        </View>

        {/* Active Book Target Bar */}
        {activeBook ? (
          <TouchableOpacity
            onPress={() => {
              Haptics.selectionAsync().catch(() => {});
              onOpenReader(activeBook.id);
            }}
            style={[
              styles.bookTargetRow,
              { borderTopColor: colors.border, backgroundColor: colors.canvas },
            ]}
            activeOpacity={0.8}
          >
            <View style={styles.bookTargetLeft}>
              {activeBook.coverImagePath ? (
                <OptimizedImage
                  source={{ uri: activeBook.coverImagePath }}
                  style={styles.bookThumb}
                  contentFit="cover"
                />
              ) : (
                <View
                  style={[
                    styles.bookThumbFallback,
                    { backgroundColor: colors.surface, borderColor: colors.border },
                  ]}
                >
                  <BookOpen size={14} color={colors.accent} />
                </View>
              )}
              <View style={styles.bookTargetDetails}>
                <Text
                  style={[styles.bookTargetTitle, { color: colors.textPrimary }]}
                  numberOfLines={1}
                >
                  {activeBook.title}
                </Text>
                <Text
                  style={[styles.bookTargetMeta, { color: colors.textSecondary }]}
                  numberOfLines={1}
                >
                  {Math.round(activeBook.progressPercentage || 0)}% read · Tap to sprint in reader
                </Text>
              </View>
            </View>
            <ChevronRight size={16} color={colors.accent} />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            onPress={onExplorePress}
            style={[
              styles.explorePromptRow,
              { borderTopColor: colors.border, backgroundColor: colors.canvas },
            ]}
            activeOpacity={0.8}
          >
            <Text style={[styles.explorePromptText, { color: colors.textSecondary }]}>
              Choose a classic book to start your sprint
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
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 1,
  },
  badgeText: {
    fontFamily: FONTS.mono.medium,
    fontSize: 11,
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
    paddingTop: 16,
  },
  presetRow: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  presetChip: {
    flex: 1,
    paddingVertical: 7,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  presetChipText: {
    fontFamily: FONTS.mona.semiBold,
    fontSize: 12,
    letterSpacing: -0.2,
  },
  clockSection: {
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  clockDigits: {
    fontFamily: FONTS.hubot.bold,
    fontSize: 48,
    letterSpacing: -1,
    lineHeight: 52,
  },
  clockLabel: {
    fontFamily: FONTS.mona.medium,
    fontSize: 12,
    marginTop: 4,
    marginBottom: 14,
  },
  trackBg: {
    width: '100%',
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  trackFill: {
    height: '100%',
    borderRadius: 3,
  },
  completionBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 14,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
  },
  completionText: {
    fontFamily: FONTS.mona.medium,
    fontSize: 12,
    flex: 1,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  primaryBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
  },
  btnText: {
    fontFamily: FONTS.mona.bold,
    fontSize: 14,
  },
  secondaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  secondaryBtnText: {
    fontFamily: FONTS.mona.semiBold,
    fontSize: 13,
  },
  bookTargetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
  },
  bookTargetLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
  },
  bookThumb: {
    width: 28,
    height: 40,
    borderRadius: 4,
  },
  bookThumbFallback: {
    width: 28,
    height: 40,
    borderRadius: 4,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bookTargetDetails: {
    marginLeft: 10,
    flex: 1,
  },
  bookTargetTitle: {
    fontFamily: FONTS.mona.bold,
    fontSize: 13,
  },
  bookTargetMeta: {
    fontFamily: FONTS.mona.medium,
    fontSize: 11,
    marginTop: 2,
  },
  explorePromptRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
  },
  explorePromptText: {
    fontFamily: FONTS.mona.medium,
    fontSize: 12,
  },
});
