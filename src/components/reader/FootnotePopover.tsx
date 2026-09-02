import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Pressable,
} from 'react-native';
import { useTheme } from '../common/ThemeProvider';
import { Bookmark, Copy, X } from 'lucide-react-native';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import { FONTS } from '../../utils/typography';

export interface FootnotePopoverProps {
  visible: boolean;
  footnoteId?: string;
  footnoteText?: string;
  footnoteNumber?: string | number;
  onClose: () => void;
}

export const FootnotePopover: React.FC<FootnotePopoverProps> = ({
  visible,
  footnoteId,
  footnoteText,
  footnoteNumber,
  onClose,
}) => {
  const { colors } = useTheme();

  if (!visible || !footnoteText) return null;

  const handleCopy = async () => {
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      await Clipboard.setStringAsync(footnoteText);
      onClose();
    } catch {}
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable
          style={[
            styles.card,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
            },
          ]}
          onPress={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <View style={[styles.header, { borderBottomColor: colors.border }]}>
            <View style={styles.titleRow}>
              <View style={[styles.badge, { backgroundColor: colors.accent + '20' }]}>
                <Bookmark size={13} color={colors.accent} />
              </View>
              <Text style={[styles.title, { color: colors.textPrimary }]}>
                {footnoteNumber ? `Note ${footnoteNumber}` : 'Footnote'}
              </Text>
            </View>

            <TouchableOpacity
              onPress={onClose}
              style={[styles.closeBtn, { backgroundColor: colors.border + '40' }]}
              accessible={true}
              accessibilityLabel="Close Footnote"
            >
              <X size={16} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Footnote Content */}
          <View style={styles.body}>
            <Text
              style={[
                styles.content,
                {
                  color: colors.textPrimary,
                  fontFamily: FONTS.mona.regular,
                },
              ]}
            >
              {footnoteText}
            </Text>
          </View>

          {/* Actions */}
          <View style={[styles.footer, { borderTopColor: colors.border }]}>
            <TouchableOpacity
              onPress={handleCopy}
              style={[styles.actionBtn, { borderColor: colors.border }]}
              accessible={true}
              accessibilityLabel="Copy Footnote Text"
            >
              <Copy size={15} color={colors.textPrimary} />
              <Text style={[styles.actionBtnText, { color: colors.textPrimary }]}>
                Copy Note
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={onClose}
              style={[styles.actionBtn, styles.primaryBtn, { backgroundColor: colors.accent }]}
              accessible={true}
              accessibilityLabel="Return to reading"
            >
              <Text style={styles.primaryBtnText}>
                Done Reading
              </Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'flex-end',
    padding: 16,
    paddingBottom: 32,
  },
  card: {
    borderRadius: 24,
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  badge: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontFamily: FONTS.mono.bold,
    fontSize: 13,
    letterSpacing: 1.1,
    textTransform: 'uppercase',
  },
  closeBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    paddingHorizontal: 22,
    paddingVertical: 18,
    maxHeight: 280,
  },
  content: {
    fontSize: 16,
    lineHeight: 24,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 10,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
  },
  actionBtnText: {
    fontFamily: FONTS.mono.medium,
    fontSize: 12,
  },
  primaryBtn: {
    borderWidth: 0,
  },
  primaryBtnText: {
    fontFamily: FONTS.mono.bold,
    fontSize: 12,
    color: '#FFFFFF',
  },
});
