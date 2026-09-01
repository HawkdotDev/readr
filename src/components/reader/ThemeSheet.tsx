import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Sheet } from '../common/Sheet';
import { Slider } from '../common/Slider';
import { useTheme } from '../common/ThemeProvider';
import { ThemeMode } from '../../types';
import { Smartphone } from 'lucide-react-native';
import { FONTS } from '../../utils/typography';
import { THEME_PALETTES } from '../../utils/theme';

export interface ThemeSheetProps {
  visible: boolean;
  onClose: () => void;
}

export const ThemeSheet: React.FC<ThemeSheetProps> = ({ visible, onClose }) => {
  const { themeMode, setThemeMode, warmthLevel, setWarmthLevel, colors } = useTheme();

  const themes: { label: string; mode: ThemeMode; bg: string; text: string; subtitle: string }[] = [
    { label: 'Crisp Light', mode: 'light', bg: THEME_PALETTES.light.canvas, text: THEME_PALETTES.light.textPrimary, subtitle: 'Editorial ivory' },
    { label: 'Parchment', mode: 'sepia', bg: THEME_PALETTES.sepia.canvas, text: THEME_PALETTES.sepia.textPrimary, subtitle: 'Warm sepia' },
    { label: 'Charcoal Dark', mode: 'dark', bg: THEME_PALETTES.dark.canvas, text: THEME_PALETTES.dark.textPrimary, subtitle: 'Deep zinc' },
    { label: 'OLED Pure Black', mode: 'oled', bg: THEME_PALETTES.oled.canvas, text: THEME_PALETTES.oled.textPrimary, subtitle: 'True black' },
    { label: 'Forest Green', mode: 'forest', bg: THEME_PALETTES.forest.canvas, text: THEME_PALETTES.forest.textPrimary, subtitle: 'Emerald soothing' },
    { label: 'Slate Oceanic', mode: 'slate', bg: THEME_PALETTES.slate.canvas, text: THEME_PALETTES.slate.textPrimary, subtitle: 'Navy steel' },
    { label: 'Solarized Dark', mode: 'solarizedDark', bg: THEME_PALETTES.solarizedDark.canvas, text: THEME_PALETTES.solarizedDark.textPrimary, subtitle: 'Low-contrast cyan' },
    { label: 'Solarized Light', mode: 'solarizedLight', bg: THEME_PALETTES.solarizedLight.canvas, text: THEME_PALETTES.solarizedLight.textPrimary, subtitle: 'Yellow paper' },
    { label: 'Rosé Pine', mode: 'rosePine', bg: THEME_PALETTES.rosePine.canvas, text: THEME_PALETTES.rosePine.textPrimary, subtitle: 'Muted lilac' },
    { label: 'Nordic Frost', mode: 'nord', bg: THEME_PALETTES.nord.canvas, text: THEME_PALETTES.nord.textPrimary, subtitle: 'Arctic ice' },
    { label: 'Vintage Parchment', mode: 'parchment', bg: THEME_PALETTES.parchment.canvas, text: THEME_PALETTES.parchment.textPrimary, subtitle: 'Antique book' },
    { label: 'Amber Glow', mode: 'amberGlow', bg: THEME_PALETTES.amberGlow.canvas, text: THEME_PALETTES.amberGlow.textPrimary, subtitle: 'Night candle' },
  ];

  return (
    <Sheet visible={visible} onClose={onClose} title="Reading Palette & Tone">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.container}>
        {/* System Theme Option */}
        <TouchableOpacity
          onPress={() => setThemeMode('system')}
          style={[
            styles.systemRow,
            {
              backgroundColor: themeMode === 'system' ? colors.accent : colors.canvas,
              borderColor: themeMode === 'system' ? colors.accent : colors.border,
            },
          ]}
        >
          <Smartphone size={18} color={themeMode === 'system' ? (colors.isDark ? '#000000' : '#FFFFFF') : colors.textPrimary} />
          <Text
            style={[
              styles.systemRowText,
              { color: themeMode === 'system' ? (colors.isDark ? '#000000' : '#FFFFFF') : colors.textPrimary },
            ]}
          >
            Match System Appearance
          </Text>
        </TouchableOpacity>

        {/* 12 Curated Reading Palettes */}
        <Text style={[styles.sectionLabel, { color: colors.textSecondary, marginTop: 16 }]}>
          12 CURATED READING PALETTES
        </Text>
        <View style={styles.grid}>
          {themes.map((t) => {
            const isActive = themeMode === t.mode;
            return (
              <TouchableOpacity
                key={t.mode}
                onPress={() => setThemeMode(t.mode)}
                style={[
                  styles.themeCard,
                  {
                    backgroundColor: t.bg,
                    borderColor: isActive ? colors.accent : colors.border,
                    borderWidth: isActive ? 2 : 1,
                  },
                ]}
              >
                <View style={styles.cardHeader}>
                  <View style={[styles.themeDot, { backgroundColor: t.text }]} />
                  {isActive && <View style={[styles.activeDot, { backgroundColor: colors.accent }]} />}
                </View>
                <View>
                  <Text style={[styles.cardLabel, { color: t.text }]}>{t.label}</Text>
                  <Text style={[styles.sampleText, { color: t.text }]} numberOfLines={1}>
                    {t.subtitle}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Blue Light Filter / Warmth Temperature */}
        <Text style={[styles.sectionLabel, { color: colors.textSecondary, marginTop: 20 }]}>
          BLUE LIGHT FILTER (0-95%)
        </Text>
        <Slider
          label="Night Amber Overlay"
          value={warmthLevel}
          min={0.0}
          max={1.0}
          step={0.05}
          displayFormatter={(v) => (v === 0 ? 'Off (Natural)' : `${Math.round(v * 95)}% Amber Filter`)}
          onChange={setWarmthLevel}
        />
      </ScrollView>
    </Sheet>
  );
};

export default ThemeSheet;

const styles = StyleSheet.create({
  container: {
    paddingBottom: 24,
  },
  systemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  systemRowText: {
    fontFamily: FONTS.mona.semiBold,
    fontSize: 14,
    letterSpacing: -0.1,
  },
  sectionLabel: {
    fontFamily: FONTS.mono.bold,
    fontSize: 11,
    letterSpacing: 1.2,
    marginBottom: 10,
    textTransform: 'uppercase',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  themeCard: {
    width: '48.5%',
    borderRadius: 12,
    padding: 12,
    minHeight: 80,
    justifyContent: 'space-between',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  themeDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  activeDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  cardLabel: {
    fontFamily: FONTS.mona.bold,
    fontSize: 13,
    letterSpacing: -0.2,
  },
  sampleText: {
    fontFamily: FONTS.mona.regular,
    fontSize: 11,
    opacity: 0.65,
    marginTop: 2,
  },
});
