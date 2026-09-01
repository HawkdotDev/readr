import { BookFormat, TOCEntry } from '../../../types';
import { IReaderDriver, ParseResult } from './IReaderDriver';
import * as FileSystem from 'expo-file-system/legacy';

export class Fb2Driver implements IReaderDriver {
  readonly format: BookFormat = 'fb2';

  async parse(filePath: string): Promise<ParseResult> {
    const filename = filePath.split('/').pop() || 'FictionBook';
    const cleanTitle = filename.replace(/\.fb2$/i, '').replace(/[-_]/g, ' ');

    try {
      const content = await FileSystem.readAsStringAsync(filePath, {
        encoding: (FileSystem as any).EncodingType?.UTF8 || 'utf8',
      });

      // Extract title from <book-title> if available
      const titleMatch = content.match(/<book-title>([^<]+)<\/book-title>/i);
      const parsedTitle = titleMatch ? titleMatch[1].trim() : cleanTitle;

      // Extract author from <author>
      const firstName = content.match(/<first-name>([^<]+)<\/first-name>/i)?.[1] || '';
      const lastName = content.match(/<last-name>([^<]+)<\/last-name>/i)?.[1] || '';
      const author = [firstName, lastName].filter(Boolean).join(' ') || 'FB2 Author';

      // Count sections
      const sections = content.match(/<section>/gi) || [];
      const sectionCount = Math.max(1, sections.length);

      const words = content.replace(/<[^>]+>/g, ' ').split(/\s+/).length;
      const pages = Math.max(1, Math.round(words / 280));

      const toc: TOCEntry[] = Array.from({ length: Math.min(sectionCount, 25) }).map((_, idx) => ({
        id: `fb2_sec_${idx + 1}`,
        bookId: '',
        title: `Section ${idx + 1}`,
        playOrder: idx + 1,
        level: 1,
      }));

      return {
        title: parsedTitle,
        authors: [author],
        pageCount: pages,
        wordCount: words,
        toc,
      };
    } catch {
      return {
        title: cleanTitle,
        authors: ['FB2 Author'],
        pageCount: 120,
        wordCount: 30000,
        toc: [],
      };
    }
  }

  calculateProgress(currentLocation: string, totalItems: number = 10): number {
    if (!currentLocation) return 0;
    const match = currentLocation.match(/sec_?(\d+)/i) || currentLocation.match(/page_?(\d+)/i);
    if (match) {
      const sec = parseInt(match[1], 10);
      return Math.min(100, Math.max(0, (sec / Math.max(1, totalItems)) * 100));
    }
    return 0;
  }
}
