import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  StyleSheet,
  ActivityIndicator,
  useWindowDimensions,
} from 'react-native';
import { useTheme } from '../common/ThemeProvider';
import {
  Compass,
  BookOpen,
  Search,
  Sparkles,
  Heart,
  Clock,
  Bookmark,
  Moon,
  ChevronRight,
  Download,
} from 'lucide-react-native';
import { FONTS } from '../../utils/typography';
import { RecommendedBook } from '../../services/recommendations/recommendationService';
import * as Haptics from 'expo-haptics';

const CARD_GAP = 14;

export interface GenreBook {
  id: string;
  title: string;
  author: string;
  summary?: string;
  coverUrl: string;
  published: string;
  downloadUrl: string;
  fileFormat: 'epub' | 'txt';
  category: string;
}

export interface GenreShowcaseItem {
  id: string;
  name: string;
  subtitle: string;
  color: string;
  iconName: 'philosophy' | 'classics' | 'mystery' | 'gothic' | 'scifi' | 'romance' | 'adventure' | 'history';
  topBook: GenreBook;
  listBooks: GenreBook[];
}

export const GENRE_SHOWCASE_CATALOG: GenreShowcaseItem[] = [
  {
    id: 'genre_philosophy',
    name: 'Philosophy',
    subtitle: 'Stoic & profound thought',
    color: '#10B981',
    iconName: 'philosophy',
    topBook: {
      id: 'gen_seneca_letters',
      title: 'Letters from a Stoic',
      author: 'Lucius Annaeus Seneca',
      summary: 'Timeless Stoic wisdom on resilience, composure, grief, and navigating life with equanimity and purposeful reason.',
      coverUrl: 'https://covers.openlibrary.org/b/isbn/9780140442106-L.jpg',
      published: '65 AD',
      downloadUrl: 'https://standardebooks.org/ebooks/seneca/epistles/richard-mott-gummere/downloads/seneca_epistles_richard-mott-gummere.epub',
      fileFormat: 'epub',
      category: 'Philosophy',
    },
    listBooks: [
      {
        id: 'gen_meditations',
        title: 'Meditations',
        author: 'Marcus Aurelius',
        published: '180 AD',
        coverUrl: 'https://covers.openlibrary.org/b/isbn/9780140449334-L.jpg',
        downloadUrl: 'https://www.gutenberg.org/ebooks/2680.epub3.images',
        fileFormat: 'epub',
        category: 'Philosophy',
      },
      {
        id: 'gen_republic',
        title: 'The Republic',
        author: 'Plato',
        published: '375 BC',
        coverUrl: 'https://covers.openlibrary.org/b/isbn/9780140455113-L.jpg',
        downloadUrl: 'https://www.gutenberg.org/ebooks/1497.epub3.images',
        fileFormat: 'epub',
        category: 'Philosophy',
      },
      {
        id: 'gen_art_of_war',
        title: 'The Art of War',
        author: 'Sun Tzu',
        published: '5th C. BC',
        coverUrl: 'https://covers.openlibrary.org/b/isbn/9780140455526-L.jpg',
        downloadUrl: 'https://standardebooks.org/ebooks/sun-tzu/the-art-of-war/lionel-giles/downloads/sun-tzu_the-art-of-war_lionel-giles.epub',
        fileFormat: 'epub',
        category: 'Philosophy',
      },
    ],
  },
  {
    id: 'genre_classics',
    name: 'Classics',
    subtitle: 'Timeless literary masterworks',
    color: '#F59E0B',
    iconName: 'classics',
    topBook: {
      id: 'gen_dorian_gray',
      title: 'The Picture of Dorian Gray',
      author: 'Oscar Wilde',
      summary: 'A decadent philosophical novel of youth, aesthetic beauty, hedonism, and moral corruption in Victorian London.',
      coverUrl: 'https://covers.openlibrary.org/b/isbn/9780141439570-L.jpg',
      published: '1890',
      downloadUrl: 'https://standardebooks.org/ebooks/oscar-wilde/the-picture-of-dorian-gray/downloads/oscar-wilde_the-picture-of-dorian-gray.epub',
      fileFormat: 'epub',
      category: 'Classics',
    },
    listBooks: [
      {
        id: 'gen_great_gatsby',
        title: 'The Great Gatsby',
        author: 'F. Scott Fitzgerald',
        published: '1925',
        coverUrl: 'https://covers.openlibrary.org/b/isbn/9780743273565-L.jpg',
        downloadUrl: 'https://standardebooks.org/ebooks/f-scott-fitzgerald/the-great-gatsby/downloads/f-scott-fitzgerald_the-great-gatsby.epub',
        fileFormat: 'epub',
        category: 'Classics',
      },
      {
        id: 'gen_metamorphosis',
        title: 'The Metamorphosis',
        author: 'Franz Kafka',
        published: '1915',
        coverUrl: 'https://covers.openlibrary.org/b/isbn/9780143105244-L.jpg',
        downloadUrl: 'https://standardebooks.org/ebooks/franz-kafka/the-metamorphosis/ian-johnston/downloads/franz-kafka_the-metamorphosis_ian-johnston.epub',
        fileFormat: 'epub',
        category: 'Classics',
      },
      {
        id: 'gen_two_cities',
        title: 'A Tale of Two Cities',
        author: 'Charles Dickens',
        published: '1859',
        coverUrl: 'https://covers.openlibrary.org/b/isbn/9780141439600-L.jpg',
        downloadUrl: 'https://www.gutenberg.org/ebooks/98.epub3.images',
        fileFormat: 'epub',
        category: 'Classics',
      },
    ],
  },
  {
    id: 'genre_gothic',
    name: 'Gothic & Horror',
    subtitle: 'Dark, uncanny & atmospheric tales',
    color: '#EC4899',
    iconName: 'gothic',
    topBook: {
      id: 'gen_dracula',
      title: 'Dracula',
      author: 'Bram Stoker',
      summary: 'The archetypal Gothic vampire novel composed through eerie letters, journal entries, and ship logs.',
      coverUrl: 'https://covers.openlibrary.org/b/isbn/9780141439846-L.jpg',
      published: '1897',
      downloadUrl: 'https://standardebooks.org/ebooks/bram-stoker/dracula/downloads/bram-stoker_dracula.epub',
      fileFormat: 'epub',
      category: 'Gothic & Horror',
    },
    listBooks: [
      {
        id: 'gen_frankenstein',
        title: 'Frankenstein',
        author: 'Mary Shelley',
        published: '1818',
        coverUrl: 'https://covers.openlibrary.org/b/isbn/9780141439471-L.jpg',
        downloadUrl: 'https://standardebooks.org/ebooks/mary-shelley/frankenstein/downloads/mary-shelley_frankenstein.epub',
        fileFormat: 'epub',
        category: 'Gothic & Horror',
      },
      {
        id: 'gen_jekyll_hyde',
        title: 'Dr Jekyll & Mr Hyde',
        author: 'Robert Louis Stevenson',
        published: '1886',
        coverUrl: 'https://covers.openlibrary.org/b/isbn/9780141439730-L.jpg',
        downloadUrl: 'https://standardebooks.org/ebooks/robert-louis-stevenson/the-strange-case-of-dr-jekyll-and-mr-hyde/downloads/robert-louis-stevenson_the-strange-case-of-dr-jekyll-and-mr-hyde.epub',
        fileFormat: 'epub',
        category: 'Gothic & Horror',
      },
      {
        id: 'gen_usher',
        title: 'The Fall of the House of Usher',
        author: 'Edgar Allan Poe',
        published: '1839',
        coverUrl: 'https://covers.openlibrary.org/b/isbn/9780141439815-L.jpg',
        downloadUrl: 'https://www.gutenberg.org/ebooks/932.epub3.images',
        fileFormat: 'epub',
        category: 'Gothic & Horror',
      },
    ],
  },
  {
    id: 'genre_mystery',
    name: 'Mystery',
    subtitle: 'Detective investigations & deduction',
    color: '#3B82F6',
    iconName: 'mystery',
    topBook: {
      id: 'gen_sherlock_holmes',
      title: 'The Adventures of Sherlock Holmes',
      author: 'Arthur Conan Doyle',
      summary: 'Twelve iconic detective mysteries featuring the legendary detective Sherlock Holmes and Dr. John Watson.',
      coverUrl: 'https://covers.openlibrary.org/b/isbn/9780141034355-L.jpg',
      published: '1892',
      downloadUrl: 'https://standardebooks.org/ebooks/arthur-conan-doyle/the-adventures-of-sherlock-holmes/downloads/arthur-conan-doyle_the-adventures-of-sherlock-holmes.epub',
      fileFormat: 'epub',
      category: 'Mystery',
    },
    listBooks: [
      {
        id: 'gen_hound_baskervilles',
        title: 'The Hound of the Baskervilles',
        author: 'Arthur Conan Doyle',
        published: '1902',
        coverUrl: 'https://covers.openlibrary.org/b/isbn/9780140437867-L.jpg',
        downloadUrl: 'https://standardebooks.org/ebooks/arthur-conan-doyle/the-hound-of-the-baskervilles/downloads/arthur-conan-doyle_the-hound-of-the-baskervilles.epub',
        fileFormat: 'epub',
        category: 'Mystery',
      },
      {
        id: 'gen_rue_morgue',
        title: 'The Murders in the Rue Morgue',
        author: 'Edgar Allan Poe',
        published: '1841',
        coverUrl: 'https://covers.openlibrary.org/b/isbn/9780141395609-L.jpg',
        downloadUrl: 'https://www.gutenberg.org/ebooks/2147.epub3.images',
        fileFormat: 'epub',
        category: 'Mystery',
      },
      {
        id: 'gen_moonstone',
        title: 'The Moonstone',
        author: 'Wilkie Collins',
        published: '1868',
        coverUrl: 'https://covers.openlibrary.org/b/isbn/9780140434088-L.jpg',
        downloadUrl: 'https://standardebooks.org/ebooks/wilkie-collins/the-moonstone/downloads/wilkie-collins_the-moonstone.epub',
        fileFormat: 'epub',
        category: 'Mystery',
      },
    ],
  },
  {
    id: 'genre_adventure',
    name: 'Adventure',
    subtitle: 'Epic voyages & daring quests',
    color: '#14B8A6',
    iconName: 'adventure',
    topBook: {
      id: 'gen_monte_cristo',
      title: 'The Count of Monte Cristo',
      author: 'Alexandre Dumas',
      summary: 'The ultimate tale of wrongful imprisonment in the Château d’If, daring escape, hidden treasure, and calculated retribution.',
      coverUrl: 'https://covers.openlibrary.org/b/isbn/9780140449266-L.jpg',
      published: '1844',
      downloadUrl: 'https://www.gutenberg.org/ebooks/1184.epub3.images',
      fileFormat: 'epub',
      category: 'Adventure',
    },
    listBooks: [
      {
        id: 'gen_treasure_island',
        title: 'Treasure Island',
        author: 'Robert Louis Stevenson',
        published: '1883',
        coverUrl: 'https://covers.openlibrary.org/b/isbn/9780141321004-L.jpg',
        downloadUrl: 'https://standardebooks.org/ebooks/robert-louis-stevenson/treasure-island/downloads/robert-louis-stevenson_treasure-island.epub',
        fileFormat: 'epub',
        category: 'Adventure',
      },
      {
        id: 'gen_odyssey',
        title: 'The Odyssey',
        author: 'Homer',
        published: '8th C. BC',
        coverUrl: 'https://covers.openlibrary.org/b/isbn/9780140268867-L.jpg',
        downloadUrl: 'https://www.gutenberg.org/ebooks/1727.epub3.images',
        fileFormat: 'epub',
        category: 'Adventure',
      },
      {
        id: 'gen_around_world',
        title: 'Around the World in 80 Days',
        author: 'Jules Verne',
        published: '1872',
        coverUrl: 'https://covers.openlibrary.org/b/isbn/9780140449068-L.jpg',
        downloadUrl: 'https://standardebooks.org/ebooks/jules-verne/around-the-world-in-eighty-days/george-makepeace-towl/downloads/jules-verne_around-the-world-in-eighty-days_george-makepeace-towle.epub',
        fileFormat: 'epub',
        category: 'Adventure',
      },
    ],
  },
  {
    id: 'genre_scifi',
    name: 'Sci-Fi & Fantasy',
    subtitle: 'Speculative worlds & imagination',
    color: '#8B5CF6',
    iconName: 'scifi',
    topBook: {
      id: 'gen_time_machine',
      title: 'The Time Machine',
      author: 'H.G. Wells',
      summary: 'A Victorian scientist invents a device that transports him into the distant future to discover the split destiny of humanity.',
      coverUrl: 'https://covers.openlibrary.org/b/isbn/9780141439976-L.jpg',
      published: '1895',
      downloadUrl: 'https://standardebooks.org/ebooks/h-g-wells/the-time-machine/downloads/h-g-wells_the-time-machine.epub',
      fileFormat: 'epub',
      category: 'Sci-Fi & Fantasy',
    },
    listBooks: [
      {
        id: 'gen_war_worlds',
        title: 'The War of the Worlds',
        author: 'H.G. Wells',
        published: '1898',
        coverUrl: 'https://covers.openlibrary.org/b/isbn/9780141441030-L.jpg',
        downloadUrl: 'https://standardebooks.org/ebooks/h-g-wells/the-war-of-the-worlds/downloads/h-g-wells_the-war-of-the-worlds.epub',
        fileFormat: 'epub',
        category: 'Sci-Fi & Fantasy',
      },
      {
        id: 'gen_20k_leagues',
        title: '20,000 Leagues Under the Seas',
        author: 'Jules Verne',
        published: '1870',
        coverUrl: 'https://covers.openlibrary.org/b/isbn/9780140449495-L.jpg',
        downloadUrl: 'https://standardebooks.org/ebooks/jules-verne/twenty-thousand-leagues-under-the-seas/f-p-walter/downloads/jules-verne_twenty-thousand-leagues-under-the-seas_f-p-walter.epub',
        fileFormat: 'epub',
        category: 'Sci-Fi & Fantasy',
      },
      {
        id: 'gen_alice',
        title: "Alice's Adventures in Wonderland",
        author: 'Lewis Carroll',
        published: '1865',
        coverUrl: 'https://covers.openlibrary.org/b/isbn/9780141439761-L.jpg',
        downloadUrl: 'https://standardebooks.org/ebooks/lewis-carroll/alices-adventures-in-wonderland/downloads/lewis-carroll_alices-adventures-in-wonderland.epub?source=download',
        fileFormat: 'epub',
        category: 'Sci-Fi & Fantasy',
      },
    ],
  },
  {
    id: 'genre_romance',
    name: 'Romance',
    subtitle: 'Courtship, society & passion',
    color: '#EF4444',
    iconName: 'romance',
    topBook: {
      id: 'gen_pride_prejudice',
      title: 'Pride and Prejudice',
      author: 'Jane Austen',
      summary: 'A sparkling romantic comedy following Elizabeth Bennet as she navigates manners, morality, and marriage in Regency England.',
      coverUrl: 'https://covers.openlibrary.org/b/isbn/9780141439518-L.jpg',
      published: '1813',
      downloadUrl: 'https://standardebooks.org/ebooks/jane-austen/pride-and-prejudice/downloads/jane-austen_pride-and-prejudice.epub?source=download',
      fileFormat: 'epub',
      category: 'Romance',
    },
    listBooks: [
      {
        id: 'gen_jane_eyre',
        title: 'Jane Eyre',
        author: 'Charlotte Brontë',
        published: '1847',
        coverUrl: 'https://covers.openlibrary.org/b/isbn/9780141441146-L.jpg',
        downloadUrl: 'https://standardebooks.org/ebooks/charlotte-bronte/jane-eyre/downloads/charlotte-bronte_jane-eyre.epub',
        fileFormat: 'epub',
        category: 'Romance',
      },
      {
        id: 'gen_wuthering_heights',
        title: 'Wuthering Heights',
        author: 'Emily Brontë',
        published: '1847',
        coverUrl: 'https://covers.openlibrary.org/b/isbn/9780141439556-L.jpg',
        downloadUrl: 'https://standardebooks.org/ebooks/emily-bronte/wuthering-heights/downloads/emily-bronte_wuthering-heights.epub',
        fileFormat: 'epub',
        category: 'Romance',
      },
      {
        id: 'gen_sense_sensibility',
        title: 'Sense and Sensibility',
        author: 'Jane Austen',
        published: '1811',
        coverUrl: 'https://covers.openlibrary.org/b/isbn/9780141439662-L.jpg',
        downloadUrl: 'https://standardebooks.org/ebooks/jane-austen/sense-and-sensibility/downloads/jane-austen_sense-and-sensibility.epub',
        fileFormat: 'epub',
        category: 'Romance',
      },
    ],
  },
  {
    id: 'genre_history',
    name: 'History',
    subtitle: 'Past chronicles & civilizations',
    color: '#6366F1',
    iconName: 'history',
    topBook: {
      id: 'gen_decline_fall',
      title: 'The Decline and Fall of Rome',
      author: 'Edward Gibbon',
      summary: 'The monumental historical work tracing Western civilization from the pinnacle of the Roman Empire to the fall of Constantinople.',
      coverUrl: 'https://covers.openlibrary.org/b/isbn/9780140437645-L.jpg',
      published: '1776',
      downloadUrl: 'https://www.gutenberg.org/ebooks/25717.epub3.images',
      fileFormat: 'epub',
      category: 'History',
    },
    listBooks: [
      {
        id: 'gen_histories',
        title: 'The Histories',
        author: 'Herodotus',
        published: '430 BC',
        coverUrl: 'https://covers.openlibrary.org/b/isbn/9780140449082-L.jpg',
        downloadUrl: 'https://www.gutenberg.org/ebooks/2707.epub3.images',
        fileFormat: 'epub',
        category: 'History',
      },
      {
        id: 'gen_peloponnesian',
        title: 'The Peloponnesian War',
        author: 'Thucydides',
        published: '400 BC',
        coverUrl: 'https://covers.openlibrary.org/b/isbn/9780140440393-L.jpg',
        downloadUrl: 'https://www.gutenberg.org/ebooks/7142.epub3.images',
        fileFormat: 'epub',
        category: 'History',
      },
      {
        id: 'gen_twelve_caesars',
        title: 'The Twelve Caesars',
        author: 'Suetonius',
        published: '121 AD',
        coverUrl: 'https://covers.openlibrary.org/b/isbn/9780140455168-L.jpg',
        downloadUrl: 'https://www.gutenberg.org/ebooks/6400.epub3.images',
        fileFormat: 'epub',
        category: 'History',
      },
    ],
  },
];

export interface GenresSectionProps {
  onGenrePress: (genreName: string) => void;
  onBookPress?: (book: RecommendedBook) => void;
  loadingBookId?: string | null;
}

export const GenresSection = React.memo<GenresSectionProps>(({
  onGenrePress,
  onBookPress,
  loadingBookId,
}) => {
  const { colors } = useTheme();
  const { width: screenWidth } = useWindowDimensions();
  const cardWidth = Math.max(280, screenWidth - 32);
  const [activeIndex, setActiveIndex] = useState(0);

  const cardListRef = useRef<FlatList>(null);
  const tabListRef = useRef<FlatList>(null);

  const renderIcon = (iconName: GenreShowcaseItem['iconName'], color: string, size = 16) => {
    switch (iconName) {
      case 'philosophy':
        return <Compass size={size} color={color} />;
      case 'classics':
        return <BookOpen size={size} color={color} />;
      case 'mystery':
        return <Search size={size} color={color} />;
      case 'scifi':
        return <Sparkles size={size} color={color} />;
      case 'gothic':
        return <Moon size={size} color={color} />;
      case 'romance':
        return <Heart size={size} color={color} />;
      case 'adventure':
        return <Compass size={size} color={color} />;
      case 'history':
        return <Clock size={size} color={color} />;
      default:
        return <Bookmark size={size} color={color} />;
    }
  };

  const handleSelectGenre = (index: number) => {
    try {
      Haptics.selectionAsync();
    } catch {}
    setActiveIndex(index);
    cardListRef.current?.scrollToOffset({
      offset: index * (cardWidth + CARD_GAP),
      animated: true,
    });
    tabListRef.current?.scrollToIndex({
      index,
      animated: true,
      viewPosition: 0.5,
    });
  };

  const handleBookSelect = (book: GenreBook) => {
    try {
      Haptics.selectionAsync();
    } catch {}
    if (onBookPress) {
      const recBook: RecommendedBook = {
        id: book.id,
        title: book.title,
        author: book.author,
        summary: book.summary || `${book.title} by ${book.author}`,
        coverUrl: book.coverUrl,
        downloadUrl: book.downloadUrl,
        fileFormat: book.fileFormat,
        category: book.category,
        recommendationReason: `Featured ${book.category}`,
        published: book.published,
      };
      onBookPress(recBook);
    } else {
      onGenrePress(book.category);
    }
  };

  const onMomentumScrollEnd = useCallback((event: any) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / (cardWidth + CARD_GAP));
    if (index >= 0 && index < GENRE_SHOWCASE_CATALOG.length && index !== activeIndex) {
      setActiveIndex(index);
      tabListRef.current?.scrollToIndex({
        index,
        animated: true,
        viewPosition: 0.5,
      });
    }
  }, [activeIndex, cardWidth]);

  return (
    <View style={styles.container}>
      {/* Section Header */}
      <View style={styles.headerRow}>
        <View style={styles.titleWithIcon}>
          <Bookmark size={17} color={colors.accent} style={{ marginRight: 7 }} />
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
            Featured Genres
          </Text>
        </View>

        <TouchableOpacity
          onPress={() => onGenrePress(GENRE_SHOWCASE_CATALOG[activeIndex].name)}
          activeOpacity={0.7}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={[styles.subHint, { color: colors.accent }]}>
            Browse all
          </Text>
        </TouchableOpacity>
      </View>

      {/* Horizontal Category Pill Tabs */}
      <FlatList
        ref={tabListRef}
        data={GENRE_SHOWCASE_CATALOG}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.tabScrollList}
        renderItem={({ item, index }) => {
          const isActive = index === activeIndex;
          return (
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => handleSelectGenre(index)}
              style={[
                styles.tabPill,
                {
                  backgroundColor: isActive ? `${item.color}1E` : colors.surface,
                  borderColor: isActive ? item.color : colors.border,
                },
              ]}
              accessible={true}
              accessibilityLabel={`Genre ${item.name}`}
            >
              <View style={styles.tabIcon}>
                {renderIcon(item.iconName, isActive ? item.color : colors.textSecondary, 14)}
              </View>
              <Text
                style={[
                  styles.tabText,
                  {
                    color: isActive ? item.color : colors.textSecondary,
                    fontFamily: isActive ? FONTS.mona.bold : FONTS.mona.medium,
                  },
                ]}
              >
                {item.name}
              </Text>
            </TouchableOpacity>
          );
        }}
      />

      {/* Horizontal Carousel of Genre Showcase Cards */}
      <FlatList
        ref={cardListRef}
        data={GENRE_SHOWCASE_CATALOG}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.cardScrollList}
        snapToInterval={cardWidth + CARD_GAP}
        snapToAlignment="start"
        decelerationRate="fast"
        getItemLayout={(_, index) => ({
          length: cardWidth + CARD_GAP,
          offset: (cardWidth + CARD_GAP) * index,
          index,
        })}
        onMomentumScrollEnd={onMomentumScrollEnd}
        renderItem={({ item }) => {
          const topBook = item.topBook;
          const isTopLoading = loadingBookId === topBook.id;

          return (
            <View
              style={[
                styles.genreCard,
                {
                  width: cardWidth,
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  shadowColor: '#000',
                  shadowOpacity: colors.isDark ? 0.28 : 0.07,
                },
              ]}
            >
              {/* Card Header: Genre Name, Subtitle & Explore Link */}
              <View style={styles.genreCardHeader}>
                <View style={styles.genreCardHeaderLeft}>
                  <View
                    style={[
                      styles.genreIconCircle,
                      {
                        backgroundColor: `${item.color}1C`,
                        borderColor: `${item.color}35`,
                      },
                    ]}
                  >
                    {renderIcon(item.iconName, item.color, 16)}
                  </View>
                  <View style={{ marginLeft: 9 }}>
                    <Text style={[styles.genreCardTitle, { color: colors.textPrimary }]}>
                      {item.name}
                    </Text>
                    <Text style={[styles.genreCardSubtitle, { color: colors.textSecondary }]}>
                      {item.subtitle}
                    </Text>
                  </View>
                </View>

                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => onGenrePress(item.name)}
                  style={styles.explorePill}
                  accessible={true}
                  accessibilityLabel={`Explore all ${item.name} books`}
                >
                  <Text style={[styles.explorePillText, { color: colors.accent }]}>
                    All
                  </Text>
                  <ChevronRight size={13} color={colors.accent} />
                </TouchableOpacity>
              </View>

              {/* Top Featured Book Card: Book on Left, Details on Right */}
              <TouchableOpacity
                activeOpacity={0.88}
                onPress={() => handleBookSelect(topBook)}
                style={[
                  styles.topBookCard,
                  {
                    backgroundColor: colors.canvas,
                    borderColor: colors.border,
                  },
                ]}
                accessible={true}
                accessibilityLabel={`Featured book: ${topBook.title} by ${topBook.author}`}
              >
                {/* Book Cover on Left */}
                <View
                  style={[
                    styles.topCoverContainer,
                    {
                      backgroundColor: colors.surface,
                      borderColor: colors.border,
                    },
                  ]}
                >
                  {topBook.coverUrl ? (
                    <Image
                      source={{ uri: topBook.coverUrl }}
                      style={styles.topCoverImage}
                      resizeMode="cover"
                    />
                  ) : (
                    <View style={[styles.placeholderCover, { backgroundColor: item.color }]}>
                      <BookOpen size={28} color="#FFFFFF" />
                    </View>
                  )}

                  {/* Format tag badge on cover */}
                  <View style={[styles.formatTag, { backgroundColor: 'rgba(0,0,0,0.65)' }]}>
                    <Text style={styles.formatTagText}>EPUB</Text>
                  </View>
                </View>

                {/* Book Details on Right */}
                <View style={styles.topBookDetails}>
                  <View>
                    <View style={styles.badgeRow}>
                      <View
                        style={[
                          styles.categoryBadge,
                          {
                            backgroundColor: `${item.color}18`,
                            borderColor: `${item.color}35`,
                          },
                        ]}
                      >
                        <Text style={[styles.categoryBadgeText, { color: item.color }]}>
                          {item.name}
                        </Text>
                      </View>
                      <Text style={[styles.yearText, { color: colors.textSecondary }]}>
                        {topBook.published}
                      </Text>
                    </View>

                    <Text
                      style={[styles.topBookTitle, { color: colors.textPrimary }]}
                      numberOfLines={2}
                    >
                      {topBook.title}
                    </Text>
                    <Text
                      style={[styles.topBookAuthor, { color: colors.textSecondary }]}
                      numberOfLines={1}
                    >
                      {topBook.author}
                    </Text>

                    {topBook.summary && (
                      <Text
                        style={[styles.topBookSummary, { color: colors.textSecondary }]}
                        numberOfLines={2}
                      >
                        {topBook.summary}
                      </Text>
                    )}
                  </View>

                  {/* Quick Action Button */}
                  <View style={styles.topCardActionRow}>
                    <TouchableOpacity
                      activeOpacity={0.85}
                      onPress={() => handleBookSelect(topBook)}
                      style={[styles.actionButton, { backgroundColor: colors.accent }]}
                      accessible={true}
                      accessibilityLabel="Read or download book"
                    >
                      {isTopLoading ? (
                        <ActivityIndicator
                          size="small"
                          color={colors.isDark ? '#000000' : '#FFFFFF'}
                        />
                      ) : (
                        <>
                          <Download
                            size={12}
                            color={colors.isDark ? '#000000' : '#FFFFFF'}
                            style={{ marginRight: 5 }}
                          />
                          <Text
                            style={[
                              styles.actionButtonText,
                              { color: colors.isDark ? '#000000' : '#FFFFFF' },
                            ]}
                          >
                            Read Now
                          </Text>
                        </>
                      )}
                    </TouchableOpacity>
                  </View>
                </View>
              </TouchableOpacity>

              {/* Eyebrow Divider */}
              <View style={styles.moreHeaderRow}>
                <Text style={[styles.moreHeaderText, { color: colors.textSecondary }]}>
                  MORE IN {item.name.toUpperCase()}
                </Text>
                <View style={[styles.moreHeaderLine, { backgroundColor: colors.border }]} />
              </View>

              {/* 3 Books in List Manner */}
              <View style={styles.listBooksContainer}>
                {item.listBooks.map((listBook: GenreBook, bIdx: number) => {
                  const isListLoading = loadingBookId === listBook.id;
                  const isLast = bIdx === item.listBooks.length - 1;

                  return (
                    <React.Fragment key={listBook.id}>
                      <TouchableOpacity
                        activeOpacity={0.75}
                        onPress={() => handleBookSelect(listBook)}
                        style={styles.listItemRow}
                        accessible={true}
                        accessibilityLabel={`${listBook.title} by ${listBook.author}`}
                      >
                        {/* Mini Cover */}
                        <View
                          style={[
                            styles.listCoverContainer,
                            {
                              backgroundColor: colors.canvas,
                              borderColor: colors.border,
                            },
                          ]}
                        >
                          {listBook.coverUrl ? (
                            <Image
                              source={{ uri: listBook.coverUrl }}
                              style={styles.listCoverImage}
                              resizeMode="cover"
                            />
                          ) : (
                            <View style={[styles.placeholderMiniCover, { backgroundColor: item.color }]}>
                              <BookOpen size={16} color="#FFFFFF" />
                            </View>
                          )}
                        </View>

                        {/* Middle: Title, Author, Year */}
                        <View style={styles.listInfoCol}>
                          <Text
                            style={[styles.listBookTitle, { color: colors.textPrimary }]}
                            numberOfLines={1}
                          >
                            {listBook.title}
                          </Text>
                          <Text
                            style={[styles.listBookMeta, { color: colors.textSecondary }]}
                            numberOfLines={1}
                          >
                            {listBook.author} · {listBook.published}
                          </Text>
                        </View>

                        {/* Right: Quick Action Pill */}
                        <View style={styles.listActionCol}>
                          {isListLoading ? (
                            <ActivityIndicator size="small" color={colors.accent} />
                          ) : (
                            <View
                              style={[
                                styles.miniActionPill,
                                {
                                  backgroundColor: colors.canvas,
                                  borderColor: colors.border,
                                },
                              ]}
                            >
                              <ChevronRight size={14} color={colors.textSecondary} />
                            </View>
                          )}
                        </View>
                      </TouchableOpacity>

                      {!isLast && (
                        <View style={[styles.listDivider, { backgroundColor: colors.border }]} />
                      )}
                    </React.Fragment>
                  );
                })}
              </View>
            </View>
          );
        }}
      />
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
    marginTop: 4,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
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
    fontSize: 12.5,
    letterSpacing: -0.1,
  },
  tabScrollList: {
    paddingHorizontal: 4,
    gap: 8,
    marginBottom: 14,
  },
  tabPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 7,
    paddingHorizontal: 13,
    borderRadius: 20,
    borderWidth: 1,
  },
  tabIcon: {
    marginRight: 6,
  },
  tabText: {
    fontSize: 12,
    letterSpacing: -0.1,
  },
  cardScrollList: {
    paddingHorizontal: 0,
    gap: CARD_GAP,
  },
  genreCard: {
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 3,
  },
  genreCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  genreCardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  genreIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 11,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  genreCardTitle: {
    fontFamily: FONTS.mona.bold,
    fontSize: 16,
    letterSpacing: -0.2,
  },
  genreCardSubtitle: {
    fontFamily: FONTS.mona.regular,
    fontSize: 11.5,
    letterSpacing: -0.1,
    marginTop: 1,
  },
  explorePill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  explorePillText: {
    fontFamily: FONTS.mona.semiBold,
    fontSize: 12,
    letterSpacing: -0.1,
    marginRight: 1,
  },
  topBookCard: {
    flexDirection: 'row',
    borderRadius: 14,
    borderWidth: 1,
    padding: 13,
    marginBottom: 14,
  },
  topCoverContainer: {
    width: 94,
    height: 140,
    borderRadius: 9,
    borderWidth: 1,
    overflow: 'hidden',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  topCoverImage: {
    width: '100%',
    height: '100%',
  },
  placeholderCover: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  formatTag: {
    position: 'absolute',
    bottom: 4,
    left: 4,
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
  },
  formatTagText: {
    fontFamily: FONTS.mona.bold,
    fontSize: 8.5,
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
  topBookDetails: {
    flex: 1,
    marginLeft: 14,
    justifyContent: 'space-between',
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  categoryBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 5,
    borderWidth: 1,
  },
  categoryBadgeText: {
    fontFamily: FONTS.mona.bold,
    fontSize: 10,
    letterSpacing: -0.1,
  },
  yearText: {
    fontFamily: FONTS.mona.regular,
    fontSize: 10.5,
  },
  topBookTitle: {
    fontFamily: FONTS.mona.bold,
    fontSize: 15,
    lineHeight: 19,
    letterSpacing: -0.2,
    marginBottom: 2,
  },
  topBookAuthor: {
    fontFamily: FONTS.mona.medium,
    fontSize: 12,
    marginBottom: 4,
  },
  topBookSummary: {
    fontFamily: FONTS.mona.regular,
    fontSize: 11,
    lineHeight: 15.5,
  },
  topCardActionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginTop: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 14,
  },
  actionButtonText: {
    fontFamily: FONTS.mona.bold,
    fontSize: 11,
    letterSpacing: -0.1,
  },
  moreHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    marginTop: 2,
  },
  moreHeaderText: {
    fontFamily: FONTS.mona.bold,
    fontSize: 10,
    letterSpacing: 0.6,
    marginRight: 8,
  },
  moreHeaderLine: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
  },
  listBooksContainer: {
    width: '100%',
  },
  listItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  listCoverContainer: {
    width: 40,
    height: 58,
    borderRadius: 6,
    borderWidth: 1,
    overflow: 'hidden',
  },
  listCoverImage: {
    width: '100%',
    height: '100%',
  },
  placeholderMiniCover: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listInfoCol: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  listBookTitle: {
    fontFamily: FONTS.mona.semiBold,
    fontSize: 13,
    letterSpacing: -0.1,
    marginBottom: 2,
  },
  listBookMeta: {
    fontFamily: FONTS.mona.regular,
    fontSize: 11.5,
  },
  listActionCol: {
    marginLeft: 8,
  },
  miniActionPill: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listDivider: {
    height: StyleSheet.hairlineWidth,
    width: '100%',
  },
});
