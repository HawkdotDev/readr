import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, Dimensions } from 'react-native';
import { Book } from '../../types';
import { useTheme } from '../common/ThemeProvider';
import { Badge } from '../common/Badge';
import { BookOpen, Heart, Clock } from 'lucide-react-native';
import { formatDurationSeconds } from '../../utils/time';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const GRID_CARD_WIDTH = (SCREEN_WIDTH - 48) / 2;

export interface BookCardProps {
  book: Book;
  viewMode?: 'grid' | 'list';
  onPress: () => void;
  onLongPress?: () => void;
}

export const BookCard: React.FC<BookCardProps> = ({
  book,
  viewMode = 'grid',
  onPress,
  onLongPress,
}) => {
  const { colors } = useTheme();

  const authorName = book.authors && book.authors.length > 0 ? book.authors.map((a) => a.name).join(', ') : 'Unknown Author';
  const progressPercent = Math.round(book.progressPercentage || 0);

  if (viewMode === 'list') {
    return (
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={onPress}
        onLongPress={onLongPress}
        style={[
          styles.listContainer,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
          },
        ] as any}
      >
        {/* Cover thumbnail with 2:3 aspect ratio */}
        <View style={[styles.listCoverWrapper, { backgroundColor: colors.canvas }] as any}>
          {book.coverImagePath ? (
            <Image source={{ uri: book.coverImagePath }} style={styles.listCoverImage} resizeMode="cover" />
          ) : (
            <View style={[styles.placeholderCover, { backgroundColor: colors.accent }] as any}>
              <BookOpen size={20} color={colors.isDark ? '#000000' : '#FFFFFF'} />
            </View>
          )}
        </View>

        {/* Details */}
        <View style={styles.listDetails}>
          <View style={styles.listHeaderRow}>
            <Text style={[styles.listTitle, { color: colors.textPrimary }] as any} numberOfLines={1}>
              {book.title}
            </Text>
            {book.isFavorite && <Heart size={14} color={colors.textPrimary} fill={colors.textPrimary} />}
          </View>

          <Text style={[styles.listAuthor, { color: colors.textSecondary }] as any} numberOfLines={1}>
            {authorName}
          </Text>

          <View style={styles.listFooter}>
            <Badge label={book.fileFormat.toUpperCase()} variant="secondary" />
            <View style={styles.listProgressWrapper}>
              <Text style={[styles.listProgressText, { color: colors.textSecondary }] as any}>
                {progressPercent > 0 ? `${progressPercent}% complete` : 'Unread'}
              </Text>
            </View>
            {book.totalTimeReadSeconds > 0 && (
              <View style={styles.timeTag}>
                <Clock size={12} color={colors.textSecondary} style={{ marginRight: 4 }} />
                <Text style={[styles.timeText, { color: colors.textSecondary }] as any}>
                  {formatDurationSeconds(book.totalTimeReadSeconds)}
                </Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  // Grid Mode with 2:3 aspect ratio cover
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      onLongPress={onLongPress}
      style={[styles.gridContainer, { width: GRID_CARD_WIDTH }] as any}
    >
      {/* 2:3 Aspect Ratio Elevation Cover */}
      <View
        style={[
          styles.gridCoverWrapper,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
          },
        ] as any}
      >
        {book.coverImagePath ? (
          <Image source={{ uri: book.coverImagePath }} style={styles.gridCoverImage} resizeMode="cover" />
        ) : (
          <View style={[styles.gridPlaceholderCover, { backgroundColor: colors.accent }] as any}>
            <BookOpen size={32} color={colors.isDark ? '#000000' : '#FFFFFF'} />
            <Text style={[styles.gridPlaceholderTitle, { color: colors.isDark ? '#000000' : '#FFFFFF' }] as any} numberOfLines={3}>
              {book.title}
            </Text>
          </View>
        )}

        {/* Favorite Icon Badge */}
        {book.isFavorite && (
          <View style={[styles.favoriteBadge, { backgroundColor: colors.isDark ? 'rgba(255, 255, 255, 0.85)' : 'rgba(0, 0, 0, 0.75)' }]}>
            <Heart size={12} color={colors.isDark ? '#000000' : '#FFFFFF'} fill={colors.isDark ? '#000000' : '#FFFFFF'} />
          </View>
        )}

        {/* Progress Bar at bottom of cover */}
        {progressPercent > 0 && (
          <View style={styles.coverProgressBarBackground}>
            <View
              style={[
                styles.coverProgressBarFill,
                { width: `${progressPercent}%`, backgroundColor: colors.accent },
              ] as any}
            />
          </View>
        )}
      </View>

      {/* Grid Book Title & Author */}
      <View style={styles.gridInfo}>
        <Text style={[styles.gridTitle, { color: colors.textPrimary }] as any} numberOfLines={2}>
          {book.title}
        </Text>
        <Text style={[styles.gridAuthor, { color: colors.textSecondary }] as any} numberOfLines={1}>
          {authorName}
        </Text>

        <View style={styles.gridFooterRow}>
          <Badge label={book.fileFormat.toUpperCase()} variant="secondary" />
          <Text style={[styles.gridPercentText, { color: colors.textSecondary }] as any}>
            {progressPercent > 0 ? `${progressPercent}%` : 'New'}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  gridContainer: {
    marginBottom: 20,
  },
  gridCoverWrapper: {
    width: '100%',
    aspectRatio: 2 / 3,
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  gridCoverImage: {
    width: '100%',
    height: '100%',
  },
  gridPlaceholderCover: {
    flex: 1,
    padding: 16,
    justifyContent: 'space-between',
  },
  gridPlaceholderTitle: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: -0.2,
    lineHeight: 18,
  },
  favoriteBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    borderRadius: 12,
    padding: 5,
  },
  coverProgressBarBackground: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
  },
  coverProgressBarFill: {
    height: '100%',
  },
  gridInfo: {
    marginTop: 8,
  },
  gridTitle: {
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 18,
  },
  gridAuthor: {
    fontSize: 12,
    marginTop: 2,
  },
  gridFooterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  gridPercentText: {
    fontSize: 11,
    fontWeight: '600',
  },
  listContainer: {
    flexDirection: 'row',
    borderRadius: 12,
    borderWidth: 1,
    padding: 10,
    marginBottom: 12,
    alignItems: 'center',
  },
  listCoverWrapper: {
    width: 50,
    aspectRatio: 2 / 3,
    borderRadius: 6,
    overflow: 'hidden',
  },
  listCoverImage: {
    width: '100%',
    height: '100%',
  },
  placeholderCover: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listDetails: {
    flex: 1,
    marginLeft: 12,
  },
  listHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  listTitle: {
    fontSize: 15,
    fontWeight: '600',
    flex: 1,
    marginRight: 8,
  },
  listAuthor: {
    fontSize: 13,
    marginTop: 2,
  },
  listFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    gap: 8,
  },
  listProgressWrapper: {
    flex: 1,
  },
  listProgressText: {
    fontSize: 12,
  },
  timeTag: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeText: {
    fontSize: 11,
  },
});
