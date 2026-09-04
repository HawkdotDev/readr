import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useTheme } from '../common/ThemeProvider';
import { FONTS } from '../../utils/typography';
import {
  OpeningSentenceItem,
} from '../../services/editorial/openingLinesService';
import {
  Feather,
  Shuffle,
  Eye,
  EyeOff,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

export interface OpeningSentenceCardProps {
  openingSentence: OpeningSentenceItem;
  onShuffle: () => void;
}

export const OpeningSentenceCard: React.FC<OpeningSentenceCardProps> = ({
  openingSentence,
  onShuffle,
}) => {
  const { colors } = useTheme();
  const [isRevealed, setIsRevealed] = useState(false);

  const handleShuffle = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    setIsRevealed(false);
    onShuffle();
  };

  const handleToggleReveal = () => {
    Haptics.selectionAsync().catch(() => {});
    setIsRevealed(!isRevealed);
  };

  return (
    <View style={styles.container}>
      <View style={styles.sectionHeaderRow}>
        <View style={styles.eyebrowRow}>
          <Feather size={13} color={colors.accent} style={{ marginRight: 6 }} />
          <Text style={[styles.sectionEyebrow, { color: colors.textSecondary }]}>
            ICONIC OPENING SENTENCE
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
            Shuffle Line
          </Text>
        </TouchableOpacity>
      </View>

      <View
        style={[
          styles.cardContainer,
          { backgroundColor: colors.surface, borderColor: colors.border },
        ]}
      >
        <Text style={[styles.openingQuoteText, { color: colors.textPrimary }]}>
          "{openingSentence.openingSentence}"
        </Text>

        {isRevealed ? (
          <View
            style={[
              styles.revealedBox,
              { backgroundColor: colors.canvas, borderColor: colors.border },
            ]}
          >
            <View style={styles.revealedHeader}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.revealedTitle, { color: colors.textPrimary }]}>
                  {openingSentence.title}
                </Text>
                <Text style={[styles.revealedAuthor, { color: colors.accent }]}>
                  {openingSentence.author} ({openingSentence.year}) · {openingSentence.genre}
                </Text>
              </View>

              <TouchableOpacity
                onPress={handleToggleReveal}
                style={[styles.iconButton, { borderColor: colors.border }]}
                accessibilityLabel="Hide Origin"
              >
                <EyeOff size={13} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <Text style={[styles.revealedSignificance, { color: colors.textSecondary }]}>
              {openingSentence.significance}
            </Text>
          </View>
        ) : (
          <View style={styles.revealPromptRow}>
            <Text style={[styles.guessPromptText, { color: colors.textSecondary }]}>
              Do you recognize which masterpiece begins with this line?
            </Text>

            <TouchableOpacity
              onPress={handleToggleReveal}
              style={[
                styles.revealButton,
                { backgroundColor: colors.canvas, borderColor: colors.accent },
              ]}
            >
              <Eye size={13} color={colors.accent} style={{ marginRight: 5 }} />
              <Text style={[styles.revealButtonText, { color: colors.accent }]}>
                Reveal Origin
              </Text>
            </TouchableOpacity>
          </View>
        )}
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
  openingQuoteText: {
    fontFamily: FONTS.mona.bold,
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: -0.3,
    marginBottom: 14,
  },
  revealedBox: {
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  revealedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  revealedTitle: {
    fontFamily: FONTS.mona.bold,
    fontSize: 14,
  },
  revealedAuthor: {
    fontFamily: FONTS.mona.semiBold,
    fontSize: 12,
    marginTop: 2,
  },
  revealedSignificance: {
    fontFamily: FONTS.mona.regular,
    fontSize: 12,
    lineHeight: 18,
  },
  revealPromptRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  guessPromptText: {
    fontFamily: FONTS.mona.medium,
    fontSize: 12,
    flex: 1,
    marginRight: 12,
  },
  revealButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    borderWidth: 1,
  },
  revealButtonText: {
    fontFamily: FONTS.mona.semiBold,
    fontSize: 12,
  },
  iconButton: {
    padding: 6,
    borderRadius: 6,
    borderWidth: 1,
  },
});
