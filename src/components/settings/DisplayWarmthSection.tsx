import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Switch } from 'react-native';
import { useTheme } from '../common/ThemeProvider';
import { Slider } from '../common/Slider';
import { Palette, Moon, Sun, Clock, Sunset } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { FONTS } from '../../utils/typography';
import { ThemeMode } from '../../types';
import { CircadianService } from '../../services/theme/circadianService';

export function DisplayWarmthSection() {
  const {
    colors,
    themeMode,
    setThemeMode,
    warmthLevel,
    setWarmthLevel,
    effectiveWarmth,
    circadianConfig,
    setCircadianConfig,
  } = useTheme();

  const themes: { mode: ThemeMode; label: string; colorDot: string }[] = [
    { mode: 'light', label: 'Light', colorDot: '#FAFAFA' },
    { mode: 'sepia', label: 'Sepia', colorDot: '#F4ECD8' },
    { mode: 'dark', label: 'Dark', colorDot: '#1E1E24' },
    { mode: 'oled', label: 'OLED', colorDot: '#000000' },
    { mode: 'forest', label: 'Forest', colorDot: '#16221A' },
    { mode: 'slate', label: 'Slate', colorDot: '#1E242B' },
  ];

  const isCircadianActive = circadianConfig?.enabled ?? false;

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

        {/* Manual Amber Warmth Slider */}
        <View style={[styles.sliderDivider, { borderTopColor: colors.border }]}>
          <Slider
            label="Base Warmth Tint"
            value={warmthLevel}
            min={0.0}
            max={1.0}
            step={0.05}
            displayFormatter={(v) => (v === 0 ? 'Off (6500K)' : `${Math.round(v * 100)}% Warm`)}
            onChange={setWarmthLevel}
          />
        </View>
      </View>

      {/* Circadian Warmth Scheduler Card */}
      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border, marginTop: 10 }]}>
        <View style={styles.cardHeaderRow}>
          <View style={styles.cardTitleWithIcon}>
            <Sunset size={16} color={colors.accent} style={{ marginRight: 6 }} />
            <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>Circadian Night Warmth</Text>
          </View>
          <Switch
            value={isCircadianActive}
            onValueChange={(val) => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
              setCircadianConfig({
                ...circadianConfig,
                enabled: val,
              });
            }}
            trackColor={{ false: colors.border, true: colors.accent }}
            thumbColor="#FFFFFF"
          />
        </View>

        <Text style={[styles.circadianDesc, { color: colors.textSecondary }]}>
          Automatically shifts the display to warm amber tones at night to preserve natural melatonin and reduce ocular strain.
        </Text>

        {isCircadianActive && (
          <View style={{ marginTop: 12 }}>
            {/* Mode Selector */}
            <View style={styles.modeRow}>
              <TouchableOpacity
                onPress={() => {
                  Haptics.selectionAsync().catch(() => {});
                  setCircadianConfig({ ...circadianConfig, mode: 'solar' });
                }}
                style={[
                  styles.modePill,
                  {
                    backgroundColor: circadianConfig.mode === 'solar' ? colors.accent : colors.canvas,
                    borderColor: circadianConfig.mode === 'solar' ? colors.accent : colors.border,
                  },
                ]}
              >
                <Sun size={13} color={circadianConfig.mode === 'solar' ? (colors.isDark ? '#000' : '#FFF') : colors.textPrimary} style={{ marginRight: 5 }} />
                <Text style={[styles.modePillText, { color: circadianConfig.mode === 'solar' ? (colors.isDark ? '#000' : '#FFF') : colors.textPrimary }]}>
                  Sunset to Sunrise
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  Haptics.selectionAsync().catch(() => {});
                  setCircadianConfig({ ...circadianConfig, mode: 'schedule' });
                }}
                style={[
                  styles.modePill,
                  {
                    backgroundColor: circadianConfig.mode === 'schedule' ? colors.accent : colors.canvas,
                    borderColor: circadianConfig.mode === 'schedule' ? colors.accent : colors.border,
                  },
                ]}
              >
                <Clock size={13} color={circadianConfig.mode === 'schedule' ? (colors.isDark ? '#000' : '#FFF') : colors.textPrimary} style={{ marginRight: 5 }} />
                <Text style={[styles.modePillText, { color: circadianConfig.mode === 'schedule' ? (colors.isDark ? '#000' : '#FFF') : colors.textPrimary }]}>
                  Custom Window
                </Text>
              </TouchableOpacity>
            </View>

            {/* Target Warmth Slider */}
            <View style={{ marginTop: 14 }}>
              <Slider
                label="Target Night Warmth"
                value={circadianConfig.targetWarmth}
                min={0.2}
                max={1.0}
                step={0.05}
                displayFormatter={(v) => `${Math.round(v * 100)}% Amber`}
                onChange={(val) => {
                  setCircadianConfig({ ...circadianConfig, targetWarmth: val });
                }}
              />
            </View>

            {/* Live Status Pill */}
            <View style={[styles.statusPill, { backgroundColor: colors.canvas, borderColor: colors.border }]}>
              <Moon size={13} color={colors.accent} style={{ marginRight: 6 }} />
              <Text style={[styles.statusText, { color: colors.textSecondary }]}>
                {effectiveWarmth > 0.01
                  ? `Active now: applying ${Math.round(effectiveWarmth * 100)}% night warmth`
                  : `Scheduled (${circadianConfig.mode === 'solar' ? 'Sunset ~6 PM' : '9:00 PM'} - 7:00 AM)`}
              </Text>
            </View>
          </View>
        )}
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
  circadianDesc: {
    fontFamily: FONTS.mona.regular,
    fontSize: 12,
    lineHeight: 17,
  },
  modeRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  modePill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
  },
  modePillText: {
    fontFamily: FONTS.mona.medium,
    fontSize: 12,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 12,
  },
  statusText: {
    fontFamily: FONTS.mono.regular,
    fontSize: 11,
  },
});
