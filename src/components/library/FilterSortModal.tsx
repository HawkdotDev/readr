import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Sheet } from '../common/Sheet';
import { useTheme } from '../common/ThemeProvider';
import { BookFormat } from '../../types';
import { SortOption } from '../../store/libraryStore';
import { Check, RotateCcw, SlidersHorizontal, Clock, ArrowDownAZ, User, TrendingUp } from 'lucide-react-native';
import { FONTS } from '../../utils/typography';
import * as Haptics from 'expo-haptics';

export interface FilterSortModalProps {
  visible: boolean;
  onClose: () => void;
  selectedFormat: BookFormat | 'all';
  onSelectFormat: (format: BookFormat | 'all') => void;
  sortOption: SortOption;
  onSelectSort: (sort: SortOption) => void;
}

export function FilterSortModal({
  visible,
  onClose,
  selectedFormat,
  onSelectFormat,
  sortOption,
  onSelectSort,
}: FilterSortModalProps) {
  const { colors } = useTheme();

  const sortOptions: { label: string; value: SortOption; icon: any }[] = [
    { label: 'Recently Active', value: 'recent', icon: Clock },
    { label: 'Title (A–Z)', value: 'title', icon: ArrowDownAZ },
    { label: 'Author', value: 'author', icon: User },
    { label: 'Reading Progress', value: 'progress', icon: TrendingUp },
  ];

  const formatOptions: { label: string; value: BookFormat | 'all' }[] = [
    { label: 'All Formats', value: 'all' },
    { label: 'EPUB', value: 'epub' },
    { label: 'PDF', value: 'pdf' },
    { label: 'TXT', value: 'txt' },
    { label: 'Markdown', value: 'md' },
    { label: 'CBZ Comic', value: 'cbz' },
  ];

  const handleReset = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    onSelectFormat('all');
    onSelectSort('recent');
  };

  return (
    <Sheet visible={visible} onClose={onClose} title="More Filters & Sort">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* Sort By Section */}
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>SORT BOOKS BY</Text>
        <View style={styles.optionsList}>
          {sortOptions.map((opt) => {
            const isSelected = sortOption === opt.value;
            const Icon = opt.icon;
            return (
              <TouchableOpacity
                key={opt.value}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
                  onSelectSort(opt.value);
                }}
                style={[
                  styles.optionRow,
                  {
                    backgroundColor: isSelected ? colors.canvas : 'transparent',
                    borderColor: isSelected ? colors.accent : colors.border,
                  },
                ]}
              >
                <View style={styles.optionLeft}>
                  <Icon
                    size={16}
                    color={isSelected ? colors.accent : colors.textSecondary}
                    style={{ marginRight: 10 }}
                  />
                  <Text
                    style={[
                      styles.optionLabel,
                      {
                        color: isSelected ? colors.textPrimary : colors.textSecondary,
                        fontFamily: isSelected ? FONTS.mona.bold : FONTS.mona.medium,
                      },
                    ]}
                  >
                    {opt.label}
                  </Text>
                </View>
                {isSelected && <Check size={16} color={colors.accent} />}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Format Filter Section */}
        <Text style={[styles.sectionTitle, { color: colors.textSecondary, marginTop: 20 }]}>
          FILTER BY FILE FORMAT
        </Text>
        <View style={styles.formatGrid}>
          {formatOptions.map((fmt) => {
            const isSelected = selectedFormat === fmt.value;
            return (
              <TouchableOpacity
                key={fmt.value}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
                  onSelectFormat(fmt.value);
                }}
                style={[
                  styles.formatChip,
                  {
                    backgroundColor: isSelected ? colors.accent : colors.surface,
                    borderColor: isSelected ? colors.accent : colors.border,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.formatText,
                    {
                      color: isSelected
                        ? colors.isDark
                          ? '#000000'
                          : '#FFFFFF'
                        : colors.textSecondary,
                      fontFamily: isSelected ? FONTS.mona.bold : FONTS.mona.medium,
                    },
                  ]}
                >
                  {fmt.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Bottom Actions */}
        <View style={styles.bottomRow}>
          <TouchableOpacity
            onPress={handleReset}
            style={[styles.resetBtn, { borderColor: colors.border }]}
          >
            <RotateCcw size={14} color={colors.textSecondary} style={{ marginRight: 6 }} />
            <Text style={[styles.resetBtnText, { color: colors.textSecondary }]}>Reset All</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={onClose}
            style={[styles.doneBtn, { backgroundColor: colors.accent }]}
          >
            <Text style={[styles.doneBtnText, { color: colors.isDark ? '#000000' : '#FFFFFF' }]}>
              Apply Filters
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </Sheet>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: 24,
  },
  sectionTitle: {
    fontFamily: FONTS.mono.bold,
    fontSize: 11,
    letterSpacing: 1.2,
    marginBottom: 10,
    textTransform: 'uppercase',
  },
  optionsList: {
    gap: 8,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionLabel: {
    fontSize: 14,
    letterSpacing: -0.2,
  },
  formatGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  formatChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
  },
  formatText: {
    fontSize: 13,
    letterSpacing: -0.1,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 24,
  },
  resetBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  resetBtnText: {
    fontFamily: FONTS.mona.semiBold,
    fontSize: 13,
  },
  doneBtn: {
    flex: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
  },
  doneBtnText: {
    fontFamily: FONTS.mona.bold,
    fontSize: 13,
    letterSpacing: -0.2,
  },
});
