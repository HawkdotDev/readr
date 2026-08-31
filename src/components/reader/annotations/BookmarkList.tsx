import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Bookmark } from '../../../types';
import { useTheme } from '../../common/ThemeProvider';
import { Bookmark as BookmarkIcon, Trash2, Plus } from 'lucide-react-native';
import { FONTS } from '../../../utils/typography';

export interface BookmarkListProps {
  bookmarks: Bookmark[];
  onAddBookmark: () => void;
  onDeleteBookmark: (id: string) => void;
  onSelectBookmark?: (bookmark: Bookmark) => void;
}

export const BookmarkList: React.FC<BookmarkListProps> = ({
  bookmarks,
  onAddBookmark,
  onDeleteBookmark,
  onSelectBookmark,
}) => {
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      {/* Quick Bookmark Button */}
      <TouchableOpacity
        onPress={onAddBookmark}
        style={[styles.addBtn, { backgroundColor: colors.canvas, borderColor: colors.border }] as any}
        accessible={true}
        accessibilityLabel="Bookmark Current Page"
      >
        <Plus size={18} color={colors.accent} />
        <Text style={[styles.addBtnText, { color: colors.accent }] as any}>
          Bookmark Current Page
        </Text>
      </TouchableOpacity>

      {bookmarks.length === 0 ? (
        <Text style={[styles.emptyText, { color: colors.textSecondary }] as any}>
          No bookmarks saved yet.
        </Text>
      ) : (
        bookmarks.map((bm) => (
          <TouchableOpacity
            key={bm.id}
            activeOpacity={onSelectBookmark ? 0.7 : 1}
            onPress={() => onSelectBookmark?.(bm)}
            style={[
              styles.bmCard,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
              },
            ] as any}
          >
            <View style={styles.bmHeader}>
              <BookmarkIcon
                size={16}
                color={colors.accent}
                fill={colors.accent}
                style={{ marginRight: 8 }}
              />
              <Text
                style={[styles.bmTitle, { color: colors.textPrimary }] as any}
                numberOfLines={1}
              >
                {bm.title}
              </Text>
              <TouchableOpacity
                onPress={() => onDeleteBookmark(bm.id)}
                style={styles.trashBtn}
                accessible={true}
                accessibilityLabel="Delete bookmark"
              >
                <Trash2 size={16} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
            <Text
              style={[styles.dateText, { color: colors.textSecondary, marginTop: 4 }] as any}
            >
              Saved {new Date(bm.createdAt).toLocaleDateString()}
            </Text>
          </TouchableOpacity>
        ))
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    gap: 6,
  },
  addBtnText: {
    fontFamily: FONTS.mona.semiBold,
    fontSize: 14,
    letterSpacing: -0.1,
  },
  bmCard: {
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  bmHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  bmTitle: {
    fontFamily: FONTS.mona.bold,
    fontSize: 15,
    flex: 1,
    letterSpacing: -0.2,
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
