import React from 'react';
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
import * as Haptics from 'expo-haptics';
import { FONTS } from '../../../utils/typography';
import { ReadingRulerMode, ThemeMode } from '../../../types';
import { THEME_PALETTES } from '../../../utils/theme';

export function FocusTab() {
  const { colors, themeMode, setThemeMode, warmthLevel, setWarmthLevel } = useTheme();

  const {
    readingRulerEnabled,
    readingRulerMode,
    readingRulerHeight,
    readingRulerOpacity,
    setReadingRulerEnabled,
    setReadingRulerMode,
    setReadingRulerHeight,
    setReadingRulerOpacity,
  } = useReaderStore();

  const themeList: { id: ThemeMode; label: string; preview: string; text: string }[] = [
    { id: 'light', label: 'Light', preview: THEME_PALETTES.light.canvas, text: THEME_PALETTES.light.textPrimary },
    { id: 'sepia', label: 'Sepia', preview: THEME_PALETTES.sepia.canvas, text: THEME_PALETTES.sepia.textPrimary },
    { id: 'dark', label: 'Dark', preview: THEME_PALETTES.dark.canvas, text: THEME_PALETTES.dark.textPrimary },
    { id: 'oled', label: 'OLED Black', preview: THEME_PALETTES.oled.canvas, text: THEME_PALETTES.oled.textPrimary },
    { id: 'forest', label: 'Forest', preview: THEME_PALETTES.forest.canvas, text: THEME_PALETTES.forest.textPrimary },
    { id: 'slate', label: 'Slate', preview: THEME_PALETTES.slate.canvas, text: THEME_PALETTES.slate.textPrimary },
    { id: 'solarizedDark', label: 'Solarized Dark', preview: THEME_PALETTES.solarizedDark.canvas, text: THEME_PALETTES.solarizedDark.textPrimary },
    { id: 'solarizedLight', label: 'Solarized Light', preview: THEME_PALETTES.solarizedLight.canvas, text: THEME_PALETTES.solarizedLight.textPrimary },
    { id: 'rosePine', label: 'Rosé Pine', preview: THEME_PALETTES.rosePine.canvas, text: THEME_PALETTES.rosePine.textPrimary },
    { id: 'nord', label: 'Nord', preview: THEME_PALETTES.nord.canvas, text: THEME_PALETTES.nord.textPrimary },
    { id: 'parchment', label: 'Parchment', preview: THEME_PALETTES.parchment.canvas, text: THEME_PALETTES.parchment.textPrimary },
    { id: 'amberGlow', label: 'Amber Glow', preview: THEME_PALETTES.amberGlow.canvas, text: THEME_PALETTES.amberGlow.textPrimary },
  ];

  return (
    <View>
      {/* Reading Ruler Focus Tool */}
      <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>READING RULER (FOCUS TOOL)</Text>
      <View style={[styles.toggleBox, { backgroundColor: colors.canvas, borderColor: colors.border }]}>
        <View style={styles.toggleRow}>
          <View style={styles.toggleTextCol}>
            <Text style={[styles.toggleTitle, { color: colors.textPrimary }]}>Enable Focus Guide</Text>
            <Text style={[styles.toggleSub, { color: colors.textSecondary }]}>
              Interactive draggable line guide following reading position
            </Text>
          </View>
          <Switch
            value={readingRulerEnabled}
            onValueChange={(val) => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
              setReadingRulerEnabled(val);
            }}
            trackColor={{ false: colors.border, true: colors.accent }}
            thumbColor="#FFFFFF"
          />
        </View>
      </View>

      {readingRulerEnabled && (
        <View style={{ marginTop: 12 }}>
          <Text style={[styles.sectionLabel, { color: colors.textSecondary, fontSize: 11 }]}>
            GUIDE STYLE
          </Text>
          <View style={styles.rulerModeGrid}>
            {(
              [
                { id: 'underline' as ReadingRulerMode, label: 'Underline' },
                { id: 'highlight' as ReadingRulerMode, label: 'Highlight Strip' },
                { id: 'dimBackground' as ReadingRulerMode, label: 'Dim Mask' },
                { id: 'dualGuide' as ReadingRulerMode, label: 'Dual Guide' },
                { id: 'focusBox' as ReadingRulerMode, label: 'Focus Box' },
                { id: 'laser' as ReadingRulerMode, label: 'Laser Line' },
              ] as const
            ).map((m) => {
              const isSel = readingRulerMode === m.id;
              return (
                <TouchableOpacity
                  key={m.id}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
                    setReadingRulerMode(m.id);
                  }}
                  style={[
                    styles.rulerModePill,
                    {
                      backgroundColor: isSel ? colors.accent : colors.canvas,
                      borderColor: isSel ? colors.accent : colors.border,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.rulerModeText,
                      { color: isSel ? (colors.isDark ? '#000000' : '#FFFFFF') : colors.textPrimary },
                    ]}
                  >
                    {m.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <Slider
            label="Ruler Aperture Height"
            value={readingRulerHeight}
            min={24}
            max={64}
            step={4}
            unit="px"
            onChange={setReadingRulerHeight}
          />

          <Slider
            label="Ruler Intensity & Opacity"
            value={readingRulerOpacity}
            min={0.2}
            max={0.9}
            step={0.05}
            displayFormatter={(v) => `${Math.round(v * 100)}%`}
            onChange={setReadingRulerOpacity}
          />
        </View>
      )}

      {/* 12 Curated Themes */}
      <Text style={[styles.sectionLabel, { color: colors.textSecondary, marginTop: 20 }]}>
        12 CURATED PALETTES
      </Text>
      <View style={styles.themeGrid}>
        {themeList.map((t) => {
          const isActive = themeMode === t.id;
          return (
            <TouchableOpacity
              key={t.id}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
                setThemeMode(t.id);
              }}
              style={[
                styles.themeCard,
                {
                  backgroundColor: t.preview,
                  borderColor: isActive ? colors.accent : colors.border,
                  borderWidth: isActive ? 2 : 1,
                },
              ]}
            >
              <View style={styles.themeCardTop}>
                <View style={[styles.themeDot, { backgroundColor: t.text }]} />
                {isActive && (
                  <View style={[styles.activeDot, { backgroundColor: colors.accent }]} />
                )}
              </View>
              <Text style={[styles.themeCardLabel, { color: t.text }]}>{t.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Blue Light Filter */}
      <Text style={[styles.sectionLabel, { color: colors.textSecondary, marginTop: 18 }]}>
        BLUE LIGHT FILTER (0-95%)
      </Text>
      <Slider
        label="Night Amber Temperature"
        value={warmthLevel}
        min={0.0}
        max={1.0}
        step={0.05}
        displayFormatter={(v) => (v === 0 ? 'Off (Natural)' : `${Math.round(v * 95)}% Amber Filter`)}
        onChange={setWarmthLevel}
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
  toggleBox: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    marginBottom: 12,
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
    fontSize: 13.5,
    marginBottom: 2,
  },
  toggleSub: {
    fontFamily: FONTS.mona.regular,
    fontSize: 11.5,
  },
  rulerModeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 12,
  },
  rulerModePill: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
  },
  rulerModeText: {
    fontFamily: FONTS.mona.semiBold,
    fontSize: 11.5,
  },
  themeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  themeCard: {
    width: '31%',
    padding: 10,
    borderRadius: 12,
    minHeight: 62,
    justifyContent: 'space-between',
  },
  themeCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  themeDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  activeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  themeCardLabel: {
    fontFamily: FONTS.mona.bold,
    fontSize: 11,
    marginTop: 6,
  },
});
