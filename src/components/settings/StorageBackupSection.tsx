import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { useTheme } from '../common/ThemeProvider';
import { ShieldCheck, Download } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { FONTS } from '../../utils/typography';
import { generateBackup, shareBackupFile } from '../../services/backup/backupService';

export function StorageBackupSection() {
  const { colors } = useTheme();
  const [isExporting, setIsExporting] = useState(false);

  const handleExportBackup = async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
      setIsExporting(true);
      const backup = await generateBackup();
      setIsExporting(false);

      const shared = await shareBackupFile(backup.uri);
      if (shared) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      }
    } catch (e: any) {
      setIsExporting(false);
      Alert.alert('Backup Failed', e?.message || 'Failed to generate backup archive');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.sectionTitle, { color: colors.textSecondary, marginTop: 20 }]}>
        DATA PRIVACY & BACKUPS
      </Text>
      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={styles.privacyHeader}>
          <View
            style={[
              styles.privacyIconCircle,
              {
                backgroundColor: colors.isDark ? '#14291E' : '#DCFCE7',
                borderColor: colors.isDark ? '#1F4D36' : '#86EFAC',
              },
            ]}
          >
            <ShieldCheck size={18} color="#16A34A" />
          </View>
          <View style={styles.privacyTextCol}>
            <Text style={[styles.privacyTitle, { color: colors.textPrimary }]}>
              100% Offline & Sovereign
            </Text>
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
  privacyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  privacyIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  privacyTextCol: {
    flex: 1,
  },
  privacyTitle: {
    fontFamily: FONTS.mona.semiBold,
    fontSize: 14,
  },
  privacyDesc: {
    fontFamily: FONTS.mona.regular,
    fontSize: 12,
    lineHeight: 16,
    marginTop: 2,
  },
  exportBackupBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
  },
  exportBackupBtnText: {
    fontFamily: FONTS.mona.bold,
    fontSize: 14,
  },
});
