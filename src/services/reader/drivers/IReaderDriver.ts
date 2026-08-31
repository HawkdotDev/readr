import { BookFormat, TOCEntry } from '../../../types';

export interface ParseResult {
  title?: string;
  authors?: string[];
  coverPath?: string | null;
  toc?: TOCEntry[];
  pageCount?: number;
  wordCount?: number;
}

export interface IReaderDriver {
  readonly format: BookFormat;
  parse(filePath: string): Promise<ParseResult>;
  calculateProgress(currentLocation: string, totalItems?: number): number;
}
