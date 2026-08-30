import { describe, it, expect } from 'bun:test';
import { detectFormatFromFilename } from '../../src/services/storage/fileManager';

describe('fileManager Service', () => {
  it('correctly detects EPUB file formats', () => {
    expect(detectFormatFromFilename('moby_dick.epub')).toBe('epub');
    expect(detectFormatFromFilename('archive.EPUB')).toBe('epub');
  });

  it('correctly detects PDF, MD, CBZ and TXT formats', () => {
    expect(detectFormatFromFilename('manual.pdf')).toBe('pdf');
    expect(detectFormatFromFilename('notes.md')).toBe('md');
    expect(detectFormatFromFilename('comic.cbz')).toBe('cbz');
    expect(detectFormatFromFilename('essay.txt')).toBe('txt');
  });

  it('defaults unknown extensions to txt', () => {
    expect(detectFormatFromFilename('document.unknown')).toBe('txt');
  });
});
