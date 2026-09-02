import { describe, it, expect } from 'bun:test';
import { parseChapterContent } from '../../src/services/reader/epubBridge';
import { progressTracker } from '../../src/services/reader/progressTracker';

describe('EPUB Parsing, HTML Bridge & Progress Engine', () => {
  it('parses chapter HTML into structured h1, h2, and paragraph blocks', () => {
    const html = '<h1>Chapter I. Mr. Sherlock Holmes</h1><h2>The Science of Deduction</h2><p>Mr. Sherlock Holmes, who was usually very late in the mornings, was seated at the breakfast table.</p><p>I stood upon the hearth-rug and picked up the stick which our visitor had left behind him.</p>';

    const blocks = parseChapterContent(html);

    expect(blocks.length).toBe(4);
    expect(blocks[0].type).toBe('h1');
    expect(blocks[0].text).toBe('Chapter I. Mr. Sherlock Holmes');

    expect(blocks[1].type).toBe('h2');
    expect(blocks[1].text).toBe('The Science of Deduction');

    expect(blocks[2].type).toBe('paragraph');
    expect(blocks[2].text).toContain('Mr. Sherlock Holmes, who was usually very late');
    expect(blocks[2].words?.length).toBeGreaterThan(5);

    expect(blocks[3].type).toBe('paragraph');
    expect(blocks[3].text).toContain('I stood upon the hearth-rug');
  });

  it('handles empty or malformed HTML gracefully', () => {
    expect(parseChapterContent('')).toEqual([]);
    expect(parseChapterContent('   ')).toEqual([]);
  });

  it('calculates reading velocity and minutes left correctly based on word count', () => {
    // 600 words at default 220 WPM should take approx 3 minutes
    const mins = progressTracker.calculateMinutesLeft(600, 220);
    expect(mins).toBe(3);

    // 0 words should return 0 min
    expect(progressTracker.calculateMinutesLeft(0, 220)).toBe(0);

    // Partial minutes should round up so users never get 0 min left when reading remains
    expect(progressTracker.calculateMinutesLeft(50, 220)).toBe(1);
  });
});

