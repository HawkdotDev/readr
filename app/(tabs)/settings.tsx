import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useTheme } from '../../src/components/common/ThemeProvider';
import {
  getUserSettings,
  updateUserSettings,
  getReadingGoals,
  updateReadingGoals,
} from '../../src/db/queries/settings';
import { UserSettings, ReadingGoal } from '../../src/types';
import { Sliders } from 'lucide-react-native';
import { FONTS } from '../../src/utils/typography';
import * as Haptics from 'expo-haptics';
import {
  DisplayWarmthSection,
  ReadingGoalsSection,
  ReadingExperienceSection,
  GestureControlsSection,
  StorageBackupSection,
} from '../../src/components/settings';

export default function SettingsScreen() {
  const { colors } = useTheme();
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [goals, setGoals] = useState<ReadingGoal | null>(null);

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

  return (
    <View style={[styles.container, { backgroundColor: colors.canvas }]}>
      {/* Screen Header */}
      <View
        style={[
          styles.header,
          {
            borderBottomColor: colors.border,
            backgroundColor: colors.surface,
          },
        ]}
      >
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Settings</Text>
        <View style={[styles.iconBtn, { borderColor: colors.border, backgroundColor: colors.surface }]}>
          <Sliders size={18} color={colors.accent} />
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <DisplayWarmthSection />

        <ReadingGoalsSection
          targetMinutes={goals?.targetDailyMinutes || 30}
          onUpdateTargetMinutes={handleUpdateTargetMinutes}
        />

        <ReadingExperienceSection
          keepAwake={settings?.keepAwake ?? true}
          onToggleKeepAwake={handleToggleKeepAwake}
          hapticFeedback={settings?.hapticFeedback ?? true}
          onToggleHaptics={handleToggleHaptics}
          onlineMetadataEnabled={settings?.onlineMetadataEnabled ?? false}
          onToggleOnlineMetadata={handleToggleOnlineMetadata}
        />

        <GestureControlsSection />

        <StorageBackupSection />

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
    padding: 20,
    paddingBottom: 100,
  },
  aboutFooter: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 24,
  },
  aboutTitle: {
    fontFamily: FONTS.mona.bold,
    fontSize: 14,
    marginBottom: 4,
  },
  aboutSubtitle: {
    fontFamily: FONTS.mona.regular,
    fontSize: 12,
    textAlign: 'center',
  },
});
