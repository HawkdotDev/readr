export interface BookclothPalette {
  id: string;
  name: string;
  bg: string;
  innerBorder: string;
  accent: string;
  title: string;
  author: string;
}

export const BOOKCLOTH_PALETTES: BookclothPalette[] = [
  {
    id: 'morocco',
    name: 'Oxblood Morocco',
    bg: '#4A151B',
    innerBorder: 'rgba(246, 232, 223, 0.22)',
    accent: '#E2A97E',
    title: '#F6E8DF',
    author: '#C49B90',
  },
  {
    id: 'sage',
    name: 'Deep Sage Cloth',
    bg: '#1B2E24',
    innerBorder: 'rgba(237, 245, 238, 0.22)',
    accent: '#8FBC8F',
    title: '#EDF5EE',
    author: '#A2B7A7',
  },
  {
    id: 'prussian',
    name: 'Prussian Navy',
    bg: '#122238',
    innerBorder: 'rgba(232, 238, 245, 0.22)',
    accent: '#8AB4F8',
    title: '#E8EEF5',
    author: '#9DB4CC',
  },
  {
    id: 'oatmeal',
    name: 'Antique Oatmeal',
    bg: '#D8CEBD',
    innerBorder: 'rgba(43, 35, 25, 0.20)',
    accent: '#705E49',
    title: '#2B2319',
    author: '#5E5344',
  },
  {
    id: 'charcoal',
    name: 'Slate Charcoal',
    bg: '#24272D',
    innerBorder: 'rgba(243, 244, 246, 0.20)',
    accent: '#9CA3AF',
    title: '#F3F4F6',
    author: '#9CA3AF',
  },
  {
    id: 'plum',
    name: 'Plum Linen',
    bg: '#381D2E',
    innerBorder: 'rgba(253, 242, 248, 0.22)',
    accent: '#E0A6D0',
    title: '#FDF2F8',
    author: '#BA94AB',
  },
  {
    id: 'umber',
    name: 'Umber Leather',
    bg: '#3D2619',
    innerBorder: 'rgba(251, 245, 238, 0.22)',
    accent: '#D4A373',
    title: '#FBF5EE',
    author: '#BC9F88',
  },
  {
    id: 'forest',
    name: 'Spruce Forest',
    bg: '#142E25',
    innerBorder: 'rgba(234, 244, 240, 0.22)',
    accent: '#52B788',
    title: '#EAF4F0',
    author: '#88AB9C',
  },
  {
    id: 'terracotta',
    name: 'Tuscan Terracotta',
    bg: '#6E2A1A',
    innerBorder: 'rgba(254, 237, 232, 0.22)',
    accent: '#F97316',
    title: '#FEEDE8',
    author: '#E0927C',
  },
  {
    id: 'amethyst',
    name: 'Imperial Amethyst',
    bg: '#2C1B3E',
    innerBorder: 'rgba(245, 238, 255, 0.22)',
    accent: '#C084FC',
    title: '#F5EEFF',
    author: '#B493DE',
  },
  {
    id: 'florentine',
    name: 'Florentine Gold',
    bg: '#4A3B18',
    innerBorder: 'rgba(254, 249, 231, 0.22)',
    accent: '#FBBF24',
    title: '#FEF9E7',
    author: '#D4B875',
  },
  {
    id: 'nordic',
    name: 'Nordic Ice',
    bg: '#182C38',
    innerBorder: 'rgba(232, 244, 252, 0.22)',
    accent: '#38BDF8',
    title: '#E8F4FC',
    author: '#90B8D0',
  },
];

export type CoverMotif = 'lyre' | 'owl' | 'quills' | 'monogram' | 'laurel' | 'compass' | 'book';

/**
 * Deterministically hash any input string into a non-negative integer.
 */
export function hashStringToSeed(str: string): number {
  if (!str) return 0;
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

/**
 * Select a deterministic bookcloth palette for a book based on title and author.
 */
export function getBookclothPalette(title?: string, author?: string): BookclothPalette {
  const normalized = `${(title || '').trim().toLowerCase()}_${(author || '').trim().toLowerCase()}`;
  const seed = hashStringToSeed(normalized);
  const index = seed % BOOKCLOTH_PALETTES.length;
  return BOOKCLOTH_PALETTES[index];
}

/**
 * Select a deterministic heritage motif emblem based on book title.
 */
export function getCoverMotif(title?: string, author?: string): CoverMotif {
  const motifs: CoverMotif[] = ['laurel', 'lyre', 'owl', 'quills', 'compass', 'monogram', 'book'];
  const seed = hashStringToSeed(`${title || ''}_${author || ''}_motif`);
  return motifs[seed % motifs.length];
}
