import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Sheet } from '../common/Sheet';
import { useTheme } from '../common/ThemeProvider';
import { BookFormat, Tag } from '../../types';
import { SortOption } from '../../store/libraryStore';
import {
  Check,
  RotateCcw,
  SlidersHorizontal,
  Clock,
  ArrowDownAZ,
  User,
  TrendingUp,
  Star,
  Tag as TagIcon,
} from 'lucide-react-native';
import { FONTS } from '../../utils/typography';
import * as Haptics from 'expo-haptics';

export interface FilterSortModalProps {
  visible: boolean;
  onClose: () => void;
  selectedFormat: BookFormat | 'all';
  onSelectFormat: (format: BookFormat | 'all') => void;
  sortOption: SortOption;
  onSelectSort: (sort: SortOption) => void;
  allTags?: Tag[];
  selectedTagId?: string | null;
  onSelectTag?: (tagId: string | null) => void;
}

export function FilterSortModal({
  visible,
  onClose,
  selectedFormat,
  onSelectFormat,
  sortOption,
  onSelectSort,
  allTags = [],
  selectedTagId = null,
  onSelectTag,
}: FilterSortModalProps) {
  const { colors } = useTheme();

  const sortOptions: { label: string; value: SortOption; icon: any }[] = [
    { label: 'Recently Active', value: 'recent', icon: Clock },
    { label: 'Highest Rating (5★)', value: 'rating', icon: Star },
    { label: 'Title (A–Z)', value: 'title', icon: ArrowDownAZ },
    { label: 'Author Name', value: 'author', icon: User },
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
    onSelectTag?.(null);
  };

  return (
    <Sheet visible={visible} onClose={onClose} title="More Filters & Sort" maxHeightRatio={0.88}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        style={styles.scroll}
        contentContainerStyle={styles.content}
        nestedScrollEnabled={true}
        keyboardShouldPersistTaps="handled"
        bounces={true}
        overScrollMode="always"
      >
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

        {/* Tag Filter Section */}
        {allTags.length > 0 && (
          <View style={{ marginTop: 18 }}>
            <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>FILTER BY TAG</Text>
            <View style={styles.formatGrid}>
              <TouchableOpacity
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
                  onSelectTag?.(null);
                }}
                style={[
                  styles.formatPill,
                  {
                    backgroundColor: selectedTagId === null ? colors.accent : colors.canvas,
                    borderColor: selectedTagId === null ? colors.accent : colors.border,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.formatPillText,
                    {
                      color: selectedTagId === null ? (colors.isDark ? '#000000' : '#FFFFFF') : colors.textPrimary,
                    },
                  ]}
                >
                  All Tags
                </Text>
              </TouchableOpacity>

              {allTags.map((tag) => {
                const isSelected = selectedTagId === tag.id;
                return (
                  <TouchableOpacity
                    key={tag.id}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
                      onSelectTag?.(isSelected ? null : tag.id);
                    }}
                    style={[
                      styles.formatPill,
                      {
                        backgroundColor: isSelected ? colors.accent : colors.canvas,
                        borderColor: isSelected ? colors.accent : colors.border,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.formatPillText,
                        {
                          color: isSelected ? (colors.isDark ? '#000000' : '#FFFFFF') : colors.textPrimary,
                        },
                      ]}
                    >
                      🏷️ {tag.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}

        {/* Format Filter Section */}
        <Text style={[styles.sectionTitle, { color: colors.textSecondary, marginTop: 18 }]}>
          E-BOOK FORMAT
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
                  styles.formatPill,
                  {
                    backgroundColor: isSelected ? colors.accent : colors.canvas,
                    borderColor: isSelected ? colors.accent : colors.border,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.formatPillText,
                    {
                      color: isSelected ? (colors.isDark ? '#000000' : '#FFFFFF') : colors.textPrimary,
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

        {/* Reset Actions */}
        <TouchableOpacity
          onPress={handleReset}
          style={[styles.resetBtn, { borderColor: colors.border }]}
        >
          <RotateCcw size={14} color={colors.textSecondary} style={{ marginRight: 6 }} />
          <Text style={[styles.resetBtnText, { color: colors.textSecondary }]}>Reset All Filters</Text>
        </TouchableOpacity>
      </ScrollView>
    </Sheet>
  );
}

export default FilterSortModal;

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  content: {
    paddingBottom: 40,
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
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionLabel: {
    fontSize: 13.5,
    letterSpacing: -0.1,
  },
  formatGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  formatPill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  formatPillText: {
    fontSize: 12.5,
  },
  resetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  resetBtnText: {
    fontFamily: FONTS.mona.semiBold,
    fontSize: 13,
  },
});
