import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { useTheme } from '../common/ThemeProvider';
import { BookStatus, BookFormat } from '../../types';
import { SortOption, LibraryViewMode } from '../../store/libraryStore';
import { LayoutGrid, List, SlidersHorizontal } from 'lucide-react-native';

export interface FilterBarProps {
  selectedStatus: BookStatus | 'all';
  onSelectStatus: (status: BookStatus | 'all') => void;
  selectedFormat: BookFormat | 'all';
  onSelectFormat: (format: BookFormat | 'all') => void;
  viewMode: LibraryViewMode;
  onToggleViewMode: () => void;
  sortOption: SortOption;
  onSelectSort: (sort: SortOption) => void;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  selectedStatus,
  onSelectStatus,
  viewMode,
  onToggleViewMode,
  sortOption,
  onSelectSort,
}) => {
  const { colors } = useTheme();

  const statuses: { label: string; value: BookStatus | 'all' }[] = [
    { label: 'All', value: 'all' },
    { label: 'Reading', value: 'reading' },
    { label: 'Unread', value: 'unread' },
    { label: 'Finished', value: 'finished' },
  ];

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
              onPress={() => onSelectStatus(s.value)}
              style={[
                styles.chip,
                {
                  backgroundColor: isActive ? colors.accent : colors.surface,
                  borderColor: isActive ? colors.accent : colors.border,
                },
              ] as any}
            >
              <Text
                style={[
                  styles.chipText,
                  { color: isActive ? '#FFFFFF' : colors.textSecondary },
                ] as any}
              >
                {s.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* View Mode & Sort Toggle */}
      <View style={styles.rightActions}>
        <TouchableOpacity
          onPress={onToggleViewMode}
          style={[styles.iconButton, { backgroundColor: colors.surface, borderColor: colors.border }] as any}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          {viewMode === 'grid' ? (
            <List size={18} color={colors.textPrimary} />
          ) : (
            <LayoutGrid size={18} color={colors.textPrimary} />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  scrollContent: {
    flexDirection: 'row',
    gap: 8,
    paddingRight: 12,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
  },
  rightActions: {
    marginLeft: 'auto',
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
