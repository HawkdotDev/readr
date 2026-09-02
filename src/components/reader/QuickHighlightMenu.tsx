import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Pressable,
} from 'react-native';
import { useTheme } from '../common/ThemeProvider';
import { BookOpen, Copy, FileText, Volume2 } from 'lucide-react-native';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import { HighlightColor } from '../../types';
import { FONTS } from '../../utils/typography';

export interface QuickHighlightMenuProps {
  visible: boolean;
  selectedText: string;
  onHighlight: (color: HighlightColor) => void;
  onAddNote: () => void;
  onDictionary: () => void;
  onSpeak: () => void;
  onClose: () => void;
}

const HIGHLIGHT_PALETTE: Array<{ color: HighlightColor; hex: string; label: string }> = [
  { color: 'yellow', hex: '#F59E0B', label: 'Golden Amber' },
  { color: 'mint', hex: '#10B981', label: 'Forest Mint' },
  { color: 'sky', hex: '#0EA5E9', label: 'Ocean Sky' },
  { color: 'coral', hex: '#F43F5E', label: 'Coral Rose' },
  { color: 'charcoal', hex: '#3F3F46', label: 'Slate Charcoal' },
];

export const QuickHighlightMenu: React.FC<QuickHighlightMenuProps> = ({
  visible,
  selectedText,
  onHighlight,
  onAddNote,
  onDictionary,
  onSpeak,
  onClose,
}) => {
  const { colors } = useTheme();

  if (!visible || !selectedText) return null;

  const handleCopy = async () => {
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      await Clipboard.setStringAsync(selectedText);
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
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable
          style={[
            styles.menuPill,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
            },
          ]}
          onPress={(e) => e.stopPropagation()}
        >
          {/* Selected Quote Preview */}
          <View style={[styles.previewRow, { borderBottomColor: colors.border }]}>
            <Text
              style={[
                styles.previewText,
                { color: colors.textPrimary, fontFamily: FONTS.mona.regular },
              ]}
              numberOfLines={2}
            >
              "{selectedText}"
            </Text>
          </View>

          {/* 5 Color Circles */}
          <View style={styles.colorRow}>
            {HIGHLIGHT_PALETTE.map((item) => (
              <TouchableOpacity
                key={item.color}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
                  onHighlight(item.color);
                  onClose();
                }}
                style={[styles.colorDot, { backgroundColor: item.hex }]}
                accessible={true}
                accessibilityLabel={`Highlight in ${item.label}`}
              />
            ))}
          </View>

          {/* Action Buttons Row */}
          <View style={[styles.actionRow, { borderTopColor: colors.border }]}>
            <TouchableOpacity
              onPress={onAddNote}
              style={styles.actionBtn}
              accessible={true}
              accessibilityLabel="Add Note to Highlight"
            >
              <FileText size={16} color={colors.textPrimary} />
              <Text style={[styles.actionLabel, { color: colors.textPrimary }]}>
                Note
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleCopy}
              style={styles.actionBtn}
              accessible={true}
              accessibilityLabel="Copy selected text"
            >
              <Copy size={16} color={colors.textPrimary} />
              <Text style={[styles.actionLabel, { color: colors.textPrimary }]}>
                Copy
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                onDictionary();
                onClose();
              }}
              style={styles.actionBtn}
              accessible={true}
              accessibilityLabel="Look up in Dictionary"
            >
              <BookOpen size={16} color={colors.textPrimary} />
              <Text style={[styles.actionLabel, { color: colors.textPrimary }]}>
                Define
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                onSpeak();
                onClose();
              }}
              style={styles.actionBtn}
              accessible={true}
              accessibilityLabel="Speak text aloud"
            >
              <Volume2 size={16} color={colors.textPrimary} />
              <Text style={[styles.actionLabel, { color: colors.textPrimary }]}>
                Speak
              </Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  menuPill: {
    width: '100%',
    maxWidth: 340,
    borderRadius: 24,
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.3,
    shadowRadius: 28,
    elevation: 16,
  },
  previewRow: {
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  previewText: {
    fontSize: 14,
    lineHeight: 20,
    fontStyle: 'italic',
  },
  colorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  colorDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  actionBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    gap: 4,
  },
  actionLabel: {
    fontFamily: FONTS.mono.medium,
    fontSize: 11,
    letterSpacing: 0.5,
  },
});
