import { describe, it, expect } from 'bun:test';
import {
  escapeRegex,
  buildReplacementRegex,
  applyNameReplacements,
  applyNameReplacementsToHtml,
  NAME_REPLACEMENT_PRESETS,
} from '../../src/utils/nameReplacer';
import { NameReplacementRule } from '../../src/types/nameReplacer';

describe('Name Replacement & Role Reversal Engine', () => {
  it('escapes regex special characters safely', () => {
    const input = 'Dr. Watson (M.D.) [Specialist] *Senior*? +Chief^ $Lead|';
    const escaped = escapeRegex(input);
    expect(escaped).toBe('Dr\\. Watson \\(M\\.D\\.\\) \\[Specialist\\] \\*Senior\\*\\? \\+Chief\\^ \\$Lead\\|');
  });

  it('builds replacement regex for case-insensitive and case-sensitive matching', () => {
    const caseSensitive = buildReplacementRegex('Sherlock', true, false);
    expect('Sherlock'.replace(caseSensitive!, 'Replaced')).toBe('Replaced');
    expect('sherlock'.replace(caseSensitive!, 'Replaced')).toBe('sherlock');

    const caseInsensitive = buildReplacementRegex('Sherlock', false, false);
    expect('Sherlock'.replace(caseInsensitive!, 'Replaced')).toBe('Replaced');
    expect('sherlock'.replace(caseInsensitive!, 'Replaced')).toBe('Replaced');
    expect('SHERLOCK'.replace(caseInsensitive!, 'Replaced')).toBe('Replaced');
  });


  it('respects whole-word boundary matching', () => {
    const wholeWordRegex = buildReplacementRegex('cat', false, true);
    expect(wholeWordRegex).not.toBeNull();

    const sample = 'The cat in the catalog caught a catfish.';
    const replaced = sample.replace(wholeWordRegex!, 'feline');
    expect(replaced).toBe('The feline in the catalog caught a catfish.');
  });

  it('applies multiple active replacement rules sequentially', () => {
    const rules: NameReplacementRule[] = [
      {
        id: '1',
        bookId: 'book-123',
        findText: 'Sherlock Holmes',
        replaceText: 'Detective Alex',
        matchCase: false,
        wholeWord: true,
        isActive: true,
      },
      {
        id: '2',
        bookId: 'book-123',
        findText: 'Dr. Watson',
        replaceText: 'Dr. Morgan',
        matchCase: false,
        wholeWord: true,
        isActive: true,
      },
      {
        id: '3',
        bookId: 'book-123',
        findText: 'London',
        replaceText: 'Neo-Tokyo',
        matchCase: false,
        wholeWord: true,
        isActive: false, // Inactive rule should not be applied
      },
    ];

    const input = 'Sherlock Holmes and Dr. Watson took a hansom cab through London in the dense fog.';
    const result = applyNameReplacements(input, rules);

    expect(result).toBe('Detective Alex and Dr. Morgan took a hansom cab through London in the dense fog.');
  });

  it('ignores inactive rules and empty inputs gracefully', () => {
    const rules: NameReplacementRule[] = [
      {
        id: '1',
        bookId: 'book-123',
        findText: 'Sherlock',
        replaceText: 'Alex',
        matchCase: false,
        wholeWord: true,
        isActive: false,
      },
      {
        id: '2',
        bookId: 'book-123',
        findText: '',
        replaceText: 'Alex',
        matchCase: false,
        wholeWord: true,
        isActive: true,
      },
    ];

    expect(applyNameReplacements('', rules)).toBe('');
    expect(applyNameReplacements('Sherlock was here', rules)).toBe('Sherlock was here');
  });

  it('applies name replacements to HTML without corrupting HTML tags or attributes', () => {
    const rules: NameReplacementRule[] = [
      {
        id: '1',
        bookId: 'book-123',
        findText: 'Sherlock',
        replaceText: 'Alex',
        matchCase: false,
        wholeWord: true,
        isActive: true,
      },
    ];

    const htmlInput = '<p class="sherlock-quote" id="sherlock_p1">Sherlock observed the scene with intense focus.</p>';
    const result = applyNameReplacementsToHtml(htmlInput, rules);

    expect(result).toBe('<p class="sherlock-quote" id="sherlock_p1">Alex observed the scene with intense focus.</p>');
  });

  it('verifies built-in presets have valid configuration', () => {
    expect(NAME_REPLACEMENT_PRESETS.length).toBeGreaterThanOrEqual(3);

    for (const preset of NAME_REPLACEMENT_PRESETS) {
      expect(preset.id).toBeTruthy();
      expect(preset.label).toBeTruthy();
      expect(preset.rules.length).toBeGreaterThan(0);
      for (const rule of preset.rules) {
        expect(rule.findText).toBeTruthy();
        expect(rule.replaceText).toBeTruthy();
      }
    }
  });
});
