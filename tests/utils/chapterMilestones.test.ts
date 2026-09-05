import { describe, it, expect } from 'bun:test';
import { calculateChapterMilestone } from '../../src/utils/chapterMilestones';
import { Book, TOCEntry } from '../../src/types';

describe('Zeigarnik Chapter Milestones', () => {
  const sampleBook: Book = {
    id: 'book-1',
    fileHash: 'abc123',
    title: 'The Picture of Dorian Gray',
    originalFilename: 'dorian.epub',
    filePath: '/books/dorian.epub',
    fileFormat: 'epub',
    fileSizeBytes: 1024000,
    pageCount: 200,
    progressPercentage: 15,
    lastReadLocation: 'chap_2',
    status: 'reading',
    isFavorite: false,
    rating: 5,
    totalTimeReadSeconds: 1200,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const sampleTOC: TOCEntry[] = [
    { id: 't-1', bookId: 'book-1', title: 'Chapter 1: The Studio', playOrder: 1, level: 0 },
    { id: 't-2', bookId: 'book-1', title: 'Chapter 2: Lord Henry', playOrder: 2, level: 0 },
    { id: 't-3', bookId: 'book-1', title: 'Chapter 3: The Portrait', playOrder: 3, level: 0 },
  ];

  it('calculates chapter-level progress and generates micro-closure badge', () => {
    const milestone = calculateChapterMilestone(sampleBook, sampleTOC);

    expect(milestone.chapterNumber).toBe(3); // chap_2 is zero-indexed chapter 3
    expect(milestone.chapterTitle).toBe('Chapter 3: The Portrait');
    expect(milestone.pagesLeftInChapter).toBeGreaterThan(0);
    expect(milestone.minutesLeftInChapter).toBeGreaterThan(0);
    expect(milestone.badgeText).toContain('pages left');
  });

  it('handles completed books by returning Completed badge', () => {
    const finishedBook = { ...sampleBook, progressPercentage: 100 };
    const milestone = calculateChapterMilestone(finishedBook);

    expect(milestone.pagesLeftInChapter).toBe(0);
    expect(milestone.badgeText).toBe('Completed');
  });

  it('gracefully handles missing TOC entries and estimates chapter structure', () => {
    const milestone = calculateChapterMilestone(sampleBook, undefined);

    expect(milestone.chapterTitle).toBe('Chapter 3');
    expect(milestone.pagesLeftInChapter).toBeGreaterThan(0);
    expect(milestone.minutesLeftInChapter).toBeGreaterThan(0);
  });
});
