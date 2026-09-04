import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useTheme } from '../common/ThemeProvider';
import { FONTS } from '../../utils/typography';
import { LiteraryAlmanacEvent } from '../../services/editorial/literaryAlmanacService';
import {
  Calendar,
  Shuffle,
  Sparkles,
  BookOpen,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

export interface ThisDayInLiteratureCardProps {
  almanacEvent: LiteraryAlmanacEvent;
  onShuffle: () => void;
}

export const ThisDayInLiteratureCard: React.FC<ThisDayInLiteratureCardProps> = ({
  almanacEvent,
  onShuffle,
}) => {
  const { colors } = useTheme();

  const handleShuffle = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    onShuffle();
  };

  return (
    <View style={styles.container}>
      <View style={styles.sectionHeaderRow}>
        <View style={styles.eyebrowRow}>
          <Calendar size={13} color={colors.accent} style={{ marginRight: 6 }} />
          <Text style={[styles.sectionEyebrow, { color: colors.textSecondary }]}>
            THIS DAY IN LITERATURE
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
            Other Eras
          </Text>
        </TouchableOpacity>
      </View>

      <View
        style={[
          styles.cardContainer,
          { backgroundColor: colors.surface, borderColor: colors.border },
        ]}
      >
        <View style={styles.almanacHeaderRow}>
          <View
            style={[
              styles.almanacCategoryPill,
              {
                backgroundColor: colors.isDark
                  ? 'rgba(59, 130, 246, 0.15)'
                  : 'rgba(59, 130, 246, 0.1)',
              },
            ]}
          >
            <Text style={[styles.almanacCategoryText, { color: almanacEvent.accentColor }]}>
              {almanacEvent.category.toUpperCase()} · {almanacEvent.year}
            </Text>
          </View>
          <Text style={[styles.almanacDateLabel, { color: colors.textSecondary }]}>
            {almanacEvent.dateStr}
          </Text>
        </View>

        <Text style={[styles.almanacHeadline, { color: colors.textPrimary }]}>
          {almanacEvent.headline}
        </Text>

        <Text style={[styles.almanacDescription, { color: colors.textSecondary }]}>
          {almanacEvent.description}
        </Text>

        <View
          style={[
            styles.almanacSignificanceBox,
            { backgroundColor: colors.canvas, borderColor: colors.border },
          ]}
        >
          <Sparkles size={13} color={almanacEvent.accentColor} style={{ marginRight: 6 }} />
          <Text style={[styles.almanacSignificanceText, { color: colors.textPrimary }]}>
            {almanacEvent.significance}
          </Text>
        </View>

        <View style={styles.almanacBookFooter}>
          <BookOpen size={13} color={colors.accent} style={{ marginRight: 5 }} />
          <Text style={[styles.almanacBookTitle, { color: colors.textPrimary }]}>
            {almanacEvent.authorOrBook}
          </Text>
        </View>
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
  almanacHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  almanacCategoryPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  almanacCategoryText: {
    fontFamily: FONTS.mono.bold,
    fontSize: 10,
    letterSpacing: 0.5,
  },
  almanacDateLabel: {
    fontFamily: FONTS.mono.medium,
    fontSize: 11,
  },
  almanacHeadline: {
    fontFamily: FONTS.hubot.bold,
    fontSize: 17,
    letterSpacing: -0.4,
    lineHeight: 22,
    marginBottom: 6,
  },
  almanacDescription: {
    fontFamily: FONTS.mona.regular,
    fontSize: 13,
    lineHeight: 19,
    marginBottom: 12,
  },
  almanacSignificanceBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 10,
  },
  almanacSignificanceText: {
    fontFamily: FONTS.mona.semiBold,
    fontSize: 12,
    lineHeight: 17,
    flex: 1,
  },
  almanacBookFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  almanacBookTitle: {
    fontFamily: FONTS.mona.bold,
    fontSize: 12,
  },
  almanacAuthor: {
    fontFamily: FONTS.mona.medium,
    fontSize: 12,
  },
});
