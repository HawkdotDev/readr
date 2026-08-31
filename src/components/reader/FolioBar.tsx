import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Pressable } from 'react-native';
import { useTheme } from '../common/ThemeProvider';

export interface FolioBarProps {
  chapterTitle: string;
  progressPercentage: number;
  minutesLeft: number;
  onScrub?: (nextProgress: number) => void;
  onPress: () => void;
}

export const FolioBar: React.FC<FolioBarProps> = ({
  chapterTitle,
  progressPercentage,
  minutesLeft,
  onPress,
}) => {
  const { colors } = useTheme();
  const clampedProgress = Math.max(0, Math.min(100, Math.round(progressPercentage)));

  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.container,
        {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
        },
      ] as any}
    >
      <View style={styles.contentRow}>
        {/* Left: Chapter Title */}
        <Text style={[styles.chapterText, { color: colors.textSecondary }] as any} numberOfLines={1}>
          {chapterTitle || 'Chapter'}
        </Text>

        {/* Center: Mini Progress Scrubber */}
        <View style={styles.scrubberContainer}>
          <View style={[styles.track, { backgroundColor: colors.border }] as any}>
            <View
              style={[
                styles.trackFill,
                {
                  width: `${clampedProgress}%`,
                  backgroundColor: colors.accent,
                },
              ] as any}
            />
          </View>
        </View>

        {/* Right: Time remaining + Progress */}
        <Text style={[styles.statText, { color: colors.textSecondary }] as any}>
          {minutesLeft > 0 ? `${minutesLeft}m left (${clampedProgress}%)` : `${clampedProgress}%`}
        </Text>
      </View>
    </Pressable>
  );
};

import { FONTS } from '../../utils/typography';

const styles = StyleSheet.create({
  container: {
    height: 48,
    borderTopWidth: 1,
    paddingHorizontal: 20,
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 4,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  chapterText: {
    fontFamily: FONTS.mona.medium,
    fontSize: 12,
    maxWidth: '35%',
  },
  scrubberContainer: {
    flex: 1,
    paddingHorizontal: 14,
    alignItems: 'center',
  },
  track: {
    width: '100%',
    height: 3,
    borderRadius: 2,
    overflow: 'hidden',
  },
  trackFill: {
    height: '100%',
    borderRadius: 2,
  },
  statText: {
    fontFamily: FONTS.mono.semiBold,
    fontSize: 12,
    textAlign: 'right',
  },
});
