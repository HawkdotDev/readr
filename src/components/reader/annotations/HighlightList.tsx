import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Highlight } from '../../../types';
import { useTheme } from '../../common/ThemeProvider';
import { Trash2 } from 'lucide-react-native';
import { HIGHLIGHT_PALETTE } from './ColorPickerRow';
import { FONTS } from '../../../utils/typography';

export interface HighlightListProps {
  highlights: Highlight[];
  onDeleteHighlight: (id: string) => void;
  onSelectHighlight?: (highlight: Highlight) => void;
}

export const HighlightList: React.FC<HighlightListProps> = ({
  highlights,
  onDeleteHighlight,
  onSelectHighlight,
}) => {
  const { colors } = useTheme();

  if (highlights.length === 0) {
    return (
      <Text style={[styles.emptyText, { color: colors.textSecondary }] as any}>
        No highlights yet in this book.
      </Text>
    );
  }

  return (
    <View style={styles.container}>
      {highlights.map((hl) => {
        const borderShade =
          HIGHLIGHT_PALETTE.find((c) => c.name === hl.color)?.hex || colors.accent;

        return (
          <TouchableOpacity
            key={hl.id}
            activeOpacity={onSelectHighlight ? 0.7 : 1}
            onPress={() => onSelectHighlight?.(hl)}
            style={[
              styles.hlCard,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
                borderLeftColor: borderShade,
              },
            ] as any}
          >
            <Text style={[styles.hlText, { color: colors.textPrimary }] as any}>
              "{hl.selectedText}"
            </Text>

            {hl.note?.content && (
              <View style={[styles.noteBox, { backgroundColor: colors.canvas }] as any}>
                <Text style={[styles.noteContent, { color: colors.textSecondary }] as any}>
                  {hl.note.content}
                </Text>
              </View>
            )}

            <View style={styles.cardFooter}>
              <Text style={[styles.dateText, { color: colors.textSecondary }] as any}>
                {new Date(hl.createdAt).toLocaleDateString()}
              </Text>
              <TouchableOpacity
                onPress={() => onDeleteHighlight(hl.id)}
                style={styles.trashBtn}
                accessible={true}
                accessibilityLabel="Delete highlight"
              >
                <Trash2 size={16} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  hlCard: {
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderLeftWidth: 5,
  },
  hlText: {
    fontFamily: FONTS.mona.regular,
    fontSize: 14,
    fontStyle: 'italic',
    lineHeight: 20,
  },
  noteBox: {
    marginTop: 8,
    padding: 8,
    borderRadius: 6,
  },
  noteContent: {
    fontFamily: FONTS.mona.regular,
    fontSize: 13,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  dateText: {
    fontFamily: FONTS.mono.regular,
    fontSize: 11,
  },
  trashBtn: {
    padding: 4,
  },
  emptyText: {
    fontFamily: FONTS.mona.regular,
    textAlign: 'center',
    paddingVertical: 24,
    fontSize: 14,
  },
});
