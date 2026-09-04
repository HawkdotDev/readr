import { describe, it, expect, beforeEach } from 'bun:test';
import {
  PARSED_BOOK_CACHE,
  getCachedBookContent,
  setCachedBookContent,
  clearParsedBookCache,
  ParsedBookContent,
} from '../../src/services/reader/epubParser';

describe('In-Memory Parsed Book LRU Cache (Zero-Latency Continue Reading)', () => {
  beforeEach(() => {
    clearParsedBookCache();
  });

  it('stores and retrieves cached parsed book content in 0ms', () => {
    const mockBook: ParsedBookContent = {
      title: 'Meditations',
      author: 'Marcus Aurelius',
      chapters: [
        { id: 'c1', title: 'Book I', content: '<p>Content</p>', orderIndex: 0, wordCount: 150 },
      ],
      totalWords: 150,
    };

    const cacheKey = 'file:///path/meditations.epub::epub::Meditations';
    setCachedBookContent(cacheKey, mockBook);

    const retrieved = getCachedBookContent(cacheKey);
    expect(retrieved).not.toBeNull();
    expect(retrieved?.title).toBe('Meditations');
    expect(retrieved?.chapters.length).toBe(1);
    expect(retrieved?.chapters[0].title).toBe('Book I');
  });

  it('returns null for non-existent cache keys', () => {
    const retrieved = getCachedBookContent('non_existent_key');
    expect(retrieved).toBeNull();
  });

  it('evicts oldest entries when cache exceeds MAX_CACHED_BOOKS (LRU policy)', () => {
    // Add 5 entries (MAX is 5)
    for (let i = 1; i <= 5; i++) {
      setCachedBookContent(`key_${i}`, {
        title: `Book ${i}`,
        author: 'Author',
        chapters: [],
        totalWords: 100,
      });
    }

    expect(PARSED_BOOK_CACHE.size).toBe(5);
    expect(getCachedBookContent('key_1')).not.toBeNull();

    // Adding a 6th entry should evict the oldest
    setCachedBookContent('key_6', {
      title: 'Book 6',
      author: 'Author',
      chapters: [],
      totalWords: 100,
    });

    expect(PARSED_BOOK_CACHE.size).toBe(5);
    // Because key_1 was accessed recently, key_2 was the oldest and should be evicted
    expect(getCachedBookContent('key_2')).toBeNull();
    expect(getCachedBookContent('key_6')).not.toBeNull();
    expect(getCachedBookContent('key_1')).not.toBeNull();
  });

  it('clears all cached books completely on clearParsedBookCache()', () => {
    setCachedBookContent('key_1', {
      title: 'Book 1',
      author: 'Author',
      chapters: [],
      totalWords: 100,
    });
    expect(PARSED_BOOK_CACHE.size).toBe(1);

    clearParsedBookCache();
    expect(PARSED_BOOK_CACHE.size).toBe(0);
    expect(getCachedBookContent('key_1')).toBeNull();
  });
});
