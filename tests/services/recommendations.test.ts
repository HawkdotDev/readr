import { describe, it, expect } from 'bun:test';
import {
  getPersonalizedRecommendations,
  RECOMMENDATION_CATALOG,
} from '../../src/services/recommendations/recommendationService';
import { Book } from '../../src/types';

describe('Book Recommendation Engine', () => {
  it('provides default curated recommendations when library is empty', () => {
    const recs = getPersonalizedRecommendations([]);
    expect(recs.length).toBeGreaterThan(0);
    expect(recs.length).toBeLessThanOrEqual(RECOMMENDATION_CATALOG.length);
  });

  it('filters out books already in the user library', () => {
    const mockLibrary: Book[] = [
      {
        id: 'book_1',
        fileHash: 'hash_seneca_1',
        title: 'Letters from a Stoic',
        originalFilename: 'seneca.epub',
        filePath: '/mock/seneca.epub',
        fileFormat: 'epub',
        fileSizeBytes: 1000,
        pageCount: 200,
        progressPercentage: 50,
        status: 'reading',
        isFavorite: true,
        totalTimeReadSeconds: 500,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    const recs = getPersonalizedRecommendations(mockLibrary);
    expect(recs.some((b) => b.title === 'Letters from a Stoic')).toBe(false);
  });

  it('boosts philosophy recommendations when user reads Stoic/Philosophy books', () => {
    const mockLibrary: Book[] = [
      {
        id: 'book_med',
        fileHash: 'hash_med_1',
        title: 'Meditations',
        originalFilename: 'meditations.epub',
        filePath: '/mock/meditations.epub',
        fileFormat: 'epub',
        fileSizeBytes: 1000,
        pageCount: 160,
        progressPercentage: 20,
        status: 'reading',
        isFavorite: true,
        totalTimeReadSeconds: 300,
        authors: [{ id: 'a1', name: 'Marcus Aurelius' }],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    const recs = getPersonalizedRecommendations(mockLibrary);
    const topRec = recs[0];
    expect(topRec.category === 'Philosophy').toBe(true);
    expect(topRec.recommendationReason).toContain('Philosophy');
  });

  it('boosts Victorian recommendations when user reads Jane Austen', () => {
    const mockLibrary: Book[] = [
      {
        id: 'book_pride',
        fileHash: 'hash_pride_1',
        title: 'Pride and Prejudice',
        originalFilename: 'pride.epub',
        filePath: '/mock/pride.epub',
        fileFormat: 'epub',
        fileSizeBytes: 1000,
        pageCount: 300,
        progressPercentage: 40,
        status: 'reading',
        isFavorite: false,
        totalTimeReadSeconds: 600,
        authors: [{ id: 'a2', name: 'Jane Austen' }],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    const recs = getPersonalizedRecommendations(mockLibrary);
    const topRec = recs[0];
    expect(topRec.category === 'Victorian' || topRec.category === 'Classics').toBe(true);
    expect(topRec.recommendationReason).toContain('Jane Austen');
  });
});
