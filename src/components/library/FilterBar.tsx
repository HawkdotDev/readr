import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { useTheme } from '../common/ThemeProvider';
import { BookFormat } from '../../types';
import { SortOption, LibraryViewMode, LibraryFilterStatus } from '../../store/libraryStore';
import { LayoutGrid, List } from 'lucide-react-native';
import { FONTS } from '../../utils/typography';

export interface FilterBarProps {
  selectedStatus: LibraryFilterStatus;
  onSelectStatus: (status: LibraryFilterStatus) => void;
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
}) => {
  const { colors } = useTheme();

  const statuses: { label: string; value: LibraryFilterStatus }[] = [
    { label: 'All', value: 'all' },
    { label: '★ Favourites', value: 'favorites' },
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
              ]}
              accessible={true}
              accessibilityLabel={`Filter by ${s.label}`}
            >
              <Text
                style={[
                  styles.chipText,
                  {
                    color: isActive
                      ? (colors.isDark ? '#000000' : '#FFFFFF')
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

      {/* View Mode Toggle */}
      <View style={styles.rightActions}>
        <TouchableOpacity
          onPress={onToggleViewMode}
          style={[styles.iconButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          accessible={true}
          accessibilityLabel={`Switch to ${viewMode === 'grid' ? 'list' : 'grid'} view`}
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
  },
});
