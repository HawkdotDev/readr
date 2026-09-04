import { describe, it, expect } from 'bun:test';
import {
  calculateReadingChallenge,
  getDayOfYear,
  isLeapYear,
  getTotalDaysInYear,
  DEFAULT_ANNUAL_TARGET,
} from '../../src/services/editorial/readingChallengeService';
import {
  calculateReadingVelocity,
  formatForecastDate,
  DEFAULT_WPM,
} from '../../src/services/editorial/readingVelocityService';
import {
  getTodayReflectionPrompt,
  getRandomReflectionPrompt,
  formatReflectionForExport,
  selectMemoryRecallHighlight,
  LITERARY_REFLECTION_PROMPTS,
} from '../../src/services/editorial/reflectionJournalService';
import { Book } from '../../src/types';

describe('Reading Utility Feed Services', () => {
  describe('Annual Reading Challenge Service', () => {
    it('detects leap years correctly', () => {
      expect(isLeapYear(2024)).toBe(true);
      expect(isLeapYear(2026)).toBe(false);
      expect(isLeapYear(2000)).toBe(true);
      expect(isLeapYear(1900)).toBe(false);
      expect(getTotalDaysInYear(2024)).toBe(366);
      expect(getTotalDaysInYear(2026)).toBe(365);
    });

    it('calculates day of year accurately', () => {
      const jan1 = new Date(2026, 0, 1);
      const day = getDayOfYear(jan1);
      expect(day).toBeGreaterThanOrEqual(1);
    });

    it('calculates challenge progress when no books completed', () => {
      const books: Book[] = [];
      const refDate = new Date(2026, 5, 1); // Mid year (June 1)
      const res = calculateReadingChallenge(books, 24, refDate);

      expect(res.completedCount).toBe(0);
      expect(res.percentage).toBe(0);
      expect(res.isCompleted).toBe(false);
      expect(res.milestones.q1).toBe(false);
      expect(res.pacing.status).toBe('behind');
    });

    it('calculates challenge progress and milestone flags when books completed', () => {
      const mockFinishedBooks: Book[] = Array.from({ length: 12 }, (_, i) => ({
        id: `book_${i}`,
        title: `Finished Book ${i}`,
        filePath: `/books/${i}.epub`,
        fileHash: `hash_${i}`,
        originalFilename: `${i}.epub`,
        fileSizeBytes: 100000,
        fileFormat: 'epub' as const,
        status: 'finished' as const,
        progressPercentage: 100,
        pageCount: 200,
        totalTimeReadSeconds: 5000,
        createdAt: new Date(2026, 0, 1),
        updatedAt: new Date(2026, 3, 1), // April 2026
        lastReadAt: new Date(2026, 3, 1),
        isFavorite: false,
        rating: 5,
        authors: [],
        tags: [],
      }));

      // In early February (day ~35), 12 books completed out of 24 target is way ahead of pace
      const refDate = new Date(2026, 1, 5);
      const res = calculateReadingChallenge(mockFinishedBooks, 24, refDate);

      expect(res.completedCount).toBe(12);
      expect(res.percentage).toBe(50);
      expect(res.milestones.q1).toBe(true);
      expect(res.milestones.q2).toBe(true);
      expect(res.milestones.q3).toBe(false);
      expect(res.pacing.status).toBe('ahead');
      expect(res.pacing.message).toContain('ahead of schedule');
    });
  });

  describe('Reading Velocity & Finish-Date Predictor Service', () => {
    const sampleBook: Book = {
      id: 'active_1',
      title: 'Moby-Dick',
      filePath: '/books/mobydick.epub',
      fileHash: 'hash_mobydick',
      originalFilename: 'mobydick.epub',
      fileSizeBytes: 800000,
      fileFormat: 'epub' as const,
      status: 'reading' as const,
      progressPercentage: 50, // 50% through
      pageCount: 400, // 200 pages remaining
      totalTimeReadSeconds: 12000,
      createdAt: new Date(),
      updatedAt: new Date(),
      isFavorite: true,
      rating: 5,
      authors: [{ id: 'a1', name: 'Herman Melville' }],
      tags: [],
    };

    it('calculates remaining pages, minutes, and WPM', () => {
      const res = calculateReadingVelocity(sampleBook, 200, 30);
      expect(res.bookTitle).toBe('Moby-Dick');
      expect(res.wpm).toBe(200);
      expect(res.remainingPages).toBe(200); // 50% of 400
      expect(res.pagesPerHour).toBe(48); // (200 * 60) / 250
      expect(res.remainingMinutes).toBe(250); // (200 * 250 words) / 200 wpm = 250 mins
      expect(res.formattedTimeRemaining).toBe('4h 10m left');
    });

    it('formats forecast finish dates properly', () => {
      const refDate = new Date(2026, 8, 4); // Friday, Sep 4
      expect(formatForecastDate(new Date(2026, 8, 4), refDate)).toBe('Today');
      expect(formatForecastDate(new Date(2026, 8, 5), refDate)).toBe('Tomorrow');
      expect(formatForecastDate(new Date(2026, 8, 8), refDate)).toBe('Tue, Sep 8');
    });

    it('handles completed books gracefully', () => {
      const finishedBook: Book = {
        ...sampleBook,
        progressPercentage: 100,
      };
      const res = calculateReadingVelocity(finishedBook, DEFAULT_WPM, 30);
      expect(res.remainingPages).toBe(0);
      expect(res.remainingMinutes).toBe(0);
      expect(res.formattedTimeRemaining).toBe('Completed');
      expect(res.primaryForecast.summary).toBe('You have finished this book!');
    });
  });

  describe('Reflection Journal Service', () => {
    it('has diverse reflection prompts with category, prompt, and subtext', () => {
      expect(LITERARY_REFLECTION_PROMPTS.length).toBeGreaterThanOrEqual(6);
      LITERARY_REFLECTION_PROMPTS.forEach((p) => {
        expect(p.prompt.length).toBeGreaterThan(10);
        expect(p.subtext.length).toBeGreaterThan(5);
        expect(p.category).toBeDefined();
      });
    });

    it('returns deterministic prompt of the day', () => {
      const p1 = getTodayReflectionPrompt(new Date('2026-09-04'));
      const p2 = getTodayReflectionPrompt(new Date('2026-09-04'));
      expect(p1.id).toBe(p2.id);
    });

    it('shuffles to a different reflection prompt', () => {
      const first = LITERARY_REFLECTION_PROMPTS[0];
      const random = getRandomReflectionPrompt(first.id);
      expect(random.id).not.toBe(first.id);
    });

    it('formats reflection for Obsidian/Markdown export cleanly', () => {
      const md = formatReflectionForExport(
        'What core belief of yours did your reading challenge today?',
        'It made me reconsider how social expectations shape personal ambition.',
        'The Great Gatsby',
        'F. Scott Fitzgerald',
        new Date('2026-09-04')
      );
      expect(md).toContain('## Literary Reflection');
      expect(md).toContain('*The Great Gatsby*');
      expect(md).toContain('F. Scott Fitzgerald');
      expect(md).toContain('Prompt');
      expect(md).toContain('reconsider how social expectations');
      expect(md).toContain('Exported from Readr');
    });

    it('selects memory recall highlight from pool', () => {
      const mockHighlights = [
        {
          id: 'h1',
          bookId: 'b1',
          bookTitle: 'War and Peace',
          selectedText: 'A quiet conscience is the greatest joy.',
          color: 'yellow' as const,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'h2',
          bookId: 'b2',
          bookTitle: 'Anna Karenina',
          selectedText: 'All happy families are alike.',
          color: 'amber' as const,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const selected = selectMemoryRecallHighlight(mockHighlights, 'b1');
      expect(selected).toBeDefined();
      expect(selected?.bookTitle).toBe('Anna Karenina');
    });
  });
});
