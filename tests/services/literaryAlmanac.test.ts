import { describe, it, expect } from 'bun:test';
import {
  getTodayInLiterature,
  getRandomAlmanacEvent,
  LITERARY_ALMANAC_EVENTS,
} from '../../src/services/editorial/literaryAlmanacService';

describe('Literary Almanac Service', () => {
  it('has valid curated historic events with required fields', () => {
    expect(LITERARY_ALMANAC_EVENTS.length).toBeGreaterThanOrEqual(5);

    LITERARY_ALMANAC_EVENTS.forEach((event) => {
      expect(event.id).toBeDefined();
      expect(event.headline.length).toBeGreaterThan(0);
      expect(event.description.length).toBeGreaterThan(0);
      expect(event.year).toBeGreaterThan(1500);
      expect(event.accentColor).toMatch(/^#[0-9A-Fa-f]{6}$/);
    });
  });

  it('returns a valid daily literary event for current date', () => {
    const todayEvent = getTodayInLiterature();
    expect(todayEvent).toBeDefined();
    expect(todayEvent.headline).toBeDefined();
    expect(todayEvent.significance).toBeDefined();
  });

  it('returns random event excluding a specific ID', () => {
    const first = LITERARY_ALMANAC_EVENTS[0];
    const random = getRandomAlmanacEvent(first.id);
    expect(random).toBeDefined();
    expect(random.id).not.toBe(first.id);
  });

  it('returns the authentic literary event for September 5 (Jack Kerouac - On the Road)', () => {
    const sep5Date = new Date(2026, 8, 5); // Month 8 is September (0-indexed)
    const event = getTodayInLiterature(sep5Date);
    expect(event).toBeDefined();
    expect(event.dateStr).toBe('September 5');
    expect(event.year).toBe(1957);
    expect(event.authorOrBook).toBe('Jack Kerouac');
    expect(event.headline).toContain('On the Road');
    expect(event.category).toBe('Publication');
  });
});
