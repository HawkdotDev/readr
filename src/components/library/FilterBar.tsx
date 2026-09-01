import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { useTheme } from '../common/ThemeProvider';
import { BookFormat } from '../../types';
import { SortOption, LibraryFilterStatus } from '../../store/libraryStore';
import { SlidersHorizontal } from 'lucide-react-native';
import { FONTS } from '../../utils/typography';
import { FilterSortModal } from './FilterSortModal';
import * as Haptics from 'expo-haptics';

export interface FilterBarProps {
  selectedStatus: LibraryFilterStatus;
  onSelectStatus: (status: LibraryFilterStatus) => void;
  selectedFormat: BookFormat | 'all';
  onSelectFormat: (format: BookFormat | 'all') => void;
  sortOption: SortOption;
  onSelectSort: (sort: SortOption) => void;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  selectedStatus,
  onSelectStatus,
  selectedFormat,
  onSelectFormat,
  sortOption,
  onSelectSort,
}) => {
  const { colors } = useTheme();
  const [isMoreFiltersOpen, setIsMoreFiltersOpen] = useState(false);

  const statuses: { label: string; value: LibraryFilterStatus }[] = [
    { label: 'All', value: 'all' },
    { label: 'Reading', value: 'reading' },
    { label: 'Unread', value: 'unread' },
    { label: 'Finished', value: 'finished' },
  ];

  const hasExtraFilters = selectedFormat !== 'all' || sortOption !== 'recent';

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Status Chips */}
        {statuses.map((s) => {
          const isActive = selectedStatus === s.value;
          return (
            <TouchableOpacity
              key={s.value}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
                onSelectStatus(s.value);
              }}
              style={[
                styles.chip,
                {
                  backgroundColor: isActive ? colors.accent : colors.surface,
                  borderColor: isActive ? colors.accent : colors.border,
                },
              ]}
              accessible={true}
              accessibilityLabel={`Filter by ${s.label}`}
            >
              <Text
                style={[
                  styles.chipText,
                  {
                    color: isActive
                      ? colors.isDark
                        ? '#000000'
                        : '#FFFFFF'
                      : colors.textSecondary,
                    fontFamily: isActive ? FONTS.mona.bold : FONTS.mona.medium,
                  },
                ]}
              >
                {s.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* More Filters & Sort Button */}
      <View style={styles.rightActions}>
        <TouchableOpacity
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
            setIsMoreFiltersOpen(true);
          }}
          style={[
            styles.iconButton,
            {
              backgroundColor: hasExtraFilters ? colors.canvas : colors.surface,
              borderColor: hasExtraFilters ? colors.accent : colors.border,
            },
          ]}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          accessible={true}
          accessibilityLabel="More Filters and Sorting"
        >
          <SlidersHorizontal
            size={16}
            color={hasExtraFilters ? colors.accent : colors.textPrimary}
          />
          {hasExtraFilters && (
            <View style={[styles.activeDot, { backgroundColor: colors.accent }]} />
          )}
        </TouchableOpacity>
      </View>

      {/* Filter & Sort Bottom Sheet Modal */}
      <FilterSortModal
        visible={isMoreFiltersOpen}
        onClose={() => setIsMoreFiltersOpen(false)}
        selectedFormat={selectedFormat}
        onSelectFormat={onSelectFormat}
        sortOption={sortOption}
        onSelectSort={onSelectSort}
      />
    </View>
  );
};

export default FilterBar;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 2.5,
    paddingBottom: 8,
  },
  scrollContent: {
    paddingHorizontal: 0,
    gap: 8,
    alignItems: 'center',
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipText: {
    fontSize: 12,
    letterSpacing: -0.2,
  },
  rightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 8,
    gap: 8,
  },
  iconButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  activeDot: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 6,
    height: 6,
    borderRadius: 3,
  },
});
