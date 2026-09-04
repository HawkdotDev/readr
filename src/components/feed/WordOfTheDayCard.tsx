import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useTheme } from '../common/ThemeProvider';
import { FONTS } from '../../utils/typography';
import { LiteraryWord } from '../../services/editorial/literaryLexiconService';
import {
  Sparkles,
  Shuffle,
  Copy,
  Check,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import * as Clipboard from 'expo-clipboard';

export interface WordOfTheDayCardProps {
  literaryWord: LiteraryWord;
  onShuffle: () => void;
}

export const WordOfTheDayCard: React.FC<WordOfTheDayCardProps> = ({
  literaryWord,
  onShuffle,
}) => {
  const { colors } = useTheme();
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      await Clipboard.setStringAsync(
        `${literaryWord.word} (${literaryWord.phonetic}) — ${literaryWord.definition}\n\n"${literaryWord.literaryExample}" — ${literaryWord.citation}`
      );
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.warn('Failed to copy word:', e);
    }
  };

  const handleShuffle = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    setCopied(false);
    onShuffle();
  };

  return (
    <View style={styles.container}>
      <View style={styles.sectionHeaderRow}>
        <View style={styles.eyebrowRow}>
          <Sparkles size={13} color={colors.accent} style={{ marginRight: 6 }} />
          <Text style={[styles.sectionEyebrow, { color: colors.textSecondary }]}>
            LEXICON DISPATCH · WORD OF THE DAY
          </Text>
        </View>

        <TouchableOpacity
          onPress={handleShuffle}
          style={[
            styles.shuffleBtn,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <Shuffle size={12} color={colors.textSecondary} style={{ marginRight: 4 }} />
          <Text style={[styles.shuffleBtnText, { color: colors.textSecondary }]}>
            Next Word
          </Text>
        </TouchableOpacity>
      </View>

      <View
        style={[
          styles.cardContainer,
          { backgroundColor: colors.surface, borderColor: colors.border },
        ]}
      >
        <View style={styles.lexiconHeaderRow}>
          <View>
            <Text style={[styles.lexiconWord, { color: colors.textPrimary }]}>
              {literaryWord.word}
            </Text>
            <View style={styles.lexiconMetaRow}>
              <Text style={[styles.lexiconPhonetic, { color: colors.accent }]}>
                {literaryWord.phonetic}
              </Text>
              <View
                style={[
                  styles.partOfSpeechBadge,
                  { backgroundColor: colors.canvas, borderColor: colors.border },
                ]}
              >
                <Text style={[styles.partOfSpeechText, { color: colors.textSecondary }]}>
                  {literaryWord.partOfSpeech}
                </Text>
              </View>
            </View>
          </View>

          <TouchableOpacity
            onPress={handleCopy}
            style={[
              styles.iconButton,
              { backgroundColor: colors.canvas, borderColor: colors.border },
            ]}
            accessibilityLabel="Copy Word"
          >
            {copied ? (
              <Check size={13} color="#10B981" />
            ) : (
              <Copy size={13} color={colors.textSecondary} />
            )}
          </TouchableOpacity>
        </View>

        <Text style={[styles.lexiconDefinition, { color: colors.textPrimary }]}>
          {literaryWord.definition}
        </Text>

        <View
          style={[
            styles.lexiconExampleBox,
            { backgroundColor: colors.canvas, borderColor: colors.border },
          ]}
        >
          <Text style={[styles.lexiconExampleText, { color: colors.textPrimary }]}>
            "{literaryWord.literaryExample}"
          </Text>
          <Text style={[styles.lexiconCitationText, { color: colors.textSecondary }]}>
            — {literaryWord.citation}
          </Text>
        </View>

        <Text style={[styles.lexiconEtymology, { color: colors.textSecondary }]}>
          Origin: {literaryWord.etymology}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  eyebrowRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionEyebrow: {
    fontFamily: FONTS.mono.bold,
    fontSize: 11,
    letterSpacing: 1.1,
    textTransform: 'uppercase',
  },
  shuffleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  shuffleBtnText: {
    fontFamily: FONTS.mona.medium,
    fontSize: 11,
  },
  cardContainer: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
    padding: 16,
  },
  lexiconHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  lexiconWord: {
    fontFamily: FONTS.hubot.bold,
    fontSize: 22,
    letterSpacing: -0.5,
  },
  lexiconMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 3,
  },
  lexiconPhonetic: {
    fontFamily: FONTS.mono.medium,
    fontSize: 12,
    marginRight: 8,
  },
  partOfSpeechBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
  },
  partOfSpeechText: {
    fontFamily: FONTS.mono.bold,
    fontSize: 10,
    textTransform: 'uppercase',
  },
  iconButton: {
    padding: 7,
    borderRadius: 8,
    borderWidth: 1,
  },
  lexiconDefinition: {
    fontFamily: FONTS.mona.semiBold,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  lexiconExampleBox: {
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 10,
  },
  lexiconExampleText: {
    fontFamily: FONTS.mona.regular,
    fontSize: 13,
    lineHeight: 19,
    fontStyle: 'italic',
  },
  lexiconCitationText: {
    fontFamily: FONTS.mona.medium,
    fontSize: 11,
    marginTop: 4,
    textAlign: 'right',
  },
  lexiconEtymology: {
    fontFamily: FONTS.mona.medium,
    fontSize: 11,
  },
});
