import React from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  StyleSheet,
} from 'react-native';
import { useTheme } from '../common/ThemeProvider';
import { Book } from '../../types';
import { BookOpen, BookMarked } from 'lucide-react-native';
import { FONTS } from '../../utils/typography';
import * as Haptics from 'expo-haptics';

export interface ContinueStartedSectionProps {
  books: Book[];
  onBookPress: (book: Book) => void;
  onBookLongPress?: (book: Book) => void;
}

export const ContinueStartedSection: React.FC<ContinueStartedSectionProps> = ({
  books,
  onBookPress,
  onBookLongPress,
}) => {
  const { colors } = useTheme();

  if (!books || books.length === 0) return null;

  return (
    <View style={styles.container}>
      {/* Section Header */}
      <View style={styles.headerRow}>
        <View style={styles.titleWithIcon}>
          <BookMarked size={16} color={colors.accent} style={{ marginRight: 6 }} />
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
            Books you started
          </Text>
        </View>
        <Text style={[styles.subHint, { color: colors.textSecondary }]}>
          {books.length} in progress
        </Text>
      </View>

      {/* Horizontal Carousel */}
      <FlatList
        data={books}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.scrollList}
        decelerationRate="fast"
        snapToInterval={146}
        renderItem={({ item }) => {
          const authorName =
            item.authors && item.authors.length > 0
              ? item.authors.map((a) => a.name).join(', ')
              : 'Unknown Author';

          const progress = Math.max(0, Math.min(100, Math.round(item.progressPercentage || 0)));
          const totalPages = item.pageCount && item.pageCount > 0 ? item.pageCount : 240;
          const pagesRead = Math.round((progress / 100) * totalPages);
          const pagesLeft = Math.max(0, totalPages - pagesRead);

          return (
            <TouchableOpacity
              activeOpacity={0.88}
              onPress={() => onBookPress(item)}
              onLongPress={() => {
                try {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                } catch {}
                onBookLongPress?.(item);
              }}
              delayLongPress={280}
              style={styles.card}
              accessible={true}
              accessibilityLabel={`Continue reading ${item.title} by ${authorName}, ${progress}% completed`}
            >
              {/* Cover Artwork */}
              <View
                style={[
                  styles.coverContainer,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                    shadowOpacity: colors.isDark ? 0.35 : 0.1,
                  },
                ]}
              >
                {item.coverImagePath ? (
                  <Image source={{ uri: item.coverImagePath }} style={styles.coverImage} resizeMode="cover" />
                ) : (
                  <View style={[styles.placeholderCover, { backgroundColor: colors.accent }]}>
                    <BookOpen size={24} color={colors.isDark ? '#000000' : '#FFFFFF'} />
                  </View>
                )}
              </View>

              {/* Progress Section */}
              <View style={styles.progressContainer}>
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

                <View style={styles.metaRow}>
                  <Text style={[styles.percentageText, { color: colors.textPrimary }]}>
                    {progress}%
                  </Text>
                  <Text style={[styles.pagesLeftText, { color: colors.textSecondary }]}>
                    {pagesLeft}p left
                  </Text>
                </View>
              </View>

              {/* Book Info */}
              <Text
                style={[styles.bookTitle, { color: colors.textPrimary }]}
                numberOfLines={2}
              >
                {item.title}
              </Text>
              <Text
                style={[styles.bookAuthor, { color: colors.textSecondary }]}
                numberOfLines={1}
              >
                {authorName}
              </Text>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    marginTop: 6,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 5,
    marginBottom: 12,
  },
  titleWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionTitle: {
    fontFamily: FONTS.mona.bold,
    fontSize: 18,
    letterSpacing: -0.4,
  },
  subHint: {
    fontFamily: FONTS.mona.medium,
    fontSize: 12,
    letterSpacing: -0.1,
  },
  scrollList: {
    paddingHorizontal: 5,
    gap: 14,
  },
  card: {
    width: 132,
  },
  coverContainer: {
    width: 132,
    height: 186,
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 4,
    marginBottom: 6,
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
  progressContainer: {
    marginBottom: 4,
  },
  progressTrack: {
    height: 3.5,
    borderRadius: 2,
    overflow: 'hidden',
    width: '100%',
    marginBottom: 4,
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  percentageText: {
    fontFamily: FONTS.mona.bold,
    fontSize: 11,
    letterSpacing: -0.1,
  },
  pagesLeftText: {
    fontFamily: FONTS.mona.regular,
    fontSize: 10.5,
    letterSpacing: -0.1,
  },
  bookTitle: {
    fontFamily: FONTS.mona.bold,
    fontSize: 13.5,
    lineHeight: 17,
    letterSpacing: -0.2,
    marginBottom: 2,
  },
  bookAuthor: {
    fontFamily: FONTS.mona.regular,
    fontSize: 11.5,
  },
});
