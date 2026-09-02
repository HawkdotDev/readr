import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, Dimensions } from 'react-native';
import { Book } from '../../types';
import { useTheme } from '../common/ThemeProvider';
import { Badge } from '../common/Badge';
import { BookOpen, Heart, Clock, Star, Check } from 'lucide-react-native';
import { formatDurationSeconds } from '../../utils/time';
import { FONTS } from '../../utils/typography';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const GRID_CARD_WIDTH = (SCREEN_WIDTH - 48) / 2;

export interface BookCardProps {
  book: Book;
  viewMode?: 'grid' | 'list';
  onPress: () => void;
  onLongPress?: () => void;
  isSelectMode?: boolean;
  isSelected?: boolean;
  onSelect?: () => void;
}

export const BookCard = React.memo<BookCardProps>(({
  book,
  viewMode = 'grid',
  onPress,
  onLongPress,
  isSelectMode,
  isSelected,
  onSelect,
}) => {
  const { colors } = useTheme();

  const authorName = book.authors && book.authors.length > 0 ? book.authors.map((a) => a.name).join(', ') : 'Unknown Author';
  const progressPercent = Math.round(book.progressPercentage || 0);

  const handlePress = () => {
    if (isSelectMode && onSelect) {
      onSelect();
    } else {
      onPress();
    }
  };

  if (viewMode === 'list') {
    return (
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={handlePress}
        onLongPress={onLongPress}
        delayLongPress={280}
        style={[
          styles.listContainer,
          {
            backgroundColor: isSelected ? (colors.isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.03)') : colors.surface,
            borderColor: isSelected ? colors.accent : colors.border,
          },
        ] as any}
      >
        {/* Selection checkbox when in select mode */}
        {isSelectMode && (
          <View style={[styles.listSelectCheckbox, { borderColor: isSelected ? colors.accent : colors.border, backgroundColor: isSelected ? colors.accent : 'transparent' }]}>
            {isSelected && <Check size={12} color={colors.isDark ? '#000000' : '#FFFFFF'} />}
          </View>
        )}

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
            {book.rating && book.rating > 0 ? (
              <View style={styles.ratingBadge}>
                <Star size={11} color="#F59E0B" fill="#F59E0B" style={{ marginRight: 3 }} />
                <Text style={[styles.ratingBadgeText, { color: colors.textSecondary }] as any}>{book.rating}</Text>
              </View>
            ) : null}
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
      onPress={handlePress}
      onLongPress={onLongPress}
      delayLongPress={280}
      style={[styles.gridContainer, { width: GRID_CARD_WIDTH }] as any}
    >
      {/* 2:3 Aspect Ratio Elevation Cover */}
      <View
        style={[
          styles.gridCoverWrapper,
          {
            backgroundColor: colors.surface,
            borderColor: isSelected ? colors.accent : colors.border,
            borderWidth: isSelected ? 2 : 1,
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

        {/* Multi-Select Checkbox Badge */}
        {isSelectMode && (
          <View
            style={[
              styles.gridSelectBadge,
              {
                backgroundColor: isSelected ? colors.accent : (colors.isDark ? 'rgba(0,0,0,0.65)' : 'rgba(255,255,255,0.85)'),
                borderColor: isSelected ? colors.accent : colors.border,
              },
            ]}
          >
            {isSelected && <Check size={12} color={colors.isDark ? '#000000' : '#FFFFFF'} />}
          </View>
        )}

        {/* Favorite Icon Badge */}
        {!isSelectMode && book.isFavorite && (
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
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Badge label={book.fileFormat.toUpperCase()} variant="secondary" />
            {book.rating && book.rating > 0 ? (
              <View style={styles.ratingBadge}>
                <Star size={10} color="#F59E0B" fill="#F59E0B" style={{ marginRight: 2 }} />
                <Text style={[styles.ratingBadgeText, { color: colors.textSecondary }] as any}>{book.rating}</Text>
              </View>
            ) : null}
          </View>
          <Text style={[styles.gridPercentText, { color: colors.textSecondary }] as any}>
            {progressPercent > 0 ? `${progressPercent}%` : 'New'}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  gridContainer: {
    marginBottom: 16,
  },
  gridCoverWrapper: {
    width: '100%',
    aspectRatio: 2 / 2.75,
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  gridCoverImage: {
    width: '100%',
    height: '100%',
  },
  gridPlaceholderCover: {
    flex: 1,
    padding: 13,
    justifyContent: 'space-between',
  },
  gridPlaceholderTitle: {
    fontFamily: FONTS.hubot.bold,
    fontSize: 13,
    letterSpacing: -0.2,
    lineHeight: 16,
  },
  gridSelectBadge: {
    position: 'absolute',
    top: 7,
    left: 7,
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  listSelectCheckbox: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  favoriteBadge: {
    position: 'absolute',
    top: 7,
    right: 7,
    borderRadius: 10,
    padding: 4,
  },
  coverProgressBarBackground: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 3.5,
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
  },
  coverProgressBarFill: {
    height: '100%',
  },
  gridInfo: {
    marginTop: 6,
  },
  gridTitle: {
    fontFamily: FONTS.mona.bold,
    fontSize: 13.5,
    lineHeight: 17,
    letterSpacing: -0.2,
  },
  gridAuthor: {
    fontFamily: FONTS.mona.regular,
    fontSize: 11.5,
    marginTop: 1.5,
  },
  gridFooterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  gridPercentText: {
    fontFamily: FONTS.mono.semiBold,
    fontSize: 10.5,
  },
  listContainer: {
    flexDirection: 'row',
    borderRadius: 11,
    borderWidth: 1,
    padding: 8,
    marginBottom: 10,
    alignItems: 'center',
  },
  listCoverWrapper: {
    width: 44,
    aspectRatio: 2 / 3,
    borderRadius: 5,
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
    marginLeft: 10,
  },
  listHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  listTitle: {
    fontFamily: FONTS.mona.bold,
    fontSize: 14,
    flex: 1,
    marginRight: 6,
    letterSpacing: -0.2,
  },
  listAuthor: {
    fontFamily: FONTS.mona.regular,
    fontSize: 12,
    marginTop: 1.5,
  },
  listFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
    gap: 6,
  },
  listProgressWrapper: {
    flex: 1,
  },
  listProgressText: {
    fontFamily: FONTS.mono.regular,
    fontSize: 11,
  },
  timeTag: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeText: {
    fontFamily: FONTS.mono.medium,
    fontSize: 10.5,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 5,
    paddingVertical: 1.5,
    borderRadius: 6,
    backgroundColor: 'rgba(245, 158, 11, 0.12)',
  },
  ratingBadgeText: {
    fontFamily: FONTS.mono.bold,
    fontSize: 10,
    color: '#F59E0B',
  },
});
