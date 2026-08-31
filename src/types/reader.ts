import { BookFormat, TOCEntry } from './book';

export interface ReaderLocation {
  cfi?: string | null;
  page?: number | null;
  percentage: number;
  chapterTitle?: string | null;
  totalChapters?: number | null;
}

export interface ReadingProgressPayload {
  location: string; // CFI or page
  percentage: number;
  wordsRead?: number;
  secondsElapsed?: number;
}

export interface ReaderBridgeMessage {
  type:
    | 'ready'
    | 'relocated'
    | 'selected'
    | 'tap'
    | 'toc'
    | 'searchResult'
    | 'error';
  payload?: any;
}

export interface IReaderDriver {
  readonly format: BookFormat;
  parse(filePath: string): Promise<{
    title?: string;
    authors?: string[];
    coverPath?: string | null;
    toc?: TOCEntry[];
    pageCount?: number;
  }>;
  calculateProgress(currentLocation: string, totalCount?: number): number;
}

export interface DictionaryDefinition {
  word: string;
  phonetic?: string;
  partOfSpeech: string;
  definition: string;
  example?: string;
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
