import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  Pressable,
  TouchableOpacity,
  StyleSheet,
  Share,
} from 'react-native';
import { useTheme } from '../common/ThemeProvider';
import { Copy, Share2, X, Check } from 'lucide-react-native';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import { FONTS } from '../../utils/typography';

export interface QuoteCardModalProps {
  visible: boolean;
  quoteText: string;
  bookTitle?: string;
  author?: string;
  onClose: () => void;
}

export const QuoteCardModal: React.FC<QuoteCardModalProps> = ({
  visible,
  quoteText,
  bookTitle,
  author,
  onClose,
}) => {
  const { colors } = useTheme();
  const [hasCopied, setHasCopied] = useState(false);

  if (!visible || !quoteText) return null;

  const displayTitle = bookTitle || 'Selected Passage';
  const displayAuthor = author || 'Unknown Author';
  const formattedShareText = `"${quoteText.trim()}"\n\n— ${displayTitle}, ${displayAuthor}\nRead via Readr`;

  const handleCopy = async () => {
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      await Clipboard.setStringAsync(formattedShareText);
      setHasCopied(true);
      setTimeout(() => setHasCopied(false), 2000);
    } catch {}
  };

  const handleShare = async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
      await Share.share({
        message: formattedShareText,
        title: `Quote from ${displayTitle}`,
      });
    } catch {}
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      statusBarTranslucent={true}
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={onClose}
          accessible={true}
          accessibilityLabel="Dismiss quote card"
        />
        <View
          style={[
            styles.cardContainer,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
            },
          ]}
        >
          {/* Close Header */}
          <View style={styles.topHeader}>
            <Text style={[styles.eyebrow, { color: colors.textSecondary }]}>
              EDITORIAL QUOTATION
            </Text>
            <TouchableOpacity
              onPress={onClose}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              style={[styles.closeBtn, { backgroundColor: colors.canvas, borderColor: colors.border }]}
              accessible={true}
              accessibilityLabel="Close Quote Card"
            >
              <X size={15} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Quotation Canvas */}
          <View
            style={[
              styles.quoteCanvas,
              {
                backgroundColor: colors.canvas,
                borderColor: colors.border,
              },
            ]}
          >
            {/* Serif Large Quotation Mark */}
            <Text style={[styles.quoteMark, { color: colors.accent }]}>“</Text>

            {/* Quote Body */}
            <Text style={[styles.quoteBody, { color: colors.textPrimary }]}>
              {quoteText.trim()}
            </Text>

            {/* Delicate Divider */}
            <View style={[styles.divider, { backgroundColor: colors.border }]} />

            {/* Book Meta Footer */}
            <View style={styles.bookMetaRow}>
              <View style={styles.metaTextCol}>
                <Text style={[styles.bookTitle, { color: colors.textPrimary }]} numberOfLines={1}>
                  {displayTitle}
                </Text>
                <Text style={[styles.bookAuthor, { color: colors.textSecondary }]} numberOfLines={1}>
                  {displayAuthor}
                </Text>
              </View>
              <Text style={[styles.readrWatermark, { color: colors.accent }]}>
                READR
              </Text>
            </View>
          </View>

          {/* Action Row */}
          <View style={styles.actionRow}>
            <TouchableOpacity
              onPress={handleCopy}
              style={[
                styles.actionBtn,
                {
                  backgroundColor: colors.canvas,
                  borderColor: colors.border,
                },
              ]}
              accessible={true}
              accessibilityLabel="Copy quote text"
            >
              {hasCopied ? (
                <Check size={16} color="#16A34A" />
              ) : (
                <Copy size={16} color={colors.textPrimary} />
              )}
              <Text style={[styles.actionBtnText, { color: colors.textPrimary }]}>
                {hasCopied ? 'Copied' : 'Copy'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleShare}
              style={[
                styles.actionBtn,
                styles.shareBtn,
                {
                  backgroundColor: colors.accent,
                  borderColor: colors.accent,
                },
              ]}
              accessible={true}
              accessibilityLabel="Share quote card"
            >
              <Share2 size={16} color={colors.isDark ? '#000000' : '#FFFFFF'} />
              <Text
                style={[
                  styles.actionBtnText,
                  { color: colors.isDark ? '#000000' : '#FFFFFF' },
                ]}
              >
                Share Quote
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  cardContainer: {
    width: '100%',
    maxWidth: 380,
    borderRadius: 24,
    borderWidth: 1,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 12,
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  eyebrow: {
    fontFamily: FONTS.mono.bold,
    fontSize: 10.5,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  closeBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quoteCanvas: {
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 18,
    marginBottom: 16,
    position: 'relative',
  },
  quoteMark: {
    fontSize: 42,
    lineHeight: 42,
    fontFamily: FONTS.mona.bold,
    marginBottom: -10,
    opacity: 0.85,
  },
  quoteBody: {
    fontFamily: FONTS.mona.regular,
    fontSize: 15,
    lineHeight: 23,
    letterSpacing: -0.1,
    fontStyle: 'italic',
  },
  divider: {
    height: 1,
    width: '100%',
    marginVertical: 14,
  },
  bookMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  metaTextCol: {
    flex: 1,
    marginRight: 12,
  },
  bookTitle: {
    fontFamily: FONTS.hubot.bold,
    fontSize: 13,
    letterSpacing: -0.2,
  },
  bookAuthor: {
    fontFamily: FONTS.mona.medium,
    fontSize: 11,
    marginTop: 2,
  },
  readrWatermark: {
    fontFamily: FONTS.mono.bold,
    fontSize: 9.5,
    letterSpacing: 1.5,
    opacity: 0.7,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 11,
    borderRadius: 14,
    borderWidth: 1,
    gap: 6,
  },
  shareBtn: {
    flex: 1.4,
  },
  actionBtnText: {
    fontFamily: FONTS.mona.semiBold,
    fontSize: 13,
    letterSpacing: -0.1,
  },
});
