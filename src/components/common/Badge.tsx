import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from './ThemeProvider';
import { FONTS } from '../../utils/typography';

export interface BadgeProps {
  label: string;
  variant?:
    | 'primary'
    | 'secondary'
    | 'accent'
    | 'outline'
    | 'success'
    | 'warning'
    | 'info'
    | 'favorite';
  style?: ViewStyle;
}

export function Badge({ label, variant = 'secondary', style }: BadgeProps) {
  const { colors } = useTheme();

  const getStyle = (): { bg: string; text: string; border?: string } => {
    switch (variant) {
      case 'primary':
        return {
          bg: colors.accent,
          text: colors.isDark ? '#000000' : '#FFFFFF',
        };
      case 'accent':
        return {
          bg: colors.isDark ? 'rgba(251, 146, 60, 0.16)' : 'rgba(194, 65, 12, 0.10)',
          text: colors.accent,
          border: colors.isDark ? 'rgba(251, 146, 60, 0.35)' : 'rgba(194, 65, 12, 0.22)',
        };
      case 'outline':
        return {
          bg: 'transparent',
          text: colors.textSecondary,
          border: colors.border,
        };
      case 'success':
        return {
          bg: colors.isDark ? '#064E3B' : '#ECFDF5',
          text: colors.isDark ? '#34D399' : '#047857',
          border: colors.isDark ? '#065F46' : '#A7F3D0',
        };
      case 'warning':
        return {
          bg: colors.isDark ? '#451A03' : '#FEF3C7',
          text: colors.isDark ? '#FBBF24' : '#B45309',
          border: colors.isDark ? '#78350F' : '#FDE68A',
        };
      case 'info':
        return {
          bg: colors.isDark ? '#1E293B' : '#EFF6FF',
          text: colors.isDark ? '#60A5FA' : '#1D4ED8',
          border: colors.isDark ? '#334155' : '#BFDBFE',
        };
      case 'favorite':
        return {
          bg: colors.isDark ? '#4C0519' : '#FFF1F2',
          text: colors.isDark ? '#FB7185' : '#E11D48',
          border: colors.isDark ? '#881337' : '#FECDD3',
        };
      case 'secondary':
      default:
        return {
          bg: colors.surface,
          text: colors.textSecondary,
          border: colors.border,
        };
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
}

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
