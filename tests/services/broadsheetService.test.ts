import { describe, it, expect } from 'bun:test';
import {
  BROADSHEET_DISPATCHES,
  getDailyBroadsheetDispatch,
  getBroadsheetDispatchesByCategory,
  getRandomBroadsheetDispatch,
} from '../../src/services/editorial/broadsheetService';

describe('Broadsheet Editorial Service', () => {
  it('contains curated timeless literary dispatches with required editorial fields', () => {
    expect(BROADSHEET_DISPATCHES.length).toBeGreaterThanOrEqual(10);
    for (const d of BROADSHEET_DISPATCHES) {
      expect(d.id).toBeDefined();
      expect(typeof d.id).toBe('string');
      expect(['philosophy', 'poetry', 'fiction', 'essays']).toContain(d.category);
      expect(d.title.length).toBeGreaterThan(0);
      expect(d.author.length).toBeGreaterThan(0);
      expect(d.source.length).toBeGreaterThan(0);
      expect(d.year.length).toBeGreaterThan(0);
      expect(d.readTimeSeconds).toBeGreaterThan(0);
      expect(d.keyInsight.length).toBeGreaterThan(0);
      expect(d.text.length).toBeGreaterThan(50);
    }
  });

  it('deterministically returns daily dispatch based on reference date', () => {
    const d1 = new Date(2026, 8, 6);
    const d2 = new Date(2026, 8, 6);
    const dispatch1 = getDailyBroadsheetDispatch(d1);
    const dispatch2 = getDailyBroadsheetDispatch(d2);

    expect(dispatch1.id).toBe(dispatch2.id);
    expect(dispatch1.author).toBe(dispatch2.author);
  });

  it('filters dispatches by category accurately', () => {
    const philosophy = getBroadsheetDispatchesByCategory('philosophy');
    expect(philosophy.length).toBeGreaterThan(0);
    expect(philosophy.every((d) => d.category === 'philosophy')).toBe(true);

    const poetry = getBroadsheetDispatchesByCategory('poetry');
    expect(poetry.length).toBeGreaterThan(0);
    expect(poetry.every((d) => d.category === 'poetry')).toBe(true);

    const all = getBroadsheetDispatchesByCategory('all');
    expect(all.length).toBe(BROADSHEET_DISPATCHES.length);
  });

  it('shuffles to a random dispatch and respects exclusion ID', () => {
    const current = BROADSHEET_DISPATCHES[0];
    const next = getRandomBroadsheetDispatch(current.id, 'all');
    expect(next.id).not.toBe(current.id);
  });
});
