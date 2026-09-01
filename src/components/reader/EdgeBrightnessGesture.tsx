import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  PanResponder,
  Animated,
  Dimensions,
} from 'react-native';
import { useTheme } from '../common/ThemeProvider';
import { Sun } from 'lucide-react-native';
import { FONTS } from '../../utils/typography';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export interface EdgeBrightnessGestureProps {
  onBrightnessChange?: (brightness: number) => void;
  initialBrightness?: number;
}

export function EdgeBrightnessGesture({
  onBrightnessChange,
  initialBrightness = 0.8,
}: EdgeBrightnessGestureProps) {
  const { colors } = useTheme();
  const [brightness, setBrightness] = useState(initialBrightness);
  const [isInteracting, setIsInteracting] = useState(false);

  const opacityAnim = useRef(new Animated.Value(0)).current;
  const lastYRef = useRef<number>(0);
  const brightnessRef = useRef<number>(initialBrightness);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => Math.abs(gestureState.dy) > 4,
      onPanResponderGrant: (_, gestureState) => {
        setIsInteracting(true);
        lastYRef.current = gestureState.y0;
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }).start();
      },
      onPanResponderMove: (_, gestureState) => {
        // Dragging UP increases brightness; dragging DOWN decreases brightness
        const delta = (lastYRef.current - gestureState.moveY) / (SCREEN_HEIGHT * 0.4);
        const newBrightness = Math.max(0.05, Math.min(1.0, brightnessRef.current + delta));
        setBrightness(newBrightness);
        onBrightnessChange?.(newBrightness);
      },
      onPanResponderRelease: () => {
        brightnessRef.current = brightness;
        setTimeout(() => {
          Animated.timing(opacityAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }).start(() => setIsInteracting(false));
        }, 800);
      },
      onPanResponderTerminate: () => {
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }).start(() => setIsInteracting(false));
      },
    })
  ).current;

  const percent = Math.round(brightness * 100);

  return (
    <>
      {/* Invisible Touch Strip on Left Edge */}
      <View
        {...panResponder.panHandlers}
        style={styles.edgeTouchArea}
        accessible={true}
        accessibilityLabel="Edge swipe brightness control"
      />

      {/* Floating Brightness HUD Overlay */}
      {isInteracting && (
        <Animated.View
          pointerEvents="none"
          style={[
            styles.hudContainer,
            {
              opacity: opacityAnim,
            },
          ]}
        >
          <View
            style={[
              styles.hudCard,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
                shadowColor: '#000',
                shadowOpacity: colors.isDark ? 0.4 : 0.15,
              },
            ]}
          >
            <Sun size={20} color={colors.accent} style={{ marginBottom: 6 }} />
            <Text style={[styles.hudText, { color: colors.textPrimary }]}>{percent}%</Text>
            
            {/* Vertical Indicator Bar */}
            <View style={[styles.barTrack, { backgroundColor: colors.border }]}>
              <View
                style={[
                  styles.barFill,
                  {
                    height: `${percent}%`,
                    backgroundColor: colors.accent,
                  },
                ]}
              />
            </View>
          </View>
        </Animated.View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  edgeTouchArea: {
    position: 'absolute',
    top: 60,
    bottom: 60,
    left: 0,
    width: 28,
    zIndex: 95,
  },
  hudContainer: {
    position: 'absolute',
    left: 20,
    top: '35%',
    zIndex: 99,
  },
  hudCard: {
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 8,
    minWidth: 44,
  },
  hudText: {
    fontFamily: FONTS.mono.bold,
    fontSize: 11,
    marginBottom: 8,
  },
  barTrack: {
    width: 5,
    height: 90,
    borderRadius: 3,
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  barFill: {
    width: '100%',
    borderRadius: 3,
  },
});
