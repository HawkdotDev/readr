import { describe, it, expect } from 'bun:test';
import {
  getWordOfTheDay,
  getRandomLiteraryWord,
  LITERARY_WORDS,
} from '../../src/services/editorial/literaryLexiconService';
import {
  getTodayOpeningSentence,
  getRandomOpeningSentence,
  FAMOUS_OPENING_LINES,
} from '../../src/services/editorial/openingLinesService';
import {
  getTodayLiteraryLore,
  getRandomLiteraryLore,
  LITERARY_LORE_STORIES,
} from '../../src/services/editorial/literaryLoreService';

describe('Creative Feed Services', () => {
  describe('Literary Lexicon Service', () => {
    it('has valid words with definitions, citations, and phonetics', () => {
      expect(LITERARY_WORDS.length).toBeGreaterThanOrEqual(5);
      LITERARY_WORDS.forEach((w) => {
        expect(w.word.length).toBeGreaterThan(0);
        expect(w.phonetic).toMatch(/^\/.*\/$/);
        expect(w.definition.length).toBeGreaterThan(0);
        expect(w.literaryExample.length).toBeGreaterThan(0);
      });
    });

    it('returns a word of the day deterministically', () => {
      const w1 = getWordOfTheDay(new Date('2026-09-04'));
      const w2 = getWordOfTheDay(new Date('2026-09-04'));
      expect(w1.id).toBe(w2.id);
    });

    it('shuffles to a different word when requested', () => {
      const first = LITERARY_WORDS[0];
      const random = getRandomLiteraryWord(first.id);
      expect(random.id).not.toBe(first.id);
    });
  });

  describe('Opening Lines Service', () => {
    it('has iconic opening lines with title, author, and significance', () => {
      expect(FAMOUS_OPENING_LINES.length).toBeGreaterThanOrEqual(5);
      FAMOUS_OPENING_LINES.forEach((line) => {
        expect(line.openingSentence.length).toBeGreaterThan(0);
        expect(line.title.length).toBeGreaterThan(0);
        expect(line.author.length).toBeGreaterThan(0);
        expect(line.significance.length).toBeGreaterThan(0);
      });
    });

    it('returns opening sentence of the day', () => {
      const line = getTodayOpeningSentence();
      expect(line).toBeDefined();
      expect(line.title).toBeDefined();
    });

    it('shuffles to a different opening sentence', () => {
      const first = FAMOUS_OPENING_LINES[0];
      const random = getRandomOpeningSentence(first.id);
      expect(random.id).not.toBe(first.id);
    });
  });

  describe('Literary Lore Service', () => {
    it('has micro-essays with era, takeaway, and story', () => {
      expect(LITERARY_LORE_STORIES.length).toBeGreaterThanOrEqual(3);
      LITERARY_LORE_STORIES.forEach((lore) => {
        expect(lore.headline.length).toBeGreaterThan(0);
        expect(lore.story.length).toBeGreaterThan(0);
        expect(lore.takeaway.length).toBeGreaterThan(0);
      });
    });

    it('returns lore story of the day', () => {
      const lore = getTodayLiteraryLore();
      expect(lore).toBeDefined();
      expect(lore.headline).toBeDefined();
    });

    it('shuffles to a different lore story', () => {
      const first = LITERARY_LORE_STORIES[0];
      const random = getRandomLiteraryLore(first.id);
      expect(random.id).not.toBe(first.id);
    });
  });
});
