import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useTheme } from '../common/ThemeProvider';
import { FONTS } from '../../utils/typography';

export interface FolioBarProps {
  chapterTitle?: string;
  currentChapterNumber?: number;
  totalChapters?: number;
  progressPercentage: number;
  minutesLeft: number;
  onPress: () => void;
}

export const FolioBar: React.FC<FolioBarProps> = ({
  chapterTitle,
  currentChapterNumber = 1,
  totalChapters = 1,
  progressPercentage,
  minutesLeft,
  onPress,
}) => {
  const { colors } = useTheme();
  const clampedProgress = Math.max(0, Math.min(100, Math.round(progressPercentage)));

  const chapterLabel = totalChapters > 1
    ? `Chapter ${currentChapterNumber} of ${totalChapters}`
    : (chapterTitle || 'Chapter 1');

  const timeLabel = minutesLeft > 0 ? `${minutesLeft} min left` : 'Finished';

  return (
    <Pressable
      onPress={onPress}
      style={styles.container}
      accessible={true}
      accessibilityRole="button"
      accessibilityLabel={`Reading progress: ${clampedProgress} percent, ${chapterLabel}, ${timeLabel}`}
    >
      {/* Progress Track Line */}
      <View style={[styles.progressTrack, { backgroundColor: colors.border }]}>
        <View
          style={[
            styles.progressFill,
            {
              width: `${clampedProgress}%`,
              backgroundColor: colors.textPrimary,
            },
          ]}
        />
      </View>

      {/* 3-Column Metadata Row (65% | Chapter 5 of 12 | 14 min left) */}
      <View style={styles.metaRow}>
        <Text style={[styles.leftText, { color: colors.textSecondary }]}>
          {clampedProgress}%
        </Text>

        <Text style={[styles.centerText, { color: colors.textSecondary }]} numberOfLines={1}>
          {chapterLabel}
        </Text>

        <Text style={[styles.rightText, { color: colors.textSecondary }]}>
          {timeLabel}
        </Text>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 16,
  },
  progressTrack: {
    width: '100%',
    height: 3,
    borderRadius: 1.5,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 1.5,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  leftText: {
    fontFamily: FONTS.mono.medium,
    fontSize: 11,
    minWidth: 40,
  },
  centerText: {
    fontFamily: FONTS.mono.medium,
    fontSize: 11,
    textAlign: 'center',
    flex: 1,
    paddingHorizontal: 8,
  },
  rightText: {
    fontFamily: FONTS.mono.medium,
    fontSize: 11,
    textAlign: 'right',
    minWidth: 65,
  },
});
