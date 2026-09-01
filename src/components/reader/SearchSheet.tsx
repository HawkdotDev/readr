import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { Sheet } from '../common/Sheet';
import { useTheme } from '../common/ThemeProvider';
import { ParsedChapter } from '../../services/reader/epubParser';
import { Search, X, ChevronRight } from 'lucide-react-native';
import { FONTS } from '../../utils/typography';

export interface SearchSheetProps {
  visible: boolean;
  chapters: ParsedChapter[];
  onSelectResult: (chapterIndex: number) => void;
  onClose: () => void;
}

interface SearchMatch {
  chapterIndex: number;
  chapterTitle: string;
  snippet: string;
}

export const SearchSheet: React.FC<SearchSheetProps> = ({
  visible,
  chapters,
  onSelectResult,
  onClose,
}) => {
  const { colors } = useTheme();
  const [query, setQuery] = useState('');

  const matches: SearchMatch[] = [];
  if (query.trim().length > 1) {
    const q = query.toLowerCase().trim();
    chapters.forEach((chap, idx) => {
      const cleanContent = chap.content.replace(/<[^>]+>/g, ' ');
      const lower = cleanContent.toLowerCase();
      let pos = lower.indexOf(q);
      while (pos !== -1 && matches.length < 50) {
        const start = Math.max(0, pos - 40);
        const end = Math.min(cleanContent.length, pos + q.length + 40);
        const snippet = cleanContent.substring(start, end).trim();

        matches.push({
          chapterIndex: idx,
          chapterTitle: chap.title,
          snippet: `...${snippet}...`,
        });

        pos = lower.indexOf(q, pos + q.length + 10);
      }
    });
  }

  return (
    <Sheet visible={visible} onClose={onClose} title="Search in Book">
      <View style={styles.container}>
        {/* Search Input */}
        <View style={[styles.inputBox, { backgroundColor: colors.canvas, borderColor: colors.border }] as any}>
          <Search size={18} color={colors.textSecondary} style={{ marginRight: 8 }} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search keywords or phrases..."
            placeholderTextColor={colors.textSecondary}
            style={[styles.input, { color: colors.textPrimary }] as any}
            autoCapitalize="none"
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')} style={{ padding: 4 }}>
              <X size={16} color={colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>

        {/* Results Count */}
        {query.trim().length > 1 && (
          <Text style={[styles.countText, { color: colors.textSecondary }] as any}>
            {matches.length} {matches.length === 1 ? 'match' : 'matches'} found
          </Text>
        )}

        {/* Matches List */}
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.list}>
          {matches.map((m, idx) => (
            <TouchableOpacity
              key={`match_${idx}`}
              onPress={() => {
                onSelectResult(m.chapterIndex);
                onClose();
              }}
              style={[
                styles.resultCard,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                },
              ] as any}
            >
              <View style={styles.cardHeader}>
                <Text style={[styles.chapterTitle, { color: colors.accent }] as any} numberOfLines={1}>
                  {m.chapterTitle}
                </Text>
                <ChevronRight size={16} color={colors.textSecondary} />
              </View>
              <Text style={[styles.snippetText, { color: colors.textPrimary }] as any}>
                {m.snippet}
              </Text>
            </TouchableOpacity>
          ))}

          {query.trim().length > 1 && matches.length === 0 && (
            <Text style={[styles.noMatches, { color: colors.textSecondary }] as any}>
              No occurrences of "{query}" found in this book.
            </Text>
          )}
        </ScrollView>
      </View>
    </Sheet>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingBottom: 24,
    maxHeight: 500,
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    height: 44,
    marginBottom: 12,
  },
  input: {
    flex: 1,
    fontFamily: FONTS.mona.regular,
    fontSize: 15,
    padding: 0,
  },
  countText: {
    fontFamily: FONTS.mono.semiBold,
    fontSize: 12,
    marginBottom: 8,
  },
  list: {
    gap: 10,
  },
  resultCard: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  chapterTitle: {
    fontFamily: FONTS.mono.bold,
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  snippetText: {
    fontFamily: FONTS.mona.regular,
    fontSize: 14,
    lineHeight: 20,
  },
  noMatches: {
    fontFamily: FONTS.mona.regular,
    textAlign: 'center',
    paddingVertical: 24,
    fontSize: 14,
  },
});
