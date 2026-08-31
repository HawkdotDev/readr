import { IReaderDriver, ParseResult } from './IReaderDriver';
import { BookFormat } from '../../../types';
import * as FileSystem from 'expo-file-system/legacy';

export class TxtDriver implements IReaderDriver {
  readonly format: BookFormat;

  constructor(format: 'txt' | 'md' | 'cbz' = 'txt') {
    this.format = format;
  }

  async parse(filePath: string): Promise<ParseResult> {
    try {
      const rawText = await (FileSystem as any).readAsStringAsync(filePath);
      const wordCount = rawText.split(/\s+/).filter(Boolean).length;
      const lines = rawText.split('\n').filter((l: string) => l.trim().length > 0);
      const title = lines[0]?.substring(0, 60) || filePath.split('/').pop() || 'Text Document';

      return {
        title,
        authors: ['Local Document'],
        pageCount: Math.ceil(wordCount / 250),
        wordCount,
      };
    } catch {
      return {
        title: filePath.split('/').pop() || 'Text Document',
        authors: ['Local Document'],
        pageCount: 1,
        wordCount: 100,
      };
    }
  }

  calculateProgress(currentLocation: string, totalCount = 1): number {
    if (!currentLocation || totalCount <= 0) return 0;
    const current = parseFloat(currentLocation.replace(/[^\d.]/g, '')) || 0;
    return Math.min(100, Math.max(0, (current / totalCount) * 100));
  }
}
