import React, { useRef, useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  PanResponder,
} from 'react-native';
import { useTheme } from './ThemeProvider';
import { Minus, Plus } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
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

export function Slider({
  label,
  value,
  min,
  max,
  step = 1,
  unit = '',
  displayFormatter,
  onChange,
  style,
}: SliderProps) {
  const { colors } = useTheme();
  const trackRef = useRef<View>(null);
  const [isDragging, setIsDragging] = useState(false);
  const trackBounds = useRef<{ pageX: number; width: number }>({ pageX: 0, width: 0 });
  const lastHapticValue = useRef<number>(value);

  const measureTrack = useCallback(() => {
    trackRef.current?.measure((_x, _y, width, _height, pageX) => {
      if (width > 0) {
        trackBounds.current = { pageX, width };
      }
    });
  }, []);

  const updateFromTouch = useCallback(
    (pageX: number) => {
      const { pageX: trackX, width } = trackBounds.current;
      if (width <= 0) return;

      const relativeX = Math.max(0, Math.min(width, pageX - trackX));
      const ratio = relativeX / width;
      const rawValue = min + ratio * (max - min);

      // Snap to discrete step
      const stepsCount = Math.round((rawValue - min) / step);
      const steppedValue = Number((min + stepsCount * step).toFixed(2));
      const clampedValue = Math.max(min, Math.min(max, steppedValue));

      if (clampedValue !== lastHapticValue.current) {
        lastHapticValue.current = clampedValue;
        Haptics.selectionAsync().catch(() => {});
        onChange(clampedValue);
      }
    },
    [min, max, step, onChange]
  );

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => {
        setIsDragging(true);
        measureTrack();
        updateFromTouch(evt.nativeEvent.pageX);
      },
      onPanResponderMove: (evt) => {
        updateFromTouch(evt.nativeEvent.pageX);
      },
      onPanResponderRelease: () => {
        setIsDragging(false);
      },
      onPanResponderTerminate: () => {
        setIsDragging(false);
      },
    })
  ).current;

  const handleDecrement = () => {
    Haptics.selectionAsync().catch(() => {});
    const next = Math.max(min, Number((value - step).toFixed(2)));
    onChange(next);
  };

  const handleIncrement = () => {
    Haptics.selectionAsync().catch(() => {});
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
        <Text
          style={[
            styles.valueText,
            { color: isDragging ? colors.accent : colors.textPrimary },
          ]}
        >
          {displayText}
        </Text>
      </View>

      <View style={styles.controlRow}>
        {/* Step Decrement Button */}
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
          <Minus size={15} color={colors.textPrimary} />
        </TouchableOpacity>

        {/* Interactive Fluid Scrub Track Area */}
        <View
          ref={trackRef}
          onLayout={measureTrack}
          {...panResponder.panHandlers}
          style={styles.trackTouchTarget}
          accessible={true}
          accessibilityRole="adjustable"
          accessibilityLabel={`${label}: ${displayText}`}
          accessibilityValue={{ min, max, now: value }}
        >
          {/* Groove Track */}
          <View
            style={[
              styles.trackGroove,
              {
                backgroundColor: colors.canvas,
                borderColor: colors.border,
              },
            ]}
          >
            {/* Active Progress Fill */}
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

          {/* Tactile Circular Thumb Indicator */}
          <View
            style={[
              styles.thumb,
              {
                left: `${progressPercent}%`,
                backgroundColor: colors.surface,
                borderColor: colors.accent,
                transform: [
                  { translateX: isDragging ? -11 : -9 },
                  { scale: isDragging ? 1.2 : 1.0 },
                ],
                shadowOpacity: isDragging ? 0.28 : 0.12,
              },
            ]}
            pointerEvents="none"
          />
        </View>

        {/* Step Increment Button */}
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
          <Plus size={15} color={colors.textPrimary} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

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
    fontVariant: ['tabular-nums'],
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
  trackTouchTarget: {
    flex: 1,
    height: 36,
    justifyContent: 'center',
    position: 'relative',
  },
  trackGroove: {
    width: '100%',
    height: 8,
    borderRadius: 4,
    borderWidth: 1,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 3,
  },
  thumb: {
    position: 'absolute',
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2.5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
});
