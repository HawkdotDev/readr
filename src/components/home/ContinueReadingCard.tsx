import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../common/ThemeProvider';
import { Book } from '../../types';
import { GenerativeEditorialCover } from '../common/GenerativeEditorialCover';
import { OptimizedImage } from '../common/OptimizedImage';
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
      accessible={true}
      accessibilityLabel={`Continue reading ${book.title} by ${authorName}, ${progress}% completed`}
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
          <MoreHorizontal size={17} color={colors.textSecondary} />
        </TouchableOpacity>
      )}

      {/* Left Column: ONLY Book Cover */}
      <View style={styles.coverWrapper}>
        <View style={[styles.coverContainer, { backgroundColor: colors.canvas, borderColor: colors.border }]}>
          {book.coverImagePath ? (
            <OptimizedImage source={{ uri: book.coverImagePath }} style={styles.coverImage} contentFit="cover" priority="high" />
          ) : (
            <GenerativeEditorialCover
              title={book.title}
              author={authorName}
              isCompact={false}
            />
          )}
          <View style={styles.spineSheen} pointerEvents="none" />
        </View>
      </View>

      {/* Right Column: Title, Author, Completion Bar, and Continue Button */}
      <View style={styles.infoCol}>
        {/* Title & Author */}
        <View style={styles.textBlock}>
          <Text style={[styles.title, { color: colors.textPrimary }]} numberOfLines={2}>
            {book.title}
          </Text>
          <Text style={[styles.author, { color: colors.textSecondary }]} numberOfLines={1}>
            {authorName}
          </Text>
        </View>

        {/* Bottom Group: Progress section with meta info over bar, and Continue Reading button below */}
        <View style={styles.bottomGroup}>
          {/* Completion Progress Bar Section */}
          <View style={styles.progressSection}>
            {/* Completion % and Pages Left (Placed Over Completion Bar) */}
            <View style={styles.progressMetaRow}>
              <Text style={[styles.percentageText, { color: colors.textPrimary }]}>
                {progress}% complete
              </Text>
              <Text style={[styles.pagesLeftText, { color: colors.textSecondary }]}>
                {progress >= 100
                  ? 'Completed'
                  : `${pagesLeft} ${pagesLeft === 1 ? 'page' : 'pages'} left · ~${Math.max(1, Math.ceil(pagesLeft * 1.6))}m`}
              </Text>
            </View>

            {/* Completion Progress Bar Track */}
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
          </View>

          {/* Continue Reading Button (Placed Below Completion Bar) */}
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
            <ChevronRight size={15} color={colors.isDark ? '#000000' : '#FFFFFF'} />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    borderRadius: 20,
    borderWidth: 1,
    padding: 13,
    marginBottom: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
    position: 'relative',
  },
  optionsBtn: {
    position: 'absolute',
    top: 11,
    right: 11,
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  coverWrapper: {
    width: 117,
    marginRight: 14,
  },
  coverContainer: {
    width: 117,
    height: 167,
    borderRadius: 11,
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 5,
    elevation: 2,
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  spineSheen: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 3.5,
    backgroundColor: 'rgba(255, 255, 255, 0.20)',
    borderRightWidth: StyleSheet.hairlineWidth,
    borderRightColor: 'rgba(0, 0, 0, 0.25)',
    zIndex: 4,
  },
  infoCol: {
    flex: 1,
    justifyContent: 'space-between',
    paddingVertical: 2,
    alignItems: 'stretch',
  },
  textBlock: {
    paddingRight: 26,
  },
  title: {
    fontFamily: FONTS.mona.bold,
    fontSize: 16,
    lineHeight: 21,
    letterSpacing: -0.3,
    marginBottom: 2,
  },
  author: {
    fontFamily: FONTS.mona.regular,
    fontSize: 12,
  },
  bottomGroup: {
    width: '100%',
  },
  progressSection: {
    width: '100%',
    marginBottom: 11,
  },
  progressMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 6,
  },
  percentageText: {
    fontFamily: FONTS.mona.medium,
    fontSize: 11.5,
    letterSpacing: -0.1,
  },
  pagesLeftText: {
    fontFamily: FONTS.mona.regular,
    fontSize: 11,
    letterSpacing: -0.1,
  },
  progressTrack: {
    height: 4.5,
    borderRadius: 2.25,
    overflow: 'hidden',
    width: '100%',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2.25,
  },
  continueBtn: {
    width: '100%',
    alignSelf: 'stretch',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10.5,
    paddingHorizontal: 16,
    borderRadius: 21,
  },
  continueBtnText: {
    fontFamily: FONTS.mona.bold,
    fontSize: 13,
    letterSpacing: -0.1,
  },
});
