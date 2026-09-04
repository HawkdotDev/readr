export interface OpeningSentenceItem {
  id: string;
  openingSentence: string;
  title: string;
  author: string;
  year: number;
  genre: string;
  significance: string;
  coverUrl?: string;
  epubDownloadUrl?: string;
}

export const FAMOUS_OPENING_LINES: OpeningSentenceItem[] = [
  {
    id: 'open_orwell_1984',
    openingSentence: 'It was a bright cold day in April, and the clocks were striking thirteen.',
    title: '1984',
    author: 'George Orwell',
    year: 1949,
    genre: 'Dystopian Fiction',
    significance:
      'With a single impossible chime ("thirteen"), Orwell immediately disorients the reader and establishes the unnatural, totalitarian disruption of reality under Ingsoc.',
    coverUrl: 'https://covers.openlibrary.org/b/isbn/9780451524935-L.jpg',
  },
  {
    id: 'open_melville_moby',
    openingSentence: 'Call me Ishmael.',
    title: 'Moby-Dick',
    author: 'Herman Melville',
    year: 1851,
    genre: 'Epic Maritime Tragedy',
    significance:
      'Just three monosyllabic words. The narrator does not say his name is Ishmael, but commands the reader to call him that—conjuring the biblical outcast and solitary wanderer.',
    coverUrl: 'https://covers.openlibrary.org/b/isbn/9780142437247-L.jpg',
  },
  {
    id: 'open_dickens_twocities',
    openingSentence:
      'It was the best of times, it was the worst of times, it was the age of wisdom, it was the age of foolishness...',
    title: 'A Tale of Two Cities',
    author: 'Charles Dickens',
    year: 1859,
    genre: 'Historical Classics',
    significance:
      'The definitive demonstration of rhetorical antithesis in English prose, capturing the explosive contradictions of the French Revolution and human civilization.',
    coverUrl: 'https://covers.openlibrary.org/b/isbn/9780141439600-L.jpg',
  },
  {
    id: 'open_garcia_solitude',
    openingSentence:
      'Many years later, as he faced the firing squad, Colonel Aureliano Buendía was to remember that distant afternoon when his father took him to discover ice.',
    title: 'One Hundred Years of Solitude',
    author: 'Gabriel García Márquez',
    year: 1967,
    genre: 'Magical Realism',
    significance:
      'A masterclass in temporal orchestration that compresses past, present, and impending death into a single miraculous memory.',
    coverUrl: 'https://covers.openlibrary.org/b/isbn/9780060883287-L.jpg',
  },
  {
    id: 'open_tolstoy_karenina',
    openingSentence:
      'All happy families are alike; each unhappy family is unhappy in its own way.',
    title: 'Anna Karenina',
    author: 'Leo Tolstoy',
    year: 1878,
    genre: 'Russian Realism',
    significance:
      'Known in philosophy and science as the "Anna Karenina Principle", positing that success requires every attribute to align, while failure can occur in infinite variations.',
    coverUrl: 'https://covers.openlibrary.org/b/isbn/9780143035008-L.jpg',
  },
  {
    id: 'open_austen_pride',
    openingSentence:
      'It is a truth universally acknowledged, that a single man in possession of a good fortune, must be in want of a wife.',
    title: 'Pride and Prejudice',
    author: 'Jane Austen',
    year: 1813,
    genre: 'Victorian Social Satire',
    significance:
      'A glittering triumph of irony where Austen presents social pressure as universal law, setting the satirical stage for Elizabeth Bennet and Mr. Darcy.',
    coverUrl: 'https://covers.openlibrary.org/b/isbn/9780141439518-L.jpg',
  },
  {
    id: 'open_kafka_metamorphosis',
    openingSentence:
      'As Gregor Samsa awoke one morning from uneasy dreams he found himself transformed in his bed into a gigantic insect.',
    title: 'The Metamorphosis',
    author: 'Franz Kafka',
    year: 1915,
    genre: 'Modernist Absurdism',
    significance:
      'Kafka treats the utterly surreal with matter-of-fact bureaucratic calmness, instantly plunging the reader into existential alienation.',
    coverUrl: 'https://covers.openlibrary.org/b/isbn/9780553213690-L.jpg',
  },
];

export function getTodayOpeningSentence(date: Date = new Date()): OpeningSentenceItem {
  const startOfYear = new Date(date.getFullYear(), 0, 1);
  const dayOfYear = Math.floor((date.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24));
  return FAMOUS_OPENING_LINES[dayOfYear % FAMOUS_OPENING_LINES.length];
}

export function getRandomOpeningSentence(excludeId?: string): OpeningSentenceItem {
  const pool = excludeId
    ? FAMOUS_OPENING_LINES.filter((o) => o.id !== excludeId)
    : FAMOUS_OPENING_LINES;
  return pool[Math.floor(Math.random() * pool.length)] || FAMOUS_OPENING_LINES[0];
}
