import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Switch,
} from 'react-native';
import { Slider } from '../../common/Slider';
import { useTheme } from '../../common/ThemeProvider';
import { useReaderStore } from '../../../store/readerStore';
import {
  Sparkles,
  Smartphone,
  ArrowLeftRight,
  ArrowUpDown,
  Columns,
  UserCheck,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { FONTS } from '../../../utils/typography';
import { NavigationMode } from '../../../types';
import { TouchZoneConfigModal } from '../TouchZoneConfigModal';

export interface ExperienceTabProps {
  onClose?: () => void;
}

export function ExperienceTab({ onClose }: ExperienceTabProps) {
  const { colors } = useTheme();
  const [showTouchZoneModal, setShowTouchZoneModal] = useState(false);

  const {
    readingDirection,
    pageTurnStyle,
    navigationMode,
    volumeKeysTurnPages,
    dualPageMode,
    readingEngine,
    pageTransition,
    edgeBrightnessEnabled,
    shakeToSpeechEnabled,
    tiltToTurnEnabled,
    tiltSensitivity,
    bionicReadingEnabled,
    bionicFixation,
    isAutoScrolling,
    autoScrollMode,
    autoScrollSpeed,
    showSpeedometer,
    setReadingDirection,
    setPageTurnStyle,
    setPageTransition,
    setNavigationMode,
    setVolumeKeysTurnPages,
    setDualPageMode,
    setReadingEngine,
    setEdgeBrightnessEnabled,
    setShakeToSpeechEnabled,
    setTiltToTurnEnabled,
    setTiltSensitivity,
    setBionicReadingEnabled,
    setBionicFixation,
    setAutoScrolling,
    setAutoScrollMode,
    setAutoScrollSpeed,
    setShowSpeedometer,
  } = useReaderStore();

  return (
    <View>
      {/* Reading Engine Architecture */}
      <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>READING ENGINE ARCHITECTURE</Text>
      <View style={styles.directionGrid}>
        <TouchableOpacity
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
            setReadingEngine('modern');
          }}
          style={[
            styles.directionCard,
            {
              backgroundColor: readingEngine === 'modern' ? colors.accent : colors.canvas,
              borderColor: readingEngine === 'modern' ? colors.accent : colors.border,
            },
          ]}
        >
          <Sparkles
            size={20}
            color={readingEngine === 'modern' ? (colors.isDark ? '#000000' : '#FFFFFF') : colors.textPrimary}
            style={{ marginBottom: 6 }}
          />
          <Text
            style={[
              styles.directionCardTitle,
              {
                color: readingEngine === 'modern' ? (colors.isDark ? '#000000' : '#FFFFFF') : colors.textPrimary,
              },
            ]}
          >
            Bleeding Edge
          </Text>
          <Text
            style={[
              styles.directionCardSub,
              {
                color: readingEngine === 'modern' ? (colors.isDark ? '#1F2937' : '#E5E7EB') : colors.textSecondary,
              },
            ]}
          >
            Foliate engine, exact paging & CFIs
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
            setReadingEngine('native');
          }}
          style={[
            styles.directionCard,
            {
              backgroundColor: readingEngine === 'native' ? colors.accent : colors.canvas,
              borderColor: readingEngine === 'native' ? colors.accent : colors.border,
            },
          ]}
        >
          <Smartphone
            size={20}
            color={readingEngine === 'native' ? (colors.isDark ? '#000000' : '#FFFFFF') : colors.textPrimary}
            style={{ marginBottom: 6 }}
          />
          <Text
            style={[
              styles.directionCardTitle,
              {
                color: readingEngine === 'native' ? (colors.isDark ? '#000000' : '#FFFFFF') : colors.textPrimary,
              },
            ]}
          >
            Classic Native
          </Text>
          <Text
            style={[
              styles.directionCardSub,
              {
                color: readingEngine === 'native' ? (colors.isDark ? '#1F2937' : '#E5E7EB') : colors.textSecondary,
              },
            ]}
          >
            Lightweight Hermes text layout
          </Text>
        </TouchableOpacity>
      </View>

      {/* Page Flow & Direction */}
      <Text style={[styles.sectionLabel, { color: colors.textSecondary, marginTop: 18 }]}>PAGE FLOW & DIRECTION</Text>
      <View style={styles.directionGrid}>
        <TouchableOpacity
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
            setReadingDirection('horizontal');
          }}
          style={[
            styles.directionCard,
            {
              backgroundColor: readingDirection === 'horizontal' ? colors.accent : colors.canvas,
              borderColor: readingDirection === 'horizontal' ? colors.accent : colors.border,
            },
          ]}
        >
          <ArrowLeftRight
            size={20}
            color={readingDirection === 'horizontal' ? (colors.isDark ? '#000000' : '#FFFFFF') : colors.textPrimary}
            style={{ marginBottom: 6 }}
          />
          <Text
            style={[
              styles.directionCardTitle,
              {
                color: readingDirection === 'horizontal' ? (colors.isDark ? '#000000' : '#FFFFFF') : colors.textPrimary,
              },
            ]}
          >
            Sideways
          </Text>
          <Text
            style={[
              styles.directionCardSub,
              {
                color: readingDirection === 'horizontal' ? (colors.isDark ? '#1F2937' : '#E5E7EB') : colors.textSecondary,
              },
            ]}
          >
            Horizontal paginated
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
            setReadingDirection('vertical');
          }}
          style={[
            styles.directionCard,
            {
              backgroundColor: readingDirection === 'vertical' ? colors.accent : colors.canvas,
              borderColor: readingDirection === 'vertical' ? colors.accent : colors.border,
            },
          ]}
        >
          <ArrowUpDown
            size={20}
            color={readingDirection === 'vertical' ? (colors.isDark ? '#000000' : '#FFFFFF') : colors.textPrimary}
            style={{ marginBottom: 6 }}
          />
          <Text
            style={[
              styles.directionCardTitle,
              {
                color: readingDirection === 'vertical' ? (colors.isDark ? '#000000' : '#FFFFFF') : colors.textPrimary,
              },
            ]}
          >
            Top to Bottom
          </Text>
          <Text
            style={[
              styles.directionCardSub,
              {
                color: readingDirection === 'vertical' ? (colors.isDark ? '#1F2937' : '#E5E7EB') : colors.textSecondary,
              },
            ]}
          >
            Continuous scroll
          </Text>
        </TouchableOpacity>
      </View>

      {/* Page Turn Method */}
      <Text style={[styles.sectionLabel, { color: colors.textSecondary, marginTop: 18 }]}>
        PAGE TURN INTERACTION
      </Text>
      <View style={styles.navModeGrid}>
        {(
          [
            { id: 'tap' as NavigationMode, label: 'Tap Edges', sub: 'Left / Right edge tap' },
            { id: 'swipe' as NavigationMode, label: 'Swipe Gestures', sub: 'Drag to flip' },
            { id: 'buttons' as NavigationMode, label: 'Screen Buttons', sub: 'Next / Prev buttons' },
            { id: 'both' as NavigationMode, label: 'Tap & Swipe', sub: 'Flexible hybrid' },
          ] as const
        ).map((item) => {
          const isSel = navigationMode === item.id;
          return (
            <TouchableOpacity
              key={item.id}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
                setNavigationMode(item.id);
              }}
              style={[
                styles.navModeCard,
                {
                  backgroundColor: isSel ? colors.accent : colors.canvas,
                  borderColor: isSel ? colors.accent : colors.border,
                },
              ]}
            >
              <Text
                style={[
                  styles.navModeTitle,
                  {
                    color: isSel ? (colors.isDark ? '#000000' : '#FFFFFF') : colors.textPrimary,
                  },
                ]}
              >
                {item.label}
              </Text>
              <Text
                style={[
                  styles.navModeSub,
                  {
                    color: isSel ? (colors.isDark ? '#1F2937' : '#E5E7EB') : colors.textSecondary,
                  },
                ]}
              >
                {item.sub}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Dual Page Mode */}
      <Text style={[styles.sectionLabel, { color: colors.textSecondary, marginTop: 18 }]}>
        DUAL-PAGE SPREAD
      </Text>
      <View style={styles.alignRow}>
        <TouchableOpacity
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
            setDualPageMode('auto');
          }}
          style={[
            styles.alignBtn,
            {
              backgroundColor: dualPageMode === 'auto' ? colors.accent : colors.canvas,
              borderColor: dualPageMode === 'auto' ? colors.accent : colors.border,
            },
          ]}
        >
          <Columns size={16} color={dualPageMode === 'auto' ? (colors.isDark ? '#000000' : '#FFFFFF') : colors.textPrimary} />
          <Text style={[styles.alignBtnText, { color: dualPageMode === 'auto' ? (colors.isDark ? '#000000' : '#FFFFFF') : colors.textPrimary }]}>
            Auto (Landscape)
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
            setDualPageMode(dualPageMode === true ? false : true);
          }}
          style={[
            styles.alignBtn,
            {
              backgroundColor: dualPageMode === true ? colors.accent : colors.canvas,
              borderColor: dualPageMode === true ? colors.accent : colors.border,
            },
          ]}
        >
          <Text style={[styles.alignBtnText, { color: dualPageMode === true ? (colors.isDark ? '#000000' : '#FFFFFF') : colors.textPrimary }]}>
            {dualPageMode === true ? 'Always 2-Column' : 'Single Column'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Page Turn Style Animation */}
      <Text style={[styles.sectionLabel, { color: colors.textSecondary, marginTop: 18 }]}>
        PAGE TRANSITION DYNAMICS
      </Text>
      <View style={styles.animRow}>
        {(
          [
            { id: 'slide' as const, label: 'Slide' },
            { id: 'curl' as const, label: '3D Curl' },
            { id: 'cover' as const, label: 'Cover' },
            { id: 'fade' as const, label: 'Fade' },
            { id: 'scroll' as const, label: 'Scroll' },
            { id: 'none' as const, label: 'Instant' },
          ]
        ).map((anim) => {
          const isSel = pageTransition === anim.id || pageTurnStyle === anim.id;
          return (
            <TouchableOpacity
              key={anim.id}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
                setPageTransition(anim.id);
                if (anim.id === 'slide' || anim.id === 'curl' || anim.id === 'fade' || anim.id === 'none') {
                  setPageTurnStyle(anim.id);
                }
              }}
              style={[
                styles.animPill,
                {
                  backgroundColor: isSel ? colors.accent : colors.canvas,
                  borderColor: isSel ? colors.accent : colors.border,
                },
              ]}
            >
              <Text
                style={[
                  styles.animPillText,
                  {
                    color: isSel ? (colors.isDark ? '#000000' : '#FFFFFF') : colors.textPrimary,
                  },
                ]}
              >
                {anim.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Bionic Speed Reading Engine */}
      <Text style={[styles.sectionLabel, { color: colors.textSecondary, marginTop: 18 }]}>
        BIONIC SPEED READING
      </Text>
      <View style={[styles.toggleBox, { backgroundColor: colors.canvas, borderColor: colors.border }]}>
        <View style={styles.toggleRow}>
          <View style={styles.toggleTextCol}>
            <Text style={[styles.toggleTitle, { color: colors.textPrimary }]}>Bionic Reading Mode</Text>
            <Text style={[styles.toggleSub, { color: colors.textSecondary }]}>
              Bolds initial word stems to guide eye fixations and speed up comprehension
            </Text>
          </View>
          <Switch
            value={bionicReadingEnabled}
            onValueChange={(val) => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
              setBionicReadingEnabled(val);
            }}
            trackColor={{ false: colors.border, true: colors.accent }}
            thumbColor="#FFFFFF"
          />
        </View>

        {bionicReadingEnabled && (
          <View style={{ marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: colors.border }}>
            <Text style={[styles.drawerTitle, { color: colors.textSecondary, marginBottom: 8 }]}>FIXATION INTENSITY</Text>
            <View style={{ flexDirection: 'row', gap: 6 }}>
              {(
                [
                  { id: 'low' as const, label: 'Low (35%)' },
                  { id: 'medium' as const, label: 'Medium (50%)' },
                  { id: 'high' as const, label: 'High (65%)' },
                ]
              ).map((lvl) => {
                const isSel = bionicFixation === lvl.id;
                return (
                  <TouchableOpacity
                    key={lvl.id}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
                      setBionicFixation(lvl.id);
                    }}
                    style={[
                      styles.modePill,
                      {
                        backgroundColor: isSel ? colors.accent : colors.surface,
                        borderColor: isSel ? colors.accent : colors.border,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.modePillText,
                        { color: isSel ? (colors.isDark ? '#000000' : '#FFFFFF') : colors.textPrimary },
                      ]}
                    >
                      {lvl.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}
      </View>

      {/* Dynamic Auto-Scroll HUD */}
      <Text style={[styles.sectionLabel, { color: colors.textSecondary, marginTop: 18 }]}>
        HANDS-FREE AUTO-SCROLL
      </Text>
      <View style={[styles.toggleBox, { backgroundColor: colors.canvas, borderColor: colors.border }]}>
        <View style={styles.toggleRow}>
          <View style={styles.toggleTextCol}>
            <Text style={[styles.toggleTitle, { color: colors.textPrimary }]}>Auto-Scroll</Text>
            <Text style={[styles.toggleSub, { color: colors.textSecondary }]}>
              Automatically scroll content at steady reading pace
            </Text>
          </View>
          <Switch
            value={isAutoScrolling}
            onValueChange={(val) => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
              setAutoScrolling(val);
            }}
            trackColor={{ false: colors.border, true: colors.accent }}
            thumbColor="#FFFFFF"
          />
        </View>

        <View style={{ marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: colors.border }}>
          <Text style={[styles.drawerTitle, { color: colors.textSecondary, marginBottom: 8 }]}>SCROLL DYNAMICS</Text>
          <View style={{ flexDirection: 'row', gap: 6, marginBottom: 12 }}>
            <TouchableOpacity
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
                setAutoScrollMode('smooth');
              }}
              style={[
                styles.modePill,
                {
                  backgroundColor: autoScrollMode === 'smooth' ? colors.accent : colors.surface,
                  borderColor: autoScrollMode === 'smooth' ? colors.accent : colors.border,
                },
              ]}
            >
              <Text
                style={[
                  styles.modePillText,
                  { color: autoScrollMode === 'smooth' ? (colors.isDark ? '#000000' : '#FFFFFF') : colors.textPrimary },
                ]}
              >
                Smooth Continuous
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
                setAutoScrollMode('pageTimer');
              }}
              style={[
                styles.modePill,
                {
                  backgroundColor: autoScrollMode === 'pageTimer' ? colors.accent : colors.surface,
                  borderColor: autoScrollMode === 'pageTimer' ? colors.accent : colors.border,
                },
              ]}
            >
              <Text
                style={[
                  styles.modePillText,
                  { color: autoScrollMode === 'pageTimer' ? (colors.isDark ? '#000000' : '#FFFFFF') : colors.textPrimary },
                ]}
              >
                Page-by-Page Timer
              </Text>
            </TouchableOpacity>
          </View>

          <Slider
            label="Auto-Scroll Velocity"
            value={autoScrollSpeed}
            min={1}
            max={20}
            step={1}
            displayFormatter={(v) => `${v} px/sec`}
            onChange={setAutoScrollSpeed}
          />
        </View>

        <View style={[styles.toggleRow, { marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: colors.border }]}>
          <View style={styles.toggleTextCol}>
            <Text style={[styles.toggleTitle, { color: colors.textPrimary }]}>Reading Speedometer (WPM)</Text>
            <Text style={[styles.toggleSub, { color: colors.textSecondary }]}>
              Display live Words-Per-Minute gauge and pacing estimate
            </Text>
          </View>
          <Switch
            value={showSpeedometer}
            onValueChange={(val) => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
              setShowSpeedometer(val);
            }}
            trackColor={{ false: colors.border, true: colors.accent }}
            thumbColor="#FFFFFF"
          />
        </View>

        <View style={{ marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: colors.border }}>
          <TouchableOpacity
            onPress={() => {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
              setAutoScrolling(true);
              onClose?.();
            }}
            style={[styles.startAutoScrollBtn, { backgroundColor: colors.accent }]}
          >
            <Text style={[styles.startAutoScrollText, { color: colors.isDark ? '#000000' : '#FFFFFF' }]}>
              ⚡ Start Hands-Free Auto-Scroll HUD
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 9-Zone Touch Action Mapping */}
      <Text style={[styles.sectionLabel, { color: colors.textSecondary, marginTop: 18 }]}>
        TOUCH GESTURES & ZONES
      </Text>
      <View style={[styles.toggleBox, { backgroundColor: colors.canvas, borderColor: colors.border }]}>
        <TouchableOpacity
          onPress={() => {
            Haptics.selectionAsync().catch(() => {});
            setShowTouchZoneModal(true);
          }}
          style={[styles.startAutoScrollBtn, { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1 }]}
        >
          <Text style={[styles.startAutoScrollText, { color: colors.textPrimary }]}>
            🎛️ Customize 9-Zone Touch Grid Actions
          </Text>
        </TouchableOpacity>

        <View style={[styles.toggleRow, { marginTop: 12, paddingTop: 10, borderTopWidth: 1, borderTopColor: colors.border }]}>
          <View style={styles.toggleTextCol}>
            <Text style={[styles.toggleTitle, { color: colors.textPrimary }]}>Edge-Swipe Brightness</Text>
            <Text style={[styles.toggleSub, { color: colors.textSecondary }]}>
              Swipe left edge up/down to adjust screen brightness
            </Text>
          </View>
          <Switch
            value={edgeBrightnessEnabled}
            onValueChange={(val) => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
              setEdgeBrightnessEnabled(val);
            }}
            trackColor={{ false: colors.border, true: colors.accent }}
            thumbColor="#FFFFFF"
          />
        </View>
      </View>

      {/* Hardware & Motion Sensors */}
      <Text style={[styles.sectionLabel, { color: colors.textSecondary, marginTop: 18 }]}>
        HARDWARE & MOTION SENSORS
      </Text>
      <View style={[styles.toggleBox, { backgroundColor: colors.canvas, borderColor: colors.border }]}>
        <View style={styles.toggleRow}>
          <View style={styles.toggleTextCol}>
            <Text style={[styles.toggleTitle, { color: colors.textPrimary }]}>Volume Keys Turn Pages</Text>
            <Text style={[styles.toggleSub, { color: colors.textSecondary }]}>
              Use device volume rocker up/down to flip pages
            </Text>
          </View>
          <Switch
            value={volumeKeysTurnPages}
            onValueChange={(val) => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
              setVolumeKeysTurnPages(val);
            }}
            trackColor={{ false: colors.border, true: colors.accent }}
            thumbColor="#FFFFFF"
          />
        </View>

        <View style={[styles.toggleRow, { marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: colors.border }]}>
          <View style={styles.toggleTextCol}>
            <Text style={[styles.toggleTitle, { color: colors.textPrimary }]}>Shake-to-Speech (TTS)</Text>
            <Text style={[styles.toggleSub, { color: colors.textSecondary }]}>
              Shake device to toggle audio narration playback
            </Text>
          </View>
          <Switch
            value={shakeToSpeechEnabled}
            onValueChange={(val) => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
              setShakeToSpeechEnabled(val);
            }}
            trackColor={{ false: colors.border, true: colors.accent }}
            thumbColor="#FFFFFF"
          />
        </View>

        <View style={[styles.toggleRow, { marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: colors.border }]}>
          <View style={styles.toggleTextCol}>
            <Text style={[styles.toggleTitle, { color: colors.textPrimary }]}>Tilt-to-Turn Pages</Text>
            <Text style={[styles.toggleSub, { color: colors.textSecondary }]}>
              Tilt device sideways to flip to next or previous page
            </Text>
          </View>
          <Switch
            value={tiltToTurnEnabled}
            onValueChange={(val) => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
              setTiltToTurnEnabled(val);
            }}
            trackColor={{ false: colors.border, true: colors.accent }}
            thumbColor="#FFFFFF"
          />
        </View>

        {tiltToTurnEnabled && (
          <View style={{ marginTop: 8 }}>
            <Slider
              label="Tilt Angle Sensitivity"
              value={tiltSensitivity}
              min={15}
              max={45}
              step={5}
              unit="°"
              onChange={setTiltSensitivity}
            />
          </View>
        )}
      </View>

      {/* Dynamic Role Reversal & Name Replacer */}
      <Text style={[styles.sectionLabel, { color: colors.textSecondary, marginTop: 18 }]}>
        CHARACTER MODS & ROLE REVERSAL
      </Text>
      <View style={[styles.toggleBox, { backgroundColor: colors.canvas, borderColor: colors.border }]}>
        <TouchableOpacity
          onPress={() => {
            Haptics.selectionAsync().catch(() => {});
            useReaderStore.getState().setActiveSheet('nameReplacement');
          }}
          style={[
            styles.startAutoScrollBtn,
            { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1 },
          ]}
          accessible={true}
          accessibilityLabel="Open Role Reversal and Name Replacer"
        >
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <UserCheck size={16} color={colors.accent} style={{ marginRight: 6 }} />
            <Text style={[styles.startAutoScrollText, { color: colors.textPrimary }]}>
              Open Character Name Replacer
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* 9-Zone Touch Action Mapping Modal */}
      <TouchZoneConfigModal
        visible={showTouchZoneModal}
        onClose={() => setShowTouchZoneModal(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  sectionLabel: {
    fontFamily: FONTS.mono.bold,
    fontSize: 12,
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  directionGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 8,
  },
  directionCard: {
    flex: 1,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  directionCardTitle: {
    fontFamily: FONTS.mona.bold,
    fontSize: 14,
    marginBottom: 2,
  },
  directionCardSub: {
    fontFamily: FONTS.mona.regular,
    fontSize: 11,
    lineHeight: 14,
  },
  navModeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  navModeCard: {
    width: '48%',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  navModeTitle: {
    fontFamily: FONTS.mona.bold,
    fontSize: 13,
    marginBottom: 2,
  },
  navModeSub: {
    fontFamily: FONTS.mona.regular,
    fontSize: 11,
  },
  alignRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  alignBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
    gap: 8,
  },
  alignBtnText: {
    fontFamily: FONTS.mona.medium,
    fontSize: 14,
  },
  animRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  animPill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  animPillText: {
    fontFamily: FONTS.mona.medium,
    fontSize: 13,
  },
  toggleBox: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    marginBottom: 14,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  toggleTextCol: {
    flex: 1,
    marginRight: 12,
  },
  toggleTitle: {
    fontFamily: FONTS.mona.semiBold,
    fontSize: 14,
    marginBottom: 2,
  },
  toggleSub: {
    fontFamily: FONTS.mona.regular,
    fontSize: 12,
    lineHeight: 16,
  },
  drawerTitle: {
    fontFamily: FONTS.mono.bold,
    fontSize: 11,
    letterSpacing: 0.5,
  },
  modePill: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modePillText: {
    fontFamily: FONTS.mona.medium,
    fontSize: 12,
  },
  startAutoScrollBtn: {
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  startAutoScrollText: {
    fontFamily: FONTS.mona.semiBold,
    fontSize: 13,
  },
});
