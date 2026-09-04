import { describe, it, expect, beforeEach } from 'bun:test';
import { useLibraryStore } from '../../src/store/libraryStore';
import { Book, Tag } from '../../src/types';

describe('useLibraryStore Global Caching & Frame-0 Hydration', () => {
  beforeEach(() => {
    useLibraryStore.setState({
      books: [],
      tags: [],
      searchQuery: '',
      selectedStatus: 'all',
      selectedFormat: 'all',
    });
  });

  it('stores and updates global books array', () => {
    const mockBooks: Book[] = [
      {
        id: 'b1',
        title: 'Frankenstein',
        filePath: '/path/frankenstein.epub',
        fileHash: 'hash_frankenstein',
        originalFilename: 'frankenstein.epub',
        fileSizeBytes: 524288,
        fileFormat: 'epub',
        status: 'reading',
        progressPercentage: 45,
        pageCount: 280,
        totalTimeReadSeconds: 3600,
        createdAt: new Date(),
        updatedAt: new Date(),
        isFavorite: false,
        rating: 5,
        authors: [{ id: 'a1', name: 'Mary Shelley' }],
        tags: [],
      },
    ];

    useLibraryStore.getState().setBooks(mockBooks);
    expect(useLibraryStore.getState().books.length).toBe(1);
    expect(useLibraryStore.getState().books[0].title).toBe('Frankenstein');
  });

  it('optimistically updates book properties via updateBookInStore', () => {
    const mockBook: Book = {
      id: 'b2',
      title: 'The Great Gatsby',
      filePath: '/path/gatsby.epub',
      fileHash: 'hash_gatsby',
      originalFilename: 'gatsby.epub',
      fileSizeBytes: 314572,
      fileFormat: 'epub',
      status: 'unread',
      progressPercentage: 0,
      pageCount: 180,
      totalTimeReadSeconds: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      isFavorite: false,
      rating: 0,
      authors: [{ id: 'a2', name: 'F. Scott Fitzgerald' }],
      tags: [],
    };

    useLibraryStore.getState().setBooks([mockBook]);
    useLibraryStore.getState().updateBookInStore('b2', { isFavorite: true, rating: 4 });

    const updated = useLibraryStore.getState().books.find((b) => b.id === 'b2');
    expect(updated?.isFavorite).toBe(true);
    expect(updated?.rating).toBe(4);
  });

  it('stores and updates global tags array', () => {
    const mockTags: Tag[] = [
      { id: 't1', name: 'Classic', color: '#10B981' },
      { id: 't2', name: 'Philosophy', color: '#6366F1' },
    ];

    useLibraryStore.getState().setTags(mockTags);
    expect(useLibraryStore.getState().tags.length).toBe(2);
    expect(useLibraryStore.getState().tags[0].name).toBe('Classic');
  });
});
