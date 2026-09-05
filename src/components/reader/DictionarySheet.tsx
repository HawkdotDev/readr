import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, ScrollView } from 'react-native';
import { Sheet } from '../common/Sheet';
import { useTheme } from '../common/ThemeProvider';
import { lookupWord } from '../../services/dictionary/dictionaryService';
import { DictionaryDefinition } from '../../types';
import { BookOpen, Volume2, Highlighter } from 'lucide-react-native';
import * as Speech from 'expo-speech';
import { FONTS } from '../../utils/typography';

export interface DictionarySheetProps {
  visible: boolean;
  word: string | null;
  onClose: () => void;
  onHighlightWord?: (word: string) => void;
}

export const DictionarySheet: React.FC<DictionarySheetProps> = ({
  visible,
  word,
  onClose,
  onHighlightWord,
}) => {
  const { colors } = useTheme();
  const [definition, setDefinition] = useState<DictionaryDefinition | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (word && visible) {
      setLoading(true);
      lookupWord(word).then((res) => {
        setDefinition(res);
        setLoading(false);
      });
    }
  }, [word, visible]);

  const pronounceWord = () => {
    if (definition?.word) {
      Speech.speak(definition.word);
    }
  };

  return (
    <Sheet visible={visible} onClose={onClose} title="Dictionary Definition" maxHeightRatio={0.55}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        style={styles.scroll}
        contentContainerStyle={styles.container}
        nestedScrollEnabled={true}
        keyboardShouldPersistTaps="handled"
        bounces={true}
        overScrollMode="always"
      >
        {loading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="small" color={colors.accent} />
            <Text style={[styles.loadingText, { color: colors.textSecondary }] as any}>Looking up definition...</Text>
          </View>
        ) : definition ? (
          <View>
            {/* Word Header */}
            <View style={styles.headerRow}>
              <View>
                <Text style={[styles.wordTitle, { color: colors.textPrimary }] as any}>{definition.word}</Text>
                {definition.phonetic && (
                  <Text style={[styles.phonetic, { color: colors.textSecondary }] as any}>{definition.phonetic}</Text>
                )}
              </View>

              <TouchableOpacity
                onPress={pronounceWord}
                style={[styles.audioBtn, { backgroundColor: colors.canvas, borderColor: colors.border }] as any}
              >
                <Volume2 size={20} color={colors.accent} />
              </TouchableOpacity>
            </View>

            {/* Part of speech badge */}
            <View style={[styles.posBadge, { backgroundColor: colors.canvas, borderColor: colors.border }] as any}>
              <Text style={[styles.posText, { color: colors.accent }] as any}>{definition.partOfSpeech}</Text>
            </View>

            {/* Meaning */}
            <Text style={[styles.definitionText, { color: colors.textPrimary }] as any}>{definition.definition}</Text>

            {/* Example */}
            {definition.example && (
              <View style={[styles.exampleBox, { backgroundColor: colors.canvas, borderLeftColor: colors.accent }] as any}>
                <Text style={[styles.exampleText, { color: colors.textSecondary }] as any}>"{definition.example}"</Text>
              </View>
            )}

            {/* Actions */}
            {onHighlightWord && (
              <TouchableOpacity
                onPress={() => {
                  onHighlightWord(definition.word);
                  onClose();
                }}
                style={[styles.highlightActionBtn, { backgroundColor: colors.surface, borderColor: colors.border }] as any}
              >
                <Highlighter size={16} color={colors.textPrimary} />
                <Text style={[styles.highlightActionText, { color: colors.textPrimary }] as any}>
                  Create Highlight with Word
                </Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <Text style={[styles.notFoundText, { color: colors.textSecondary }] as any}>
            No definition found for "{word}".
          </Text>
        )}
      </ScrollView>
    </Sheet>
  );
};

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  container: {
    paddingBottom: 40,
  },
  loadingBox: {
    paddingVertical: 32,
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    fontFamily: FONTS.mona.regular,
    fontSize: 14,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  wordTitle: {
    fontFamily: FONTS.hubot.bold,
    fontSize: 24,
    letterSpacing: -0.4,
    textTransform: 'capitalize',
  },
  phonetic: {
    fontFamily: FONTS.mono.regular,
    fontSize: 14,
    marginTop: 2,
  },
  audioBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  posBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    marginBottom: 14,
  },
  posText: {
    fontFamily: FONTS.mono.bold,
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  definitionText: {
    fontFamily: FONTS.mona.regular,
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 16,
  },
  exampleBox: {
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 3,
    marginBottom: 16,
  },
  exampleText: {
    fontFamily: FONTS.mona.regular,
    fontSize: 14,
    fontStyle: 'italic',
    lineHeight: 20,
  },
  highlightActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 8,
  },
  highlightActionText: {
    fontFamily: FONTS.mona.semiBold,
    fontSize: 14,
    letterSpacing: -0.1,
  },
  notFoundText: {
    fontFamily: FONTS.mona.regular,
    fontSize: 15,
    textAlign: 'center',
    paddingVertical: 24,
  },
});
