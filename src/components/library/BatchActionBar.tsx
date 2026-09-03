import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Heart, CheckCircle2, Trash2 } from 'lucide-react-native';
import { useTheme } from '../common/ThemeProvider';
import { FONTS } from '../../utils/typography';

export interface BatchActionBarProps {
  selectedCount: number;
  totalFilteredCount: number;
  onSelectAll: () => void;
  onBatchFavorite: () => void;
  onBatchMarkStatus: (status: 'unread' | 'reading' | 'finished') => void;
  onBatchDelete: () => void;
}

export const BatchActionBar: React.FC<BatchActionBarProps> = React.memo(({
  selectedCount,
  totalFilteredCount,
  onSelectAll,
  onBatchFavorite,
  onBatchMarkStatus,
  onBatchDelete,
}) => {
  const { colors } = useTheme();

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.surface, borderColor: colors.accent },
      ]}
    >
      <TouchableOpacity
        onPress={onSelectAll}
        style={styles.selectAllBtn}
      >
        <Text style={[styles.selectAllText, { color: colors.textPrimary }]}>
          {selectedCount === totalFilteredCount && totalFilteredCount > 0
            ? 'Deselect All'
            : `Select All (${selectedCount}/${totalFilteredCount})`}
        </Text>
      </TouchableOpacity>

      <View style={styles.actionIconsRow}>
        <TouchableOpacity
          onPress={onBatchFavorite}
          disabled={selectedCount === 0}
          style={[
            styles.miniActionBtn,
            { opacity: selectedCount === 0 ? 0.35 : 1 },
          ]}
          accessible={true}
          accessibilityLabel="Favorite selected"
        >
          <Heart size={15} color={colors.accent} />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => onBatchMarkStatus('finished')}
          disabled={selectedCount === 0}
          style={[
            styles.miniActionBtn,
            { opacity: selectedCount === 0 ? 0.35 : 1 },
          ]}
          accessible={true}
          accessibilityLabel="Mark selected finished"
        >
          <CheckCircle2 size={15} color={colors.accent} />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={onBatchDelete}
          disabled={selectedCount === 0}
          style={[
            styles.miniActionBtn,
            { opacity: selectedCount === 0 ? 0.35 : 1 },
          ]}
          accessible={true}
          accessibilityLabel="Delete selected"
        >
          <Trash2 size={15} color="#EF4444" />
        </TouchableOpacity>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 10,
  },
  selectAllBtn: {
    paddingVertical: 4,
  },
  selectAllText: {
    fontFamily: FONTS.mona.semiBold,
    fontSize: 12,
  },
  actionIconsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  miniActionBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
