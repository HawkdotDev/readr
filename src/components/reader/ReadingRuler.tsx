import React, { useRef } from 'react';
import {
  View,
  StyleSheet,
  PanResponder,
  Animated,
  Dimensions,
} from 'react-native';
import { useTheme } from '../common/ThemeProvider';
import { ReadingRulerMode } from '../../types';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export interface ReadingRulerProps {
  enabled: boolean;
  mode: ReadingRulerMode;
  height?: number; // Ruler aperture height (e.g. 36px)
  opacity?: number; // Ruler intensity
}

export const ReadingRuler: React.FC<ReadingRulerProps> = ({
  enabled,
  mode = 'highlight',
  height = 38,
  opacity = 0.5,
}) => {
  const { colors } = useTheme();
  const panY = useRef(new Animated.Value(SCREEN_HEIGHT * 0.35)).current;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        panY.extractOffset();
      },
      onPanResponderMove: Animated.event([null, { dy: panY }], {
        useNativeDriver: false,
      }),
      onPanResponderRelease: () => {
        panY.flattenOffset();
      },
    })
  ).current;

  if (!enabled) return null;

  // Render specific ruler modes
  const renderRulerGraphic = () => {
    switch (mode) {
      case 'underline':
        return (
          <View style={[styles.rulerContainer, { height }]}>
            <View
              style={[
                styles.underlineBar,
                {
                  backgroundColor: colors.accent,
                  opacity: Math.max(0.6, opacity),
                },
              ]}
            />
          </View>
        );

      case 'highlight':
        return (
          <View
            style={[
              styles.highlightBar,
              {
                height,
                backgroundColor: colors.isDark
                  ? `rgba(234, 179, 8, ${opacity * 0.4})`
                  : `rgba(254, 240, 138, ${opacity * 0.6})`,
                borderColor: colors.isDark
                  ? `rgba(234, 179, 8, ${opacity * 0.8})`
                  : `rgba(202, 138, 4, ${opacity * 0.6})`,
              },
            ]}
          />
        );

      case 'dimBackground':
        return (
          <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
            {/* Upper Dim Mask */}
            <Animated.View
              style={[
                styles.dimMask,
                {
                  backgroundColor: colors.isDark ? 'rgba(0,0,0,0.72)' : 'rgba(0,0,0,0.52)',
                  height: panY,
                },
              ]}
            />
            {/* Clear Reading Aperture */}
            <View
              style={[
                styles.apertureBox,
                {
                  height,
                  borderColor: colors.accent,
                },
              ]}
            />
            {/* Lower Dim Mask */}
            <View
              style={[
                styles.dimMask,
                {
                  flex: 1,
                  backgroundColor: colors.isDark ? 'rgba(0,0,0,0.72)' : 'rgba(0,0,0,0.52)',
                },
              ]}
            />
          </View>
        );

      case 'dualGuide':
        return (
          <View style={[styles.rulerContainer, { height }]}>
            <View style={[styles.guideLine, { backgroundColor: colors.accent, opacity }]} />
            <View style={{ flex: 1 }} />
            <View style={[styles.guideLine, { backgroundColor: colors.accent, opacity }]} />
          </View>
        );

      case 'focusBox':
        return (
          <View
            style={[
              styles.focusBoxContainer,
              {
                height,
                borderColor: colors.accent,
                backgroundColor: colors.isDark
                  ? `rgba(255, 255, 255, ${opacity * 0.08})`
                  : `rgba(0, 0, 0, ${opacity * 0.05})`,
              },
            ]}
          />
        );

      case 'laser':
        return (
          <View style={[styles.rulerContainer, { height: 12 }]}>
            <View
              style={[
                styles.laserLine,
                {
                  backgroundColor: '#EF4444',
                  shadowColor: '#EF4444',
                  opacity: Math.max(0.7, opacity),
                },
              ]}
            />
          </View>
        );

      default:
        return null;
    }
  };

  if (mode === 'dimBackground') {
    return (
      <View style={styles.fullscreenOverlay} pointerEvents="box-none">
        <Animated.View
          style={[
            styles.dragHandleWrapper,
            {
              transform: [{ translateY: panY }],
            },
          ]}
          {...panResponder.panHandlers}
        >
          <View style={[styles.dragHandlePill, { backgroundColor: colors.accent }]}>
            <View style={styles.dragGripDot} />
            <View style={styles.dragGripDot} />
            <View style={styles.dragGripDot} />
          </View>
        </Animated.View>
        {renderRulerGraphic()}
      </View>
    );
  }

  return (
    <Animated.View
      style={[
        styles.rulerWrapper,
        {
          transform: [{ translateY: panY }],
        },
      ]}
      {...panResponder.panHandlers}
    >
      {renderRulerGraphic()}
      {/* Floating touch drag handle on right margin */}
      <View style={[styles.dragGrip, { backgroundColor: colors.accent }]}>
        <View style={styles.dragGripDot} />
        <View style={styles.dragGripDot} />
      </View>
    </Animated.View>
  );
};

export default ReadingRuler;

const styles = StyleSheet.create({
  fullscreenOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 40,
  },
  rulerWrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 40,
    justifyContent: 'center',
  },
  rulerContainer: {
    width: '100%',
    justifyContent: 'flex-end',
  },
  underlineBar: {
    height: 3,
    width: '100%',
    borderRadius: 1.5,
  },
  highlightBar: {
    width: '100%',
    borderRadius: 4,
    borderWidth: 0.8,
  },
  dimMask: {
    width: '100%',
  },
  apertureBox: {
    width: '100%',
    borderTopWidth: 1.5,
    borderBottomWidth: 1.5,
    backgroundColor: 'transparent',
  },
  guideLine: {
    height: 1.5,
    width: '100%',
  },
  focusBoxContainer: {
    width: '100%',
    borderRadius: 8,
    borderWidth: 1.5,
  },
  laserLine: {
    height: 2,
    width: '100%',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 3,
  },
  dragGrip: {
    position: 'absolute',
    right: 4,
    top: -8,
    width: 20,
    height: 16,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    opacity: 0.85,
  },
  dragHandleWrapper: {
    position: 'absolute',
    right: 6,
    zIndex: 45,
  },
  dragHandlePill: {
    width: 24,
    height: 20,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2.5,
  },
  dragGripDot: {
    width: 2.5,
    height: 2.5,
    borderRadius: 1.25,
    backgroundColor: '#FFFFFF',
  },
});
