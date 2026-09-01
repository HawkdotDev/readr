import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Switch,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useTheme } from '../../src/components/common/ThemeProvider';
import {
  getUserSettings,
  updateUserSettings,
  getReadingGoals,
  updateReadingGoals,
} from '../../src/db/queries/settings';
import { UserSettings, ReadingGoal, ThemeMode } from '../../src/types';
import { generateBackup, shareBackupFile } from '../../src/services/backup/backupService';
import { Slider } from '../../src/components/common/Slider';
import {
  Palette,
  Eye,
  Smartphone,
  ShieldCheck,
  Download,
  Globe,
  Sliders,
  Sparkles,
  Info,
  Check,
  Target,
  SunMedium,
  Layers,
  HardDrive,
} from 'lucide-react-native';
import { FONTS } from '../../src/utils/typography';
import * as Haptics from 'expo-haptics';

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
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    if (!settings) return;
    setSettings({ ...settings, keepAwake: val });
    updateUserSettings({ keepAwake: val });
  };

  const handleToggleHaptics = (val: boolean) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    if (!settings) return;
    setSettings({ ...settings, hapticFeedback: val });
    updateUserSettings({ hapticFeedback: val });
  };

  const handleToggleOnlineMetadata = (val: boolean) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
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
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
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

  const themes: { label: string; mode: ThemeMode; colorDot: string }[] = [
    { label: 'System', mode: 'system', colorDot: '#71717A' },
    { label: 'Light', mode: 'light', colorDot: '#FAF7F2' },
    { label: 'Sepia', mode: 'sepia', colorDot: '#F4EFE6' },
    { label: 'Dark', mode: 'dark', colorDot: '#18181B' },
    { label: 'OLED', mode: 'oled', colorDot: '#000000' },
    { label: 'Forest', mode: 'forest', colorDot: '#121E17' },
    { label: 'Slate', mode: 'slate', colorDot: '#0F172A' },
    { label: 'Solarized Dark', mode: 'solarizedDark', colorDot: '#002B36' },
    { label: 'Solarized Light', mode: 'solarizedLight', colorDot: '#FDF6E3' },
    { label: 'Rosé Pine', mode: 'rosePine', colorDot: '#191724' },
    { label: 'Nord', mode: 'nord', colorDot: '#2E3440' },
    { label: 'Parchment', mode: 'parchment', colorDot: '#F5ECD7' },
    { label: 'Amber Glow', mode: 'amberGlow', colorDot: '#1A120B' },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.canvas }]}>
      {/* Top Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Settings</Text>

        <View style={[styles.iconBtn, { borderColor: colors.border, backgroundColor: colors.surface }]}>
          <Sliders size={18} color={colors.accent} />
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Appearance & Color Palette */}
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

        {/* Daily Goals */}
        <Text style={[styles.sectionTitle, { color: colors.textSecondary, marginTop: 24 }]}>
          DAILY HABIT GOALS
        </Text>
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.cardHeaderRow}>
            <View style={styles.cardTitleWithIcon}>
              <Target size={16} color={colors.accent} style={{ marginRight: 6 }} />
              <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>Daily Reading Target</Text>
            </View>
          </View>

          <Slider
            label="Target Minutes"
            value={goals?.targetDailyMinutes || 30}
            min={10}
            max={120}
            step={5}
            unit=" mins/day"
            onChange={handleUpdateTargetMinutes}
          />
        </View>

        {/* Reading Preferences */}
        <Text style={[styles.sectionTitle, { color: colors.textSecondary, marginTop: 24 }]}>
          READING EXPERIENCE
        </Text>
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          {/* Keep Awake */}
          <View style={styles.toggleRow}>
            <View style={styles.toggleIconCol}>
              <View style={[styles.iconPill, { backgroundColor: colors.canvas, borderColor: colors.border }]}>
                <Eye size={15} color={colors.textPrimary} />
              </View>
            </View>
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
              thumbColor={colors.isDark ? '#FFFFFF' : '#FFFFFF'}
            />
          </View>

          {/* Haptic Touch */}
          <View style={[styles.toggleRow, { borderTopWidth: 1, borderTopColor: colors.border, marginTop: 14, paddingTop: 14 }]}>
            <View style={styles.toggleIconCol}>
              <View style={[styles.iconPill, { backgroundColor: colors.canvas, borderColor: colors.border }]}>
                <Smartphone size={15} color={colors.textPrimary} />
              </View>
            </View>
            <View style={styles.toggleTextCol}>
              <Text style={[styles.toggleTitle, { color: colors.textPrimary }]}>Haptic Feedback</Text>
              <Text style={[styles.toggleDesc, { color: colors.textSecondary }]}>
                Tactile feedback on page turns and actions
              </Text>
            </View>
            <Switch
              value={settings?.hapticFeedback ?? true}
              onValueChange={handleToggleHaptics}
              trackColor={{ false: colors.border, true: colors.accent }}
              thumbColor={colors.isDark ? '#FFFFFF' : '#FFFFFF'}
            />
          </View>

          {/* Metadata Search */}
          <View style={[styles.toggleRow, { borderTopWidth: 1, borderTopColor: colors.border, marginTop: 14, paddingTop: 14 }]}>
            <View style={styles.toggleIconCol}>
              <View style={[styles.iconPill, { backgroundColor: colors.canvas, borderColor: colors.border }]}>
                <Globe size={15} color={colors.textPrimary} />
              </View>
            </View>
            <View style={styles.toggleTextCol}>
              <Text style={[styles.toggleTitle, { color: colors.textPrimary }]}>Online Cover & Metadata</Text>
              <Text style={[styles.toggleDesc, { color: colors.textSecondary }]}>
                Auto-enrich book covers via Open Library
              </Text>
            </View>
            <Switch
              value={settings?.onlineMetadataEnabled ?? false}
              onValueChange={handleToggleOnlineMetadata}
              trackColor={{ false: colors.border, true: colors.accent }}
              thumbColor={colors.isDark ? '#FFFFFF' : '#FFFFFF'}
            />
          </View>
        </View>

        {/* Data Ownership & .readr Backup */}
        <Text style={[styles.sectionTitle, { color: colors.textSecondary, marginTop: 24 }]}>
          DATA PRIVACY & BACKUPS
        </Text>
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.privacyHeader}>
            <View style={[styles.privacyIconCircle, { backgroundColor: colors.isDark ? '#14291E' : '#DCFCE7', borderColor: colors.isDark ? '#1F4D36' : '#86EFAC' }]}>
              <ShieldCheck size={18} color="#16A34A" />
            </View>
            <View style={styles.privacyTextCol}>
              <Text style={[styles.privacyTitle, { color: colors.textPrimary }]}>100% Offline & Sovereign</Text>
              <Text style={[styles.privacyDesc, { color: colors.textSecondary }]}>
                Your library, highlights, notes, and reading history remain entirely on your device.
              </Text>
            </View>
          </View>

          <TouchableOpacity
            onPress={handleExportBackup}
            disabled={isExporting}
            style={[styles.exportBackupBtn, { backgroundColor: colors.accent }]}
            accessible={true}
            accessibilityLabel="Export .readr backup file"
          >
            {isExporting ? (
              <ActivityIndicator color={colors.isDark ? '#000000' : '#FFFFFF'} size="small" />
            ) : (
              <>
                <Download
                  size={16}
                  color={colors.isDark ? '#000000' : '#FFFFFF'}
                  style={{ marginRight: 8 }}
                />
                <Text
                  style={[
                    styles.exportBackupBtnText,
                    { color: colors.isDark ? '#000000' : '#FFFFFF' },
                  ]}
                >
                  Create .readr Backup Archive
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* App Footer */}
        <View style={styles.aboutFooter}>
          <Text style={[styles.aboutTitle, { color: colors.textPrimary }]}>Readr v1.1.0-beta</Text>
          <Text style={[styles.aboutSubtitle, { color: colors.textSecondary }]}>
            Expo SDK 57 • SQLite • Drizzle ORM • 100% Local Sovereignty
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

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
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
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
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
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
    fontFamily: FONTS.mona.bold,
    fontSize: 15,
    letterSpacing: -0.2,
  },
  themeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  themePill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
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
    fontSize: 12.5,
    letterSpacing: -0.1,
  },
  sliderDivider: {
    borderTopWidth: 1,
    marginTop: 14,
    paddingTop: 10,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  toggleIconCol: {
    marginRight: 12,
  },
  iconPill: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleTextCol: {
    flex: 1,
    paddingRight: 10,
  },
  toggleTitle: {
    fontFamily: FONTS.mona.bold,
    fontSize: 14.5,
    letterSpacing: -0.2,
  },
  toggleDesc: {
    fontFamily: FONTS.mona.regular,
    fontSize: 12,
    marginTop: 2,
    lineHeight: 16,
  },
  privacyHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  privacyIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  privacyTextCol: {
    flex: 1,
  },
  privacyTitle: {
    fontFamily: FONTS.mona.bold,
    fontSize: 14.5,
    letterSpacing: -0.2,
    marginBottom: 2,
  },
  privacyDesc: {
    fontFamily: FONTS.mona.regular,
    fontSize: 12.5,
    lineHeight: 17,
  },
  exportBackupBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  exportBackupBtnText: {
    fontFamily: FONTS.mona.bold,
    fontSize: 13.5,
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
