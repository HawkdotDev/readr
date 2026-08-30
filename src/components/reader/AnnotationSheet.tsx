import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, StyleSheet } from 'react-native';
import { Sheet } from '../common/Sheet';
import { useTheme } from '../common/ThemeProvider';
import { Bookmark, Highlight, HighlightColor } from '../../types';
import { getBookmarks, getHighlights, addBookmark, addHighlight, deleteBookmark, deleteHighlight } from '../../db/queries/books';
import { Bookmark as BookmarkIcon, Highlighter, Trash2, Plus, Share2 } from 'lucide-react-native';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system/legacy';

export interface AnnotationSheetProps {
  visible: boolean;
  bookId: string;
  bookTitle: string;
  currentLocationCfi?: string;
  currentChapterTitle?: string;
  onClose: () => void;
}

export const AnnotationSheet: React.FC<AnnotationSheetProps> = ({
  visible,
  bookId,
  bookTitle,
  currentLocationCfi,
  currentChapterTitle,
  onClose,
}) => {
  const { colors } = useTheme();
  const [tab, setTab] = useState<'highlights' | 'bookmarks'>('highlights');
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [highlights, setHighlights] = useState<Highlight[]>([]);

  // New Highlight state
  const [isAddingHighlight, setIsAddingHighlight] = useState(false);
  const [newText, setNewText] = useState('');
  const [newNote, setNewNote] = useState('');
  const [selectedColor, setSelectedColor] = useState<HighlightColor>('charcoal');

  const highlightColors: { name: HighlightColor; hex: string }[] = [
    { name: 'charcoal', hex: '#3F3F46' },
    { name: 'graphite', hex: '#71717A' },
    { name: 'silver', hex: '#A1A1AA' },
    { name: 'platinum', hex: '#D4D4D8' },
    { name: 'smoke', hex: '#E4E4E7' },
  ];

  const reloadData = async () => {
    if (!bookId) return;
    const bms = await getBookmarks(bookId);
    const hls = await getHighlights(bookId);
    setBookmarks(bms);
    setHighlights(hls);
  };

  useEffect(() => {
    if (visible && bookId) {
      reloadData();
    }
  }, [visible, bookId]);

  const handleAddQuickBookmark = async () => {
    const title = currentChapterTitle || 'Current Position';
    await addBookmark(bookId, title, currentLocationCfi, 1);
    await reloadData();
  };

  const handleCreateHighlight = async () => {
    if (!newText.trim()) return;
    await addHighlight(bookId, newText.trim(), selectedColor, currentLocationCfi, 1, newNote.trim() || undefined);
    setNewText('');
    setNewNote('');
    setIsAddingHighlight(false);
    await reloadData();
  };

  const handleDeleteBookmark = async (id: string) => {
    await deleteBookmark(id);
    await reloadData();
  };

  const handleDeleteHighlight = async (id: string) => {
    await deleteHighlight(id);
    await reloadData();
  };

  const handleExportMarkdown = async () => {
    let md = `# Annotations: ${bookTitle}\nExported from Readr Sanctuary on ${new Date().toLocaleDateString()}\n\n`;

    if (highlights.length > 0) {
      md += `## Highlights\n\n`;
      highlights.forEach((h) => {
        md += `> "${h.selectedText}"\n\n`;
        if (h.note?.content) {
          md += `*Note*: ${h.note.content}\n\n`;
        }
      });
    }

    if (bookmarks.length > 0) {
      md += `## Bookmarks\n\n`;
      bookmarks.forEach((b) => {
        md += `- **${b.title}** (${new Date(b.createdAt).toLocaleDateString()})\n`;
      });
    }

    const cacheDir = (FileSystem as any).cacheDirectory || '';
    const tempFile = `${cacheDir}Annotations_${bookId}.md`;
    await FileSystem.writeAsStringAsync(tempFile, md);

    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(tempFile, { mimeType: 'text/markdown', dialogTitle: 'Export Annotations' });
    }
  };

  return (
    <Sheet visible={visible} onClose={onClose} title="Annotations & Bookmarks">
      <View style={styles.container}>
        {/* Tab Switcher */}
        <View style={[styles.tabRow, { backgroundColor: colors.canvas, borderColor: colors.border }] as any}>
          <TouchableOpacity
            onPress={() => setTab('highlights')}
            style={[
              styles.tabBtn,
              {
                backgroundColor: tab === 'highlights' ? colors.surface : 'transparent',
              },
            ] as any}
          >
            <Highlighter size={16} color={tab === 'highlights' ? colors.accent : colors.textSecondary} />
            <Text
              style={[
                styles.tabText,
                { color: tab === 'highlights' ? colors.textPrimary : colors.textSecondary },
              ] as any}
            >
              Highlights ({highlights.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setTab('bookmarks')}
            style={[
              styles.tabBtn,
              {
                backgroundColor: tab === 'bookmarks' ? colors.surface : 'transparent',
              },
            ] as any}
          >
            <BookmarkIcon size={16} color={tab === 'bookmarks' ? colors.accent : colors.textSecondary} />
            <Text
              style={[
                styles.tabText,
                { color: tab === 'bookmarks' ? colors.textPrimary : colors.textSecondary },
              ] as any}
            >
              Bookmarks ({bookmarks.length})
            </Text>
          </TouchableOpacity>
        </View>

        {/* Tab Content */}
        {tab === 'highlights' ? (
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.list}>
            {!isAddingHighlight ? (
              <TouchableOpacity
                onPress={() => setIsAddingHighlight(true)}
                style={[styles.addBtn, { backgroundColor: colors.canvas, borderColor: colors.border }] as any}
              >
                <Plus size={18} color={colors.accent} />
                <Text style={[styles.addBtnText, { color: colors.accent }] as any}>Add Note or Highlight</Text>
              </TouchableOpacity>
            ) : (
              <View style={[styles.addForm, { backgroundColor: colors.canvas, borderColor: colors.border }] as any}>
                <Text style={[styles.formLabel, { color: colors.textSecondary }] as any}>HIGHLIGHT TEXT</Text>
                <TextInput
                  value={newText}
                  onChangeText={setNewText}
                  placeholder="Paste or enter excerpt to highlight..."
                  placeholderTextColor={colors.textSecondary}
                  style={[styles.textInput, { color: colors.textPrimary, borderColor: colors.border }] as any}
                  multiline
                />

                <Text style={[styles.formLabel, { color: colors.textSecondary, marginTop: 10 }] as any}>MARKER SHADE</Text>
                <View style={styles.colorRow}>
                  {highlightColors.map((c) => (
                    <TouchableOpacity
                      key={c.name}
                      onPress={() => setSelectedColor(c.name)}
                      style={[
                        styles.colorSwatch,
                        {
                          backgroundColor: c.hex,
                          borderWidth: selectedColor === c.name ? 3 : 1,
                          borderColor: selectedColor === c.name ? colors.textPrimary : colors.border,
                        },
                      ] as any}
                    />
                  ))}
                </View>

                <Text style={[styles.formLabel, { color: colors.textSecondary, marginTop: 10 }] as any}>NOTE (OPTIONAL)</Text>
                <TextInput
                  value={newNote}
                  onChangeText={setNewNote}
                  placeholder="Add your thoughts or reflections..."
                  placeholderTextColor={colors.textSecondary}
                  style={[styles.textInput, { color: colors.textPrimary, borderColor: colors.border }] as any}
                  multiline
                />

                <View style={styles.formActionRow}>
                  <TouchableOpacity
                    onPress={() => setIsAddingHighlight(false)}
                    style={[styles.cancelBtn, { borderColor: colors.border }] as any}
                  >
                    <Text style={[styles.cancelBtnText, { color: colors.textSecondary }] as any}>Cancel</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={handleCreateHighlight}
                    disabled={!newText.trim()}
                    style={[styles.saveBtn, { backgroundColor: colors.accent, opacity: newText.trim() ? 1 : 0.5 }] as any}
                  >
                    <Text style={[styles.saveBtnText, { color: colors.isDark ? '#000000' : '#FFFFFF' }] as any}>Save Highlight</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* Highlights List */}
            {highlights.length === 0 && !isAddingHighlight ? (
              <Text style={[styles.emptyText, { color: colors.textSecondary }] as any}>
                No highlights yet in this book.
              </Text>
            ) : (
              highlights.map((hl) => (
                <View
                  key={hl.id}
                  style={[
                    styles.hlCard,
                    {
                      backgroundColor: colors.surface,
                      borderColor: colors.border,
                      borderLeftColor:
                        highlightColors.find((c) => c.name === hl.color)?.hex || colors.accent,
                    },
                  ] as any}
                >
                  <Text style={[styles.hlText, { color: colors.textPrimary }] as any}>"{hl.selectedText}"</Text>

                  {hl.note?.content && (
                    <View style={[styles.noteBox, { backgroundColor: colors.canvas }] as any}>
                      <Text style={[styles.noteContent, { color: colors.textSecondary }] as any}>
                        {hl.note.content}
                      </Text>
                    </View>
                  )}

                  <View style={styles.cardFooter}>
                    <Text style={[styles.dateText, { color: colors.textSecondary }] as any}>
                      {new Date(hl.createdAt).toLocaleDateString()}
                    </Text>
                    <TouchableOpacity onPress={() => handleDeleteHighlight(hl.id)} style={styles.trashBtn}>
                      <Trash2 size={16} color={colors.textSecondary} />
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </ScrollView>
        ) : (
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.list}>
            {/* Quick Bookmark Button */}
            <TouchableOpacity
              onPress={handleAddQuickBookmark}
              style={[styles.addBtn, { backgroundColor: colors.canvas, borderColor: colors.border }] as any}
            >
              <Plus size={18} color={colors.accent} />
              <Text style={[styles.addBtnText, { color: colors.accent }] as any}>Bookmark Current Page</Text>
            </TouchableOpacity>

            {bookmarks.length === 0 ? (
              <Text style={[styles.emptyText, { color: colors.textSecondary }] as any}>
                No bookmarks saved yet.
              </Text>
            ) : (
              bookmarks.map((bm) => (
                <View
                  key={bm.id}
                  style={[
                    styles.bmCard,
                    {
                      backgroundColor: colors.surface,
                      borderColor: colors.border,
                    },
                  ] as any}
                >
                  <View style={styles.bmHeader}>
                    <BookmarkIcon size={16} color={colors.accent} fill={colors.accent} style={{ marginRight: 8 }} />
                    <Text style={[styles.bmTitle, { color: colors.textPrimary }] as any} numberOfLines={1}>
                      {bm.title}
                    </Text>
                    <TouchableOpacity onPress={() => handleDeleteBookmark(bm.id)} style={styles.trashBtn}>
                      <Trash2 size={16} color={colors.textSecondary} />
                    </TouchableOpacity>
                  </View>
                  <Text style={[styles.dateText, { color: colors.textSecondary, marginTop: 4 }] as any}>
                    Saved {new Date(bm.createdAt).toLocaleDateString()}
                  </Text>
                </View>
              ))
            )}
          </ScrollView>
        )}

        {/* Export Button */}
        {(highlights.length > 0 || bookmarks.length > 0) && (
          <TouchableOpacity
            onPress={handleExportMarkdown}
            style={[styles.exportBtn, { backgroundColor: colors.canvas, borderColor: colors.border }] as any}
          >
            <Share2 size={16} color={colors.accent} />
            <Text style={[styles.exportBtnText, { color: colors.accent }] as any}>Export to Markdown (.md)</Text>
          </TouchableOpacity>
        )}
      </View>
    </Sheet>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingBottom: 24,
    maxHeight: 520,
  },
  tabRow: {
    flexDirection: 'row',
    borderRadius: 12,
    borderWidth: 1,
    padding: 4,
    marginBottom: 16,
  },
  tabBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
  },
  list: {
    gap: 12,
    paddingBottom: 16,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    gap: 6,
  },
  addBtnText: {
    fontSize: 14,
    fontWeight: '600',
  },
  addForm: {
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  formLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.6,
    marginBottom: 6,
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
    minHeight: 60,
  },
  colorRow: {
    flexDirection: 'row',
    gap: 12,
  },
  colorSwatch: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  formActionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 14,
  },
  cancelBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  cancelBtnText: {
    fontSize: 13,
    fontWeight: '600',
  },
  saveBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  saveBtnText: {
    fontSize: 13,
    fontWeight: '600',
  },
  hlCard: {
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderLeftWidth: 5,
  },
  hlText: {
    fontSize: 14,
    fontStyle: 'italic',
    lineHeight: 20,
  },
  noteBox: {
    marginTop: 8,
    padding: 8,
    borderRadius: 6,
  },
  noteContent: {
    fontSize: 13,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  dateText: {
    fontSize: 11,
  },
  trashBtn: {
    padding: 4,
  },
  bmCard: {
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  bmHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  bmTitle: {
    fontSize: 15,
    fontWeight: '600',
    flex: 1,
  },
  emptyText: {
    textAlign: 'center',
    paddingVertical: 24,
    fontSize: 14,
  },
  exportBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 8,
  },
  exportBtnText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
