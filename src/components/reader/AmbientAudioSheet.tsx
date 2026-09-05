import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Platform,
} from 'react-native';
import { Sheet } from '../common/Sheet';
import { Slider } from '../common/Slider';
import { useTheme } from '../common/ThemeProvider';
import {
  ambientAudioService,
  AMBIENT_TRACKS,
  AMBIENT_PRESETS,
} from '../../services/audio/ambientAudioService';
import { AmbientAudioState, AmbientSoundId } from '../../types/ambient';
import { FONTS } from '../../utils/typography';
import * as Haptics from 'expo-haptics';
import {
  CloudRain,
  Flame,
  CloudLightning,
  Waves,
  Headphones,
  Activity,
  Play,
  Pause,
  Clock,
  Sparkles,
} from 'lucide-react-native';
import { WebView } from 'react-native-webview';

export interface AmbientAudioSheetProps {
  visible: boolean;
  onClose: () => void;
}

export const AmbientAudioSheet: React.FC<AmbientAudioSheetProps> = ({
  visible,
  onClose,
}) => {
  const { colors } = useTheme();
  const [audioState, setAudioState] = useState<AmbientAudioState>(
    ambientAudioService.getState()
  );
  const webViewRef = useRef<any>(null);

  useEffect(() => {
    const unsub = ambientAudioService.subscribe((state) => {
      setAudioState(state);
    });
    return unsub;
  }, []);

  useEffect(() => {
    if (webViewRef.current) {
      ambientAudioService.registerWebView(webViewRef.current);
    }
  }, [webViewRef.current]);

  const getTrackIcon = (id: AmbientSoundId, isActive: boolean) => {
    const iconColor = isActive ? colors.accent : colors.textSecondary;
    switch (id) {
      case 'rain':
        return <CloudRain size={20} color={iconColor} />;
      case 'hearth':
        return <Flame size={20} color={iconColor} />;
      case 'storm':
        return <CloudLightning size={20} color={iconColor} />;
      case 'stream':
        return <Waves size={20} color={iconColor} />;
      case 'brown_noise':
        return <Headphones size={20} color={iconColor} />;
      case 'pink_noise':
        return <Activity size={20} color={iconColor} />;
      default:
        return <Sparkles size={20} color={iconColor} />;
    }
  };

  const sleepTimers = [
    { label: 'Off', minutes: null },
    { label: '15m', minutes: 15 },
    { label: '30m', minutes: 30 },
    { label: '45m', minutes: 45 },
    { label: '60m', minutes: 60 },
  ];

  const activeTrackCount = Object.keys(audioState.activeTracks).length;

  return (
    <Sheet visible={visible} onClose={onClose} title="Focus Soundscapes">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Hidden Procedural Web Audio Engine */}
        <View style={styles.hiddenBridge} pointerEvents="none">
          <WebView
            ref={(ref) => {
              webViewRef.current = ref;
              if (ref) ambientAudioService.registerWebView(ref);
            }}
            originWhitelist={['*']}
            source={{ html: ambientAudioService.getSynthHtml() }}
            javaScriptEnabled={true}
            mediaPlaybackRequiresUserAction={false}
            allowsInlineMediaPlayback={true}
          />
        </View>

        {/* Master Playback & Volume Control Card */}
        <View style={[styles.masterCard, { backgroundColor: colors.canvas, borderColor: colors.border }]}>
          <View style={styles.masterHeader}>
            <View style={styles.masterInfoCol}>
              <Text style={[styles.masterTitle, { color: colors.textPrimary }]}>
                {audioState.isPlaying ? 'Soundscapes Active' : 'Soundscapes Paused'}
              </Text>
              <Text style={[styles.masterSubtitle, { color: colors.textSecondary }]}>
                {activeTrackCount === 0
                  ? 'Tap a soundscape below to begin'
                  : `${activeTrackCount} soundscape${activeTrackCount > 1 ? 's' : ''} mixing`}
              </Text>
            </View>

            <TouchableOpacity
              onPress={() => {
                try {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                } catch {}
                ambientAudioService.togglePlay();
              }}
              style={[
                styles.masterPlayBtn,
                {
                  backgroundColor: colors.accent,
                },
              ]}
              accessible={true}
              accessibilityLabel={audioState.isPlaying ? 'Pause soundscapes' : 'Play soundscapes'}
            >
              {audioState.isPlaying ? (
                <Pause size={22} color={colors.isDark ? '#000000' : '#FFFFFF'} />
              ) : (
                <Play size={22} color={colors.isDark ? '#000000' : '#FFFFFF'} style={{ marginLeft: 2 }} />
              )}
            </TouchableOpacity>
          </View>

          {/* Master Volume Slider */}
          <View style={[styles.masterSliderWrap, { borderTopColor: colors.border }]}>
            <Slider
              label="Master Volume"
              value={audioState.masterVolume}
              min={0.0}
              max={1.0}
              step={0.05}
              displayFormatter={(v) => `${Math.round(v * 100)}%`}
              onChange={(val) => ambientAudioService.setMasterVolume(val)}
            />
          </View>
        </View>

        {/* Curated Atmosphere Presets */}
        <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>
          CURATED ATMOSPHERES
        </Text>
        <View style={styles.presetsRow}>
          {AMBIENT_PRESETS.map((preset) => (
            <TouchableOpacity
              key={preset.id}
              onPress={() => {
                try {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                } catch {}
                ambientAudioService.applyPreset(preset);
              }}
              style={[
                styles.presetPill,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                },
              ]}
            >
              <Sparkles size={12} color={colors.accent} style={{ marginRight: 5 }} />
              <Text style={[styles.presetText, { color: colors.textPrimary }]}>
                {preset.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Ambient Tracks Soundboard */}
        <Text style={[styles.sectionLabel, { color: colors.textSecondary, marginTop: 18 }]}>
          INDIVIDUAL SOUNDSCAPES
        </Text>
        <View style={styles.tracksGrid}>
          {AMBIENT_TRACKS.map((track) => {
            const isActive = audioState.activeTracks[track.id] !== undefined;
            const currentVolume = audioState.activeTracks[track.id] ?? track.volume;

            return (
              <View
                key={track.id}
                style={[
                  styles.trackCard,
                  {
                    backgroundColor: colors.surface,
                    borderColor: isActive ? colors.accent : colors.border,
                  },
                ]}
              >
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => {
                    try {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    } catch {}
                    ambientAudioService.toggleTrack(track.id);
                  }}
                  style={styles.trackHeader}
                >
                  <View style={[styles.iconCircle, { backgroundColor: colors.canvas, borderColor: colors.border }]}>
                    {getTrackIcon(track.id, isActive)}
                  </View>
                  <View style={styles.trackInfo}>
                    <Text
                      style={[
                        styles.trackName,
                        {
                          color: isActive ? colors.accent : colors.textPrimary,
                          fontFamily: isActive ? FONTS.mona.bold : FONTS.mona.semiBold,
                        },
                      ]}
                    >
                      {track.name}
                    </Text>
                    <Text style={[styles.trackDesc, { color: colors.textSecondary }]} numberOfLines={1}>
                      {track.description}
                    </Text>
                  </View>
                </TouchableOpacity>

                {/* Track Volume Slider (Visible when active) */}
                {isActive && (
                  <View style={[styles.trackSliderWrap, { borderTopColor: colors.border }]}>
                    <Slider
                      label="Layer Volume"
                      value={currentVolume}
                      min={0.0}
                      max={1.0}
                      step={0.05}
                      displayFormatter={(v) => `${Math.round(v * 100)}%`}
                      onChange={(v) => ambientAudioService.setTrackVolume(track.id, v)}
                    />
                  </View>
                )}
              </View>
            );
          })}
        </View>

        {/* Sleep Timer Section */}
        <Text style={[styles.sectionLabel, { color: colors.textSecondary, marginTop: 18 }]}>
          SLEEP TIMER
        </Text>
        <View style={styles.sleepTimersRow}>
          {sleepTimers.map((t) => {
            const isSelected = audioState.sleepTimerMinutes === t.minutes;
            return (
              <TouchableOpacity
                key={t.label}
                onPress={() => {
                  try {
                    Haptics.selectionAsync();
                  } catch {}
                  ambientAudioService.setSleepTimer(t.minutes);
                }}
                style={[
                  styles.sleepTimerPill,
                  {
                    backgroundColor: isSelected ? colors.accent : colors.surface,
                    borderColor: isSelected ? colors.accent : colors.border,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.sleepTimerText,
                    {
                      color: isSelected
                        ? colors.isDark
                          ? '#000000'
                          : '#FFFFFF'
                        : colors.textPrimary,
                    },
                  ]}
                >
                  {t.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Live Timer Countdown Badge */}
        {audioState.sleepTimerRemainingSeconds !== null && (
          <View style={[styles.timerBadge, { backgroundColor: colors.canvas, borderColor: colors.border }]}>
            <Clock size={13} color={colors.accent} style={{ marginRight: 6 }} />
            <Text style={[styles.timerBadgeText, { color: colors.accent }]}>
              Fade-out in {Math.floor(audioState.sleepTimerRemainingSeconds / 60)}m{' '}
              {audioState.sleepTimerRemainingSeconds % 60}s
            </Text>
          </View>
        )}
      </ScrollView>
    </Sheet>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: 24,
  },
  hiddenBridge: {
    width: 1,
    height: 1,
    opacity: 0.01,
    position: 'absolute',
    top: -9999,
  },
  masterCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 16,
  },
  masterHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  masterInfoCol: {
    flex: 1,
    paddingRight: 12,
  },
  masterTitle: {
    fontFamily: FONTS.mona.bold,
    fontSize: 15,
  },
  masterSubtitle: {
    fontFamily: FONTS.mona.regular,
    fontSize: 12,
    marginTop: 2,
  },
  masterPlayBtn: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
  },
  masterSliderWrap: {
    borderTopWidth: 1,
    marginTop: 14,
    paddingTop: 12,
  },
  sectionLabel: {
    fontFamily: FONTS.mono.bold,
    fontSize: 11,
    letterSpacing: 0.8,
    marginBottom: 10,
  },
  presetsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 6,
  },
  presetPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 16,
    borderWidth: 1,
  },
  presetText: {
    fontFamily: FONTS.mona.medium,
    fontSize: 12,
  },
  tracksGrid: {
    gap: 10,
  },
  trackCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 12,
  },
  trackHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  trackInfo: {
    flex: 1,
  },
  trackName: {
    fontSize: 14,
  },
  trackDesc: {
    fontFamily: FONTS.mona.regular,
    fontSize: 11,
    marginTop: 2,
  },
  trackSliderWrap: {
    borderTopWidth: 1,
    marginTop: 10,
    paddingTop: 8,
  },
  sleepTimersRow: {
    flexDirection: 'row',
    gap: 8,
  },
  sleepTimerPill: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
  },
  sleepTimerText: {
    fontFamily: FONTS.mono.bold,
    fontSize: 12,
  },
  timerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 12,
  },
  timerBadgeText: {
    fontFamily: FONTS.mono.medium,
    fontSize: 11,
  },
});
