import { Book, TOCEntry } from '../types';

export interface ChapterMilestone {
  chapterTitle: string;
  chapterNumber: number;
  pagesLeftInChapter: number;
  minutesLeftInChapter: number;
  chapterProgressPercent: number;
  badgeText: string;
}

/**
 * Zeigarnik Chapter Milestone & Micro-Closure Calculator.
 * Breaks down intimidating 500-page book progress into immediate,
 * satisfying chapter-level milestones that reduce reader startup inertia.
 */
export function calculateChapterMilestone(
  book: Book,
  tocEntries?: TOCEntry[]
): ChapterMilestone {
  const totalPages = Math.max(1, book.pageCount || 180);
  const overallProgress = Math.max(0, Math.min(100, book.progressPercentage || 0));
  const currentPage = Math.round((overallProgress / 100) * totalPages);

  // 1. Determine Chapter Count
  const totalChapters = Math.max(
    1,
    tocEntries && tocEntries.length > 0
      ? tocEntries.length
      : Math.max(5, Math.round(totalPages / 16))
  );

  const avgChapterPages = Math.max(4, Math.round(totalPages / totalChapters));

  // 2. Parse Chapter Index from lastReadLocation (e.g. 'chap_4' or percentage)
  let currentChapterIndex = 0;
  if (book.lastReadLocation && book.lastReadLocation.startsWith('chap_')) {
    const parsed = parseInt(book.lastReadLocation.replace('chap_', ''), 10);
    if (!isNaN(parsed) && parsed >= 0) {
      currentChapterIndex = parsed;
    }
  } else {
    currentChapterIndex = Math.min(
      totalChapters - 1,
      Math.floor((overallProgress / 100) * totalChapters)
    );
  }

  const chapterNumber = currentChapterIndex + 1;

  // 3. Resolve Chapter Title
  let chapterTitle = `Chapter ${chapterNumber}`;
  if (tocEntries && tocEntries[currentChapterIndex]?.title) {
    const rawTitle = tocEntries[currentChapterIndex].title.trim();
    chapterTitle = rawTitle.length > 24 ? `${rawTitle.slice(0, 22)}…` : rawTitle;
  }

  // 4. Calculate Chapter Pages and Minutes Remaining
  const pagesIntoChapter = currentPage % avgChapterPages;
  const pagesLeftInChapter =
    overallProgress >= 100
      ? 0
      : Math.max(1, avgChapterPages - pagesIntoChapter);

  const minutesLeftInChapter = Math.max(1, Math.ceil(pagesLeftInChapter * 1.5));
  const chapterProgressPercent = Math.round(
    ((avgChapterPages - pagesLeftInChapter) / avgChapterPages) * 100
  );

  // 5. Construct Zeigarnik Micro-Closure Badge Text
  let badgeText = '';
  if (overallProgress >= 100) {
    badgeText = 'Completed';
  } else if (pagesLeftInChapter <= 1) {
    badgeText = `${chapterTitle} · Finishing chapter (~1m)`;
  } else {
    badgeText = `${chapterTitle} · ${pagesLeftInChapter} pages left (~${minutesLeftInChapter}m)`;
  }

  return {
    chapterTitle,
    chapterNumber,
    pagesLeftInChapter,
    minutesLeftInChapter,
    chapterProgressPercent,
    badgeText,
  };
}
