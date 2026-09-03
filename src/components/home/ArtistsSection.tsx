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
import { Palette } from 'lucide-react-native';
import { FONTS } from '../../utils/typography';
import { ArtistDetailModal } from './ArtistDetailModal';
import * as Haptics from 'expo-haptics';

export interface ArtistItem {
  id: string;
  name: string;
  genre: string;
  initials: string;
  accentColor: string;
  lifespan?: string;
  movement?: string;
  description: string;
  famousWorks?: string[];
  bookCount?: number;
}

export const CURATED_ARTISTS: ArtistItem[] = [
  {
    id: 'art_seneca',
    name: 'Lucius Seneca',
    genre: 'Philosophy',
    initials: 'LS',
    accentColor: '#10B981',
    lifespan: '4 BC – 65 AD',
    movement: 'Roman Stoicism',
    description:
      'Roman Stoic philosopher, statesman, and dramatist whose letters and moral treatises on composure, grief, and the brevity of human existence remain timeless guides to living well.',
    famousWorks: ['Letters from a Stoic', 'On the Shortness of Life', 'Meditations on Grief'],
  },
  {
    id: 'art_austen',
    name: 'Jane Austen',
    genre: 'Romance',
    initials: 'JA',
    accentColor: '#EC4899',
    lifespan: '1775 – 1817',
    movement: 'Regency Realism & Social Satire',
    description:
      'One of the most celebrated English novelists in world literature, known for her sharp social critique, sparkling wit, and poignant exploration of autonomy, courtship, and human character.',
    famousWorks: ['Pride and Prejudice', 'Sense and Sensibility', 'Emma', 'Persuasion'],
  },
  {
    id: 'art_wilde',
    name: 'Oscar Wilde',
    genre: 'Classics',
    initials: 'OW',
    accentColor: '#F59E0B',
    lifespan: '1854 – 1900',
    movement: 'Victorian Aestheticism & Decadence',
    description:
      'Brilliant Irish poet, playwright, and aesthetic visionary known for razor-sharp satire, sparkling paradoxical wit, and daring philosophical examination of art, beauty, and morality.',
    famousWorks: ['The Picture of Dorian Gray', 'The Importance of Being Earnest', 'De Profundis'],
  },
  {
    id: 'art_doyle',
    name: 'Arthur Conan Doyle',
    genre: 'Mystery',
    initials: 'AD',
    accentColor: '#3B82F6',
    lifespan: '1859 – 1930',
    movement: 'Victorian Detective Fiction',
    description:
      'Scottish physician and author whose creation of Sherlock Holmes and Dr. John Watson established the gold standard of forensic investigation, deductive reasoning, and classic detective intrigue.',
    famousWorks: ['A Study in Scarlet', 'The Hound of the Baskervilles', 'The Sign of the Four'],
  },
  {
    id: 'art_shelley',
    name: 'Mary Shelley',
    genre: 'Gothic',
    initials: 'MS',
    accentColor: '#8B5CF6',
    lifespan: '1797 – 1851',
    movement: 'Romanticism & Gothic Sci-Fi',
    description:
      'Visionary English novelist whose masterpiece Frankenstein birthed modern science fiction, exploring the hubris of knowledge, social alienation, and the boundaries of creation.',
    famousWorks: ['Frankenstein', 'The Last Man', 'Mathilda'],
  },
  {
    id: 'art_poe',
    name: 'Edgar Allan Poe',
    genre: 'Horror',
    initials: 'EP',
    accentColor: '#EF4444',
    lifespan: '1809 – 1849',
    movement: 'American Dark Romanticism',
    description:
      'Pioneering American master of macabre gothic tales, psychological mystery, and rhythmic verse whose atmospheric narratives laid the foundations of the modern short story and horror fiction.',
    famousWorks: ['The Raven', 'The Tell-Tale Heart', 'The Fall of the House of Usher'],
  },
  {
    id: 'art_bronte',
    name: 'Charlotte Brontë',
    genre: 'Victorian',
    initials: 'CB',
    accentColor: '#14B8A6',
    lifespan: '1816 – 1855',
    movement: 'Victorian Gothic Romance',
    description:
      'Influential English novelist who revolutionized 19th-century prose by creating fierce, morally complex, and fiercely independent heroines who questioned Victorian societal expectations.',
    famousWorks: ['Jane Eyre', 'Villette', 'Shirley'],
  },
  {
    id: 'art_kafka',
    name: 'Franz Kafka',
    genre: 'Modernism',
    initials: 'FK',
    accentColor: '#F97316',
    lifespan: '1883 – 1924',
    movement: 'Modernist Absurdism',
    description:
      'Bohemian novelist whose surreal, claustrophobic parables capture the disorientation of modern existence, oppressive bureaucratic absurdity, and the struggle for personal meaning.',
    famousWorks: ['The Metamorphosis', 'The Trial', 'The Castle'],
  },
  {
    id: 'art_fitzgerald',
    name: 'F. Scott Fitzgerald',
    genre: 'Classics',
    initials: 'SF',
    accentColor: '#6366F1',
    lifespan: '1896 – 1940',
    movement: 'The Lost Generation & Jazz Age',
    description:
      'Quintessential chronicler of the Jazz Age whose lyrical prose vividly depicted the dazzling glamour, spiritual restlessness, and tragic illusion of the American Dream in the 1920s.',
    famousWorks: ['The Great Gatsby', 'Tender Is the Night', 'This Side of Paradise'],
  },
  {
    id: 'art_tolstoy',
    name: 'Leo Tolstoy',
    genre: 'Realism',
    initials: 'LT',
    accentColor: '#84CC16',
    lifespan: '1828 – 1910',
    movement: 'Russian Realism & Moral Philosophy',
    description:
      'Monumental giant of world literature whose epic panoramic narratives weave historical destiny, spiritual seeking, and intimate human psychology into profound meditations on existence.',
    famousWorks: ['War and Peace', 'Anna Karenina', 'The Death of Ivan Ilyich'],
  },
];

export interface ArtistsSectionProps {
  books?: Book[];
  onArtistPress: (artistName: string) => void;
  onSeeAllPress?: () => void;
}

export const ArtistsSection = React.memo<ArtistsSectionProps>(({
  books = [],
  onArtistPress,
  onSeeAllPress,
}) => {
  const { colors } = useTheme();
  const [selectedArtist, setSelectedArtist] = useState<ArtistItem | null>(null);

  // Combine unique artists from user's library with curated classic artists
  const artistsList = useMemo(() => {
    const map = new Map<string, ArtistItem>();

    // 1. Extract from user's library books
    books.forEach((b) => {
      if (b.authors && b.authors.length > 0) {
        b.authors.forEach((a) => {
          const trimmed = a.name.trim();
          if (trimmed && !map.has(trimmed.toLowerCase())) {
            const words = trimmed.split(' ');
            const initials =
              words.length >= 2
                ? `${words[0][0]}${words[words.length - 1][0]}`.toUpperCase()
                : trimmed.slice(0, 2).toUpperCase();

            map.set(trimmed.toLowerCase(), {
              id: `user_art_${a.id || trimmed}`,
              name: trimmed,
              genre: 'In Library',
              initials,
              accentColor: colors.accent,
              description: `Author featured in your Readr personal collection. Explore and search all titles by ${trimmed} in your library or discover related editions in the catalog.`,
              famousWorks: [b.title],
              bookCount: 1,
            });
          } else if (trimmed && map.has(trimmed.toLowerCase())) {
            const existing = map.get(trimmed.toLowerCase())!;
            existing.bookCount = (existing.bookCount || 1) + 1;
            if (existing.famousWorks && !existing.famousWorks.includes(b.title)) {
              existing.famousWorks.push(b.title);
            }
          }
        });
      }
    });

    // 2. Add curated famous artists if not already in map
    CURATED_ARTISTS.forEach((ca) => {
      if (!map.has(ca.name.toLowerCase())) {
        map.set(ca.name.toLowerCase(), ca);
      }
    });

    return Array.from(map.values()).slice(0, 14);
  }, [books, colors.accent]);

  return (
    <View style={styles.container}>
      {/* Section Header */}
      <View style={styles.headerRow}>
        <View style={styles.titleWithIcon}>
          <Palette size={16} color={colors.accent} style={{ marginRight: 6 }} />
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
            Artists
          </Text>
        </View>

        <Text style={[styles.subHint, { color: colors.textSecondary }]}>
          Tap to view bio
        </Text>
      </View>

      {/* Horizontal Artists Carousel */}
      <FlatList
        data={artistsList}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.scrollList}
        decelerationRate="fast"
        renderItem={({ item }) => {
          return (
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => {
                Haptics.selectionAsync().catch(() => {});
                setSelectedArtist(item);
              }}
              style={styles.artistCard}
              accessible={true}
              accessibilityLabel={`Artist: ${item.name}, ${item.genre}`}
            >
              {/* Square with Rounded Corners Avatar */}
              <View
                style={[
                  styles.avatarSquare,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                    shadowColor: '#000',
                    shadowOpacity: colors.isDark ? 0.3 : 0.08,
                  },
                ]}
              >
                <View
                  style={[
                    styles.avatarSquareInner,
                    {
                      backgroundColor: colors.isDark
                        ? 'rgba(255, 255, 255, 0.06)'
                        : 'rgba(0, 0, 0, 0.04)',
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.initialsText,
                      { color: item.accentColor || colors.accent },
                    ]}
                  >
                    {item.initials}
                  </Text>
                </View>

                {/* Sub-badge dot */}
                <View
                  style={[
                    styles.accentDot,
                    { backgroundColor: item.accentColor || colors.accent },
                  ]}
                />
              </View>

              {/* Artist Name */}
              <Text
                style={[styles.artistName, { color: colors.textPrimary }]}
                numberOfLines={2}
              >
                {item.name}
              </Text>

              {/* Genre / Tag */}
              <Text
                style={[styles.artistGenre, { color: colors.textSecondary }]}
                numberOfLines={1}
              >
                {item.bookCount
                  ? `${item.bookCount} ${item.bookCount === 1 ? 'book' : 'books'}`
                  : item.genre}
              </Text>
            </TouchableOpacity>
          );
        }}
      />

      {/* Artist Description Modal */}
      <ArtistDetailModal
        visible={Boolean(selectedArtist)}
        artist={selectedArtist}
        onClose={() => setSelectedArtist(null)}
        onBrowseBooks={onArtistPress}
      />
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
    marginTop: 6,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
    marginBottom: 14,
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
    paddingHorizontal: 4,
    gap: 14,
  },
  artistCard: {
    width: 96,
    alignItems: 'center',
  },
  avatarSquare: {
    width: 74,
    height: 74,
    borderRadius: 18, // Square with border radius!
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    position: 'relative',
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
    elevation: 3,
  },
  avatarSquareInner: {
    width: 64,
    height: 64,
    borderRadius: 14, // Inner square with border radius!
    alignItems: 'center',
    justifyContent: 'center',
  },
  initialsText: {
    fontFamily: FONTS.mona.bold,
    fontSize: 20,
    letterSpacing: 0.5,
  },
  accentDot: {
    position: 'absolute',
    bottom: 3,
    right: 3,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  artistName: {
    fontFamily: FONTS.mona.bold,
    fontSize: 12.5,
    lineHeight: 16,
    letterSpacing: -0.2,
    textAlign: 'center',
    marginBottom: 2,
  },
  artistGenre: {
    fontFamily: FONTS.mona.regular,
    fontSize: 11,
    letterSpacing: -0.1,
    textAlign: 'center',
  },
});
