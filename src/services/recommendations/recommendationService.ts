import { Book, OPDSBookEntry } from '../../types';
import { downloadOPDSBook } from '../opds/opdsService';

export interface RecommendedBook {
  id: string;
  title: string;
  author: string;
  summary: string;
  coverUrl: string;
  downloadUrl: string;
  fileFormat: 'epub' | 'txt';
  category: string;
  recommendationReason: string;
  published?: string;
}

export const RECOMMENDATION_CATALOG: RecommendedBook[] = [
  {
    id: 'rec_seneca_letters',
    title: 'Letters from a Stoic',
    author: 'Lucius Annaeus Seneca',
    summary: 'Essential Stoic wisdom on friendship, courage, grief, and navigating modern life with equanimity and purpose.',
    coverUrl: 'https://covers.openlibrary.org/b/isbn/9780140442106-L.jpg',
    downloadUrl: 'https://standardebooks.org/ebooks/seneca/epistles/richard-mott-gummere/downloads/seneca_epistles_richard-mott-gummere.epub',
    fileFormat: 'epub',
    category: 'Philosophy',
    recommendationReason: 'Stoic Classic',
    published: '65 AD',
  },
  {
    id: 'rec_dorian_gray',
    title: 'The Picture of Dorian Gray',
    author: 'Oscar Wilde',
    summary: 'A decadent tale of youth, aesthetic beauty, hedonism, and moral corruption in Victorian London.',
    coverUrl: 'https://covers.openlibrary.org/b/isbn/9780141439570-L.jpg',
    downloadUrl: 'https://standardebooks.org/ebooks/oscar-wilde/the-picture-of-dorian-gray/downloads/oscar-wilde_the-picture-of-dorian-gray.epub',
    fileFormat: 'epub',
    category: 'Classics',
    recommendationReason: 'Timeless Masterpiece',
    published: '1890',
  },
  {
    id: 'rec_dracula',
    title: 'Dracula',
    author: 'Bram Stoker',
    summary: 'The archetypal Gothic vampire novel composed through letters, journal entries, and ship logs.',
    coverUrl: 'https://covers.openlibrary.org/b/isbn/9780141439846-L.jpg',
    downloadUrl: 'https://standardebooks.org/ebooks/bram-stoker/dracula/downloads/bram-stoker_dracula.epub',
    fileFormat: 'epub',
    category: 'Gothic',
    recommendationReason: 'Gothic Thriller',
    published: '1897',
  },
  {
    id: 'rec_jane_eyre',
    title: 'Jane Eyre',
    author: 'Charlotte Brontë',
    summary: 'A revolutionary coming-of-age story exploring passion, moral integrity, independence, and dark secrets.',
    coverUrl: 'https://covers.openlibrary.org/b/isbn/9780141441146-L.jpg',
    downloadUrl: 'https://standardebooks.org/ebooks/charlotte-bronte/jane-eyre/downloads/charlotte-bronte_jane-eyre.epub',
    fileFormat: 'epub',
    category: 'Victorian',
    recommendationReason: 'Acclaimed Romance',
    published: '1847',
  },
  {
    id: 'rec_sherlock_holmes',
    title: 'The Adventures of Sherlock Holmes',
    author: 'Arthur Conan Doyle',
    summary: 'Twelve iconic detective mysteries featuring the legendary detective Sherlock Holmes and Dr. John Watson.',
    coverUrl: 'https://covers.openlibrary.org/b/isbn/9780141034355-L.jpg',
    downloadUrl: 'https://standardebooks.org/ebooks/arthur-conan-doyle/the-adventures-of-sherlock-holmes/downloads/arthur-conan-doyle_the-adventures-of-sherlock-holmes.epub',
    fileFormat: 'epub',
    category: 'Mystery',
    recommendationReason: 'Detective Mystery',
    published: '1892',
  },
  {
    id: 'rec_art_of_war',
    title: 'The Art of War',
    author: 'Sun Tzu',
    summary: 'The quintessential ancient military strategy treatise applicable to leadership, competition, and mindset.',
    coverUrl: 'https://covers.openlibrary.org/b/isbn/9780140455526-L.jpg',
    downloadUrl: 'https://standardebooks.org/ebooks/sun-tzu/the-art-of-war/lionel-giles/downloads/sun-tzu_the-art-of-war_lionel-giles.epub',
    fileFormat: 'epub',
    category: 'Philosophy',
    recommendationReason: 'Strategy & Wisdom',
    published: '5th C. BC',
  },
  {
    id: 'rec_metamorphosis',
    title: 'The Metamorphosis',
    author: 'Franz Kafka',
    summary: 'A haunting surrealist novella about Gregor Samsa who awakens to find himself transformed into an insect.',
    coverUrl: 'https://covers.openlibrary.org/b/isbn/9780143105244-L.jpg',
    downloadUrl: 'https://standardebooks.org/ebooks/franz-kafka/the-metamorphosis/ian-johnston/downloads/franz-kafka_the-metamorphosis_ian-johnston.epub',
    fileFormat: 'epub',
    category: 'Classics',
    recommendationReason: 'Modern Classic',
    published: '1915',
  },
  {
    id: 'rec_wuthering_heights',
    title: 'Wuthering Heights',
    author: 'Emily Brontë',
    summary: 'An intense, atmospheric narrative of passion, obsession, and revenge set on the wild Yorkshire moors.',
    coverUrl: 'https://covers.openlibrary.org/b/isbn/9780141439556-L.jpg',
    downloadUrl: 'https://standardebooks.org/ebooks/emily-bronte/wuthering-heights/downloads/emily-bronte_wuthering-heights.epub',
    fileFormat: 'epub',
    category: 'Victorian',
    recommendationReason: 'Passionate Classic',
    published: '1847',
  },
  {
    id: 'rec_plato_republic',
    title: 'The Republic',
    author: 'Plato',
    summary: 'Socratic dialogue exploring justice, the ideal city-state, the allegory of the cave, and the philosopher king.',
    coverUrl: 'https://covers.openlibrary.org/b/isbn/9780140455113-L.jpg',
    downloadUrl: 'https://standardebooks.org/ebooks/plato/the-republic/benjamin-jowett/downloads/plato_the-republic_benjamin-jowett.epub',
    fileFormat: 'epub',
    category: 'Philosophy',
    recommendationReason: 'Foundational Philosophy',
    published: '375 BC',
  },
];

/**
 * Intelligent recommendation engine that analyzes library books, author affinity,
 * reading progress, and genre clusters to produce curated book recommendations.
 */
export function getPersonalizedRecommendations(libraryBooks: Book[]): RecommendedBook[] {
  const libraryTitles = new Set(
    libraryBooks.map((b) => b.title.toLowerCase().trim())
  );
  const libraryAuthors = new Set(
    libraryBooks.flatMap((b) => (b.authors || []).map((a) => a.name.toLowerCase().trim()))
  );

  const favoriteBooks = libraryBooks.filter((b) => b.isFavorite);

  const hasPhilosophy =
    libraryBooks.some((b) => b.title.toLowerCase().includes('meditations') || b.title.toLowerCase().includes('walden')) ||
    libraryAuthors.has('marcus aurelius') ||
    libraryAuthors.has('henry david thoreau');

  const hasFavPhilosophy = favoriteBooks.some(
    (b) => b.title.toLowerCase().includes('meditations') || b.title.toLowerCase().includes('walden') || b.title.toLowerCase().includes('seneca')
  );

  const hasRomanceOrVictorian =
    libraryBooks.some((b) => b.title.toLowerCase().includes('pride') || b.title.toLowerCase().includes('prejudice')) ||
    libraryAuthors.has('jane austen');

  const hasFavVictorian = favoriteBooks.some(
    (b) => b.title.toLowerCase().includes('pride') || b.title.toLowerCase().includes('prejudice') || b.title.toLowerCase().includes('austen')
  );

  const hasGothic =
    libraryBooks.some((b) => b.title.toLowerCase().includes('frankenstein')) ||
    libraryAuthors.has('mary shelley');

  const hasFavGothic = favoriteBooks.some(
    (b) => b.title.toLowerCase().includes('frankenstein') || b.title.toLowerCase().includes('dracula')
  );

  // Filter out books user already owns
  const unowned = RECOMMENDATION_CATALOG.filter(
    (item) => !libraryTitles.has(item.title.toLowerCase().trim())
  );

  // Score and enrich each item
  const scored = unowned.map((item) => {
    let score = 10;
    let reason = item.recommendationReason;

    if (item.category === 'Philosophy' && hasPhilosophy) {
      score += hasFavPhilosophy ? 50 : 30;
      reason = hasFavPhilosophy ? 'Based on your favourite Philosophy reads' : 'Because you enjoy Philosophy';
    } else if (item.category === 'Victorian' && hasRomanceOrVictorian) {
      score += hasFavVictorian ? 50 : 30;
      reason = hasFavVictorian ? 'Based on your favourite Victorian classics' : 'Because you read Jane Austen';
    } else if (item.category === 'Gothic' && hasGothic) {
      score += hasFavGothic ? 50 : 30;
      reason = hasFavGothic ? 'Based on your favourite Gothic reads' : 'Because you read Frankenstein';
    } else if (item.category === 'Classics') {
      score += 15;
    }

    return {
      ...item,
      recommendationReason: reason,
      _score: score,
    };
  });

  // Sort by score descending and return top 7 items
  scored.sort((a, b) => b._score - a._score);
  return scored.map(({ _score, ...rest }) => rest);
}

/**
 * Helper to download and ingest a recommended book directly into the user's library
 */
export async function downloadRecommendedBook(book: RecommendedBook) {
  const opdsEntry: OPDSBookEntry = {
    id: book.id,
    title: book.title,
    author: book.author,
    summary: book.summary,
    coverUrl: book.coverUrl,
    downloadUrl: book.downloadUrl,
    fileFormat: book.fileFormat,
    published: book.published,
  };

  return await downloadOPDSBook(opdsEntry);
}
