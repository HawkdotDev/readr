import { describe, it, expect } from 'bun:test';
import {
  BOOKCLOTH_PALETTES,
  hashStringToSeed,
  getBookclothPalette,
} from '../../src/utils/generativeCover';

describe('Generative Editorial Cover Engine', () => {
  it('has 8 distinct, sophisticated bookcloth palettes', () => {
    expect(BOOKCLOTH_PALETTES.length).toBe(8);
    for (const p of BOOKCLOTH_PALETTES) {
      expect(p.bg).toMatch(/^#[0-9A-Fa-f]{6}$/);
      expect(p.title).toMatch(/^#[0-9A-Fa-f]{6}$/);
      expect(p.author).toMatch(/^#[0-9A-Fa-f]{6}$/);
      expect(p.accent).toMatch(/^#[0-9A-Fa-f]{6}$/);
    }
  });

  it('deterministically hashes strings to non-negative integers', () => {
    const seed1 = hashStringToSeed('Moby Dick');
    const seed2 = hashStringToSeed('Moby Dick');
    const seed3 = hashStringToSeed('War and Peace');

    expect(seed1).toBe(seed2);
    expect(seed1).toBeGreaterThanOrEqual(0);
    expect(seed1).not.toBe(seed3);
  });

  it('deterministically assigns the same palette to the same book regardless of case or whitespace', () => {
    const p1 = getBookclothPalette('The Great Gatsby', 'F. Scott Fitzgerald');
    const p2 = getBookclothPalette('the great gatsby  ', ' f. scott fitzgerald');
    expect(p1.id).toBe(p2.id);
  });

  it('handles empty or missing title and author safely without throwing', () => {
    const pEmpty = getBookclothPalette('', '');
    expect(pEmpty).toBeDefined();
    expect(pEmpty.bg).toBeDefined();

    const pUndefined = getBookclothPalette(undefined as any, undefined as any);
    expect(pUndefined).toBeDefined();
    expect(pUndefined.bg).toBeDefined();
  });
});
