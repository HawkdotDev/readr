import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import * as FileSystem from 'expo-file-system/legacy';
import { useTheme } from '../common/ThemeProvider';
import { importBookFromUri, detectFormatFromFilename } from '../../services/storage/fileManager';
import {
  X,
  Folder,
  FileText,
  BookOpen,
  ChevronRight,
  ArrowLeft,
  Check,
  Download,
  FolderOpen,
  HardDrive,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { FONTS } from '../../utils/typography';

export interface FileBrowserModalProps {
  visible: boolean;
  onClose: () => void;
  onImportCompleted?: (count: number) => void;
}

interface FileItem {
  name: string;
  uri: string;
  isDirectory: boolean;
  size?: number;
  isSupportedEbook: boolean;
}

export function FileBrowserModal({
  visible,
  onClose,
  onImportCompleted,
}: FileBrowserModalProps) {
  const { colors } = useTheme();

  const [currentPath, setCurrentPath] = useState<string>('');
  const [items, setItems] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedUris, setSelectedUris] = useState<string[]>([]);
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState<string>('');

  const rootPath = (FileSystem as any).documentDirectory || '';

  useEffect(() => {
    if (visible) {
      setCurrentPath(rootPath);
      loadDirectory(rootPath);
      setSelectedUris([]);
    }
  }, [visible]);

  const loadDirectory = async (dirUri: string) => {
    try {
      setLoading(true);
      const fileNames = await FileSystem.readDirectoryAsync(dirUri);
      const list: FileItem[] = [];

      for (const name of fileNames) {
        const itemUri = `${dirUri}${dirUri.endsWith('/') ? '' : '/'}${name}`;
        try {
          const info = await FileSystem.getInfoAsync(itemUri);
          const isDir = info.isDirectory;
          const isSupported = !isDir && /\.(epub|pdf|txt|md|cbz|mobi|fb2)$/i.test(name);

          list.push({
            name,
            uri: itemUri,
            isDirectory: isDir,
            size: info.exists ? (info as any).size : undefined,
            isSupportedEbook: isSupported,
          });
        } catch {}
      }

      // Sort directories first, then alphabetical
      list.sort((a, b) => {
        if (a.isDirectory && !b.isDirectory) return -1;
        if (!a.isDirectory && b.isDirectory) return 1;
        return a.name.localeCompare(b.name);
      });

      setItems(list);
      setLoading(false);
    } catch (err) {
      setItems([]);
      setLoading(false);
    }
  };

  const handleNavigateFolder = (folderUri: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    setCurrentPath(folderUri);
    loadDirectory(folderUri);
  };

  const handleNavigateUp = () => {
    if (!currentPath || currentPath === rootPath) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    const parts = currentPath.replace(/\/$/, '').split('/');
    parts.pop();
    const parent = parts.join('/') + '/';
    setCurrentPath(parent);
    loadDirectory(parent);
  };

  const handleToggleSelect = (item: FileItem) => {
    if (!item.isSupportedEbook) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    if (selectedUris.includes(item.uri)) {
      setSelectedUris(selectedUris.filter((u) => u !== item.uri));
    } else {
      setSelectedUris([...selectedUris, item.uri]);
    }
  };

  const handleImportSelected = async () => {
    if (selectedUris.length === 0) return;

    setIsImporting(true);
    let successCount = 0;

    for (let i = 0; i < selectedUris.length; i++) {
      const uri = selectedUris[i];
      const filename = uri.split('/').pop() || 'book.epub';
      setImportProgress(`Importing (${i + 1}/${selectedUris.length}): ${filename}`);

      try {
        const res = await importBookFromUri(uri, filename);
        if (res.success) {
          successCount++;
        }
      } catch (err) {
        console.warn('Import error:', err);
      }
    }

    setIsImporting(false);
    setImportProgress('');
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    Alert.alert('Import Complete', `Successfully imported ${successCount} book(s) into your library.`);
    onImportCompleted?.(successCount);
    onClose();
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const canGoUp = Boolean(currentPath && currentPath !== rootPath);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={[styles.container, { backgroundColor: colors.canvas }]}>
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <View style={styles.headerLeft}>
            <FolderOpen size={20} color={colors.accent} style={{ marginRight: 8 }} />
            <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>My Files Storage</Text>
          </View>
          <TouchableOpacity
            onPress={onClose}
            style={[styles.closeBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
          >
            <X size={18} color={colors.textPrimary} />
          </TouchableOpacity>
        </View>

        {/* Directory Breadcrumb */}
        <View style={[styles.breadcrumbRow, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
          <TouchableOpacity
            onPress={handleNavigateUp}
            disabled={!canGoUp}
            style={[styles.backBtn, !canGoUp && { opacity: 0.3 }]}
          >
            <ArrowLeft size={16} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={[styles.pathText, { color: colors.textSecondary }]} numberOfLines={1}>
            {currentPath.replace((FileSystem as any).documentDirectory || '', '📂 Storage / ')}
          </Text>
        </View>

        {/* File / Folder List */}
        {loading ? (
          <View style={styles.centerLoading}>
            <ActivityIndicator size="large" color={colors.accent} />
          </View>
        ) : (
          <ScrollView contentContainerStyle={styles.listContainer}>
            {items.length === 0 ? (
              <View style={styles.emptyView}>
                <HardDrive size={36} color={colors.textSecondary} style={{ marginBottom: 8, opacity: 0.5 }} />
                <Text style={[styles.emptyText, { color: colors.textSecondary }]}>This folder is empty.</Text>
              </View>
            ) : (
              items.map((item) => {
                const isSelected = selectedUris.includes(item.uri);

                if (item.isDirectory) {
                  return (
                    <TouchableOpacity
                      key={item.uri}
                      onPress={() => handleNavigateFolder(item.uri)}
                      style={[styles.itemRow, { borderBottomColor: colors.border }]}
                    >
                      <Folder size={22} color={colors.accent} style={{ marginRight: 12 }} />
                      <Text style={[styles.itemName, { color: colors.textPrimary }]} numberOfLines={1}>
                        {item.name}
                      </Text>
                      <ChevronRight size={18} color={colors.textSecondary} />
                    </TouchableOpacity>
                  );
                }

                return (
                  <TouchableOpacity
                    key={item.uri}
                    onPress={() => handleToggleSelect(item)}
                    style={[
                      styles.itemRow,
                      { borderBottomColor: colors.border },
                      isSelected && { backgroundColor: colors.surface },
                    ]}
                  >
                    <View
                      style={[
                        styles.checkbox,
                        { borderColor: colors.border },
                        isSelected && { backgroundColor: colors.accent, borderColor: colors.accent },
                        !item.isSupportedEbook && { opacity: 0.3 },
                      ]}
                    >
                      {isSelected && <Check size={12} color={colors.isDark ? '#000000' : '#FFFFFF'} />}
                    </View>

                    <View style={styles.fileIconWrapper}>
                      {item.isSupportedEbook ? (
                        <BookOpen size={18} color={colors.accent} />
                      ) : (
                        <FileText size={18} color={colors.textSecondary} />
                      )}
                    </View>

                    <View style={styles.fileDetailsCol}>
                      <Text
                        style={[
                          styles.itemName,
                          { color: item.isSupportedEbook ? colors.textPrimary : colors.textSecondary },
                        ]}
                        numberOfLines={1}
                      >
                        {item.name}
                      </Text>
                      <Text style={[styles.fileMeta, { color: colors.textSecondary }]}>
                        {formatFileSize(item.size)}
                        {item.isSupportedEbook ? ` • ${detectFormatFromFilename(item.name).toUpperCase()}` : ''}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })
            )}
          </ScrollView>
        )}

        {/* Floating Batch Import Bar */}
        {selectedUris.length > 0 && (
          <View style={[styles.bottomActionBar, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
            <View>
              <Text style={[styles.selectedCountText, { color: colors.textPrimary }]}>
                {selectedUris.length} file{selectedUris.length > 1 ? 's' : ''} selected
              </Text>
              {importProgress ? (
                <Text style={[styles.importProgressText, { color: colors.accent }]}>{importProgress}</Text>
              ) : null}
            </View>

            <TouchableOpacity
              onPress={handleImportSelected}
              disabled={isImporting}
              style={[styles.importBtn, { backgroundColor: colors.accent }]}
            >
              {isImporting ? (
                <ActivityIndicator size="small" color={colors.isDark ? '#000000' : '#FFFFFF'} />
              ) : (
                <>
                  <Download size={15} color={colors.isDark ? '#000000' : '#FFFFFF'} style={{ marginRight: 6 }} />
                  <Text style={[styles.importBtnText, { color: colors.isDark ? '#000000' : '#FFFFFF' }]}>
                    Import ({selectedUris.length})
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        )}
      </View>
    </Modal>
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
    paddingTop: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontFamily: FONTS.mona.bold,
    fontSize: 17,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  breadcrumbRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    gap: 8,
  },
  backBtn: {
    padding: 4,
  },
  pathText: {
    fontFamily: FONTS.mono.regular,
    fontSize: 12,
    flex: 1,
  },
  centerLoading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    paddingBottom: 80,
  },
  emptyView: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontFamily: FONTS.mona.medium,
    fontSize: 13,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 0.8,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  fileIconWrapper: {
    marginRight: 10,
  },
  fileDetailsCol: {
    flex: 1,
  },
  itemName: {
    fontFamily: FONTS.mona.medium,
    fontSize: 13.5,
  },
  fileMeta: {
    fontFamily: FONTS.mona.regular,
    fontSize: 11,
    marginTop: 2,
  },
  bottomActionBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderTopWidth: 1,
  },
  selectedCountText: {
    fontFamily: FONTS.mona.bold,
    fontSize: 14,
  },
  importProgressText: {
    fontFamily: FONTS.mona.regular,
    fontSize: 11,
    marginTop: 2,
  },
  importBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 12,
  },
  importBtnText: {
    fontFamily: FONTS.mona.bold,
    fontSize: 13,
  },
});
