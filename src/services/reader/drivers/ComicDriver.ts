import { BookFormat, TOCEntry } from '../../../types';
import { IReaderDriver, ParseResult } from './IReaderDriver';
import * as FileSystem from 'expo-file-system/legacy';

export class ComicDriver implements IReaderDriver {
  readonly format: BookFormat;

  constructor(format: BookFormat = 'cbz') {
    this.format = format;
  }

  async parse(filePath: string): Promise<ParseResult> {
    const filename = filePath.split('/').pop() || 'Comic';
    const cleanTitle = filename.replace(/\.(cbz|cbr|zip|rar)$/i, '').replace(/[-_]/g, ' ');

    try {
      const info = await FileSystem.getInfoAsync(filePath);
      const approxPages = info.exists && (info as any).size ? Math.max(12, Math.round((info as any).size / (400 * 1024))) : 32;

      const toc: TOCEntry[] = Array.from({ length: approxPages }).map((_, idx) => ({
        id: `page_${idx + 1}`,
        bookId: '',
        title: `Page ${idx + 1}`,
        pageNumber: idx + 1,
        playOrder: idx + 1,
        level: 1,
      }));

      return {
        title: cleanTitle,
        authors: ['Comic Artist'],
        pageCount: approxPages,
        wordCount: approxPages * 40,
        toc,
      };
    } catch {
      return {
        title: cleanTitle,
        authors: ['Comic Artist'],
        pageCount: 24,
        wordCount: 1000,
        toc: [],
      };
    }
  }

  calculateProgress(currentLocation: string, totalItems: number = 30): number {
    if (!currentLocation) return 0;
    const match = currentLocation.match(/page_?(\d+)/i);
    if (match) {
      const page = parseInt(match[1], 10);
      return Math.min(100, Math.max(0, (page / Math.max(1, totalItems)) * 100));
    }
    return 0;
  }
}
