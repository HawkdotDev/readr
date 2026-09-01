import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../common/ThemeProvider';
import { Book } from '../../types';
import { BookOpen, ChevronRight, MoreHorizontal } from 'lucide-react-native';
import { FONTS } from '../../utils/typography';

export interface ContinueReadingCardProps {
  book: Book;
  onPress: () => void;
  onLongPress?: () => void;
  onOptionsPress?: () => void;
}

export const ContinueReadingCard = React.memo<ContinueReadingCardProps>(({
  book,
  onPress,
  onLongPress,
  onOptionsPress,
}) => {
  const { colors } = useTheme();

  const authorName =
    book.authors && book.authors.length > 0
      ? book.authors.map((a) => a.name).join(', ')
      : 'Unknown Author';

  const progress = Math.max(0, Math.min(100, Math.round(book.progressPercentage || 0)));

  // Calculate total number of pages left based on book pageCount and progress
  const totalPages = book.pageCount && book.pageCount > 0 ? book.pageCount : 240;
  const pagesRead = Math.round((progress / 100) * totalPages);
  const pagesLeft = Math.max(0, totalPages - pagesRead);

  return (
    <TouchableOpacity
      activeOpacity={0.96}
      onPress={onPress}
      onLongPress={onLongPress}
      delayLongPress={280}
      style={[
        styles.card,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
        },
      ]}
    >
      {/* Top Options Button */}
      {onOptionsPress && (
        <TouchableOpacity
          onPress={onOptionsPress}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          style={[styles.optionsBtn, { backgroundColor: colors.canvas, borderColor: colors.border }]}
          accessible={true}
          accessibilityLabel="Book options"
        >
          <MoreHorizontal size={18} color={colors.textSecondary} />
        </TouchableOpacity>
      )}

      {/* Main Content: Cover + Info */}
      <View style={styles.topRow}>
        {/* Book Cover */}
        <View style={styles.coverWrapper}>
          <View style={[styles.coverContainer, { backgroundColor: colors.canvas, borderColor: colors.border }]}>
            {book.coverImagePath ? (
              <Image source={{ uri: book.coverImagePath }} style={styles.coverImage} resizeMode="cover" />
            ) : (
              <View style={[styles.placeholderCover, { backgroundColor: colors.accent }]}>
                <BookOpen size={36} color={colors.isDark ? '#000000' : '#FFFFFF'} />
              </View>
            )}
          </View>
        </View>

        {/* Book Info */}
        <View style={styles.infoCol}>
          <View style={styles.textBlock}>
            <Text style={[styles.title, { color: colors.textPrimary }]} numberOfLines={2}>
              {book.title}
            </Text>
            <Text style={[styles.author, { color: colors.textSecondary }]} numberOfLines={1}>
              {authorName}
            </Text>
          </View>

          {/* Progress Bar with % completed and pages left below */}
          <View style={styles.progressSection}>
            <View style={[styles.progressTrack, { backgroundColor: colors.border }]}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${Math.max(5, progress)}%`,
                    backgroundColor: colors.accent,
                  },
                ]}
              />
            </View>

            <View style={styles.progressMetaRow}>
              <Text style={[styles.percentageText, { color: colors.textPrimary }]}>
                {progress}% complete
              </Text>
              <Text style={[styles.pagesLeftText, { color: colors.textSecondary }]}>
                {progress >= 100
                  ? 'Completed'
                  : `${pagesLeft} ${pagesLeft === 1 ? 'page' : 'pages'} left`}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Continue Reading Pill Button */}
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.88}
        style={[styles.continueBtn, { backgroundColor: colors.accent }]}
        accessible={true}
        accessibilityLabel="Continue Reading"
      >
        <Text style={[styles.continueBtnText, { color: colors.isDark ? '#000000' : '#FFFFFF' }]}>
          Continue Reading
        </Text>
        <ChevronRight size={18} color={colors.isDark ? '#000000' : '#FFFFFF'} />
      </TouchableOpacity>
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  card: {
    borderRadius: 22,
    borderWidth: 1,
    padding: 15,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
    position: 'relative',
  },
  optionsBtn: {
    position: 'absolute',
    top: 13,
    right: 13,
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  topRow: {
    flexDirection: 'row',
    marginBottom: 13,
  },
  coverWrapper: {
    width: 116,
    marginRight: 15,
  },
  coverContainer: {
    width: 116,
    height: 164,
    borderRadius: 11,
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  placeholderCover: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoCol: {
    flex: 1,
    justifyContent: 'space-between',
    paddingRight: 22,
    paddingVertical: 2,
  },
  textBlock: {
    marginBottom: 8,
  },
  title: {
    fontFamily: FONTS.mona.bold,
    fontSize: 16.5,
    lineHeight: 22,
    letterSpacing: -0.3,
    marginBottom: 3,
  },
  author: {
    fontFamily: FONTS.mona.regular,
    fontSize: 12.5,
  },
  progressSection: {
    marginTop: 'auto',
  },
  progressTrack: {
    height: 4.5,
    borderRadius: 2.25,
    overflow: 'hidden',
    width: '100%',
    marginBottom: 6,
  },
  progressFill: {
    height: '100%',
    borderRadius: 2.25,
  },
  progressMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  percentageText: {
    fontFamily: FONTS.mona.medium,
    fontSize: 12,
    letterSpacing: -0.1,
  },
  pagesLeftText: {
    fontFamily: FONTS.mona.regular,
    fontSize: 11.5,
    letterSpacing: -0.1,
  },
  continueBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 24,
  },
  continueBtnText: {
    fontFamily: FONTS.mona.bold,
    fontSize: 14,
    letterSpacing: -0.1,
  },
});
