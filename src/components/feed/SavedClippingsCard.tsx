import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Share,
  StyleSheet,
} from 'react-native';
import { useTheme } from '../common/ThemeProvider';
import { EnrichedHighlight } from '../../db/queries/books';
import { FONTS } from '../../utils/typography';
import {
  Bookmark,
  Shuffle,
  Copy,
  Check,
  Share2,
  BookOpen,
  ArrowUpRight,
  ChevronRight,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import * as Clipboard from 'expo-clipboard';

export interface SavedClippingsCardProps {
  highlights: EnrichedHighlight[];
  onOpenReader: (bookId: string) => void;
  onExplorePress: () => void;
}

export const SavedClippingsCard: React.FC<SavedClippingsCardProps> = ({
  highlights,
  onOpenReader,
  onExplorePress,
}) => {
  const { colors } = useTheme();
  const [index, setIndex] = useState(0);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const activeHighlight = highlights.length > 0 ? highlights[index % highlights.length] : null;

  const handleNext = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    setIndex((prev) => (prev + 1) % highlights.length);
  };

  const handleCopy = async (text: string, id: string) => {
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      await Clipboard.setStringAsync(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (e) {
      console.warn('Failed to copy highlight:', e);
    }
  };

  const handleShare = async (text: string, title?: string) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
      await Share.share({
        message: `"${text}"\n\n${title ? `— ${title}\n` : ''}Saved with Readr`,
      });
    } catch (e) {
      console.warn('Failed to share highlight:', e);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.sectionHeaderRow}>
        <View style={styles.eyebrowRow}>
          <Bookmark size={13} color={colors.accent} style={{ marginRight: 6 }} />
          <Text style={[styles.sectionEyebrow, { color: colors.textSecondary }]}>
            {highlights.length > 0 ? 'YOUR SAVED CLIPPINGS' : 'READING PASSAGE'}
          </Text>
        </View>

        {highlights.length > 1 && (
          <TouchableOpacity
            onPress={handleNext}
            style={[
              styles.shuffleBtn,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <Shuffle size={12} color={colors.textSecondary} style={{ marginRight: 4 }} />
            <Text style={[styles.shuffleBtnText, { color: colors.textSecondary }]}>
              Next ({((index % highlights.length) + 1)}/{highlights.length})
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {activeHighlight ? (
        <View
          style={[
            styles.cardContainer,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
              borderLeftColor:
                activeHighlight.color === 'amber'
                  ? '#F59E0B'
                  : activeHighlight.color === 'mint'
                  ? '#10B981'
                  : activeHighlight.color === 'sky'
                  ? '#0EA5E9'
                  : activeHighlight.color === 'coral'
                  ? '#F43F5E'
                  : '#EAB308',
              borderLeftWidth: 4,
            },
          ]}
        >
          <View style={styles.clippingTopRow}>
            <View style={styles.clippingBookPill}>
              <Text style={[styles.clippingBookPillText, { color: colors.accent }]} numberOfLines={1}>
                {activeHighlight.bookTitle}
              </Text>
            </View>

            <View style={styles.clippingActions}>
              <TouchableOpacity
                onPress={() =>
                  handleCopy(
                    `"${activeHighlight.selectedText}" — ${activeHighlight.bookTitle}`,
                    activeHighlight.id
                  )
                }
                style={[
                  styles.iconButton,
                  { backgroundColor: colors.canvas, borderColor: colors.border },
                ]}
                accessibilityLabel="Copy Highlight"
              >
                {copiedId === activeHighlight.id ? (
                  <Check size={13} color="#10B981" />
                ) : (
                  <Copy size={13} color={colors.textSecondary} />
                )}
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() =>
                  handleShare(activeHighlight.selectedText, activeHighlight.bookTitle)
                }
                style={[
                  styles.iconButton,
                  { backgroundColor: colors.canvas, borderColor: colors.border, marginLeft: 6 },
                ]}
                accessibilityLabel="Share Highlight"
              >
                <Share2 size={13} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
          </View>

          <Text style={[styles.clippingQuote, { color: colors.textPrimary }]}>
            "{activeHighlight.selectedText}"
          </Text>

          <TouchableOpacity
            onPress={() => {
              Haptics.selectionAsync().catch(() => {});
              onOpenReader(activeHighlight.bookId);
            }}
            style={[styles.jumpButton, { borderTopColor: colors.border }]}
            activeOpacity={0.7}
          >
            <Text style={[styles.jumpButtonText, { color: colors.accent }]}>
              Open in Book
            </Text>
            <ArrowUpRight size={12} color={colors.accent} />
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity
          onPress={onExplorePress}
          style={[
            styles.emptyCard,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
          activeOpacity={0.8}
        >
          <BookOpen size={20} color={colors.accent} style={{ marginBottom: 6 }} />
          <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>
            No Clippings Saved Yet
          </Text>
          <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>
            Select and highlight sentences while reading to preserve memorable quotes here.
          </Text>
        </TouchableOpacity>
      )}
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
  clippingTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  clippingBookPill: {
    flex: 1,
    marginRight: 10,
  },
  clippingBookPillText: {
    fontFamily: FONTS.mona.bold,
    fontSize: 13,
  },
  clippingActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    padding: 6,
    borderRadius: 6,
    borderWidth: 1,
  },
  clippingQuote: {
    fontFamily: FONTS.mona.medium,
    fontSize: 14,
    lineHeight: 22,
    fontStyle: 'italic',
    marginBottom: 14,
  },
  jumpButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingTop: 10,
    borderTopWidth: 1,
  },
  jumpButtonText: {
    fontFamily: FONTS.mona.semiBold,
    fontSize: 12,
    marginRight: 3,
  },
  emptyCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 20,
    alignItems: 'center',
  },
  emptyTitle: {
    fontFamily: FONTS.mona.bold,
    fontSize: 13,
    marginBottom: 4,
  },
  emptySubtext: {
    fontFamily: FONTS.mona.medium,
    fontSize: 11,
    textAlign: 'center',
    lineHeight: 16,
  },
});
