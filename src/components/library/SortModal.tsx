import React from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet } from 'react-native';
import { ArrowUpDown, Check, X } from 'lucide-react-native';
import { useTheme } from '../common/ThemeProvider';
import { FONTS } from '../../utils/typography';
import * as Haptics from 'expo-haptics';

export type ShelfSortField = 'recent_read' | 'recent_added' | 'title' | 'author' | 'progress' | 'size';

export interface SortModalProps {
  visible: boolean;
  sortBy: ShelfSortField;
  onSelectSort: (sortBy: ShelfSortField) => void;
  onClose: () => void;
}

export const SORT_OPTIONS: { id: ShelfSortField; label: string; desc: string }[] = [
  { id: 'recent_read', label: 'Recently Read', desc: 'Sort by reading activity' },
  { id: 'recent_added', label: 'Recently Added', desc: 'Sort by import date' },
  { id: 'title', label: 'Title (A → Z)', desc: 'Alphabetical order' },
  { id: 'author', label: 'Author (A → Z)', desc: 'Author name order' },
  { id: 'progress', label: 'Reading Progress', desc: 'Highest completion percentage' },
  { id: 'size', label: 'File Size', desc: 'Largest file footprint' },
];

export const SortModal: React.FC<SortModalProps> = React.memo(({
  visible,
  sortBy,
  onSelectSort,
  onClose,
}) => {
  const { colors } = useTheme();

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <View
          style={[
            styles.modalContent,
            { backgroundColor: colors.canvas, borderColor: colors.border },
          ]}
          onStartShouldSetResponder={() => true}
        >
          <View style={styles.header}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <ArrowUpDown size={18} color={colors.accent} />
              <Text style={[styles.title, { color: colors.textPrimary }]}>
                Sort Books By
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={18} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <View style={styles.optionsList}>
            {SORT_OPTIONS.map((opt) => {
              const isSelected = sortBy === opt.id;
              return (
                <TouchableOpacity
                  key={opt.id}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
                    onSelectSort(opt.id);
                    onClose();
                  }}
                  style={[
                    styles.optionItem,
                    {
                      backgroundColor: isSelected ? colors.surface : 'transparent',
                      borderColor: isSelected ? colors.accent : colors.border,
                    },
                  ]}
                >
                  <View style={{ flex: 1 }}>
                    <Text
                      style={[
                        styles.optionTitle,
                        {
                          color: colors.textPrimary,
                          fontFamily: isSelected ? FONTS.mona.bold : FONTS.mona.medium,
                        },
                      ]}
                    >
                      {opt.label}
                    </Text>
                    <Text style={[styles.optionDesc, { color: colors.textSecondary }]}>
                      {opt.desc}
                    </Text>
                  </View>
                  {isSelected && <Check size={16} color={colors.accent} />}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </TouchableOpacity>
    </Modal>
  );
});

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    width: '100%',
    maxWidth: 380,
    borderRadius: 20,
    borderWidth: 1,
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  title: {
    fontFamily: FONTS.mona.bold,
    fontSize: 16,
  },
  closeBtn: {
    padding: 4,
  },
  optionsList: {
    gap: 8,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
  },
  optionTitle: {
    fontSize: 13.5,
  },
  optionDesc: {
    fontSize: 11,
    marginTop: 2,
  },
});
