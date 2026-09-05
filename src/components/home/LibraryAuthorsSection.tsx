import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useTheme } from '../common/ThemeProvider';
import { Book } from '../../types';
import { Feather, BookOpen, Bookmark, ChevronRight, Sparkles } from 'lucide-react-native';
import { FONTS } from '../../utils/typography';
import { AuthorDetailModal } from './AuthorDetailModal';
import * as Haptics from 'expo-haptics';

import {
  AuthorItem,
  ArtistItem,
  LibraryBookRef,
  CURATED_AUTHORS,
  CURATED_ARTISTS,
  buildLibraryAuthorsList,
} from '../../services/editorial/libraryAuthorsService';

export type { AuthorItem, ArtistItem, LibraryBookRef };
export { CURATED_AUTHORS, CURATED_ARTISTS };

export interface LibraryAuthorsSectionProps {
  books?: Book[];
  onAuthorPress?: (authorName: string) => void;
  onArtistPress?: (artistName: string) => void;
  onSeeAllPress?: () => void;
}

export const LibraryAuthorsSection = React.memo<LibraryAuthorsSectionProps>(({
  books = [],
  onAuthorPress,
  onArtistPress,
  onSeeAllPress,
}) => {
  const { colors } = useTheme();
  const [selectedAuthor, setSelectedAuthor] = useState<AuthorItem | null>(null);

  const handlePress = onAuthorPress || onArtistPress || (() => {});

  // Aggregate user library authors and combine with curated classics
  const authorsList = useMemo(() => {
    const res = buildLibraryAuthorsList(books);
    return {
      authors: res.authors.slice(0, 16),
      libraryCount: res.libraryCount,
    };
  }, [books]);

  return (
    <View style={styles.container}>
      {/* Section Header */}
      <View style={styles.headerRow}>
        <View style={styles.titleGroup}>
          <View style={styles.eyebrowRow}>
            <Feather size={12} color={colors.accent} style={{ marginRight: 6 }} />
            <Text style={[styles.eyebrowText, { color: colors.textSecondary }]}>
              LITERARY CREATORS
            </Text>
          </View>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
            Library Authors
          </Text>
        </View>

        {authorsList.libraryCount > 0 && (
          <View
            style={[
              styles.countPill,
              { backgroundColor: colors.canvas, borderColor: colors.border },
            ]}
          >
            <Bookmark size={11} color={colors.accent} style={{ marginRight: 4 }} />
            <Text style={[styles.countPillText, { color: colors.textPrimary }]}>
              {authorsList.libraryCount} in library
            </Text>
          </View>
        )}
      </View>

      {/* Horizontal Authors Carousel */}
      <FlatList
        data={authorsList.authors}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.scrollList}
        decelerationRate="fast"
        renderItem={({ item }) => {
          const accent = item.accentColor || colors.accent;
          const primaryWork =
            item.libraryBooks && item.libraryBooks.length > 0
              ? item.libraryBooks[0].title
              : item.famousWorks && item.famousWorks.length > 0
              ? item.famousWorks[0]
              : null;

          return (
            <TouchableOpacity
              activeOpacity={0.86}
              onPress={() => {
                Haptics.selectionAsync().catch(() => {});
                setSelectedAuthor(item);
              }}
              style={[
                styles.authorCard,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                },
              ]}
              accessible={true}
              accessibilityLabel={`Author: ${item.name}, ${item.genre}`}
            >
              {/* Card Top Row: Crest & Badge */}
              <View style={styles.cardTopRow}>
                {/* Monogram Crest */}
                <View
                  style={[
                    styles.avatarCrest,
                    {
                      backgroundColor: colors.canvas,
                      borderColor: `${accent}40`,
                    },
                  ]}
                >
                  <Text style={[styles.initialsText, { color: accent }]}>
                    {item.initials}
                  </Text>
                </View>

                {/* Status / Category Pill */}
                {item.isLibraryAuthor ? (
                  <View
                    style={[
                      styles.statusPill,
                      {
                        backgroundColor: `${colors.accent}14`,
                        borderColor: `${colors.accent}30`,
                      },
                    ]}
                  >
                    <Bookmark size={9} color={colors.accent} style={{ marginRight: 3 }} />
                    <Text style={[styles.statusPillText, { color: colors.accent }]}>
                      {item.bookCount || 1} {item.bookCount === 1 ? 'Book' : 'Books'}
                    </Text>
                  </View>
                ) : (
                  <View
                    style={[
                      styles.statusPill,
                      {
                        backgroundColor: `${accent}12`,
                        borderColor: `${accent}25`,
                      },
                    ]}
                  >
                    <Text
                      style={[styles.statusPillText, { color: accent }]}
                      numberOfLines={1}
                    >
                      {item.genre.split(' ')[0]}
                    </Text>
                  </View>
                )}
              </View>

              {/* Author Name & Movement */}
              <View style={styles.nameBlock}>
                <Text
                  style={[styles.authorName, { color: colors.textPrimary }]}
                  numberOfLines={2}
                >
                  {item.name}
                </Text>
                <Text
                  style={[styles.authorMovement, { color: colors.textSecondary }]}
                  numberOfLines={1}
                >
                  {item.movement || item.genre}
                </Text>
              </View>

              {/* Micro-Shelf Preview Box */}
              {primaryWork && (
                <View
                  style={[
                    styles.microShelfBox,
                    {
                      backgroundColor: colors.canvas,
                      borderColor: colors.border,
                    },
                  ]}
                >
                  <BookOpen size={11} color={accent} style={{ marginRight: 5 }} />
                  <Text
                    style={[styles.microShelfText, { color: colors.textPrimary }]}
                    numberOfLines={1}
                  >
                    {primaryWork}
                  </Text>
                </View>
              )}

              {/* Card Bottom: View Profile CTA */}
              <View style={styles.cardFooter}>
                <Text style={[styles.cardFooterText, { color: colors.accent }]}>
                  View Profile
                </Text>
                <ChevronRight size={11} color={colors.accent} />
              </View>
            </TouchableOpacity>
          );
        }}
      />

      {/* Redesigned Author Description Bottom Sheet */}
      <AuthorDetailModal
        visible={Boolean(selectedAuthor)}
        author={selectedAuthor}
        onClose={() => setSelectedAuthor(null)}
        onBrowseBooks={handlePress}
      />
    </View>
  );
});

// Backward compatibility alias
export const ArtistsSection = LibraryAuthorsSection;
export type ArtistsSectionProps = LibraryAuthorsSectionProps;

const styles = StyleSheet.create({
  container: {
    marginBottom: 26,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 14,
    paddingHorizontal: 2,
  },
  titleGroup: {
    flex: 1,
  },
  eyebrowRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 3,
  },
  eyebrowText: {
    fontFamily: FONTS.mono.bold,
    fontSize: 10.5,
    letterSpacing: 1.1,
    textTransform: 'uppercase',
  },
  sectionTitle: {
    fontFamily: FONTS.hubot.bold,
    fontSize: 20,
    letterSpacing: -0.5,
    lineHeight: 24,
  },
  countPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
  },
  countPillText: {
    fontFamily: FONTS.mona.semiBold,
    fontSize: 11,
    letterSpacing: -0.1,
  },
  scrollList: {
    paddingRight: 20,
    gap: 12,
  },
  authorCard: {
    width: 182,
    padding: 14,
    borderRadius: 20,
    borderWidth: 1,
    justifyContent: 'space-between',
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  avatarCrest: {
    width: 44,
    height: 44,
    borderRadius: 14,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initialsText: {
    fontFamily: FONTS.hubot.bold,
    fontSize: 17,
    letterSpacing: -0.2,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    maxWidth: 90,
  },
  statusPillText: {
    fontFamily: FONTS.mona.bold,
    fontSize: 10,
    letterSpacing: -0.2,
  },
  nameBlock: {
    marginBottom: 10,
  },
  authorName: {
    fontFamily: FONTS.mona.bold,
    fontSize: 15,
    lineHeight: 19,
    letterSpacing: -0.3,
    marginBottom: 3,
  },
  authorMovement: {
    fontFamily: FONTS.mona.medium,
    fontSize: 11.5,
    letterSpacing: -0.1,
  },
  microShelfBox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 10,
  },
  microShelfText: {
    fontFamily: FONTS.mona.medium,
    fontSize: 11,
    letterSpacing: -0.1,
    flex: 1,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 4,
  },
  cardFooterText: {
    fontFamily: FONTS.mona.bold,
    fontSize: 11,
    letterSpacing: -0.1,
  },
});
