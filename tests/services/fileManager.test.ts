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

  it('correctly detects extended digital formats (CBR, MOBI, AZW3, FB2, DOCX, RTF, HTML)', () => {
    expect(detectFormatFromFilename('manga.cbr')).toBe('cbr');
    expect(detectFormatFromFilename('kindle_book.mobi')).toBe('mobi');
    expect(detectFormatFromFilename('amazon.azw3')).toBe('azw3');
    expect(detectFormatFromFilename('russian_novel.fb2')).toBe('fb2');
    expect(detectFormatFromFilename('manuscript.docx')).toBe('docx');
    expect(detectFormatFromFilename('formatted.rtf')).toBe('rtf');
    expect(detectFormatFromFilename('webpage.html')).toBe('html');
  });

  it('defaults unknown extensions to txt', () => {
    expect(detectFormatFromFilename('document.unknown')).toBe('txt');
  });
});
