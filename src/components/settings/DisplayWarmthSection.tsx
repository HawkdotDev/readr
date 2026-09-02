import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../common/ThemeProvider';
import { Slider } from '../common/Slider';
import { Palette } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { FONTS } from '../../utils/typography';
import { ThemeMode } from '../../types';

export function DisplayWarmthSection() {
  const { colors, themeMode, setThemeMode, warmthLevel, setWarmthLevel } = useTheme();

  const themes: { mode: ThemeMode; label: string; colorDot: string }[] = [
    { mode: 'light', label: 'Light', colorDot: '#FAFAFA' },
    { mode: 'sepia', label: 'Sepia', colorDot: '#F4ECD8' },
    { mode: 'dark', label: 'Dark', colorDot: '#1E1E24' },
    { mode: 'oled', label: 'OLED', colorDot: '#000000' },
    { mode: 'forest', label: 'Forest', colorDot: '#16221A' },
    { mode: 'slate', label: 'Slate', colorDot: '#1E242B' },
  ];

  return (
    <View style={styles.container}>
      <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
        APPEARANCE & THEME
      </Text>
      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={styles.cardHeaderRow}>
          <View style={styles.cardTitleWithIcon}>
            <Palette size={16} color={colors.accent} style={{ marginRight: 6 }} />
            <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>Color Theme</Text>
          </View>
        </View>

        {/* Theme Selector Pills */}
        <View style={styles.themeGrid}>
          {themes.map((t) => {
            const isSelected = themeMode === t.mode;
            return (
              <TouchableOpacity
                key={t.mode}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
                  setThemeMode(t.mode);
                }}
                style={[
                  styles.themePill,
                  {
                    backgroundColor: isSelected ? colors.accent : colors.canvas,
                    borderColor: isSelected ? colors.accent : colors.border,
                  },
                ]}
                accessible={true}
                accessibilityLabel={`Select ${t.label} theme`}
              >
                <View
                  style={[
                    styles.colorDot,
                    {
                      backgroundColor: t.colorDot,
                      borderColor: isSelected ? 'rgba(255,255,255,0.4)' : colors.border,
                    },
                  ]}
                />
                <Text
                  style={[
                    styles.themePillText,
                    {
                      color: isSelected
                        ? colors.isDark
                          ? '#000000'
                          : '#FFFFFF'
                        : colors.textPrimary,
                      fontFamily: isSelected ? FONTS.mona.bold : FONTS.mona.medium,
                    },
                  ]}
                >
                  {t.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Amber Warmth Slider */}
        <View style={[styles.sliderDivider, { borderTopColor: colors.border }]}>
          <Slider
            label="Night Warmth Tint"
            value={warmthLevel}
            min={0.0}
            max={1.0}
            step={0.05}
            displayFormatter={(v) => (v === 0 ? 'Off (6500K)' : `${Math.round(v * 100)}% Warm`)}
            onChange={setWarmthLevel}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 4,
  },
  sectionTitle: {
    fontFamily: FONTS.mono.bold,
    fontSize: 12,
    letterSpacing: 0.8,
    marginBottom: 10,
    textTransform: 'uppercase',
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 18,
    marginBottom: 8,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  cardTitleWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardTitle: {
    fontFamily: FONTS.mona.semiBold,
    fontSize: 15,
  },
  themeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 6,
  },
  themePill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  colorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 1,
    marginRight: 6,
  },
  themePillText: {
    fontSize: 12,
  },
  sliderDivider: {
    borderTopWidth: 1,
    paddingTop: 14,
    marginTop: 8,
  },
});
