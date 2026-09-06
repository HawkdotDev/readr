import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '../../src/components/common/ThemeProvider';
import { generateBackup, shareBackupFile, parseAndValidateBackup, restoreBackup } from '../../src/services/backup/backupService';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import { ArrowLeft, DownloadCloud, UploadCloud, ShieldCheck, CheckCircle2 } from 'lucide-react-native';

export default function BackupWizardScreen() {
  const router = useRouter();
  const { colors } = useTheme();

  const [loading, setLoading] = useState(false);
  const [lastExportedFile, setLastExportedFile] = useState<string | null>(null);

  const handleExport = async () => {
    setLoading(true);
    try {
      const backup = await generateBackup();
      setLastExportedFile(backup.filename);
      await shareBackupFile(backup.uri);
    } catch (err: any) {
      Alert.alert('Export Failed', err?.message || 'Could not generate backup file.');
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
      });

      if (result.canceled || !result.assets || result.assets.length === 0) {
        return;
      }

      setLoading(true);
      const asset = result.assets[0];
      const content = await FileSystem.readAsStringAsync(asset.uri);
      const validated = await parseAndValidateBackup(content);

      if (!validated.valid || !validated.data) {
        Alert.alert('Invalid Backup', validated.error || 'The selected file is not a valid .readr backup.');
        return;
      }

      const backupData = validated.data;
      Alert.alert(
        'Restore Confirmation',
        `This backup contains ${backupData.manifest.stats.totalBooks} books and ${backupData.manifest.stats.totalHighlights} highlights. Would you like to restore this library snapshot? Existing records will be updated.`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Restore',
            onPress: async () => {
              setLoading(true);
              try {
                const restoreRes = await restoreBackup(backupData);
                if (restoreRes.success) {
                  Alert.alert(
                    'Library Restored',
                    `Successfully restored:\n• ${restoreRes.booksRestored} books\n• ${restoreRes.highlightsRestored} highlights\n• ${restoreRes.bookmarksRestored} bookmarks\n• ${restoreRes.collectionsRestored} collections\n• ${restoreRes.sessionsRestored} sessions`,
                    [
                      {
                        text: 'Go to Library',
                        onPress: () => router.replace('/library'),
                      },
                    ]
                  );
                } else {
                  Alert.alert('Restore Failed', restoreRes.error || 'Failed to import backup data.');
                }
              } catch (err: any) {
                Alert.alert('Restore Error', err?.message || 'Unexpected error while restoring backup.');
              } finally {
                setLoading(false);
              }
            },
          },
        ]
      );
    } catch (err: any) {
      Alert.alert('Restore Error', err?.message || 'Failed to read backup file.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.canvas }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={22} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Data Sovereignty & Backups</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Info Banner */}
        <View style={[styles.infoCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <ShieldCheck size={28} color={colors.textPrimary} style={styles.icon} />
          <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>Complete Local Ownership</Text>
          <Text style={[styles.cardDesc, { color: colors.textSecondary }]}>
            Readr stores your books, reading sessions, progress, and highlights in portable `.readr` container files. Transfer your library seamlessly across devices without any cloud dependence.
          </Text>
        </View>

        {/* Action 1: Export */}
        <View style={[styles.actionCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.actionTitle, { color: colors.textPrimary }]}>Export Library Archive</Text>
          <Text style={[styles.actionDesc, { color: colors.textSecondary }]}>
            Create a unified `.readr` backup archive containing your entire local SQLite database, book collections, annotations, and reading stats.
          </Text>

          <TouchableOpacity
            onPress={handleExport}
            disabled={loading}
            style={[styles.btn, { backgroundColor: colors.accent }]}
          >
            {loading ? (
              <ActivityIndicator color={colors.isDark ? '#000000' : '#FFFFFF'} />
            ) : (
              <>
                <DownloadCloud size={18} color={colors.isDark ? '#000000' : '#FFFFFF'} style={{ marginRight: 8 }} />
                <Text style={[styles.btnText, { color: colors.isDark ? '#000000' : '#FFFFFF' }]}>Generate & Share Backup</Text>
              </>
            )}
          </TouchableOpacity>

          {lastExportedFile && (
            <View style={styles.exportedRow}>
              <CheckCircle2 size={16} color={colors.textPrimary} style={{ marginRight: 6 }} />
              <Text style={[styles.exportedText, { color: colors.textPrimary }]}>
                Archive ready: {lastExportedFile}
              </Text>
            </View>
          )}
        </View>

        {/* Action 2: Restore */}
        <View style={[styles.actionCard, { backgroundColor: colors.surface, borderColor: colors.border, marginTop: 16 }]}>
          <Text style={[styles.actionTitle, { color: colors.textPrimary }]}>Restore from Archive</Text>
          <Text style={[styles.actionDesc, { color: colors.textSecondary }]}>
            Import a previously created `.readr` archive to restore your reading progress, bookmarks, and books.
          </Text>

          <TouchableOpacity
            onPress={handleRestore}
            disabled={loading}
            style={[styles.restoreBtn, { borderColor: colors.accent }]}
          >
            <UploadCloud size={18} color={colors.accent} style={{ marginRight: 8 }} />
            <Text style={[styles.restoreBtnText, { color: colors.accent }]}>Select .readr File</Text>
          </TouchableOpacity>
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
    paddingHorizontal: 16,
    paddingTop: 52,
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  backBtn: {
    padding: 6,
  },
  headerTitle: {
    fontFamily: FONTS.mona.bold,
    fontSize: 17,
    letterSpacing: -0.2,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 48,
  },
  infoCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 18,
    alignItems: 'center',
    marginBottom: 20,
  },
  icon: {
    marginBottom: 10,
  },
  cardTitle: {
    fontFamily: FONTS.hubot.bold,
    fontSize: 17,
    marginBottom: 6,
    letterSpacing: -0.2,
  },
  cardDesc: {
    fontFamily: FONTS.mona.regular,
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'center',
  },
  actionCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 18,
  },
  actionTitle: {
    fontFamily: FONTS.mona.bold,
    fontSize: 16,
    marginBottom: 6,
    letterSpacing: -0.2,
  },
  actionDesc: {
    fontFamily: FONTS.mona.regular,
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 16,
  },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
  },
  btnText: {
    color: '#FFFFFF',
    fontFamily: FONTS.mona.semiBold,
    fontSize: 15,
    letterSpacing: -0.1,
  },
  restoreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1.5,
  },
  restoreBtnText: {
    fontFamily: FONTS.mona.semiBold,
    fontSize: 15,
    letterSpacing: -0.1,
  },
  exportedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    justifyContent: 'center',
  },
  exportedText: {
    fontFamily: FONTS.mono.semiBold,
    fontSize: 12,
  },
});
