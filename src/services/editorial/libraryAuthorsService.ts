import { Book } from '../../types';

export interface LibraryBookRef {
  id: string;
  title: string;
  progress?: number;
}

export interface AuthorItem {
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
  libraryBooks?: LibraryBookRef[];
  isLibraryAuthor?: boolean;
}

// Backward compatibility alias
export type ArtistItem = AuthorItem;

export const AUTHOR_PALETTES = [
  '#B45309', // Amber
  '#10B981', // Emerald
  '#3B82F6', // Sapphire
  '#EC4899', // Rose
  '#8B5CF6', // Purple
  '#F97316', // Orange
  '#06B6D4', // Cyan
  '#14B8A6', // Teal
];

export const CURATED_AUTHORS: AuthorItem[] = [
  {
    id: 'aut_austen',
    name: 'Jane Austen',
    genre: 'Classic Literature',
    initials: 'JA',
    accentColor: '#EC4899',
    lifespan: '1775 – 1817',
    movement: 'Regency Realism & Social Satire',
    description:
      'Celebrated English novelist known for her sharp social critique, sparkling wit, and poignant exploration of autonomy, courtship, and human character.',
    famousWorks: ['Pride and Prejudice', 'Sense and Sensibility', 'Emma', 'Persuasion'],
  },
  {
    id: 'aut_kafka',
    name: 'Franz Kafka',
    genre: 'Modernism',
    initials: 'FK',
    accentColor: '#F97316',
    lifespan: '1883 – 1924',
    movement: 'Modernist Absurdism',
    description:
      'Visionary Prague-born writer whose surreal explorations of alienation, labyrinthine bureaucracy, and existential dread defined 20th-century consciousness.',
    famousWorks: ['The Metamorphosis', 'The Trial', 'The Castle', 'In the Penal Colony'],
  },
  {
    id: 'aut_doyle',
    name: 'Arthur Conan Doyle',
    genre: 'Detective Fiction',
    initials: 'AD',
    accentColor: '#B45309',
    lifespan: '1859 – 1930',
    movement: 'Victorian Mystery & Deduction',
    description:
      'Master of narrative ratiocination whose detective Sherlock Holmes transformed forensic investigation and Victorian popular fiction forever.',
    famousWorks: [
      'A Study in Scarlet',
      'The Hound of the Baskervilles',
      'The Sign of the Four',
      'The Adventures of Sherlock Holmes',
    ],
  },
  {
    id: 'aut_shelley',
    name: 'Mary Shelley',
    genre: 'Gothic Fiction',
    initials: 'MS',
    accentColor: '#10B981',
    lifespan: '1797 – 1851',
    movement: 'Romantic Gothic & Early Sci-Fi',
    description:
      'Pioneering English novelist whose masterpiece Frankenstein bridged Romantic sublime with scientific ambition, inventing modern science fiction.',
    famousWorks: ['Frankenstein', 'The Last Man', 'Mathilda', 'Valperga'],
  },
  {
    id: 'aut_poe',
    name: 'Edgar Allan Poe',
    genre: 'Gothic Mystery',
    initials: 'EP',
    accentColor: '#8B5CF6',
    lifespan: '1809 – 1849',
    movement: 'American Romanticism & Macabre',
    description:
      'Arch-poet of psychological terror, macabre mysteries, and lyrical melancholy, credited as the forefather of modern detective fiction.',
    famousWorks: [
      'The Raven',
      'The Tell-Tale Heart',
      'The Fall of the House of Usher',
      'The Murders in the Rue Morgue',
    ],
  },
  {
    id: 'aut_wilde',
    name: 'Oscar Wilde',
    genre: 'Decadence & Wit',
    initials: 'OW',
    accentColor: '#EC4899',
    lifespan: '1854 – 1900',
    movement: 'Aestheticism & Decadence',
    description:
      'Brilliant Irish dramatist, poet, and wit celebrated for flamboyant epigrams, philosophical comedies, and the haunting morality of Dorian Gray.',
    famousWorks: [
      'The Picture of Dorian Gray',
      'The Importance of Being Earnest',
      'De Profundis',
      'The Ballad of Reading Gaol',
    ],
  },
  {
    id: 'aut_bronte',
    name: 'Charlotte Brontë',
    genre: 'Victorian Gothic',
    initials: 'CB',
    accentColor: '#F59E0B',
    lifespan: '1816 – 1855',
    movement: 'Victorian Realism & Proto-Feminism',
    description:
      'Powerful Yorkshire novelist whose fierce emotional honesty and passionate heroine Jane Eyre broke conventional Victorian literary boundaries.',
    famousWorks: ['Jane Eyre', 'Villette', 'Shirley', 'The Professor'],
  },
  {
    id: 'aut_fitzgerald',
    name: 'F. Scott Fitzgerald',
    genre: 'Jazz Age Fiction',
    initials: 'FF',
    accentColor: '#3B82F6',
    lifespan: '1896 – 1940',
    movement: 'The Lost Generation',
    description:
      'Lyrical chronicler of the Jazz Age, wealth, disillusionment, and the shimmering, fragile promise of the American Dream in 1920s America.',
    famousWorks: [
      'The Great Gatsby',
      'Tender Is the Night',
      'This Side of Paradise',
      'The Beautiful and Damned',
    ],
  },
  {
    id: 'aut_tolstoy',
    name: 'Leo Tolstoy',
    genre: 'Russian Realism',
    initials: 'LT',
    accentColor: '#10B981',
    lifespan: '1828 – 1910',
    movement: 'Epic Russian Realism & Moral Philosophy',
    description:
      'Monumental Russian titan whose sprawling epics explored human destiny, moral conviction, history, and spiritual renewal with unmatched grandeur.',
    famousWorks: ['War and Peace', 'Anna Karenina', 'The Death of Ivan Ilyich', 'Resurrection'],
  },
  {
    id: 'aut_seneca',
    name: 'Seneca the Younger',
    genre: 'Stoic Philosophy',
    initials: 'SY',
    accentColor: '#B45309',
    lifespan: 'c. 4 BC – AD 65',
    movement: 'Roman Imperial Stoicism',
    description:
      'Roman statesman, dramatist, and Stoic philosopher whose letters on composure, brevity of life, and virtue guide modern philosophical seekers.',
    famousWorks: [
      'Letters from a Stoic',
      'On the Shortness of Life',
      'On Anger',
      'Thyestes',
    ],
  },
  {
    id: 'aut_dostoevsky',
    name: 'Fyodor Dostoevsky',
    genre: 'Psychological Realism',
    initials: 'FD',
    accentColor: '#8B5CF6',
    lifespan: '1821 – 1881',
    movement: 'Existential & Psychological Realism',
    description:
      'Profound explorer of human duality, guilt, redemption, and faith whose complex psychological dramas probe the deepest recesses of the human psyche.',
    famousWorks: ['Crime and Punishment', 'The Brothers Karamazov', 'Notes from Underground'],
  },
  {
    id: 'aut_woolf',
    name: 'Virginia Woolf',
    genre: 'Modernist Stream',
    initials: 'VW',
    accentColor: '#06B6D4',
    lifespan: '1882 – 1941',
    movement: 'Modernist Stream of Consciousness',
    description:
      'Formidable modernist pioneer whose lyrical stream of consciousness and feminist criticism radically reshaped narrative perception and interiority.',
    famousWorks: ['Mrs. Dalloway', 'To the Lighthouse', 'Orlando', 'A Room of One’s Own'],
  },
];

// Backward compatibility alias
export const CURATED_ARTISTS = CURATED_AUTHORS;

export function generateAuthorInitials(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) return 'AU';
  const words = trimmed.split(/\s+/).filter(Boolean);
  if (words.length >= 2) {
    return `${words[0][0]}${words[words.length - 1][0]}`.toUpperCase();
  }
  return trimmed.slice(0, 2).toUpperCase();
}

export function getAuthorAccentColor(name: string, curatedMatch?: AuthorItem): string {
  if (curatedMatch?.accentColor) return curatedMatch.accentColor;
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash += name.charCodeAt(i);
  }
  return AUTHOR_PALETTES[Math.abs(hash) % AUTHOR_PALETTES.length];
}

export function buildLibraryAuthorsList(books: Book[] = []): {
  authors: AuthorItem[];
  libraryCount: number;
} {
  const map = new Map<string, AuthorItem>();

  // 1. Extract from user's personal collection
  books.forEach((b) => {
    if (b.authors && b.authors.length > 0) {
      b.authors.forEach((a) => {
        const trimmed = a.name.trim();
        if (!trimmed) return;
        const key = trimmed.toLowerCase();

        // Check if matches a curated classic author
        const curatedMatch = CURATED_AUTHORS.find(
          (ca) => ca.name.toLowerCase() === key || ca.name.toLowerCase().includes(key)
        );

        if (!map.has(key)) {
          const initials = curatedMatch?.initials || generateAuthorInitials(trimmed);
          const accentColor = getAuthorAccentColor(trimmed, curatedMatch);

          map.set(key, {
            id: `user_aut_${a.id || trimmed}`,
            name: trimmed,
            genre: curatedMatch?.genre || 'In Your Library',
            initials,
            accentColor,
            lifespan: curatedMatch?.lifespan,
            movement: curatedMatch?.movement || 'Featured in Personal Library',
            description:
              curatedMatch?.description ||
              `Distinguished author featured in your Readr personal library. Access your downloaded works or discover matching editions in the public catalog.`,
            famousWorks: curatedMatch?.famousWorks || [b.title],
            bookCount: 1,
            libraryBooks: [{ id: b.id, title: b.title, progress: b.progressPercentage }],
            isLibraryAuthor: true,
          });
        } else {
          const existing = map.get(key)!;
          existing.bookCount = (existing.bookCount || 1) + 1;
          if (existing.libraryBooks && !existing.libraryBooks.some((lb) => lb.id === b.id)) {
            existing.libraryBooks.push({ id: b.id, title: b.title, progress: b.progressPercentage });
          }
        }
      });
    }
  });

  const libraryCount = map.size;

  // 2. Add curated famous classics that aren't already represented
  CURATED_AUTHORS.forEach((ca) => {
    const key = ca.name.toLowerCase();
    if (!map.has(key)) {
      map.set(key, {
        ...ca,
        bookCount: 0,
        libraryBooks: [],
        isLibraryAuthor: false,
      });
    }
  });

  return {
    authors: Array.from(map.values()),
    libraryCount,
  };
}
