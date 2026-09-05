import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Sheet } from '../common/Sheet';
import { Slider } from '../common/Slider';
import { useTheme } from '../common/ThemeProvider';
import { ttsService, TTSState } from '../../services/tts/ttsService';
import { Play, Pause, Square, SkipBack, SkipForward, Clock } from 'lucide-react-native';
import { FONTS } from '../../utils/typography';

export interface TTSSheetProps {
  visible: boolean;
  onClose: () => void;
}

export const TTSSheet: React.FC<TTSSheetProps> = ({ visible, onClose }) => {
  const { colors } = useTheme();
  const [ttsState, setTTSState] = useState<TTSState>(ttsService.getState());

  useEffect(() => {
    const unsub = ttsService.subscribe((state) => {
      setTTSState(state);
    });
    return unsub;
  }, []);

  const sleepTimers = [
    { label: 'Off', minutes: null },
    { label: '15m', minutes: 15 },
    { label: '30m', minutes: 30 },
    { label: '45m', minutes: 45 },
    { label: '60m', minutes: 60 },
  ];

  return (
    <Sheet visible={visible} onClose={onClose} title="Audio Narration (TTS)" maxHeightRatio={0.88}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        style={styles.scroll}
        contentContainerStyle={styles.container}
        nestedScrollEnabled={true}
        keyboardShouldPersistTaps="handled"
        bounces={true}
        overScrollMode="always"
      >
        {/* Playback Progress Indicator */}
        <View style={[styles.progressCard, { backgroundColor: colors.canvas, borderColor: colors.border }] as any}>
          <Text style={[styles.progressText, { color: colors.textSecondary }] as any}>
            Sentence {ttsState.currentSentenceIndex + 1} of {Math.max(1, ttsState.totalSentences)}
          </Text>

          {ttsState.sleepTimerRemainingSeconds !== null && (
            <View style={styles.timerBadge}>
              <Clock size={12} color={colors.accent} style={{ marginRight: 4 }} />
              <Text style={[styles.timerText, { color: colors.accent }] as any}>
                {Math.floor(ttsState.sleepTimerRemainingSeconds / 60)}m {ttsState.sleepTimerRemainingSeconds % 60}s left
              </Text>
            </View>
          )}
        </View>

        {/* Playback Controls */}
        <View style={styles.controlsRow}>
          <TouchableOpacity
            onPress={() => ttsService.prevSentence()}
            style={[styles.controlBtn, { backgroundColor: colors.surface, borderColor: colors.border }] as any}
          >
            <SkipBack size={20} color={colors.textPrimary} />
          </TouchableOpacity>

          {ttsState.isPlaying ? (
            <TouchableOpacity
              onPress={() => ttsService.pause()}
              style={[styles.mainPlayBtn, { backgroundColor: colors.accent }] as any}
            >
              <Pause size={26} color="#FFFFFF" />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={() => ttsService.play()}
              style={[styles.mainPlayBtn, { backgroundColor: colors.accent }] as any}
            >
              <Play size={26} color={colors.isDark ? '#000000' : '#FFFFFF'} style={{ marginLeft: 3 }} />
            </TouchableOpacity>
          )}

          <TouchableOpacity
            onPress={() => ttsService.nextSentence()}
            style={[styles.controlBtn, { backgroundColor: colors.surface, borderColor: colors.border }] as any}
          >
            <SkipForward size={20} color={colors.textPrimary} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => ttsService.stop()}
            style={[styles.controlBtn, { backgroundColor: colors.surface, borderColor: colors.border }] as any}
          >
            <Square size={18} color={colors.textPrimary} />
          </TouchableOpacity>
        </View>

        {/* Speed Slider */}
        <Slider
          label="Narration Speed"
          value={ttsState.rate}
          min={0.5}
          max={2.0}
          step={0.1}
          displayFormatter={(v) => `${v.toFixed(1)}x`}
          onChange={(v) => ttsService.setRate(v)}
          style={{ marginTop: 14 } as any}
        />

        {/* Sleep Timer */}
        <Text style={[styles.sectionLabel, { color: colors.textSecondary, marginTop: 16 }] as any}>SLEEP TIMER</Text>
        <View style={styles.timerRow}>
          {sleepTimers.map((st) => {
            const isSelected = ttsState.sleepTimerMinutes === st.minutes;
            return (
              <TouchableOpacity
                key={st.label}
                onPress={() => ttsService.setSleepTimer(st.minutes)}
                style={[
                  styles.timerChip,
                  {
                    backgroundColor: isSelected ? colors.accent : colors.canvas,
                    borderColor: isSelected ? colors.accent : colors.border,
                  },
                ] as any}
              >
                <Text style={[styles.timerChipText, { color: isSelected ? (colors.isDark ? '#000000' : '#FFFFFF') : colors.textPrimary }] as any}>
                  {st.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </Sheet>
  );
};

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  container: {
    paddingBottom: 40,
  },
  progressCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  progressText: {
    fontFamily: FONTS.mona.semiBold,
    fontSize: 13,
  },
  timerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timerText: {
    fontFamily: FONTS.mono.bold,
    fontSize: 12,
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    marginVertical: 10,
  },
  controlBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mainPlayBtn: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  sectionLabel: {
    fontFamily: FONTS.mono.bold,
    fontSize: 11,
    letterSpacing: 1.2,
    marginBottom: 10,
    textTransform: 'uppercase',
  },
  timerRow: {
    flexDirection: 'row',
    gap: 8,
  },
  timerChip: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timerChipText: {
    fontFamily: FONTS.mona.semiBold,
    fontSize: 13,
    letterSpacing: -0.1,
  },
});
