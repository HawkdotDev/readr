export type BookFormat =
  | 'epub'
  | 'pdf'
  | 'txt'
  | 'md'
  | 'cbz'
  | 'cbr'
  | 'mobi'
  | 'azw3'
  | 'fb2'
  | 'docx'
  | 'rtf'
  | 'html';
export type BookStatus = 'unread' | 'reading' | 'finished' | 'abandoned';
export type HighlightColor =
  | 'charcoal'
  | 'graphite'
  | 'silver'
  | 'platinum'
  | 'smoke'
  | 'yellow'
  | 'amber'
  | 'mint'
  | 'sky'
  | 'coral';

export interface Author {
  id: string;
  name: string;
  sortName?: string | null;
}

export interface TOCEntry {
  id: string;
  bookId: string;
  title: string;
  href?: string | null;
  cfi?: string | null;
  pageNumber?: number | null;
  playOrder: number;
  level: number;
  parentId?: string | null;
}

export interface Bookmark {
  id: string;
  bookId: string;
  locationCfi?: string | null;
  pageNumber?: number | null;
  title: string;
  snippet?: string | null;
  createdAt: Date;
}

export interface Note {
  id: string;
  highlightId: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Highlight {
  id: string;
  bookId: string;
  locationCfi?: string | null;
  pageNumber?: number | null;
  selectedText: string;
  color: HighlightColor;
  note?: Note | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Collection {
  id: string;
  name: string;
  description?: string | null;
  icon?: string | null;
  orderIndex: number;
  createdAt: Date;
  bookCount?: number;
}

export interface Tag {
  id: string;
  name: string;
  color?: string | null;
}

export interface Book {
  id: string;
  fileHash: string;
  title: string;
  subtitle?: string | null;
  description?: string | null;
  publisher?: string | null;
  publishedDate?: string | null;
  isbn?: string | null;
  language?: string | null;
  originalFilename: string;
  filePath: string;
  fileFormat: BookFormat;
  coverImagePath?: string | null;
  fileSizeBytes: number;
  pageCount: number;
  lastReadLocation?: string | null; // EPUB CFI or page number or line
  progressPercentage: number; // 0.0 - 100.0
  status: BookStatus;
  isFavorite: boolean;
  totalTimeReadSeconds: number;
  createdAt: Date;
  updatedAt: Date;
  lastReadAt?: Date | null;
  authors?: Author[];
  toc?: TOCEntry[];
  tags?: Tag[];
  rating?: number; // 0 (unrated) or 1 - 5 stars
}

export interface OPDSServer {
  id: string;
  title: string;
  url: string;
  username?: string | null;
  password?: string | null;
  icon?: string | null;
  createdAt: Date;
}

export interface BookSettings {
  bookId: string;
  fontFamily?: string | null;
  fontSize?: number | null;
  lineHeight?: number | null;
  marginHorizontal?: number | null;
  textAlign?: 'left' | 'justify' | null;
  activeTheme?: string | null;
  paragraphIndent?: number | null;
  paragraphSpacing?: number | null;
  dropCaps?: boolean | null;
  readingRulerEnabled?: boolean | null;
  readingRulerMode?: string | null;
  bionicReadingEnabled?: boolean | null;
  bionicFixation?: 'low' | 'medium' | 'high' | null;
  readingDirection?: 'horizontal' | 'vertical' | null;
  pageTurnStyle?: 'slide' | 'curl' | 'fade' | 'none' | null;
  dualPageMode?: boolean | 'auto' | null;
  warmthLevel?: number | null;
  autoScrollSpeed?: number | null;
  autoScrollMode?: 'smooth' | 'line' | 'pageTimer' | 'pixel' | 'wave' | null;
  updatedAt?: Date;
}


