import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../common/ThemeProvider';

export interface StatCardProps {
  label: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  style?: ViewStyle;
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  subtitle,
  icon,
  style,
}) => {
  const { colors } = useTheme();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
        },
        style,
      ] as any}
    >
      <View style={styles.topRow}>
        <Text style={[styles.label, { color: colors.textSecondary }] as any}>{label}</Text>
        <View style={styles.iconBox}>{icon}</View>
      </View>

      <Text style={[styles.value, { color: colors.textPrimary }] as any}>{value}</Text>

      {subtitle && (
        <Text style={[styles.subtitle, { color: colors.textSecondary }] as any}>{subtitle}</Text>
      )}
    </View>
  );
};

import { FONTS } from '../../utils/typography';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  label: {
    fontFamily: FONTS.mono.bold,
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  iconBox: {
    opacity: 0.85,
  },
  value: {
    fontFamily: FONTS.hubot.bold,
    fontSize: 22,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontFamily: FONTS.mona.regular,
    fontSize: 11,
    marginTop: 4,
  },
});
