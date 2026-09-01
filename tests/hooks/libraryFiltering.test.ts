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

  it('identifies in-progress books other than the featured hero card', () => {
    const featured =
      sampleBooks.find((b) => b.status === 'reading' && (b.progressPercentage || 0) > 0) ||
      sampleBooks.find((b) => (b.progressPercentage || 0) > 0) ||
      sampleBooks[0];

    const additionalReadingBook: Book = {
      id: 'b4',
      fileHash: 'h4',
      title: 'The Brothers Karamazov',
      originalFilename: 'karamazov.epub',
      filePath: 'file:///books/karamazov.epub',
      fileFormat: 'epub',
      fileSizeBytes: 3000,
      pageCount: 800,
      progressPercentage: 25,
      status: 'reading',
      isFavorite: false,
      totalTimeReadSeconds: 1500,
      createdAt: new Date('2026-01-20'),
      updatedAt: new Date('2026-01-22'),
      authors: [{ id: 'a1', name: 'Fyodor Dostoevsky' }],
    };

    const allBooks = [...sampleBooks, additionalReadingBook];

    const inProgress = allBooks.filter(
      (b) =>
        b.id !== featured?.id &&
        b.status !== 'finished' &&
        (b.progressPercentage || 0) > 0 &&
        (b.progressPercentage || 0) < 100
    );

    expect(inProgress.length).toBe(1);
    expect(inProgress[0].title).toBe('The Brothers Karamazov');
    expect(inProgress[0].progressPercentage).toBe(25);
  });

  it('filters books by favourites correctly', () => {
    const favoriteBooks = sampleBooks.filter((b) => b.isFavorite);
    expect(favoriteBooks.length).toBe(1);
    expect(favoriteBooks[0].title).toBe('Crime and Punishment');
  });

  it('sorts books with favourites first', () => {
    const sorted = [...sampleBooks].sort((a, b) => {
      if (a.isFavorite && !b.isFavorite) return -1;
      if (!a.isFavorite && b.isFavorite) return 1;
      return a.title.localeCompare(b.title);
    });

    expect(sorted[0].title).toBe('Crime and Punishment');
    expect(sorted[0].isFavorite).toBe(true);
  });

  it('filters books by tag correctly', () => {
    const booksWithTags: Book[] = [
      {
        ...sampleBooks[0],
        tags: [{ id: 'tag_classics', name: 'Classics' }],
      },
      {
        ...sampleBooks[1],
        tags: [{ id: 'tag_philosophy', name: 'Philosophy' }],
      },
      {
        ...sampleBooks[2],
        tags: [{ id: 'tag_classics', name: 'Classics' }],
      },
    ];

    const philosophyBooks = booksWithTags.filter((b) =>
      b.tags?.some((t) => t.id === 'tag_philosophy')
    );
    expect(philosophyBooks.length).toBe(1);
    expect(philosophyBooks[0].title).toBe('Meditations');

    const classicBooks = booksWithTags.filter((b) =>
      b.tags?.some((t) => t.id === 'tag_classics')
    );
    expect(classicBooks.length).toBe(2);
  });

  it('sorts books by star rating (highest rating first)', () => {
    const ratedBooks: Book[] = [
      { ...sampleBooks[0], rating: 4 },
      { ...sampleBooks[1], rating: 5 },
      { ...sampleBooks[2], rating: 2 },
    ];

    const sortedByRating = [...ratedBooks].sort(
      (a, b) => (b.rating || 0) - (a.rating || 0)
    );

    expect(sortedByRating[0].title).toBe('Meditations');
    expect(sortedByRating[0].rating).toBe(5);
    expect(sortedByRating[1].title).toBe('Crime and Punishment');
    expect(sortedByRating[1].rating).toBe(4);
    expect(sortedByRating[2].title).toBe('Notes from Underground');
    expect(sortedByRating[2].rating).toBe(2);
  });
});
