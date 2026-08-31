import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Switch, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useTheme } from '../../src/components/common/ThemeProvider';
import { getUserSettings, updateUserSettings, getReadingGoals, updateReadingGoals } from '../../src/db/queries/settings';
import { UserSettings, ReadingGoal, ThemeMode } from '../../src/types';
import { generateBackup, shareBackupFile } from '../../src/services/backup/backupService';
import { Slider } from '../../src/components/common/Slider';
import {
  Palette,
  Type,
  ShieldCheck,
  DownloadCloud,
  Smartphone,
  Sliders,
  Sparkles,
  Info,
  CheckCircle2,
} from 'lucide-react-native';

export default function SettingsScreen() {
  const { colors, themeMode, setThemeMode, warmthLevel, setWarmthLevel } = useTheme();

  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [goals, setGoals] = useState<ReadingGoal | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    getUserSettings().then(setSettings);
    getReadingGoals().then(setGoals);
  }, []);

  const handleToggleKeepAwake = (val: boolean) => {
    if (!settings) return;
    setSettings({ ...settings, keepAwake: val });
    updateUserSettings({ keepAwake: val });
  };

  const handleToggleHaptics = (val: boolean) => {
    if (!settings) return;
    setSettings({ ...settings, hapticFeedback: val });
    updateUserSettings({ hapticFeedback: val });
  };

  const handleToggleOnlineMetadata = (val: boolean) => {
    if (!settings) return;
    setSettings({ ...settings, onlineMetadataEnabled: val });
    updateUserSettings({ onlineMetadataEnabled: val });
  };

  const handleUpdateTargetMinutes = (val: number) => {
    if (!goals) return;
    setGoals({ ...goals, targetDailyMinutes: val });
    updateReadingGoals({ targetDailyMinutes: val });
  };

  const handleExportBackup = async () => {
    try {
      setIsExporting(true);
      const backup = await generateBackup();
      setIsExporting(false);

      const shared = await shareBackupFile(backup.uri);
      if (!shared) {
        Alert.alert('Backup Created', `Saved to device as ${backup.filename}`);
      }
    } catch (err: any) {
      setIsExporting(false);
      Alert.alert('Backup Error', err?.message || 'Failed to create backup.');
    }
  };

  const themes: { label: string; mode: ThemeMode }[] = [
    { label: 'System', mode: 'system' },
    { label: 'Light', mode: 'light' },
    { label: 'Sepia', mode: 'sepia' },
    { label: 'Dark', mode: 'dark' },
    { label: 'OLED', mode: 'oled' },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.canvas }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <View>
          <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Preferences</Text>
          <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
            Configuration & sovereign backups
          </Text>
        </View>
        <Sliders size={26} color={colors.accent} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Appearance Section */}
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>APPEARANCE & THEME</Text>
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.cardLabel, { color: colors.textPrimary }]}>Active Color Theme</Text>
          <View style={styles.themeChipsRow}>
            {themes.map((t) => {
              const isSelected = themeMode === t.mode;
              return (
                <TouchableOpacity
                  key={t.mode}
                  onPress={() => setThemeMode(t.mode)}
                  style={[
                    styles.themeChip,
                    {
                      backgroundColor: isSelected ? colors.accent : colors.canvas,
                      borderColor: isSelected ? colors.accent : colors.border,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.themeChipText,
                      { color: isSelected ? (colors.isDark ? '#000000' : '#FFFFFF') : colors.textPrimary },
                    ]}
                  >
                    {t.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <Slider
            label="Independent Warmth Overlay"
            value={warmthLevel}
            min={0.0}
            max={1.0}
            step={0.05}
            displayFormatter={(v) => (v === 0 ? 'Off (6500K)' : `${Math.round(v * 100)}% Amber`)}
            onChange={setWarmthLevel}
            style={{ marginTop: 16 }}
          />
        </View>

        {/* Daily Goals Section */}
        <Text style={[styles.sectionTitle, { color: colors.textSecondary, marginTop: 24 }]}>
          DAILY READING GOALS
        </Text>
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Slider
            label="Daily Reading Target"
            value={goals?.targetDailyMinutes || 30}
            min={10}
            max={120}
            step={5}
            unit=" mins/day"
            onChange={handleUpdateTargetMinutes}
          />
        </View>

        {/* Reader Behaviors */}
        <Text style={[styles.sectionTitle, { color: colors.textSecondary, marginTop: 24 }]}>
          READING EXPERIENCE
        </Text>
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.toggleRow}>
            <View style={styles.toggleTextCol}>
              <Text style={[styles.toggleTitle, { color: colors.textPrimary }]}>Keep Screen Awake</Text>
              <Text style={[styles.toggleDesc, { color: colors.textSecondary }]}>
                Prevents display sleep during active reading
              </Text>
            </View>
            <Switch
              value={settings?.keepAwake ?? true}
              onValueChange={handleToggleKeepAwake}
              trackColor={{ false: colors.border, true: colors.accent }}
            />
          </View>

          <View style={[styles.toggleRow, { borderTopWidth: 1, borderTopColor: colors.border, marginTop: 12, paddingTop: 12 }]}>
            <View style={styles.toggleTextCol}>
              <Text style={[styles.toggleTitle, { color: colors.textPrimary }]}>Haptic Feedback</Text>
              <Text style={[styles.toggleDesc, { color: colors.textSecondary }]}>
                Tactile pulse on page turns and bookmarks
              </Text>
            </View>
            <Switch
              value={settings?.hapticFeedback ?? true}
              onValueChange={handleToggleHaptics}
              trackColor={{ false: colors.border, true: colors.accent }}
            />
          </View>

          <View style={[styles.toggleRow, { borderTopWidth: 1, borderTopColor: colors.border, marginTop: 12, paddingTop: 12 }]}>
            <View style={styles.toggleTextCol}>
              <Text style={[styles.toggleTitle, { color: colors.textPrimary }]}>Online Book Search</Text>
              <Text style={[styles.toggleDesc, { color: colors.textSecondary }]}>
                Fetch covers and metadata via Open Library
              </Text>
            </View>
            <Switch
              value={settings?.onlineMetadataEnabled ?? false}
              onValueChange={handleToggleOnlineMetadata}
              trackColor={{ false: colors.border, true: colors.accent }}
            />
          </View>
        </View>

        {/* Data Ownership & .readr Backup */}
        <Text style={[styles.sectionTitle, { color: colors.textSecondary, marginTop: 24 }]}>
          LOCAL DATA SOVEREIGNTY (.readr)
        </Text>
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.privacyHeader}>
            <ShieldCheck size={22} color="#16A34A" style={{ marginRight: 8 }} />
            <Text style={[styles.privacyTitle, { color: colors.textPrimary }]}>100% Offline & Private</Text>
          </View>
          <Text style={[styles.privacyDesc, { color: colors.textSecondary }]}>
            Readr does not have cloud databases, telemetric analytics, or tracking servers. Your library and reading logs exist only on this device.
          </Text>

          <TouchableOpacity
            onPress={handleExportBackup}
            disabled={isExporting}
            style={[styles.exportBackupBtn, { backgroundColor: colors.accent }]}
          >
            {isExporting ? (
              <ActivityIndicator color={colors.isDark ? '#000000' : '#FFFFFF'} size="small" />
            ) : (
              <>
                <DownloadCloud size={18} color={colors.isDark ? '#000000' : '#FFFFFF'} style={{ marginRight: 8 }} />
                <Text style={[styles.exportBackupBtnText, { color: colors.isDark ? '#000000' : '#FFFFFF' }]}>Create .readr Backup Archive</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* About Info */}
        <View style={styles.aboutFooter}>
          <Text style={[styles.aboutTitle, { color: colors.textPrimary }]}>Readr v1.0.0</Text>
          <Text style={[styles.aboutSubtitle, { color: colors.textSecondary }]}>
            Built with Expo SDK 57 • SQLite • Drizzle ORM • 100% Local Sovereignty
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

import { FONTS } from '../../src/utils/typography';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 56,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontFamily: FONTS.mona.extraBold,
    fontSize: 28,
    letterSpacing: -0.8,
  },
  headerSubtitle: {
    fontFamily: FONTS.mono.medium,
    fontSize: 12,
    marginTop: 3,
    letterSpacing: 0.2,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 110,
  },
  sectionTitle: {
    fontFamily: FONTS.mono.bold,
    fontSize: 11,
    letterSpacing: 1.2,
    marginBottom: 10,
    textTransform: 'uppercase',
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
  },
  cardLabel: {
    fontFamily: FONTS.mona.bold,
    fontSize: 14,
    marginBottom: 12,
    letterSpacing: -0.2,
  },
  themeChipsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  themeChip: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  themeChipText: {
    fontFamily: FONTS.mona.bold,
    fontSize: 12,
    letterSpacing: -0.1,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  toggleTextCol: {
    flex: 1,
    paddingRight: 12,
  },
  toggleTitle: {
    fontFamily: FONTS.mona.bold,
    fontSize: 15,
    letterSpacing: -0.2,
  },
  toggleDesc: {
    fontFamily: FONTS.mona.regular,
    fontSize: 12,
    marginTop: 2,
  },
  privacyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  privacyTitle: {
    fontFamily: FONTS.mona.bold,
    fontSize: 15,
    letterSpacing: -0.2,
  },
  privacyDesc: {
    fontFamily: FONTS.mona.regular,
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 16,
  },
  exportBackupBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
  },
  exportBackupBtnText: {
    color: '#FFFFFF',
    fontFamily: FONTS.mona.semiBold,
    fontSize: 14,
    letterSpacing: -0.1,
  },
  aboutFooter: {
    marginTop: 32,
    alignItems: 'center',
  },
  aboutTitle: {
    fontFamily: FONTS.hubot.bold,
    fontSize: 14,
    letterSpacing: -0.2,
  },
  aboutSubtitle: {
    fontFamily: FONTS.mono.regular,
    fontSize: 11,
    marginTop: 4,
    textAlign: 'center',
  },
});
