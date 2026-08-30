import { AppState, AppStateStatus } from 'react-native';
import { updateBookProgress } from '../../db/queries/books';
import { logReadingSession } from '../../db/queries/stats';

interface PendingProgress {
  bookId: string;
  location: string;
  progressPercentage: number;
  sessionStartTime: Date;
  lastPersistedTime: number;
  timer: any;
}

class ProgressTracker {
  private pending: Map<string, PendingProgress> = new Map();
  private appStateSubscription: any = null;
  private defaultWPM: number = 220;

  constructor() {
    if (typeof AppState?.addEventListener === 'function') {
      this.appStateSubscription = AppState.addEventListener('change', this.handleAppStateChange);
    }
  }

  public recordProgress(
    bookId: string,
    location: string,
    progressPercentage: number
  ): void {
    let item = this.pending.get(bookId);

    if (!item) {
      item = {
        bookId,
        location,
        progressPercentage,
        sessionStartTime: new Date(),
        lastPersistedTime: Date.now(),
        timer: null,
      };
      this.pending.set(bookId, item);
    } else {
      item.location = location;
      item.progressPercentage = progressPercentage;
    }

    if (item.timer) {
      clearTimeout(item.timer);
    }

    // 500ms Debounce write
    item.timer = setTimeout(() => {
      this.flushBook(bookId);
    }, 500);
  }

  public async flushBook(bookId: string): Promise<void> {
    const item = this.pending.get(bookId);
    if (!item) return;

    if (item.timer) {
      clearTimeout(item.timer);
      item.timer = null;
    }

    const now = Date.now();
    const elapsedSeconds = Math.max(0, Math.round((now - item.lastPersistedTime) / 1000));
    item.lastPersistedTime = now;

    try {
      await updateBookProgress(item.bookId, item.location, item.progressPercentage, elapsedSeconds);
    } catch (e) {
      console.warn('Failed to persist progress:', e);
    }
  }

  public async endSession(bookId: string, endLocation?: string): Promise<void> {
    const item = this.pending.get(bookId);
    if (!item) return;

    await this.flushBook(bookId);
    const sessionEndTime = new Date();
    const durationSeconds = Math.max(1, Math.round((sessionEndTime.getTime() - item.sessionStartTime.getTime()) / 1000));

    try {
      await logReadingSession(
        bookId,
        item.sessionStartTime,
        sessionEndTime,
        item.location,
        endLocation || item.location,
        Math.max(1, Math.round((item.progressPercentage / 100) * 10))
      );
    } catch (e) {
      console.warn('Failed to log reading session:', e);
    }

    this.pending.delete(bookId);
  }

  public calculateMinutesLeft(wordsRemaining: number, customWpm?: number): number {
    const wpm = customWpm !== undefined ? customWpm : this.defaultWPM;
    if (wpm <= 0 || wordsRemaining <= 0) return 0;
    return Math.ceil(wordsRemaining / wpm);
  }

  private handleAppStateChange = (nextAppState: AppStateStatus): void => {
    if (nextAppState === 'background' || nextAppState === 'inactive') {
      this.flushAll();
    }
  };

  public flushAll(): void {
    for (const [bookId] of this.pending) {
      this.flushBook(bookId);
    }
  }

  public destroy(): void {
    if (this.appStateSubscription?.remove) {
      this.appStateSubscription.remove();
    }
    this.flushAll();
  }
}

export const progressTracker = new ProgressTracker();
