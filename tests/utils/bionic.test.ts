import { describe, it, expect } from 'bun:test';
import {
  getFixationLength,
  bionicWord,
  transformPlainTextToBionic,
  transformToBionicHtml,
} from '../../src/utils/bionic';

describe('Bionic Reading Transformation Engine', () => {
  it('calculates fixation length correctly for low, medium, and high intensity', () => {
    // 6-letter word "reader"
    expect(getFixationLength(6, 'low')).toBe(3); // ceil(6 * 0.35) = 3
    expect(getFixationLength(6, 'medium')).toBe(3); // ceil(6 * 0.5) = 3
    expect(getFixationLength(6, 'high')).toBe(4); // ceil(6 * 0.65) = 4

    // 1-letter word
    expect(getFixationLength(1, 'low')).toBe(1);
    expect(getFixationLength(1, 'medium')).toBe(1);
    expect(getFixationLength(1, 'high')).toBe(1);

    // 10-letter word "comprehend"
    expect(getFixationLength(10, 'low')).toBe(4);
    expect(getFixationLength(10, 'medium')).toBe(5);
    expect(getFixationLength(10, 'high')).toBe(7);
  });

  it('bolds word core without corrupting leading or trailing punctuation', () => {
    expect(bionicWord('hello', 'medium')).toBe('<b>hel</b>lo');
    expect(bionicWord('"world!"', 'medium')).toBe('"<b>wor</b>ld!"');
    expect(bionicWord('(example)', 'medium')).toBe('(<b>exam</b>ple)');
    expect(bionicWord('fast...', 'medium')).toBe('<b>fa</b>st...');
  });

  it('transforms multi-word plain text strings accurately', () => {
    const text = 'Readr is an ultra-fast reading app.';
    const result = transformPlainTextToBionic(text, 'medium');

    expect(result).toContain('<b>Rea</b>dr');
    expect(result).toContain('<b>i</b>s');
    expect(result).toContain('<b>a</b>n');
    expect(result).toContain('<b>ap</b>p.');
  });

  it('transforms HTML content without breaking or modifying HTML tags or attributes', () => {
    const sampleHtml = `<h1 class="chapter-title">Chapter One</h1><p>It was a <em>bright</em> cold day in April.</p>`;
    const transformed = transformToBionicHtml(sampleHtml, 'medium');

    // Tags should remain intact
    expect(transformed).toContain('<h1 class="chapter-title">');
    expect(transformed).toContain('</h1>');
    expect(transformed).toContain('<p>');
    expect(transformed).toContain('<em>');
    expect(transformed).toContain('</em>');
    expect(transformed).toContain('</p>');

    // Words inside should be transformed
    expect(transformed).toContain('<b>Chap</b>ter');
    expect(transformed).toContain('<b>On</b>e');
    expect(transformed).toContain('<b>bri</b>ght');
    expect(transformed).toContain('<b>Apr</b>il.');
  });
});
