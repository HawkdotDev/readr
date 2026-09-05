import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { Sheet } from '../common/Sheet';
import { useTheme } from '../common/ThemeProvider';
import { Bookmark, Highlight, HighlightColor } from '../../types';
import {
  getBookmarks,
  getHighlights,
  addBookmark,
  addHighlight,
  deleteBookmark,
  deleteHighlight,
} from '../../db/queries/books';
import { Bookmark as BookmarkIcon, Highlighter, Plus, Share2 } from 'lucide-react-native';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system/legacy';
import { HighlightList } from './annotations/HighlightList';
import { BookmarkList } from './annotations/BookmarkList';
import { NoteEditorModal } from './annotations/NoteEditorModal';
import { FONTS } from '../../utils/typography';

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
  const [isAddingHighlight, setIsAddingHighlight] = useState(false);

  const reloadData = useCallback(async () => {
    if (!bookId) return;
    try {
      const [bms, hls] = await Promise.all([
        getBookmarks(bookId),
        getHighlights(bookId),
      ]);
      setBookmarks(bms);
      setHighlights(hls);
    } catch (e) {
      console.warn('Failed to load annotations:', e);
    }
  }, [bookId]);

  useEffect(() => {
    if (visible && bookId) {
      reloadData();
    }
  }, [visible, bookId, reloadData]);

  const handleAddQuickBookmark = async () => {
    const title = currentChapterTitle || 'Current Position';
    await addBookmark(bookId, title, currentLocationCfi, 1);
    await reloadData();
  };

  const handleCreateHighlight = async (
    text: string,
    color: HighlightColor,
    note?: string
  ) => {
    await addHighlight(
      bookId,
      text,
      color,
      currentLocationCfi,
      1,
      note
    );
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
    let md = `# Annotations: ${bookTitle}\nExported from Readr Library on ${new Date().toLocaleDateString()}\n\n`;

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
      await Sharing.shareAsync(tempFile, {
        mimeType: 'text/markdown',
        dialogTitle: 'Export Annotations',
      });
    }
  };

  return (
    <Sheet visible={visible} onClose={onClose} title="Annotations & Bookmarks" maxHeightRatio={0.88}>
      <View style={styles.container}>
        {/* Tab Switcher */}
        <View
          style={[
            styles.tabRow,
            { backgroundColor: colors.canvas, borderColor: colors.border },
          ] as any}
        >
          <TouchableOpacity
            onPress={() => setTab('highlights')}
            style={[
              styles.tabBtn,
              {
                backgroundColor:
                  tab === 'highlights' ? colors.surface : 'transparent',
              },
            ] as any}
          >
            <Highlighter
              size={16}
              color={tab === 'highlights' ? colors.accent : colors.textSecondary}
            />
            <Text
              style={[
                styles.tabText,
                {
                  color:
                    tab === 'highlights'
                      ? colors.textPrimary
                      : colors.textSecondary,
                },
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
                backgroundColor:
                  tab === 'bookmarks' ? colors.surface : 'transparent',
              },
            ] as any}
          >
            <BookmarkIcon
              size={16}
              color={tab === 'bookmarks' ? colors.accent : colors.textSecondary}
            />
            <Text
              style={[
                styles.tabText,
                {
                  color:
                    tab === 'bookmarks'
                      ? colors.textPrimary
                      : colors.textSecondary,
                },
              ] as any}
            >
              Bookmarks ({bookmarks.length})
            </Text>
          </TouchableOpacity>
        </View>

        {/* Tab Content */}
        {tab === 'highlights' ? (
          <ScrollView
            showsVerticalScrollIndicator={false}
            style={styles.scroll}
            contentContainerStyle={styles.list}
            nestedScrollEnabled={true}
            keyboardShouldPersistTaps="handled"
            bounces={true}
            overScrollMode="always"
          >
            {!isAddingHighlight ? (
              <TouchableOpacity
                onPress={() => setIsAddingHighlight(true)}
                style={[
                  styles.addBtn,
                  { backgroundColor: colors.canvas, borderColor: colors.border },
                ] as any}
              >
                <Plus size={18} color={colors.accent} />
                <Text style={[styles.addBtnText, { color: colors.accent }] as any}>
                  Add Note or Highlight
                </Text>
              </TouchableOpacity>
            ) : (
              <NoteEditorModal
                onSave={handleCreateHighlight}
                onCancel={() => setIsAddingHighlight(false)}
              />
            )}

            <HighlightList
              highlights={highlights}
              onDeleteHighlight={handleDeleteHighlight}
            />
          </ScrollView>
        ) : (
          <ScrollView
            showsVerticalScrollIndicator={false}
            style={styles.scroll}
            contentContainerStyle={styles.list}
            nestedScrollEnabled={true}
            keyboardShouldPersistTaps="handled"
            bounces={true}
            overScrollMode="always"
          >
            <BookmarkList
              bookmarks={bookmarks}
              onAddBookmark={handleAddQuickBookmark}
              onDeleteBookmark={handleDeleteBookmark}
            />
          </ScrollView>
        )}

        {/* Export Action */}
        {(highlights.length > 0 || bookmarks.length > 0) && (
          <TouchableOpacity
            onPress={handleExportMarkdown}
            style={[
              styles.exportBtn,
              { backgroundColor: colors.canvas, borderColor: colors.border },
            ] as any}
          >
            <Share2 size={16} color={colors.accent} />
            <Text style={[styles.exportBtnText, { color: colors.accent }] as any}>
              Export to Markdown (.md)
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </Sheet>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll: {
    flex: 1,
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
    fontFamily: FONTS.mona.semiBold,
    fontSize: 13,
    letterSpacing: -0.1,
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
    fontFamily: FONTS.mona.semiBold,
    fontSize: 14,
    letterSpacing: -0.1,
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
    fontFamily: FONTS.mona.semiBold,
    fontSize: 14,
    letterSpacing: -0.1,
  },
});
