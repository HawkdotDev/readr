import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  PanResponder,
} from 'react-native';
import { useTheme } from '../common/ThemeProvider';
import { useReaderStore } from '../../store/readerStore';
import { AutoScrollMode } from '../../types';
import {
  Play,
  Pause,
  X,
  FastForward,
  Rewind,
  Clock,
  ChevronUp,
  ChevronDown,
  Gauge,
  Sliders,
} from 'lucide-react-native';
import { FONTS } from '../../utils/typography';
import * as Haptics from 'expo-haptics';

export interface AutoScrollControllerProps {
  onScrollTick?: (deltaY: number) => void;
  onPageTurnNext?: () => void;
  onPageTurnPrev?: () => void;
}

export function AutoScrollController({
  onScrollTick,
  onPageTurnNext,
  onPageTurnPrev,
}: AutoScrollControllerProps) {
  const { colors } = useTheme();

  const {
    isAutoScrolling,
    autoScrollSpeed,
    autoScrollMode,
    pageTimerIntervalSeconds,
    setAutoScrolling,
    setAutoScrollSpeed,
    setAutoScrollMode,
    setPageTimerInterval,
  } = useReaderStore();

  const [isPaused, setIsPaused] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState(pageTimerIntervalSeconds);
  const [expanded, setExpanded] = useState(false);

  // Position animated value for subtle float
  const slideAnim = useRef(new Animated.Value(80)).current;

  useEffect(() => {
    if (isAutoScrolling) {
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 8,
        tension: 90,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: 120,
        duration: 180,
        useNativeDriver: true,
      }).start();
    }
  }, [isAutoScrolling]);

  // Continuous Scroll Timer loop
  useEffect(() => {
    if (!isAutoScrolling || isPaused) return;

    if (autoScrollMode === 'smooth' || autoScrollMode === 'pixel') {
      const intervalMs = autoScrollMode === 'pixel' ? 30 : 16;
      const step = (autoScrollSpeed * intervalMs) / 1000;

      const timer = setInterval(() => {
        onScrollTick?.(step);
      }, intervalMs);

      return () => clearInterval(timer);
    }

    if (autoScrollMode === 'line') {
      const lineIntervalMs = Math.max(300, 3000 - autoScrollSpeed * 14);
      const timer = setInterval(() => {
        onScrollTick?.(24);
      }, lineIntervalMs);

      return () => clearInterval(timer);
    }

    if (autoScrollMode === 'pageTimer') {
      setSecondsRemaining(pageTimerIntervalSeconds);
      const timer = setInterval(() => {
        setSecondsRemaining((prev) => {
          if (prev <= 1) {
            onPageTurnNext?.();
            return pageTimerIntervalSeconds;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [isAutoScrolling, isPaused, autoScrollSpeed, autoScrollMode, pageTimerIntervalSeconds, onScrollTick, onPageTurnNext]);

  if (!isAutoScrolling) return null;

  const handleTogglePlayPause = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    setIsPaused((prev) => !prev);
  };

  const handleAdjustSpeed = (delta: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    const newSpeed = Math.max(10, Math.min(180, autoScrollSpeed + delta));
    setAutoScrollSpeed(newSpeed);
  };

  const handleClose = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    setAutoScrolling(false);
  };

  const modes: { label: string; mode: AutoScrollMode }[] = [
    { label: 'Smooth', mode: 'smooth' },
    { label: 'Line', mode: 'line' },
    { label: 'Timed Page', mode: 'pageTimer' },
    { label: 'Pixel', mode: 'pixel' },
  ];

  return (
    <Animated.View
      style={[
        styles.floatingContainer,
        {
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <View
        style={[
          styles.pillCard,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
            shadowColor: '#000',
            shadowOpacity: colors.isDark ? 0.4 : 0.15,
          },
        ]}
      >
        {/* Top Control Strip */}
        <View style={styles.mainRow}>
          {/* Pause / Resume Button */}
          <TouchableOpacity
            onPress={handleTogglePlayPause}
            style={[styles.playBtn, { backgroundColor: colors.accent }]}
            accessible={true}
            accessibilityLabel={isPaused ? 'Resume auto-scroll' : 'Pause auto-scroll'}
          >
            {isPaused ? (
              <Play size={16} color={colors.isDark ? '#000000' : '#FFFFFF'} fill={colors.isDark ? '#000000' : '#FFFFFF'} />
            ) : (
              <Pause size={16} color={colors.isDark ? '#000000' : '#FFFFFF'} fill={colors.isDark ? '#000000' : '#FFFFFF'} />
            )}
          </TouchableOpacity>

          {/* Speed / Mode Display */}
          <TouchableOpacity
            onPress={() => setExpanded(!expanded)}
            style={styles.infoTouch}
          >
            <Text style={[styles.modeLabel, { color: colors.textPrimary }]}>
              {autoScrollMode === 'pageTimer'
                ? `⏱️ Page Flip: ${secondsRemaining}s`
                : `${autoScrollMode.toUpperCase()} • ${autoScrollSpeed} px/s`}
            </Text>
            <Text style={[styles.subModeHint, { color: colors.textSecondary }]}>
              {isPaused ? 'Paused (tap to resume)' : 'Auto-Scrolling Active'}
            </Text>
          </TouchableOpacity>

          {/* Stepper Controls */}
          {autoScrollMode !== 'pageTimer' && (
            <View style={styles.stepperWrap}>
              <TouchableOpacity
                onPress={() => handleAdjustSpeed(-10)}
                style={[styles.stepperBtn, { borderColor: colors.border }]}
              >
                <Rewind size={13} color={colors.textPrimary} />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handleAdjustSpeed(10)}
                style={[styles.stepperBtn, { borderColor: colors.border }]}
              >
                <FastForward size={13} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>
          )}

          {/* Close Stop Button */}
          <TouchableOpacity
            onPress={handleClose}
            style={[styles.closeBtn, { backgroundColor: colors.canvas, borderColor: colors.border }]}
            accessible={true}
            accessibilityLabel="Stop auto-scroll"
          >
            <X size={15} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Expanded Mode & Speed Palette */}
        {expanded && (
          <View style={[styles.expandedDrawer, { borderTopColor: colors.border }]}>
            <Text style={[styles.drawerTitle, { color: colors.textSecondary }]}>SCROLL MODE</Text>
            <View style={styles.modeRow}>
              {modes.map((m) => {
                const isSelected = autoScrollMode === m.mode;
                return (
                  <TouchableOpacity
                    key={m.mode}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
                      setAutoScrollMode(m.mode);
                    }}
                    style={[
                      styles.modePill,
                      {
                        backgroundColor: isSelected ? colors.accent : colors.canvas,
                        borderColor: isSelected ? colors.accent : colors.border,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.modePillText,
                        {
                          color: isSelected ? (colors.isDark ? '#000000' : '#FFFFFF') : colors.textPrimary,
                          fontFamily: isSelected ? FONTS.mona.bold : FONTS.mona.medium,
                        },
                      ]}
                    >
                      {m.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {autoScrollMode === 'pageTimer' ? (
              <View style={styles.speedRow}>
                <Text style={[styles.drawerTitle, { color: colors.textSecondary }]}>PAGE INTERVAL</Text>
                <View style={styles.intervalOptions}>
                  {[10, 15, 20, 30, 45].map((sec) => {
                    const isSel = pageTimerIntervalSeconds === sec;
                    return (
                      <TouchableOpacity
                        key={sec}
                        onPress={() => {
                          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
                          setPageTimerInterval(sec);
                          setSecondsRemaining(sec);
                        }}
                        style={[
                          styles.speedPill,
                          {
                            backgroundColor: isSel ? colors.accent : colors.canvas,
                            borderColor: isSel ? colors.accent : colors.border,
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.speedPillText,
                            {
                              color: isSel ? (colors.isDark ? '#000000' : '#FFFFFF') : colors.textPrimary,
                            },
                          ]}
                        >
                          {sec}s
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            ) : (
              <View style={styles.speedRow}>
                <Text style={[styles.drawerTitle, { color: colors.textSecondary }]}>SPEED PRESETS</Text>
                <View style={styles.intervalOptions}>
                  {[
                    { label: 'Slow', val: 25 },
                    { label: 'Normal', val: 50 },
                    { label: 'Fast', val: 85 },
                    { label: 'Turbo', val: 130 },
                  ].map((preset) => {
                    const isSel = Math.abs(autoScrollSpeed - preset.val) < 15;
                    return (
                      <TouchableOpacity
                        key={preset.label}
                        onPress={() => {
                          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
                          setAutoScrollSpeed(preset.val);
                        }}
                        style={[
                          styles.speedPill,
                          {
                            backgroundColor: isSel ? colors.accent : colors.canvas,
                            borderColor: isSel ? colors.accent : colors.border,
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.speedPillText,
                            {
                              color: isSel ? (colors.isDark ? '#000000' : '#FFFFFF') : colors.textPrimary,
                            },
                          ]}
                        >
                          {preset.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            )}
          </View>
        )}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  floatingContainer: {
    position: 'absolute',
    bottom: 24,
    left: 16,
    right: 16,
    alignItems: 'center',
    zIndex: 99,
  },
  pillCard: {
    width: '100%',
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 12,
    elevation: 8,
  },
  mainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  playBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoTouch: {
    flex: 1,
    marginHorizontal: 12,
  },
  modeLabel: {
    fontFamily: FONTS.mona.bold,
    fontSize: 13,
  },
  subModeHint: {
    fontFamily: FONTS.mona.regular,
    fontSize: 11,
    marginTop: 1,
  },
  stepperWrap: {
    flexDirection: 'row',
    gap: 6,
    marginRight: 8,
  },
  stepperBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  expandedDrawer: {
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    gap: 8,
  },
  drawerTitle: {
    fontFamily: FONTS.mono.bold,
    fontSize: 10,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  modeRow: {
    flexDirection: 'row',
    gap: 6,
    flexWrap: 'wrap',
  },
  modePill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
  },
  modePillText: {
    fontSize: 11.5,
  },
  speedRow: {
    marginTop: 6,
    gap: 6,
  },
  intervalOptions: {
    flexDirection: 'row',
    gap: 6,
  },
  speedPill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    borderWidth: 1,
  },
  speedPillText: {
    fontFamily: FONTS.mona.semiBold,
    fontSize: 11,
  },
});
