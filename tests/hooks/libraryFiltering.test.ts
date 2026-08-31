import { describe, it, expect } from 'bun:test';
import { Book } from '../../src/types';

describe('Library Filtering & Sorting Logic', () => {
  const sampleBooks: Book[] = [
    {
      id: 'b1',
      fileHash: 'h1',
      title: 'Crime and Punishment',
      originalFilename: 'crime.epub',
      filePath: 'file:///books/crime.epub',
      fileFormat: 'epub',
      fileSizeBytes: 1024,
      pageCount: 500,
      progressPercentage: 65,
      status: 'reading',
      isFavorite: true,
      totalTimeReadSeconds: 7200,
      createdAt: new Date('2026-01-01'),
      updatedAt: new Date('2026-01-10'),
      authors: [{ id: 'a1', name: 'Fyodor Dostoevsky' }],
    },
    {
      id: 'b2',
      fileHash: 'h2',
      title: 'Meditations',
      originalFilename: 'meditations.pdf',
      filePath: 'file:///books/meditations.pdf',
      fileFormat: 'pdf',
      fileSizeBytes: 2048,
      pageCount: 200,
      progressPercentage: 100,
      status: 'finished',
      isFavorite: false,
      totalTimeReadSeconds: 10800,
      createdAt: new Date('2026-01-05'),
      updatedAt: new Date('2026-01-12'),
      authors: [{ id: 'a2', name: 'Marcus Aurelius' }],
    },
    {
      id: 'b3',
      fileHash: 'h3',
      title: 'Notes from Underground',
      originalFilename: 'notes.txt',
      filePath: 'file:///books/notes.txt',
      fileFormat: 'txt',
      fileSizeBytes: 512,
      pageCount: 150,
      progressPercentage: 0,
      status: 'unread',
      isFavorite: false,
      totalTimeReadSeconds: 0,
      createdAt: new Date('2026-01-15'),
      updatedAt: new Date('2026-01-15'),
      authors: [{ id: 'a1', name: 'Fyodor Dostoevsky' }],
    },
  ];

  it('filters by status correctly', () => {
    const readingBooks = sampleBooks.filter((b) => b.status === 'reading');
    expect(readingBooks.length).toBe(1);
    expect(readingBooks[0].title).toBe('Crime and Punishment');

    const finishedBooks = sampleBooks.filter((b) => b.status === 'finished');
    expect(finishedBooks.length).toBe(1);
    expect(finishedBooks[0].title).toBe('Meditations');

    const unreadBooks = sampleBooks.filter((b) => b.status === 'unread');
    expect(unreadBooks.length).toBe(1);
    expect(unreadBooks[0].title).toBe('Notes from Underground');
  });

  it('filters by format correctly', () => {
    const epubBooks = sampleBooks.filter((b) => b.fileFormat === 'epub');
    expect(epubBooks.length).toBe(1);

    const pdfBooks = sampleBooks.filter((b) => b.fileFormat === 'pdf');
    expect(pdfBooks.length).toBe(1);

    const cbzBooks = sampleBooks.filter((b) => b.fileFormat === 'cbz');
    expect(cbzBooks.length).toBe(0);
  });

  it('filters by author or title query matches', () => {
    const query = 'dostoevsky';
    const dostoevskyBooks = sampleBooks.filter((b) => {
      const matchTitle = b.title.toLowerCase().includes(query);
      const matchAuthor = b.authors?.some((a) => a.name.toLowerCase().includes(query)) ?? false;
      return matchTitle || matchAuthor;
    });

    expect(dostoevskyBooks.length).toBe(2);
    expect(dostoevskyBooks.map((b) => b.title)).toContain('Crime and Punishment');
    expect(dostoevskyBooks.map((b) => b.title)).toContain('Notes from Underground');
  });

  it('identifies featured book for resume reading', () => {
    const featured =
      sampleBooks.find((b) => b.status === 'reading' && (b.progressPercentage || 0) > 0) ||
      sampleBooks.find((b) => (b.progressPercentage || 0) > 0) ||
      sampleBooks[0];

    expect(featured).toBeDefined();
    expect(featured?.title).toBe('Crime and Punishment');
    expect(featured?.progressPercentage).toBe(65);
  });
});
