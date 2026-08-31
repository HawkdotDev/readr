import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { Sheet } from '../common/Sheet';
import { useTheme } from '../common/ThemeProvider';
import { ParsedChapter } from '../../services/reader/epubParser';
import { CheckCircle2, Circle } from 'lucide-react-native';

export interface TOCSheetProps {
  visible: boolean;
  chapters: ParsedChapter[];
  currentChapterIndex: number;
  onSelectChapter: (index: number) => void;
  onClose: () => void;
}

export const TOCSheet: React.FC<TOCSheetProps> = ({
  visible,
  chapters,
  currentChapterIndex,
  onSelectChapter,
  onClose,
}) => {
  const { colors } = useTheme();

  return (
    <Sheet visible={visible} onClose={onClose} title="Table of Contents">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.listContent}>
        {chapters.map((chap, idx) => {
          const isCurrent = idx === currentChapterIndex;
          const isPast = idx < currentChapterIndex;

          return (
            <TouchableOpacity
              key={chap.id || `toc_${idx}`}
              onPress={() => {
                onSelectChapter(idx);
                onClose();
              }}
              style={[
                styles.chapterRow,
                {
                  backgroundColor: isCurrent ? colors.canvas : 'transparent',
                  borderBottomColor: colors.border,
                },
              ] as any}
            >
              {isPast ? (
                <CheckCircle2 size={18} color={colors.textSecondary} style={styles.icon} />
              ) : isCurrent ? (
                <Circle size={18} color={colors.accent} fill={colors.accent} style={styles.icon} />
              ) : (
                <Circle size={18} color={colors.textSecondary} style={styles.icon} />
              )}

              <View style={styles.textWrapper}>
                <Text
                  style={[
                    styles.chapterTitle,
                    {
                      color: isCurrent ? colors.accent : colors.textPrimary,
                      fontWeight: isCurrent ? '700' : '500',
                    },
                  ] as any}
                  numberOfLines={1}
                >
                  {chap.title}
                </Text>
                {chap.wordCount > 0 && (
                  <Text style={[styles.wordCount, { color: colors.textSecondary }] as any}>
                    {chap.wordCount} words
                  </Text>
                )}
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </Sheet>
  );
};

import { FONTS } from '../../utils/typography';

const styles = StyleSheet.create({
  listContent: {
    paddingBottom: 24,
  },
  chapterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 8,
    borderRadius: 10,
    borderBottomWidth: 1,
  },
  icon: {
    marginRight: 12,
  },
  textWrapper: {
    flex: 1,
  },
  chapterTitle: {
    fontFamily: FONTS.mona.medium,
    fontSize: 15,
    letterSpacing: -0.2,
  },
  wordCount: {
    fontFamily: FONTS.mono.regular,
    fontSize: 12,
    marginTop: 2,
  },
});
