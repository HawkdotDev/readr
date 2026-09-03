import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { HardDrive, CheckSquare } from 'lucide-react-native';
import { useTheme } from '../common/ThemeProvider';
import { FONTS } from '../../utils/typography';
import * as Haptics from 'expo-haptics';

export interface ShelfSummaryBannerProps {
  total: number;
  reading: number;
  completed: number;
  totalSizeFormatted: string;
  isSelectMode: boolean;
  onToggleSelectMode: () => void;
}

export const ShelfSummaryBanner: React.FC<ShelfSummaryBannerProps> = React.memo(({
  total,
  reading,
  completed,
  totalSizeFormatted,
  isSelectMode,
  onToggleSelectMode,
}) => {
  const { colors } = useTheme();

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    onToggleSelectMode();
  };

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.surface, borderColor: colors.border },
      ]}
    >
      <View style={styles.left}>
        <View style={styles.countBadge}>
          <HardDrive size={13} color={colors.accent} style={{ marginRight: 5 }} />
          <Text style={[styles.countText, { color: colors.textPrimary }]}>
            {total} {total === 1 ? 'Book' : 'Books'}
          </Text>
        </View>
        <Text style={[styles.details, { color: colors.textSecondary }]}>
          {reading > 0 ? `${reading} Reading \u00B7 ` : ''}
          {completed > 0 ? `${completed} Finished \u00B7 ` : ''}
          {totalSizeFormatted}
        </Text>
      </View>

      <View style={styles.right}>
        <TouchableOpacity
          onPress={handlePress}
          style={[
            styles.actionBtn,
            {
              backgroundColor: isSelectMode ? colors.accent : colors.surface,
              borderColor: isSelectMode ? colors.accent : colors.border,
            },
          ]}
          accessible={true}
          accessibilityLabel="Multi-select mode"
        >
          <CheckSquare
            size={13}
            color={
              isSelectMode
                ? colors.isDark
                  ? '#000000'
                  : '#FFFFFF'
                : colors.textPrimary
            }
            style={{ marginRight: 4 }}
          />
          <Text
            style={[
              styles.actionBtnText,
              {
                color: isSelectMode
                  ? colors.isDark
                    ? '#000000'
                    : '#FFFFFF'
                  : colors.textPrimary,
                fontFamily: isSelectMode ? FONTS.mona.bold : FONTS.mona.medium,
              },
            ]}
          >
            {isSelectMode ? 'Cancel' : 'Select'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 12,
  },
  left: {
    flex: 1,
  },
  countBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  countText: {
    fontFamily: FONTS.mona.bold,
    fontSize: 13,
    letterSpacing: -0.2,
  },
  details: {
    fontSize: 11.5,
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
  },
  actionBtnText: {
    fontSize: 11.5,
  },
});
