import { describe, it, expect } from 'bun:test';
import {
  CircadianService,
  DEFAULT_CIRCADIAN_CONFIG,
} from '../../src/services/theme/circadianService';

describe('Circadian Rhythm Warmth Service', () => {
  it('returns zero warmth during midday in solar mode', () => {
    const midday = new Date('2026-03-15T12:00:00');
    const warmth = CircadianService.calculateSolarWarmth(midday, 0.65);
    expect(warmth).toBe(0.0);
  });

  it('elevates warmth to target level during deep night in solar mode', () => {
    const midnight = new Date('2026-03-15T23:30:00');
    const warmth = CircadianService.calculateSolarWarmth(midnight, 0.65);
    expect(warmth).toBe(0.65);
  });

  it('smoothly interpolates evening sunset warmth', () => {
    const dusk = new Date('2026-03-15T20:00:00'); // Halfway through 18:00 - 22:00
    const warmth = CircadianService.calculateSolarWarmth(dusk, 0.65);
    expect(warmth).toBeGreaterThan(0.2);
    expect(warmth).toBeLessThan(0.5);
  });

  it('evaluates scheduled warmth window correctly across midnight', () => {
    // Schedule 21:00 (9 PM) to 07:00 (7 AM)
    const night = new Date('2026-03-15T22:00:00');
    const afternoon = new Date('2026-03-15T15:00:00');

    const nightWarmth = CircadianService.calculateScheduledWarmth(night, 21, 7, 0.7);
    const dayWarmth = CircadianService.calculateScheduledWarmth(afternoon, 21, 7, 0.7);

    expect(nightWarmth).toBe(0.7);
    expect(dayWarmth).toBe(0.0);
  });

  it('respects enabled flag in evaluateWarmth', () => {
    const night = new Date('2026-03-15T23:00:00');
    const disabledConfig = { ...DEFAULT_CIRCADIAN_CONFIG, enabled: false };
    const enabledConfig = { ...DEFAULT_CIRCADIAN_CONFIG, enabled: true };

    expect(CircadianService.evaluateWarmth(disabledConfig, night)).toBe(0.0);
    expect(CircadianService.evaluateWarmth(enabledConfig, night)).toBeGreaterThan(0.0);
  });

  it('formats hours into human-readable AM/PM strings', () => {
    expect(CircadianService.formatHour(21)).toBe('9:00 PM');
    expect(CircadianService.formatHour(7)).toBe('7:00 AM');
    expect(CircadianService.formatHour(0)).toBe('12:00 AM');
    expect(CircadianService.formatHour(12)).toBe('12:00 PM');
  });
});
