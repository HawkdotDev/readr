import { describe, it, expect } from 'bun:test';
import {
  isValidCfi,
  parseCfi,
  createChapterCfi,
  compareCfi,
} from '../../src/services/reader/engine/cfiEngine';
import { generateFoliateHtml } from '../../src/services/reader/engine/foliateRuntime';

describe('EPUB Canonical Fragment Identifier (CFI) Engine', () => {
  it('validates CFI format strings correctly', () => {
    expect(isValidCfi('epubcfi(/6/4[chap01]!/4/2/10,/1:0,/1:25)')).toBe(true);
    expect(isValidCfi('epubcfi(/6/2!/4/2:0)')).toBe(true);
    expect(isValidCfi('chap_1_pos_100')).toBe(false);
    expect(isValidCfi('')).toBe(false);
  });

  it('parses standard CFI into steps, spine index, and character offset', () => {
    const parsed = parseCfi('epubcfi(/6/4[chap01]!/4/2:42)');
    expect(parsed.raw).toBe('epubcfi(/6/4[chap01]!/4/2:42)');
    expect(parsed.characterOffset).toBe(42);
    expect(parsed.spineIndex).toBe(1); // (4 / 2) - 1 = 1 (second chapter)
    expect(parsed.steps.length).toBeGreaterThanOrEqual(2);
    expect(parsed.steps[1].id).toBe('chap01');
  });

  it('parses range CFIs accurately', () => {
    const parsedRange = parseCfi('epubcfi(/6/4!/4/2,/1:0,/1:25)');
    expect(parsedRange.isRange).toBe(true);
    expect(parsedRange.rangeStart).toBeDefined();
    expect(parsedRange.rangeEnd).toBeDefined();
  });

  it('generates consistent chapter CFIs', () => {
    const cfiChap0 = createChapterCfi(0, 0);
    expect(cfiChap0).toBe('epubcfi(/6/2!/4/2:0)');

    const cfiChap5 = createChapterCfi(5, 120);
    expect(cfiChap5).toBe('epubcfi(/6/12!/4/2:120)');
  });

  it('chronologically compares and sorts CFIs', () => {
    const cfiEarly = 'epubcfi(/6/2!/4/2:10)';
    const cfiLate = 'epubcfi(/6/2!/4/2:50)';
    const cfiNextChap = 'epubcfi(/6/4!/4/2:5)';

    expect(compareCfi(cfiEarly, cfiLate)).toBe(-1);
    expect(compareCfi(cfiLate, cfiEarly)).toBe(1);
    expect(compareCfi(cfiEarly, cfiEarly)).toBe(0);
    expect(compareCfi(cfiLate, cfiNextChap)).toBe(-1);
  });
});

describe('Foliate Micro-Runtime HTML Generator', () => {
  it('generates zero-FOUC self-contained HTML bundle with theme CSS variables', () => {
    const html = generateFoliateHtml('<h1>Chapter 1</h1><p>Down the Rabbit-Hole</p>', {
      fontSize: 18,
      fontFamily: 'MonaSans-Regular',
      lineHeight: 1.6,
      marginHorizontal: 24,
      textAlign: 'justify',
      colors: {
        canvas: '#0D0D11',
        surface: '#18181B',
        border: '#27272A',
        textPrimary: '#FAFAFA',
        textSecondary: '#A1A1AA',
        accent: '#3B82F6',
        isDark: true,
      },
      readingDirection: 'horizontal',
      bionicReadingEnabled: false,
      bionicFixation: 'medium',
      paragraphIndent: 1.0,
      paragraphSpacing: 1.0,
      dropCaps: true,
    });

    expect(html).toContain('<!DOCTYPE html>');
    expect(html).toContain('--readr-canvas: #0D0D11');
    expect(html).toContain('--readr-text: #FAFAFA');
    expect(html).toContain('--readr-font-size: 18px');
    expect(html).toContain('column-width: 100vw');
    expect(html).toContain('window.ReadrEngine');
    expect(html).toContain('Down the Rabbit-Hole');
  });
});
