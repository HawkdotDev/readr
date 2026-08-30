export type BookFormat = 'epub' | 'pdf' | 'txt' | 'md' | 'cbz';
export type BookStatus = 'unread' | 'reading' | 'finished' | 'abandoned';
export type HighlightColor = 'charcoal' | 'graphite' | 'silver' | 'platinum' | 'smoke' | 'yellow' | 'amber' | 'mint' | 'sky' | 'coral';
export type ThemeMode = 'light' | 'sepia' | 'dark' | 'oled' | 'system';
export type TextAlign = 'left' | 'justify';

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
}

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

export interface ReadingSession {
  id: string;
  bookId: string;
  startTime: Date;
  endTime: Date;
  durationSeconds: number;
  startLocation?: string | null;
  endLocation?: string | null;
  pagesRead: number;
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

export interface Note {
  id: string;
  highlightId: string;
  content: string;
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

export interface UserSettings {
  id: string;
  activeTheme: ThemeMode;
  warmthLevel: number; // 0.0 to 1.0
  fontFamily: string;
  fontSize: number; // pt
  lineHeight: number; // multiplier
  marginHorizontal: number; // dp
  textAlign: TextAlign;
  keepAwake: boolean;
  hapticFeedback: boolean;
  ttsVoice?: string | null;
  ttsRate: number;
  ttsPitch?: number;
  onlineMetadataEnabled?: boolean;
  openLibraryMetadataSearch?: boolean;
}

export interface ReadingGoal {
  id: string;
  targetDailyMinutes: number;
  targetDailyPages: number;
  targetMinutesPerDay?: number;
  targetPagesPerDay?: number;
  currentStreakDays: number;
  longestStreakDays: number;
  lastActiveDate?: string | null; // YYYY-MM-DD
}

export interface BackupManifest {
  $schema: string;
  version: number;
  appVersion: string;
  createdAt: string;
  deviceInfo: {
    platform: string;
    model?: string;
  };
  stats: {
    totalBooks: number;
    totalHighlights: number;
    totalNotes: number;
    totalReadingSeconds: number;
  };
  checksums: {
    database: string;
    manifest: string;
  };
}

export interface OPDSBookEntry {
  id: string;
  title: string;
  author?: string;
  summary?: string;
  coverUrl?: string;
  downloadUrl: string;
  fileFormat: BookFormat;
  published?: string;
}

export interface DictionaryDefinition {
  word: string;
  phonetic?: string;
  partOfSpeech: string;
  definition: string;
  example?: string;
}
