import { describe, it, expect } from 'bun:test';
import {
  CURATED_AUTHORS,
  CURATED_ARTISTS,
  generateAuthorInitials,
  getAuthorAccentColor,
  buildLibraryAuthorsList,
} from '../../src/services/editorial/libraryAuthorsService';
import { Book } from '../../src/types';

describe('Library Authors Service & Curated Classics', () => {
  it('contains valid curated authors with required metadata', () => {
    expect(CURATED_AUTHORS.length).toBeGreaterThan(5);

    CURATED_AUTHORS.forEach((author) => {
      expect(author.id).toBeDefined();
      expect(author.name.length).toBeGreaterThan(0);
      expect(author.initials.length).toBeGreaterThanOrEqual(1);
      expect(author.accentColor).toMatch(/^#[0-9A-Fa-f]{6}$/);
      expect(author.description.length).toBeGreaterThan(20);
      expect(author.famousWorks).toBeDefined();
      expect(author.famousWorks!.length).toBeGreaterThan(0);
      expect(author.movement).toBeDefined();
      expect(author.lifespan).toBeDefined();
    });
  });

  it('provides backward compatibility alias for CURATED_ARTISTS', () => {
    expect(CURATED_ARTISTS).toBe(CURATED_AUTHORS);
  });

  it('includes classic literary figures in the curated collection', () => {
    const names = CURATED_AUTHORS.map((a) => a.name);
    expect(names).toContain('Jane Austen');
    expect(names).toContain('Franz Kafka');
    expect(names).toContain('Arthur Conan Doyle');
    expect(names).toContain('Mary Shelley');
    expect(names).toContain('Edgar Allan Poe');
    expect(names).toContain('Oscar Wilde');
    expect(names).toContain('Leo Tolstoy');
    expect(names).toContain('Fyodor Dostoevsky');
    expect(names).toContain('Virginia Woolf');
  });

  it('generates clean uppercase initials from author names', () => {
    expect(generateAuthorInitials('Jane Austen')).toBe('JA');
    expect(generateAuthorInitials('Arthur Conan Doyle')).toBe('AD');
    expect(generateAuthorInitials('Plato')).toBe('PL');
    expect(generateAuthorInitials('')).toBe('AU');
  });

  it('deterministically calculates author accent colors', () => {
    const color1 = getAuthorAccentColor('Virginia Woolf');
    const color2 = getAuthorAccentColor('Virginia Woolf');
    expect(color1).toBe(color2);
    expect(color1).toMatch(/^#[0-9A-Fa-f]{6}$/);
  });

  it('extracts and prioritizes library authors from user books', () => {
    const mockBooks: Book[] = [
      {
        id: 'book_1',
        fileHash: 'hash_1',
        title: 'Emma',
        originalFilename: 'emma.epub',
        filePath: '/mock/emma.epub',
        fileFormat: 'epub',
        fileSizeBytes: 1000,
        pageCount: 350,
        progressPercentage: 42,
        status: 'reading',
        isFavorite: true,
        totalTimeReadSeconds: 1200,
        createdAt: new Date(),
        updatedAt: new Date(),
        authors: [{ id: 'a_1', name: 'Jane Austen' }],
      },
      {
        id: 'book_2',
        fileHash: 'hash_2',
        title: 'Sense and Sensibility',
        originalFilename: 'sensibility.epub',
        filePath: '/mock/sensibility.epub',
        fileFormat: 'epub',
        fileSizeBytes: 950,
        pageCount: 300,
        progressPercentage: 100,
        status: 'finished',
        isFavorite: false,
        totalTimeReadSeconds: 2400,
        createdAt: new Date(),
        updatedAt: new Date(),
        authors: [{ id: 'a_1', name: 'Jane Austen' }],
      },
    ];

    const result = buildLibraryAuthorsList(mockBooks);
    expect(result.libraryCount).toBe(1);

    const austen = result.authors.find((a) => a.name.toLowerCase() === 'jane austen');
    expect(austen).toBeDefined();
    expect(austen?.isLibraryAuthor).toBe(true);
    expect(austen?.bookCount).toBe(2);
    expect(austen?.libraryBooks?.length).toBe(2);
    expect(austen?.libraryBooks?.[0].title).toBe('Emma');
    expect(austen?.libraryBooks?.[0].progress).toBe(42);
  });
});
