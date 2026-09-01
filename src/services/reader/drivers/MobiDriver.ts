import { BookFormat, TOCEntry } from '../../../types';
import { IReaderDriver, ParseResult } from './IReaderDriver';
import * as FileSystem from 'expo-file-system/legacy';

export class MobiDriver implements IReaderDriver {
  readonly format: BookFormat;

  constructor(format: BookFormat = 'mobi') {
    this.format = format;
  }

  async parse(filePath: string): Promise<ParseResult> {
    const filename = filePath.split('/').pop() || 'Ebook';
    const cleanTitle = filename.replace(/\.(mobi|azw3|azw|prc)$/i, '').replace(/[-_]/g, ' ');

    try {
      const info = await FileSystem.getInfoAsync(filePath);
      const approxWords = info.exists && (info as any).size ? Math.max(5000, Math.round((info as any).size / 6)) : 45000;
      const approxPages = Math.max(1, Math.round(approxWords / 280));

      const toc: TOCEntry[] = [
        { id: 'mobi_start', bookId: '', title: 'Beginning', playOrder: 1, level: 1 },
        { id: 'mobi_ch1', bookId: '', title: 'Chapter 1', playOrder: 2, level: 1 },
        { id: 'mobi_ch2', bookId: '', title: 'Chapter 2', playOrder: 3, level: 1 },
      ];

      return {
        title: cleanTitle,
        authors: ['Kindle Author'],
        pageCount: approxPages,
        wordCount: approxWords,
        toc,
      };
    } catch {
      return {
        title: cleanTitle,
        authors: ['Kindle Author'],
        pageCount: 150,
        wordCount: 40000,
        toc: [],
      };
    }
  }

  calculateProgress(currentLocation: string, totalItems: number = 100): number {
    if (!currentLocation) return 0;
    const match = currentLocation.match(/pos_?(\d+)/i) || currentLocation.match(/page_?(\d+)/i);
    if (match) {
      const pos = parseInt(match[1], 10);
      return Math.min(100, Math.max(0, (pos / Math.max(1, totalItems)) * 100));
    }
    return 0;
  }
}
