import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Sheet } from '../common/Sheet';
import { Slider } from '../common/Slider';
import { useTheme } from '../common/ThemeProvider';
import { ThemeMode } from '../../types';
import { Sun, Moon, Sparkles, Smartphone } from 'lucide-react-native';

export interface ThemeSheetProps {
  visible: boolean;
  onClose: () => void;
}

export const ThemeSheet: React.FC<ThemeSheetProps> = ({ visible, onClose }) => {
  const { themeMode, setThemeMode, warmthLevel, setWarmthLevel, colors } = useTheme();

  const themes: { label: string; mode: ThemeMode; bg: string; text: string; icon: React.ReactNode }[] = [
    { label: 'Crisp White', mode: 'light', bg: '#FFFFFF', text: '#18181B', icon: <Sun size={18} color="#18181B" /> },
    { label: 'Parchment Grey', mode: 'sepia', bg: '#F5F5F0', text: '#262624', icon: <Sparkles size={18} color="#262624" /> },
    { label: 'Charcoal Dusk', mode: 'dark', bg: '#18181B', text: '#FAFAFA', icon: <Moon size={18} color="#FAFAFA" /> },
    { label: 'OLED Pure Black', mode: 'oled', bg: '#000000', text: '#F4F4F5', icon: <Moon size={18} color="#FAFAFA" /> },
  ];

  return (
    <Sheet visible={visible} onClose={onClose} title="Reading Palette & Tone">
      <View style={styles.container}>
        {/* System Theme Option */}
        <TouchableOpacity
          onPress={() => setThemeMode('system')}
          style={[
            styles.systemRow,
            {
              backgroundColor: themeMode === 'system' ? colors.accent : colors.canvas,
              borderColor: themeMode === 'system' ? colors.accent : colors.border,
            },
          ] as any}
        >
          <Smartphone size={18} color={themeMode === 'system' ? (colors.isDark ? '#000000' : '#FFFFFF') : colors.textPrimary} />
          <Text
            style={[
              styles.systemRowText,
              { color: themeMode === 'system' ? (colors.isDark ? '#000000' : '#FFFFFF') : colors.textPrimary },
            ] as any}
          >
            Match System Appearance
          </Text>
        </TouchableOpacity>

        {/* 4 Monochromatic Reading Palettes */}
        <Text style={[styles.sectionLabel, { color: colors.textSecondary, marginTop: 16 }] as any}>MONOCHROMATIC PALETTES</Text>
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
                    borderWidth: isActive ? 2.5 : 1,
                  },
                ] as any}
              >
                <View style={styles.cardHeader}>
                  {t.icon}
                  {isActive && <View style={[styles.activeDot, { backgroundColor: colors.accent }]} />}
                </View>
                <Text style={[styles.cardLabel, { color: t.text }] as any}>{t.label}</Text>
                <Text style={[styles.sampleText, { color: t.text }] as any} numberOfLines={2}>
                  In a quiet sanctuary of letters...
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Dynamic Warmth Slider */}
        <Text style={[styles.sectionLabel, { color: colors.textSecondary, marginTop: 20 }] as any}>
          WARMTH TEMPERATURE
        </Text>
        <Slider
          label="Warmth Overlay"
          value={warmthLevel}
          min={0.0}
          max={1.0}
          step={0.05}
          displayFormatter={(v) => (v === 0 ? 'Off' : `${Math.round(v * 100)}% Warmth`)}
          onChange={setWarmthLevel}
        />
      </View>
    </Sheet>
  );
};

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
    fontSize: 14,
    fontWeight: '600',
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
    marginBottom: 10,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  themeCard: {
    width: '48%',
    borderRadius: 14,
    padding: 12,
    minHeight: 100,
    justifyContent: 'space-between',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  activeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  cardLabel: {
    fontSize: 14,
    fontWeight: '700',
    marginTop: 8,
  },
  sampleText: {
    fontSize: 11,
    opacity: 0.7,
    marginTop: 4,
  },
});
