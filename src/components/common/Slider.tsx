import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from './ThemeProvider';
import { Minus, Plus } from 'lucide-react-native';

export interface SliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  displayFormatter?: (val: number) => string;
  onChange: (val: number) => void;
  style?: ViewStyle;
}

export const Slider: React.FC<SliderProps> = ({
  label,
  value,
  min,
  max,
  step = 1,
  unit = '',
  displayFormatter,
  onChange,
  style,
}) => {
  const { colors } = useTheme();

  const handleDecrement = () => {
    const next = Math.max(min, Number((value - step).toFixed(2)));
    onChange(next);
  };

  const handleIncrement = () => {
    const next = Math.min(max, Number((value + step).toFixed(2)));
    onChange(next);
  };

  // Calculate percentage fill
  const progressPercent = Math.max(0, Math.min(100, ((value - min) / (max - min)) * 100));
  const displayText = displayFormatter ? displayFormatter(value) : `${value}${unit}`;

  return (
    <View style={[styles.container, style] as any}>
      <View style={styles.topRow}>
        <Text style={[styles.label, { color: colors.textSecondary }] as any}>{label}</Text>
        <Text style={[styles.valueText, { color: colors.textPrimary }] as any}>{displayText}</Text>
      </View>

      <View style={styles.controlRow}>
        <TouchableOpacity
          onPress={handleDecrement}
          disabled={value <= min}
          style={[
            styles.btn,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
              opacity: value <= min ? 0.3 : 1,
            },
          ] as any}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Minus size={16} color={colors.textPrimary} />
        </TouchableOpacity>

        {/* Visual Progress Track */}
        <View style={[styles.track, { backgroundColor: colors.border }] as any}>
          <View
            style={[
              styles.fill,
              {
                width: `${progressPercent}%`,
                backgroundColor: colors.accent,
              },
            ] as any}
          />
        </View>

        <TouchableOpacity
          onPress={handleIncrement}
          disabled={value >= max}
          style={[
            styles.btn,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
              opacity: value >= max ? 0.3 : 1,
            },
          ] as any}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Plus size={16} color={colors.textPrimary} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

import { FONTS } from '../../utils/typography';

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    fontFamily: FONTS.mona.medium,
    fontSize: 14,
  },
  valueText: {
    fontFamily: FONTS.mono.bold,
    fontSize: 14,
  },
  controlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  btn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  track: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 4,
  },
});
