import { IReaderDriver, ParseResult } from './IReaderDriver';
import { BookFormat } from '../../../types';
import { parseBookFile } from '../epubParser';

export class EpubDriver implements IReaderDriver {
  readonly format: BookFormat = 'epub';

  async parse(filePath: string): Promise<ParseResult> {
    try {
      const defaultTitle = filePath.split('/').pop()?.replace(/\.epub$/i, '') || 'EPUB Book';
      const parsed = await parseBookFile(filePath, 'epub', defaultTitle);

      return {
        title: parsed.title,
        authors: parsed.author ? [parsed.author] : [],
        pageCount: parsed.chapters.length,
        wordCount: parsed.totalWords,
      };
    } catch (e) {
      console.warn('EpubDriver parse error:', e);
      return {};
    }
  }

  calculateProgress(currentLocation: string, totalItems = 1): number {
    if (!currentLocation || totalItems <= 0) return 0;

    // Handle chap_X_pos_Y format
    const match = currentLocation.match(/chap_(\d+)/);
    if (match) {
      const chapterIdx = parseInt(match[1], 10);
      return Math.min(100, Math.max(0, ((chapterIdx + 1) / totalItems) * 100));
    }

    return 0;
  }
}
