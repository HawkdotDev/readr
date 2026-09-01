import React from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useTheme } from '../common/ThemeProvider';
import { Book } from '../../types';
import { RecommendedBook, getPersonalizedRecommendations } from '../../services/recommendations/recommendationService';
import { BookOpen, Sparkles, Plus } from 'lucide-react-native';
import { FONTS } from '../../utils/typography';
import * as Haptics from 'expo-haptics';

export interface YouMightLikeSectionProps {
  existingBooks: Book[];
  onBookPress: (book: RecommendedBook) => void;
  loadingBookId?: string | null;
}

export const YouMightLikeSection = React.memo<YouMightLikeSectionProps>(({
  existingBooks,
  onBookPress,
  loadingBookId,
}) => {
  const { colors } = useTheme();

  const recommendations = React.useMemo(() => {
    return getPersonalizedRecommendations(existingBooks);
  }, [existingBooks]);

  if (recommendations.length === 0) return null;

  return (
    <View style={styles.container}>
      {/* Section Header */}
      <View style={styles.headerRow}>
        <View style={styles.titleWithIcon}>
          <Sparkles size={16} color={colors.accent} style={{ marginRight: 6 }} />
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
            You might like
          </Text>
        </View>
        <Text style={[styles.subHint, { color: colors.textSecondary }]}>
          Curated for you
        </Text>
      </View>

      {/* Horizontal Side-Scrolling Carousel */}
      <FlatList
        data={recommendations}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.scrollList}
        decelerationRate="fast"
        snapToInterval={146}
        renderItem={({ item }) => {
          const isLoading = loadingBookId === item.id;

          return (
            <TouchableOpacity
              activeOpacity={0.88}
              onPress={() => {
                try {
                  Haptics.selectionAsync();
                } catch {}
                onBookPress(item);
              }}
              style={styles.card}
              accessible={true}
              accessibilityLabel={`Recommended book: ${item.title} by ${item.author}`}
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
                {item.coverUrl ? (
                  <Image source={{ uri: item.coverUrl }} style={styles.coverImage} resizeMode="cover" />
                ) : (
                  <View style={[styles.placeholderCover, { backgroundColor: colors.accent }]}>
                    <BookOpen size={24} color={colors.isDark ? '#000000' : '#FFFFFF'} />
                  </View>
                )}

                {/* Quick Add overlay button */}
                <View style={[styles.addPill, { backgroundColor: colors.accent }]}>
                  {isLoading ? (
                    <ActivityIndicator size="small" color={colors.isDark ? '#000000' : '#FFFFFF'} />
                  ) : (
                    <Plus size={14} color={colors.isDark ? '#000000' : '#FFFFFF'} strokeWidth={2.5} />
                  )}
                </View>
              </View>

              {/* Thematic Reason Pill */}
              <View
                style={[
                  styles.reasonTag,
                  {
                    backgroundColor: colors.isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)',
                    borderColor: colors.border,
                  },
                ]}
              >
                <Text style={[styles.reasonText, { color: colors.accent }]} numberOfLines={1}>
                  {item.recommendationReason}
                </Text>
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
                {item.author}
              </Text>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    marginBottom: 25,
    marginTop: 10,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    // paddingHorizontal: 20,
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
    marginBottom: 8,
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
  addPill: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  reasonTag: {
    alignSelf: 'flex-start',
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    borderRadius: 6,
    borderWidth: 0.8,
    marginBottom: 4,
    maxWidth: '100%',
  },
  reasonText: {
    fontFamily: FONTS.mona.bold,
    fontSize: 10,
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
