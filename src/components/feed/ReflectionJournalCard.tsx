import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Share,
  StyleSheet,
} from 'react-native';
import { useTheme } from '../common/ThemeProvider';
import { Book } from '../../types';
import { EnrichedHighlight } from '../../db/queries/books';
import { FONTS } from '../../utils/typography';
import {
  getTodayReflectionPrompt,
  getRandomReflectionPrompt,
  formatReflectionForExport,
  selectMemoryRecallHighlight,
  ReflectionPrompt,
} from '../../services/editorial/reflectionJournalService';
import {
  NotebookPen,
  Shuffle,
  Share2,
  Copy,
  Check,
  Sparkles,
  BookOpen,
  Quote as QuoteIcon,
  ChevronRight,
  Send,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import * as Clipboard from 'expo-clipboard';

export interface ReflectionJournalCardProps {
  activeBook: Book | null;
  highlights: EnrichedHighlight[];
  onOpenReader: (bookId: string) => void;
}

export const ReflectionJournalCard: React.FC<ReflectionJournalCardProps> = ({
  activeBook,
  highlights,
  onOpenReader,
}) => {
  const { colors } = useTheme();

  const [mode, setMode] = useState<'prompt' | 'recall'>('prompt');
  const [prompt, setPrompt] = useState<ReflectionPrompt>(() => getTodayReflectionPrompt());
  const [inputText, setInputText] = useState<string>('');
  const [savedNote, setSavedNote] = useState<string | null>(null);
  const [memoryHighlight, setMemoryHighlight] = useState<EnrichedHighlight | null>(() => {
    return selectMemoryRecallHighlight(highlights, activeBook?.id);
  });
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleShufflePrompt = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    setPrompt(getRandomReflectionPrompt(prompt.id));
    setSavedNote(null);
  };

  const handleShuffleMemory = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    const next = selectMemoryRecallHighlight(highlights, memoryHighlight?.id);
    if (next) setMemoryHighlight(next);
  };

  const handleSaveReflection = () => {
    if (!inputText.trim()) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    setSavedNote(inputText.trim());
    setInputText('');
  };

  const handleCopy = async (text: string, key: string) => {
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      await Clipboard.setStringAsync(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    } catch (e) {
      console.warn('Failed to copy reflection:', e);
    }
  };

  const handleShareReflection = async () => {
    if (!savedNote) return;
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
      const md = formatReflectionForExport(
        prompt.prompt,
        savedNote,
        activeBook?.title,
        activeBook?.authors?.map((a) => a.name).join(', ')
      );
      await Share.share({
        message: md,
        title: 'Literary Reflection',
      });
    } catch (e) {
      console.warn('Failed to share reflection:', e);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header Row */}
      <View style={styles.headerRow}>
        <View style={styles.eyebrowRow}>
          <NotebookPen size={14} color={colors.accent} style={{ marginRight: 6 }} />
          <Text style={[styles.eyebrowText, { color: colors.textSecondary }]}>
            DAILY LITERARY JOURNAL
          </Text>
        </View>

        {/* Mode Switcher Tabs */}
        <View style={[styles.tabCapsule, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <TouchableOpacity
            onPress={() => {
              Haptics.selectionAsync().catch(() => {});
              setMode('prompt');
            }}
            style={[
              styles.tabBtn,
              mode === 'prompt' && { backgroundColor: colors.accent },
            ]}
          >
            <Text
              style={[
                styles.tabBtnText,
                {
                  color: mode === 'prompt'
                    ? colors.isDark
                      ? '#000000'
                      : '#FFFFFF'
                    : colors.textSecondary,
                },
              ]}
            >
              Reflection
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              Haptics.selectionAsync().catch(() => {});
              setMode('recall');
            }}
            style={[
              styles.tabBtn,
              mode === 'recall' && { backgroundColor: colors.accent },
            ]}
          >
            <Text
              style={[
                styles.tabBtnText,
                {
                  color: mode === 'recall'
                    ? colors.isDark
                      ? '#000000'
                      : '#FFFFFF'
                    : colors.textSecondary,
                },
              ]}
            >
              Recall
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Main Card */}
      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        {mode === 'prompt' ? (
          /* ─── Mode A: Daily Reflection Prompt ─── */
          <>
            <View style={styles.promptHeader}>
              <View style={[styles.categoryPill, { backgroundColor: colors.canvas, borderColor: colors.border }]}>
                <Text style={[styles.categoryText, { color: colors.accent }]}>
                  {prompt.category.toUpperCase()}
                </Text>
              </View>

              <TouchableOpacity
                onPress={handleShufflePrompt}
                style={[styles.shuffleBtn, { borderColor: colors.border }]}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Shuffle size={12} color={colors.textSecondary} style={{ marginRight: 4 }} />
                <Text style={[styles.shuffleText, { color: colors.textSecondary }]}>
                  Next Prompt
                </Text>
              </TouchableOpacity>
            </View>

            <Text style={[styles.promptText, { color: colors.textPrimary }]}>
              "{prompt.prompt}"
            </Text>
            <Text style={[styles.promptSubtext, { color: colors.textSecondary }]}>
              {prompt.subtext}
            </Text>

            {/* Saved Reflection Display or Input Composer */}
            {savedNote ? (
              <View style={[styles.savedNoteBox, { backgroundColor: colors.canvas, borderColor: colors.border }]}>
                <View style={styles.savedNoteHeader}>
                  <View style={styles.savedMetaRow}>
                    <Sparkles size={12} color="#10B981" style={{ marginRight: 4 }} />
                    <Text style={[styles.savedMetaText, { color: colors.textSecondary }]}>
                      Saved Reflection {activeBook ? `· ${activeBook.title}` : ''}
                    </Text>
                  </View>
                  <View style={styles.savedActions}>
                    <TouchableOpacity
                      onPress={() => handleCopy(savedNote, 'saved_note')}
                      style={styles.iconBtn}
                    >
                      {copiedKey === 'saved_note' ? (
                        <Check size={14} color="#10B981" />
                      ) : (
                        <Copy size={14} color={colors.textSecondary} />
                      )}
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={handleShareReflection}
                      style={[styles.iconBtn, { marginLeft: 8 }]}
                    >
                      <Share2 size={14} color={colors.accent} />
                    </TouchableOpacity>
                  </View>
                </View>

                <Text style={[styles.savedNoteContent, { color: colors.textPrimary }]}>
                  {savedNote}
                </Text>

                <TouchableOpacity
                  onPress={() => {
                    setInputText(savedNote);
                    setSavedNote(null);
                  }}
                  style={styles.editPromptLink}
                >
                  <Text style={[styles.editPromptText, { color: colors.accent }]}>
                    Edit Note
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.composerWrapper}>
                <TextInput
                  style={[
                    styles.composerInput,
                    {
                      backgroundColor: colors.canvas,
                      color: colors.textPrimary,
                      borderColor: colors.border,
                    },
                  ]}
                  placeholder={
                    activeBook
                      ? `What stood out in ${activeBook.title} today?`
                      : 'Capture a quick thought or key takeaway...'
                  }
                  placeholderTextColor={colors.textSecondary}
                  value={inputText}
                  onChangeText={setInputText}
                  multiline
                  numberOfLines={3}
                />
                <TouchableOpacity
                  onPress={handleSaveReflection}
                  disabled={!inputText.trim()}
                  style={[
                    styles.saveBtn,
                    {
                      backgroundColor: inputText.trim() ? colors.accent : colors.border,
                    },
                  ]}
                >
                  <Send
                    size={14}
                    color={
                      inputText.trim()
                        ? colors.isDark
                          ? '#000000'
                          : '#FFFFFF'
                        : colors.textSecondary
                    }
                    style={{ marginRight: 6 }}
                  />
                  <Text
                    style={[
                      styles.saveBtnText,
                      {
                        color: inputText.trim()
                          ? colors.isDark
                            ? '#000000'
                            : '#FFFFFF'
                          : colors.textSecondary,
                      },
                    ]}
                  >
                    Save Reflection
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </>
        ) : (
          /* ─── Mode B: Spaced Repetition Memory Recall ─── */
          <>
            <View style={styles.promptHeader}>
              <View style={[styles.categoryPill, { backgroundColor: colors.canvas, borderColor: colors.border }]}>
                <Text style={[styles.categoryText, { color: '#F59E0B' }]}>
                  MEMORY RECALL
                </Text>
              </View>

              <TouchableOpacity
                onPress={handleShuffleMemory}
                style={[styles.shuffleBtn, { borderColor: colors.border }]}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Shuffle size={12} color={colors.textSecondary} style={{ marginRight: 4 }} />
                <Text style={[styles.shuffleText, { color: colors.textSecondary }]}>
                  Another Passage
                </Text>
              </TouchableOpacity>
            </View>

            {memoryHighlight ? (
              <View style={[styles.recallQuoteBox, { backgroundColor: colors.canvas, borderColor: colors.border }]}>
                <QuoteIcon size={18} color={colors.accent} style={{ marginBottom: 6, opacity: 0.6 }} />
                <Text style={[styles.recallQuoteText, { color: colors.textPrimary }]}>
                  "{memoryHighlight.selectedText}"
                </Text>
                <Text style={[styles.recallBookTitle, { color: colors.accent }]}>
                  — From {memoryHighlight.bookTitle}
                </Text>

                <View style={[styles.recallActionRow, { borderTopColor: colors.border }]}>
                  <TouchableOpacity
                    onPress={() => handleCopy(memoryHighlight.selectedText, 'recall_quote')}
                    style={[styles.recallActionBtn, { borderColor: colors.border }]}
                  >
                    {copiedKey === 'recall_quote' ? (
                      <Check size={12} color="#10B981" style={{ marginRight: 4 }} />
                    ) : (
                      <Copy size={12} color={colors.textSecondary} style={{ marginRight: 4 }} />
                    )}
                    <Text style={[styles.recallActionText, { color: colors.textSecondary }]}>
                      {copiedKey === 'recall_quote' ? 'Copied' : 'Copy'}
                    </Text>
                  </TouchableOpacity>

                  {memoryHighlight.bookId && (
                    <TouchableOpacity
                      onPress={() => onOpenReader(memoryHighlight.bookId)}
                      style={[styles.recallActionBtn, { borderColor: colors.border }]}
                    >
                      <BookOpen size={12} color={colors.accent} style={{ marginRight: 4 }} />
                      <Text style={[styles.recallActionText, { color: colors.accent }]}>
                        Open Book
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            ) : (
              <View style={styles.emptyRecallBox}>
                <Text style={[styles.emptyRecallText, { color: colors.textSecondary }]}>
                  Highlights you save in your reading will appear here for serendipitous recall and spaced repetition.
                </Text>
              </View>
            )}
          </>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  eyebrowRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  eyebrowText: {
    fontFamily: FONTS.mono.bold,
    fontSize: 11,
    letterSpacing: 1.1,
    textTransform: 'uppercase',
  },
  tabCapsule: {
    flexDirection: 'row',
    borderRadius: 12,
    borderWidth: 1,
    padding: 2,
  },
  tabBtn: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  tabBtnText: {
    fontFamily: FONTS.mona.semiBold,
    fontSize: 11,
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
    padding: 16,
  },
  promptHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  categoryPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
  },
  categoryText: {
    fontFamily: FONTS.mono.bold,
    fontSize: 10,
    letterSpacing: 0.8,
  },
  shuffleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  shuffleText: {
    fontFamily: FONTS.mona.medium,
    fontSize: 11,
  },
  promptText: {
    fontFamily: FONTS.mona.bold,
    fontSize: 16,
    lineHeight: 22,
    letterSpacing: -0.3,
  },
  promptSubtext: {
    fontFamily: FONTS.mona.medium,
    fontSize: 12,
    lineHeight: 17,
    marginTop: 4,
    marginBottom: 14,
  },
  composerWrapper: {
    marginTop: 4,
  },
  composerInput: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    fontFamily: FONTS.mona.regular,
    fontSize: 13,
    minHeight: 70,
    textAlignVertical: 'top',
    marginBottom: 10,
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10,
  },
  saveBtnText: {
    fontFamily: FONTS.mona.semiBold,
    fontSize: 13,
  },
  savedNoteBox: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 4,
  },
  savedNoteHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  savedMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  savedMetaText: {
    fontFamily: FONTS.mono.medium,
    fontSize: 10,
  },
  savedActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBtn: {
    padding: 4,
  },
  savedNoteContent: {
    fontFamily: FONTS.mona.regular,
    fontSize: 13,
    lineHeight: 19,
  },
  editPromptLink: {
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  editPromptText: {
    fontFamily: FONTS.mona.semiBold,
    fontSize: 11,
  },
  recallQuoteBox: {
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  recallQuoteText: {
    fontFamily: FONTS.mona.medium,
    fontSize: 14,
    lineHeight: 20,
    fontStyle: 'italic',
  },
  recallBookTitle: {
    fontFamily: FONTS.mona.bold,
    fontSize: 12,
    marginTop: 8,
  },
  recallActionRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
  },
  recallActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
  },
  recallActionText: {
    fontFamily: FONTS.mona.medium,
    fontSize: 11,
  },
  emptyRecallBox: {
    padding: 16,
    alignItems: 'center',
  },
  emptyRecallText: {
    fontFamily: FONTS.mona.medium,
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
  },
});
