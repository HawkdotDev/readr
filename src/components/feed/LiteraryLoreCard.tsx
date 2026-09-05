import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Share,
} from 'react-native';
import { useTheme } from '../common/ThemeProvider';
import { FONTS } from '../../utils/typography';
import { LiteraryLoreItem } from '../../services/editorial/literaryLoreService';
import {
  History,
  Shuffle,
  ChevronRight,
  Sparkles,
  Share2,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

export interface LiteraryLoreCardProps {
  literaryLore: LiteraryLoreItem;
  onShuffle: () => void;
}

export const LiteraryLoreCard: React.FC<LiteraryLoreCardProps> = ({
  literaryLore,
  onShuffle,
}) => {
  const { colors } = useTheme();
  const [isExpanded, setIsExpanded] = useState(false);

  const handleShare = async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
      const shareMessage = `📚 Literary Lore: ${literaryLore.headline}\nFeaturing ${literaryLore.authorSubject} (${literaryLore.era})\n\n${literaryLore.story}\n\n✨ Takeaway: ${literaryLore.takeaway}\n\nShared via Readr`;
      await Share.share({
        message: shareMessage,
        title: `Literary Lore: ${literaryLore.headline}`,
      });
    } catch (err) {
      console.warn('Share error:', err);
    }
  };

  const handleShuffle = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    setIsExpanded(false);
    onShuffle();
  };

  const handleToggleExpand = () => {
    Haptics.selectionAsync().catch(() => {});
    setIsExpanded(!isExpanded);
  };

  return (
    <View style={styles.container}>
      <View style={styles.sectionHeaderRow}>
        <View style={styles.eyebrowRow}>
          <History size={13} color={colors.accent} style={{ marginRight: 6 }} />
          <Text style={[styles.sectionEyebrow, { color: colors.textSecondary }]}>
            LITERARY LORE
          </Text>
        </View>

        <View style={styles.headerBtnGroup}>
          <TouchableOpacity
            onPress={handleShare}
            style={[
              styles.actionBtn,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
            accessibilityLabel="Share Literary Lore"
          >
            <Share2 size={12} color={colors.textSecondary} style={{ marginRight: 4 }} />
            <Text style={[styles.actionBtnText, { color: colors.textSecondary }]}>
              Share
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleShuffle}
            style={[
              styles.actionBtn,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
            accessibilityLabel="Other Literary Lore"
          >
            <Shuffle size={12} color={colors.textSecondary} style={{ marginRight: 4 }} />
            <Text style={[styles.actionBtnText, { color: colors.textSecondary }]}>
              Other Lore
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View
        style={[
          styles.cardContainer,
          { backgroundColor: colors.surface, borderColor: colors.border },
        ]}
      >
        <View style={styles.loreHeaderRow}>
          <View
            style={[
              styles.loreTagBadge,
              {
                backgroundColor: colors.isDark
                  ? 'rgba(236, 72, 153, 0.15)'
                  : 'rgba(236, 72, 153, 0.1)',
              },
            ]}
          >
            <Text style={[styles.loreTagText, { color: '#EC4899' }]}>
              {literaryLore.tag.toUpperCase()} · {literaryLore.era}
            </Text>
          </View>
          <Text style={[styles.loreReadTime, { color: colors.textSecondary }]}>
            {literaryLore.readTime}
          </Text>
        </View>

        <Text style={[styles.loreHeadline, { color: colors.textPrimary }]}>
          {literaryLore.headline}
        </Text>
        <Text style={[styles.loreSubject, { color: colors.accent }]}>
          Featuring {literaryLore.authorSubject}
        </Text>

        <Text
          style={[styles.loreStory, { color: colors.textPrimary }]}
          numberOfLines={isExpanded ? undefined : 3}
        >
          {literaryLore.story}
        </Text>

        <View style={styles.cardFooterRow}>
          <TouchableOpacity
            onPress={handleToggleExpand}
            style={styles.loreToggleRow}
          >
            <Text style={[styles.loreToggleText, { color: colors.accent }]}>
              {isExpanded ? 'Show Less' : 'Read Full Lore'}
            </Text>
            <ChevronRight
              size={13}
              color={colors.accent}
              style={{
                transform: [{ rotate: isExpanded ? '90deg' : '0deg' }],
              }}
            />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleShare}
            style={[
              styles.cardShareBtn,
              { backgroundColor: colors.canvas, borderColor: colors.border },
            ]}
            accessibilityLabel="Share Story"
          >
            <Share2 size={11} color={colors.accent} style={{ marginRight: 4 }} />
            <Text style={[styles.cardShareBtnText, { color: colors.textPrimary }]}>
              Share Lore
            </Text>
          </TouchableOpacity>
        </View>

        {isExpanded && (
          <View
            style={[
              styles.loreTakeawayBox,
              { backgroundColor: colors.canvas, borderColor: colors.border },
            ]}
          >
            <Sparkles size={13} color={colors.accent} style={{ marginRight: 6 }} />
            <Text style={[styles.loreTakeawayText, { color: colors.textPrimary }]}>
              {literaryLore.takeaway}
            </Text>
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
  headerBtnGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  actionBtnText: {
    fontFamily: FONTS.mona.medium,
    fontSize: 11,
  },
  cardFooterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  cardShareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  cardShareBtnText: {
    fontFamily: FONTS.mona.semiBold,
    fontSize: 11,
  },
  cardContainer: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
    padding: 16,
  },
  loreHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  loreTagBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  loreTagText: {
    fontFamily: FONTS.mono.bold,
    fontSize: 10,
    letterSpacing: 0.5,
  },
  loreReadTime: {
    fontFamily: FONTS.mono.medium,
    fontSize: 11,
  },
  loreHeadline: {
    fontFamily: FONTS.hubot.bold,
    fontSize: 18,
    letterSpacing: -0.4,
    lineHeight: 22,
    marginBottom: 3,
  },
  loreSubject: {
    fontFamily: FONTS.mona.semiBold,
    fontSize: 12,
    marginBottom: 8,
  },
  loreStory: {
    fontFamily: FONTS.mona.regular,
    fontSize: 13,
    lineHeight: 20,
  },
  loreToggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  loreToggleText: {
    fontFamily: FONTS.mona.bold,
    fontSize: 12,
    marginRight: 2,
  },
  loreTakeawayBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    marginTop: 12,
  },
  loreTakeawayText: {
    fontFamily: FONTS.mona.semiBold,
    fontSize: 12,
    lineHeight: 17,
    flex: 1,
  },
});
