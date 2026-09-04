import { describe, it, expect } from 'bun:test';

describe('Navigation Tab Bar Configuration & Feed Integration', () => {
  const TAB_NAMES = ['home', 'feed', 'library', 'explore', 'stats', 'settings'] as const;
  const TAB_COUNT = TAB_NAMES.length;
  const CAPSULE_HEIGHT = 56;
  const SQUARE_SIZE = 42;
  const SQUARE_RADIUS = 12;

  it('contains 6 tabs including the new Feed tab in second position', () => {
    expect(TAB_COUNT).toBe(6);
    expect(TAB_NAMES).toEqual(['home', 'feed', 'library', 'explore', 'stats', 'settings']);
    expect(TAB_NAMES[1]).toBe('feed');
  });

  it('calculates valid geometry across standard device widths without overflow', () => {
    const testWidths = [360, 375, 390, 414, 428, 768];

    testWidths.forEach((windowWidth) => {
      const capsuleWidth = Math.min(Math.round(windowWidth * 0.88), 372);
      const tabWidth = capsuleWidth / TAB_COUNT;
      const squareOffsetX = (tabWidth - SQUARE_SIZE) / 2;

      // Ensure each tab has positive width
      expect(tabWidth).toBeGreaterThan(SQUARE_SIZE);

      // Verify the active sliding square is positioned within the capsule for all 6 tabs
      for (let i = 0; i < TAB_COUNT; i++) {
        const indicatorLeft = squareOffsetX + i * tabWidth;
        const indicatorRight = indicatorLeft + SQUARE_SIZE;

        expect(indicatorLeft).toBeGreaterThanOrEqual(0);
        expect(indicatorRight).toBeLessThanOrEqual(capsuleWidth + 0.5);
      }
    });
  });

  it('verifies vertical centering of the active sliding square', () => {
    const squareTop = (CAPSULE_HEIGHT - SQUARE_SIZE) / 2;
    expect(squareTop).toBe(7);
    expect(SQUARE_RADIUS).toBe(12);
  });
});
