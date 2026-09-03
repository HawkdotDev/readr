import { describe, expect, it } from 'bun:test';
import {
  CONTEMPORARY_BOOKS_CATALOG,
  CONTEMPORARY_AUTHORS_CATALOG,
  getBookOfTheDay,
  getAuthorOfTheDay,
  getRandomBookSpotlight,
  getRandomAuthorSpotlight,
} from '../../src/services/editorial/dailySpotlightService';

describe('Daily Spotlight Editorial Service', () => {
  it('contains rich catalogs of contemporary books and authors', () => {
    expect(CONTEMPORARY_BOOKS_CATALOG.length).toBeGreaterThan(3);
    expect(CONTEMPORARY_AUTHORS_CATALOG.length).toBeGreaterThan(3);

    for (const book of CONTEMPORARY_BOOKS_CATALOG) {
      expect(book.title).toBeTruthy();
      expect(book.author).toBeTruthy();
      expect(book.synopsis).toBeTruthy();
      expect(book.whyPopular).toBeTruthy();
      expect(book.themes.length).toBeGreaterThan(0);
      expect(book.coverUrl).toBeTruthy();
    }

    for (const author of CONTEMPORARY_AUTHORS_CATALOG) {
      expect(author.name).toBeTruthy();
      expect(author.bio).toBeTruthy();
      expect(author.whyTrending).toBeTruthy();
      expect(author.recommendedStartingBooks.length).toBeGreaterThan(0);
      expect(author.portraitUrl).toBeTruthy();
    }
  });

  it('deterministically returns the same book and author for the same date', () => {
    const fixedDate = new Date('2026-09-03T12:00:00Z');
    const book1 = getBookOfTheDay(fixedDate);
    const book2 = getBookOfTheDay(fixedDate);
    expect(book1.id).toBe(book2.id);

    const author1 = getAuthorOfTheDay(fixedDate);
    const author2 = getAuthorOfTheDay(fixedDate);
    expect(author1.id).toBe(author2.id);
  });

  it('returns valid random spotlights', () => {
    const randomBook = getRandomBookSpotlight();
    expect(randomBook).toBeDefined();
    expect(randomBook.title).toBeTruthy();

    const randomAuthor = getRandomAuthorSpotlight();
    expect(randomAuthor).toBeDefined();
    expect(randomAuthor.name).toBeTruthy();
  });
});
