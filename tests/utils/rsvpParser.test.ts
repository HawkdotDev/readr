import { describe, it, expect } from 'bun:test';
import {
  calculateORPIndex,
  calculateDelayMultiplier,
  tokenizeChapterForRSVP,
  wpmToBaseIntervalMs,
} from '../../src/utils/rsvpParser';

describe('RSVP Speed Reader Engine', () => {
  it('correctly calculates Optimal Recognition Point (ORP) indexes', () => {
    expect(calculateORPIndex(1)).toBe(0);  // "I" -> index 0
    expect(calculateORPIndex(3)).toBe(1);  // "The" -> index 1 ('h')
    expect(calculateORPIndex(5)).toBe(1);  // "Quick" -> index 1 ('u')
    expect(calculateORPIndex(7)).toBe(2);  // "Between" -> index 2 ('t')
    expect(calculateORPIndex(11)).toBe(3); // "Magnificent" -> index 3 ('n')
    expect(calculateORPIndex(15)).toBe(4); // "Extraordinary..." -> index 4
  });

  it('correctly assigns punctuation delay multipliers', () => {
    expect(calculateDelayMultiplier('hello')).toBe(1.0);
    expect(calculateDelayMultiplier('world.')).toBe(1.8);
    expect(calculateDelayMultiplier('however,')).toBe(1.4);
    expect(calculateDelayMultiplier('yes!""')).toBe(1.8);
    expect(calculateDelayMultiplier('incomprehensible')).toBe(1.3);
  });

  it('tokenizes text and strips HTML tags cleanly', () => {
    const htmlText = '<p>The <b>quick</b> brown fox, jumps over the lazy dog.</p>';
    const tokens = tokenizeChapterForRSVP(htmlText);

    expect(tokens.length).toBe(9);
    expect(tokens[0].text).toBe('The');
    expect(tokens[0].prefix).toBe('T');
    expect(tokens[0].orpChar).toBe('h');
    expect(tokens[0].suffix).toBe('e');

    expect(tokens[3].text).toBe('fox,');
    expect(tokens[3].delayMultiplier).toBe(1.4);

    expect(tokens[8].text).toBe('dog.');
    expect(tokens[8].delayMultiplier).toBe(1.8);
  });

  it('converts WPM to base interval milliseconds with clamping', () => {
    expect(wpmToBaseIntervalMs(300)).toBe(200); // 60,000 / 300 = 200ms
    expect(wpmToBaseIntervalMs(600)).toBe(100); // 60,000 / 600 = 100ms
    expect(wpmToBaseIntervalMs(50)).toBe(400);  // clamped to min 150 WPM
    expect(wpmToBaseIntervalMs(2000)).toBe(50); // clamped to max 1200 WPM
  });
});
