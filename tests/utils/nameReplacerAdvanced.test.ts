import { describe, it, expect } from 'bun:test';
import {
  escapeRegex,
  buildReplacementRegex,
  applyNameReplacements,
  applyNameReplacementsToHtml,
  NAME_REPLACEMENT_PRESETS,
} from '../../src/utils/nameReplacer';
import { NameReplacementRule } from '../../src/types/nameReplacer';

describe('Advanced Name Replacements & Role Reversal Edge Cases', () => {
  it('handles Unicode and accented characters accurately', () => {
    const rules: NameReplacementRule[] = [
      {
        id: '1',
        bookId: 'book-uni',
        findText: 'François',
        replaceText: 'Francisco',
        matchCase: true,
        wholeWord: false,
        isActive: true,
      },
      {
        id: '2',
        bookId: 'book-uni',
        findText: 'Müller',
        replaceText: 'Miller',
        matchCase: false,
        wholeWord: false,
        isActive: true,
      },
      {
        id: '3',
        bookId: 'book-uni',
        findText: 'Renée',
        replaceText: 'Renee',
        matchCase: true,
        wholeWord: true,
        isActive: true,
      },
    ];

    const input = 'François visited Mr. Müller and Renée at the café.';
    const result = applyNameReplacements(input, rules);
    expect(result).toBe('Francisco visited Mr. Miller and Renee at the café.');
  });

  it('handles terms with symbols, abbreviations, and titles', () => {
    const rules: NameReplacementRule[] = [
      {
        id: '1',
        bookId: 'book-sym',
        findText: 'Dr. John H. Watson, M.D.',
        replaceText: 'Specialist J. Watson',
        matchCase: false,
        wholeWord: false,
        isActive: true,
      },
      {
        id: '2',
        bookId: 'book-sym',
        findText: '221B Baker St.',
        replaceText: 'Sector 7-G Plaza',
        matchCase: false,
        wholeWord: false,
        isActive: true,
      },
    ];

    const input = 'Dr. John H. Watson, M.D. returned to 221B Baker St. after midnight.';
    const result = applyNameReplacements(input, rules);
    expect(result).toBe('Specialist J. Watson returned to Sector 7-G Plaza after midnight.');
  });

  it('correctly handles multi-word whole-word boundary matching', () => {
    const rules: NameReplacementRule[] = [
      {
        id: '1',
        bookId: 'book-mw',
        findText: 'Sherlock Holmes',
        replaceText: 'Detective Alex',
        matchCase: false,
        wholeWord: true,
        isActive: true,
      },
    ];

    const input = 'Sherlock Holmes spoke to Sherlock Holmesian scholars.';
    const result = applyNameReplacements(input, rules);
    // "Sherlock Holmes" should be replaced, but "Sherlock Holmesian" should not match the trailing boundary
    expect(result).toBe('Detective Alex spoke to Sherlock Holmesian scholars.');
  });

  it('handles HTML nested spans, paragraphs, and emphasis tags without corrupting markup', () => {
    const rules: NameReplacementRule[] = [
      {
        id: '1',
        bookId: 'book-html',
        findText: 'Sherlock',
        replaceText: 'Alex',
        matchCase: false,
        wholeWord: true,
        isActive: true,
      },
      {
        id: '2',
        bookId: 'book-html',
        findText: 'Watson',
        replaceText: 'Jordan',
        matchCase: false,
        wholeWord: true,
        isActive: true,
      },
    ];

    const html = '<div class="chapter-content"><p id="p-sherlock"><em>Sherlock</em> walked in with <strong>Watson</strong>.</p></div>';
    const result = applyNameReplacementsToHtml(html, rules);

    expect(result).toBe('<div class="chapter-content"><p id="p-sherlock"><em>Alex</em> walked in with <strong>Jordan</strong>.</p></div>');
  });

  it('applies built-in role reversal presets correctly on classic literature passages', () => {
    const holmesPreset = NAME_REPLACEMENT_PRESETS.find((p) => p.id === 'holmes_watson_swap')!;
    expect(holmesPreset).toBeDefined();

    const rules: NameReplacementRule[] = holmesPreset.rules.map((r, i) => ({
      ...r,
      id: `rule-${i}`,
      bookId: 'book-holmes',
    }));

    const sample = 'Sherlock Holmes listened carefully as Dr. Watson explained the strange circumstances.';
    const result = applyNameReplacements(sample, rules);

    expect(result).toContain('Watson');
    expect(result).toContain('Holmes');
  });
});
