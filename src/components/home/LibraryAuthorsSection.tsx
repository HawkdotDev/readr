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
import { Feather, BookOpen, Bookmark, ChevronRight } from 'lucide-react-native';
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

      {/* Horizontal Carousel */}
      <FlatList
        data={authorsList.authors}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.scrollList}
        decelerationRate="fast"
        renderItem={({ item }) => {
          const accent = item.accentColor || colors.accent;
          const topWork =
            item.libraryBooks && item.libraryBooks.length > 0
              ? item.libraryBooks[0].title
              : item.famousWorks && item.famousWorks.length > 0
              ? item.famousWorks[0]
              : null;

          return (
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => {
                Haptics.selectionAsync().catch(() => {});
                setSelectedAuthor(item);
              }}
              style={[
                styles.card,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                },
              ]}
              accessible={true}
              accessibilityLabel={`Author: ${item.name}, ${item.genre}`}
            >
              {/* Thin accent top edge */}
              <View style={[styles.accentEdge, { backgroundColor: accent }]} />

              {/* Monogram */}
              <View
                style={[
                  styles.monogram,
                  {
                    backgroundColor: `${accent}12`,
                    borderColor: `${accent}28`,
                  },
                ]}
              >
                <Text style={[styles.initials, { color: accent }]}>
                  {item.initials}
                </Text>
              </View>

              {/* Name */}
              <Text
                style={[styles.name, { color: colors.textPrimary }]}
                numberOfLines={1}
              >
                {item.name}
              </Text>

              {/* Genre */}
              <Text
                style={[styles.genre, { color: colors.textSecondary }]}
                numberOfLines={1}
              >
                {item.genre}
              </Text>

              {/* Top work */}
              {topWork && (
                <View
                  style={[
                    styles.workRow,
                    { backgroundColor: colors.canvas, borderColor: colors.border },
                  ]}
                >
                  <BookOpen size={10} color={accent} style={{ marginRight: 4 }} />
                  <Text
                    style={[styles.workText, { color: colors.textPrimary }]}
                    numberOfLines={1}
                  >
                    {topWork}
                  </Text>
                </View>
              )}

              {/* Footer */}
              <View style={styles.footer}>
                {item.isLibraryAuthor ? (
                  <View style={[styles.tag, { backgroundColor: `${colors.accent}12` }]}>
                    <Bookmark size={8} color={colors.accent} />
                    <Text style={[styles.tagText, { color: colors.accent }]}>
                      In Library
                    </Text>
                  </View>
                ) : (
                  <View style={[styles.tag, { backgroundColor: `${accent}10` }]}>
                    <Text style={[styles.tagText, { color: accent }]}>
                      {item.lifespan ? item.lifespan.split('–')[0].trim() : 'Classic'}
                    </Text>
                  </View>
                )}
                <ChevronRight size={14} color={colors.textSecondary} />
              </View>
            </TouchableOpacity>
          );
        }}
      />

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
    gap: 10,
  },

  // ── Card ──
  card: {
    width: 156,
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
    paddingBottom: 12,
  },
  accentEdge: {
    height: 3,
    width: '100%',
    opacity: 0.45,
  },

  // ── Monogram ──
  monogram: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 14,
    marginLeft: 12,
    marginBottom: 10,
  },
  initials: {
    fontFamily: FONTS.hubot.bold,
    fontSize: 16,
    letterSpacing: -0.3,
  },

  // ── Text ──
  name: {
    fontFamily: FONTS.mona.bold,
    fontSize: 14,
    letterSpacing: -0.3,
    lineHeight: 18,
    paddingHorizontal: 12,
    marginBottom: 2,
  },
  genre: {
    fontFamily: FONTS.mona.medium,
    fontSize: 11,
    letterSpacing: -0.1,
    paddingHorizontal: 12,
    marginBottom: 10,
    opacity: 0.7,
  },

  // ── Top work ──
  workRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 10,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
    marginBottom: 10,
  },
  workText: {
    fontFamily: FONTS.mona.medium,
    fontSize: 10.5,
    letterSpacing: -0.1,
    flex: 1,
  },

  // ── Footer ──
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
  },
  tagText: {
    fontFamily: FONTS.mona.semiBold,
    fontSize: 10,
    letterSpacing: -0.1,
  },
});
