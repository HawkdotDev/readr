import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Platform,
} from 'react-native';
import { useTheme } from '../common/ThemeProvider';
import { FONTS } from '../../utils/typography';
import {
  tokenizeChapterForRSVP,
  wpmToBaseIntervalMs,
} from '../../utils/rsvpParser';
import { RSVPWordToken } from '../../types/rsvp';
import { Slider } from '../common/Slider';
import * as Haptics from 'expo-haptics';
import {
  X,
  Play,
  Pause,
  RotateCcw,
  FastForward,
  Rewind,
  Zap,
} from 'lucide-react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export interface RSVPReaderModalProps {
  visible: boolean;
  onClose: () => void;
  chapterText: string;
  chapterTitle?: string;
}

export const RSVPReaderModal: React.FC<RSVPReaderModalProps> = ({
  visible,
  onClose,
  chapterText,
  chapterTitle = 'Active Chapter',
}) => {
  const { colors } = useTheme();

  const [wpm, setWpm] = useState<number>(350);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentIndex, setCurrentIndex] = useState<number>(0);

  const timerRef = useRef<any>(null);
  const tokens: RSVPWordToken[] = useMemo(() => {
    return tokenizeChapterForRSVP(chapterText || '');
  }, [chapterText]);

  const totalTokens = tokens.length;
  const currentToken = tokens[currentIndex] || {
    text: '',
    prefix: '',
    orpChar: '',
    suffix: '',
    delayMultiplier: 1.0,
  };

  // Stop playback when modal closes
  useEffect(() => {
    if (!visible) {
      setIsPlaying(false);
      clearTimeout(timerRef.current);
    }
  }, [visible]);

  // Frame pacing loop
  useEffect(() => {
    if (!isPlaying || totalTokens === 0) {
      clearTimeout(timerRef.current);
      return;
    }

    if (currentIndex >= totalTokens - 1) {
      setIsPlaying(false);
      return;
    }

    const baseMs = wpmToBaseIntervalMs(wpm);
    const delay = Math.round(baseMs * (currentToken.delayMultiplier || 1.0));

    timerRef.current = setTimeout(() => {
      setCurrentIndex((prev) => Math.min(totalTokens - 1, prev + 1));
    }, delay);

    return () => clearTimeout(timerRef.current);
  }, [isPlaying, currentIndex, wpm, totalTokens]);

  const togglePlay = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    setIsPlaying((prev) => !prev);
  };

  const handleSkip = (delta: number) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    setCurrentIndex((prev) => Math.max(0, Math.min(totalTokens - 1, prev + delta)));
  };

  const handleRestart = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {}
    setCurrentIndex(0);
    setIsPlaying(true);
  };

  const progressPercent =
    totalTokens > 0 ? Math.round(((currentIndex + 1) / totalTokens) * 100) : 0;

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={false}
      statusBarTranslucent={true}
      onRequestClose={onClose}
    >
      <View style={[styles.container, { backgroundColor: colors.canvas }]}>
        {/* Top Header */}
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <TouchableOpacity
            onPress={onClose}
            style={[styles.circleBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
            accessible={true}
            accessibilityLabel="Close RSVP Speed Reader"
          >
            <X size={18} color={colors.textPrimary} />
          </TouchableOpacity>

          <View style={styles.headerTitleCol}>
            <View style={styles.speedBadge}>
              <Zap size={13} color={colors.accent} style={{ marginRight: 4 }} />
              <Text style={[styles.speedBadgeText, { color: colors.accent }]}>
                RSVP · {wpm} WPM
              </Text>
            </View>
            <Text style={[styles.chapterTitle, { color: colors.textSecondary }]} numberOfLines={1}>
              {chapterTitle}
            </Text>
          </View>

          <TouchableOpacity
            onPress={handleRestart}
            style={[styles.circleBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
            accessible={true}
            accessibilityLabel="Restart Chapter"
          >
            <RotateCcw size={17} color={colors.textPrimary} />
          </TouchableOpacity>
        </View>

        {/* Center RSVP Focal Letterbox */}
        <TouchableOpacity
          activeOpacity={0.95}
          onPress={togglePlay}
          style={styles.focalArea}
          accessible={true}
          accessibilityLabel="Tap to play or pause speed reading"
        >
          {/* Top Crosshair Guide */}
          <View style={[styles.crosshairTick, { backgroundColor: colors.accent }]} />

          {/* Focal Box Frame */}
          <View
            style={[
              styles.letterbox,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
              },
            ]}
          >
            {/* Word Display with Aligned ORP Character */}
            <View style={styles.wordRow}>
              {/* Prefix (Right-aligned to anchor at ORP) */}
              <Text
                style={[
                  styles.prefixText,
                  { color: colors.textPrimary },
                ]}
                numberOfLines={1}
              >
                {currentToken.prefix}
              </Text>

              {/* ORP Letter (Fixed Center Anchor in Accent Color) */}
              <Text style={[styles.orpText, { color: colors.accent }]}>
                {currentToken.orpChar || ''}
              </Text>

              {/* Suffix (Left-aligned) */}
              <Text
                style={[
                  styles.suffixText,
                  { color: colors.textPrimary },
                ]}
                numberOfLines={1}
              >
                {currentToken.suffix}
              </Text>
            </View>
          </View>

          {/* Bottom Crosshair Guide */}
          <View style={[styles.crosshairTick, { backgroundColor: colors.accent }]} />

          <Text style={[styles.tapHint, { color: colors.textSecondary }]}>
            {isPlaying ? 'Tap anywhere to pause' : 'Tap anywhere to resume'}
          </Text>
        </TouchableOpacity>

        {/* Bottom Control Suite */}
        <View style={[styles.controlsCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          {/* Progress Metadata */}
          <View style={styles.progressRow}>
            <Text style={[styles.progressCount, { color: colors.textPrimary }]}>
              Word {currentIndex + 1} of {totalTokens}
            </Text>
            <Text style={[styles.progressPercent, { color: colors.accent }]}>
              {progressPercent}%
            </Text>
          </View>

          {/* Progress Bar Track */}
          <View style={[styles.progressBarTrack, { backgroundColor: colors.border }]}>
            <View
              style={[
                styles.progressBarFill,
                {
                  width: `${progressPercent}%`,
                  backgroundColor: colors.accent,
                },
              ]}
            />
          </View>

          {/* WPM Speed Slider */}
          <View style={styles.wpmSliderContainer}>
            <Slider
              label="Reading Velocity"
              value={wpm}
              min={200}
              max={800}
              step={25}
              displayFormatter={(v) => `${v} WPM`}
              onChange={setWpm}
            />
          </View>

          {/* Media Action Row */}
          <View style={styles.actionButtonsRow}>
            <TouchableOpacity
              onPress={() => handleSkip(-10)}
              style={[styles.skipBtn, { borderColor: colors.border }]}
              accessible={true}
              accessibilityLabel="Rewind 10 words"
            >
              <Rewind size={18} color={colors.textPrimary} />
              <Text style={[styles.skipBtnText, { color: colors.textPrimary }]}>-10</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={togglePlay}
              style={[styles.mainPlayBtn, { backgroundColor: colors.accent }]}
              accessible={true}
              accessibilityLabel={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? (
                <Pause size={24} color={colors.isDark ? '#000000' : '#FFFFFF'} />
              ) : (
                <Play size={24} color={colors.isDark ? '#000000' : '#FFFFFF'} style={{ marginLeft: 2 }} />
              )}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => handleSkip(10)}
              style={[styles.skipBtn, { borderColor: colors.border }]}
              accessible={true}
              accessibilityLabel="Skip forward 10 words"
            >
              <FastForward size={18} color={colors.textPrimary} />
              <Text style={[styles.skipBtnText, { color: colors.textPrimary }]}>+10</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Platform.OS === 'ios' ? 44 : 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  circleBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitleCol: {
    alignItems: 'center',
  },
  speedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  speedBadgeText: {
    fontFamily: FONTS.mono.bold,
    fontSize: 13,
    letterSpacing: 0.5,
  },
  chapterTitle: {
    fontFamily: FONTS.mona.regular,
    fontSize: 12,
    marginTop: 2,
  },
  focalArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  crosshairTick: {
    width: 2,
    height: 12,
    borderRadius: 1,
    opacity: 0.8,
  },
  letterbox: {
    width: '100%',
    height: 120,
    borderRadius: 16,
    borderWidth: 1,
    marginVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  wordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  prefixText: {
    flex: 1,
    textAlign: 'right',
    fontFamily: FONTS.mona.bold,
    fontSize: 34,
    letterSpacing: 0.5,
  },
  orpText: {
    fontFamily: FONTS.mona.bold,
    fontSize: 36,
    letterSpacing: 0.5,
    marginHorizontal: 0.5,
  },
  suffixText: {
    flex: 1,
    textAlign: 'left',
    fontFamily: FONTS.mona.bold,
    fontSize: 34,
    letterSpacing: 0.5,
  },
  tapHint: {
    fontFamily: FONTS.mono.regular,
    fontSize: 12,
    marginTop: 18,
  },
  controlsCard: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    borderBottomWidth: 0,
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: Platform.OS === 'ios' ? 36 : 24,
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressCount: {
    fontFamily: FONTS.mono.regular,
    fontSize: 12,
  },
  progressPercent: {
    fontFamily: FONTS.mono.bold,
    fontSize: 12,
  },
  progressBarTrack: {
    width: '100%',
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 16,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 2,
  },
  wpmSliderContainer: {
    marginBottom: 16,
  },
  actionButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
  },
  skipBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    gap: 4,
  },
  skipBtnText: {
    fontFamily: FONTS.mono.bold,
    fontSize: 12,
  },
  mainPlayBtn: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
