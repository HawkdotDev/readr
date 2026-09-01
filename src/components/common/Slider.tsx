import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from './ThemeProvider';
import { Minus, Plus } from 'lucide-react-native';
import { FONTS } from '../../utils/typography';

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

export const Slider = React.memo<SliderProps>(({
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
    <View style={[styles.container, style]}>
      <View style={styles.topRow}>
        <Text style={[styles.label, { color: colors.textSecondary }]}>{label}</Text>
        <Text style={[styles.valueText, { color: colors.textPrimary }]}>{displayText}</Text>
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
          ]}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          accessible={true}
          accessibilityLabel={`Decrease ${label}`}
        >
          <Minus size={16} color={colors.textPrimary} />
        </TouchableOpacity>

        {/* Progress Track */}
        <View style={[styles.track, { backgroundColor: colors.canvas }]}>
          <View
            style={[
              styles.fill,
              {
                width: `${progressPercent}%`,
                backgroundColor: colors.accent,
              },
            ]}
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
          ]}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          accessible={true}
          accessibilityLabel={`Increase ${label}`}
        >
          <Plus size={16} color={colors.textPrimary} />
        </TouchableOpacity>
      </View>
    </View>
  );
});

export default Slider;

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
