import { IReaderDriver, ParseResult } from './IReaderDriver';
import { BookFormat } from '../../../types';

export class PdfDriver implements IReaderDriver {
  readonly format: BookFormat = 'pdf';

  async parse(filePath: string): Promise<ParseResult> {
    const filename = filePath.split('/').pop()?.replace('.pdf', '') || 'Document';
    return {
      title: filename,
      authors: ['PDF Document'],
      pageCount: 1,
      wordCount: 500,
    };
  }

  calculateProgress(currentLocation: string, totalPages = 1): number {
    if (!currentLocation || totalPages <= 0) return 0;
    const pageNum = parseInt(currentLocation.replace(/\D/g, ''), 10) || 1;
    return Math.min(100, Math.max(0, (pageNum / totalPages) * 100));
  }
}
