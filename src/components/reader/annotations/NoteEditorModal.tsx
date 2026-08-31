import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { HighlightColor } from '../../../types';
import { useTheme } from '../../common/ThemeProvider';
import { ColorPickerRow } from './ColorPickerRow';
import { FONTS } from '../../../utils/typography';

export interface NoteEditorModalProps {
  initialText?: string;
  initialNote?: string;
  initialColor?: HighlightColor;
  onSave: (text: string, color: HighlightColor, note?: string) => void;
  onCancel: () => void;
}

export const NoteEditorModal: React.FC<NoteEditorModalProps> = ({
  initialText = '',
  initialNote = '',
  initialColor = 'charcoal',
  onSave,
  onCancel,
}) => {
  const { colors } = useTheme();
  const [text, setText] = useState(initialText);
  const [note, setNote] = useState(initialNote);
  const [selectedColor, setSelectedColor] = useState<HighlightColor>(initialColor);

  const handleSave = () => {
    if (!text.trim()) return;
    onSave(text.trim(), selectedColor, note.trim() || undefined);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.canvas, borderColor: colors.border }] as any}>
      <Text style={[styles.formLabel, { color: colors.textSecondary }] as any}>
        HIGHLIGHT TEXT
      </Text>
      <TextInput
        value={text}
        onChangeText={setText}
        placeholder="Paste or enter excerpt to highlight..."
        placeholderTextColor={colors.textSecondary}
        style={[styles.textInput, { color: colors.textPrimary, borderColor: colors.border }] as any}
        multiline
      />

      <Text style={[styles.formLabel, { color: colors.textSecondary, marginTop: 10 }] as any}>
        MARKER SHADE
      </Text>
      <ColorPickerRow selectedColor={selectedColor} onSelectColor={setSelectedColor} />

      <Text style={[styles.formLabel, { color: colors.textSecondary, marginTop: 10 }] as any}>
        NOTE (OPTIONAL)
      </Text>
      <TextInput
        value={note}
        onChangeText={setNote}
        placeholder="Add your thoughts or reflections..."
        placeholderTextColor={colors.textSecondary}
        style={[styles.textInput, { color: colors.textPrimary, borderColor: colors.border }] as any}
        multiline
      />

      <View style={styles.formActionRow}>
        <TouchableOpacity
          onPress={onCancel}
          style={[styles.cancelBtn, { borderColor: colors.border }] as any}
          accessible={true}
          accessibilityLabel="Cancel"
        >
          <Text style={[styles.cancelBtnText, { color: colors.textSecondary }] as any}>
            Cancel
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleSave}
          disabled={!text.trim()}
          style={[
            styles.saveBtn,
            {
              backgroundColor: colors.accent,
              opacity: text.trim() ? 1 : 0.5,
            },
          ] as any}
          accessible={true}
          accessibilityLabel="Save Highlight"
        >
          <Text
            style={[
              styles.saveBtnText,
              { color: colors.isDark ? '#000000' : '#FFFFFF' },
            ] as any}
          >
            Save Highlight
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  formLabel: {
    fontFamily: FONTS.mono.bold,
    fontSize: 11,
    letterSpacing: 0.8,
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    fontFamily: FONTS.mona.regular,
    fontSize: 14,
    minHeight: 60,
  },
  formActionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 14,
  },
  cancelBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  cancelBtnText: {
    fontFamily: FONTS.mona.medium,
    fontSize: 13,
  },
  saveBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  saveBtnText: {
    fontFamily: FONTS.mona.semiBold,
    fontSize: 13,
    letterSpacing: -0.1,
  },
});
