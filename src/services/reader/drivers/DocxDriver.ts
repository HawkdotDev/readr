import { BookFormat, TOCEntry } from '../../../types';
import { IReaderDriver, ParseResult } from './IReaderDriver';
import * as FileSystem from 'expo-file-system/legacy';

export class DocxDriver implements IReaderDriver {
  readonly format: BookFormat;

  constructor(format: BookFormat = 'docx') {
    this.format = format;
  }

  async parse(filePath: string): Promise<ParseResult> {
    const filename = filePath.split('/').pop() || 'Document';
    const cleanTitle = filename.replace(/\.(docx|rtf|html|htm|odt)$/i, '').replace(/[-_]/g, ' ');

    try {
      const info = await FileSystem.getInfoAsync(filePath);
      const approxWords = info.exists && (info as any).size ? Math.max(1000, Math.round((info as any).size / 8)) : 10000;
      const approxPages = Math.max(1, Math.round(approxWords / 300));

      const toc: TOCEntry[] = [
        { id: 'doc_start', bookId: '', title: cleanTitle, playOrder: 1, level: 1 },
      ];

      return {
        title: cleanTitle,
        authors: ['Document Author'],
        pageCount: approxPages,
        wordCount: approxWords,
        toc,
      };
    } catch {
      return {
        title: cleanTitle,
        authors: ['Document Author'],
        pageCount: 30,
        wordCount: 8000,
        toc: [],
      };
    }
  }

  calculateProgress(currentLocation: string, totalItems: number = 10): number {
    if (!currentLocation) return 0;
    const match = currentLocation.match(/page_?(\d+)/i) || currentLocation.match(/pos_?(\d+)/i);
    if (match) {
      const p = parseInt(match[1], 10);
      return Math.min(100, Math.max(0, (p / Math.max(1, totalItems)) * 100));
    }
    return 0;
  }
}
