import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from './ThemeProvider';
import { FONTS } from '../../utils/typography';

export interface BadgeProps {
  label: string;
  variant?: 'primary' | 'secondary' | 'accent' | 'outline' | 'success' | 'warning';
  style?: ViewStyle;
}

export const Badge = React.memo<BadgeProps>(({ label, variant = 'secondary', style }) => {
  const { colors } = useTheme();

  const getStyle = (): { bg: string; text: string; border?: string } => {
    switch (variant) {
      case 'primary':
        return { bg: colors.accent, text: colors.isDark ? '#000000' : '#FFFFFF' };
      case 'accent':
        return { bg: colors.isDark ? '#27272A' : '#E4E4E7', text: colors.textPrimary };
      case 'outline':
        return { bg: 'transparent', text: colors.textSecondary, border: colors.border };
      case 'success':
        return { bg: colors.isDark ? '#27272A' : '#E4E4E7', text: colors.textPrimary };
      case 'warning':
        return { bg: colors.isDark ? '#27272A' : '#E4E4E7', text: colors.textSecondary };
      case 'secondary':
      default:
        return { bg: colors.surface, text: colors.textSecondary, border: colors.border };
    }
  };

  const { bg, text, border } = getStyle();

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: bg,
          borderColor: border || 'transparent',
          borderWidth: border ? 1 : 0,
        },
        style,
      ]}
    >
      <Text style={[styles.text, { color: text }]}>{label}</Text>
    </View>
  );
});

export default Badge;

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: 'flex-start',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontFamily: FONTS.mono.semiBold,
    fontSize: 11,
    letterSpacing: 0.2,
  },
});
