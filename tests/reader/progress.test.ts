import { describe, it, expect } from 'bun:test';
import { progressTracker } from '../../src/services/reader/progressTracker';

describe('ProgressTracker', () => {
  it('calculates reading velocity (minutes left) accurately', () => {
    // 660 words at 220 WPM should take exactly 3 minutes
    const mins = progressTracker.calculateMinutesLeft(660, 220);
    expect(mins).toBe(3);
  });

  it('handles 0 words or 0 WPM gracefully', () => {
    expect(progressTracker.calculateMinutesLeft(0)).toBe(0);
    expect(progressTracker.calculateMinutesLeft(500, 0)).toBe(0);
  });

  it('rounds up partial minutes to avoid underestimating', () => {
    // 250 words at 200 WPM is 1.25 minutes -> 2 minutes
    const mins = progressTracker.calculateMinutesLeft(250, 200);
    expect(mins).toBe(2);
  });
});
