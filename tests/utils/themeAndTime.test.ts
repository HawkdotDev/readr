import { describe, it, expect } from 'bun:test';
import {
  THEME_PALETTES,
  getResolvedThemeColors,
  getWarmthOverlayColor,
} from '../../src/utils/theme';
import { formatDurationSeconds, formatRelativeDate } from '../../src/utils/time';

describe('Theme and Color Utilities', () => {
  it('resolves explicit theme palettes accurately', () => {
    const light = getResolvedThemeColors('light', false);
    expect(light.canvas).toBe('#FAF7F2');
    expect(light.surface).toBe('#F1EFEA');
    expect(light.isDark).toBe(false);

    const dark = getResolvedThemeColors('dark', false);
    expect(dark.canvas).toBe('#18181B');
    expect(dark.surface).toBe('#27272A');
    expect(dark.isDark).toBe(true);

    const sepia = getResolvedThemeColors('sepia', false);
    expect(sepia.canvas).toBe('#F4EFE6');
    expect(sepia.isDark).toBe(false);

    const oled = getResolvedThemeColors('oled', false);
    expect(oled.canvas).toBe('#000000');
    expect(oled.isDark).toBe(true);
  });

  it('resolves system theme based on device color scheme', () => {
    const systemDark = getResolvedThemeColors('system', true);
    expect(systemDark.isDark).toBe(true);
    expect(systemDark.canvas).toBe(THEME_PALETTES.dark.canvas);

    const systemLight = getResolvedThemeColors('system', false);
    expect(systemLight.isDark).toBe(false);
    expect(systemLight.canvas).toBe(THEME_PALETTES.light.canvas);
  });

  it('calculates warmth overlay alpha correctly', () => {
    expect(getWarmthOverlayColor(0)).toBe('transparent');
    expect(getWarmthOverlayColor(0.01)).toBe('transparent');

    const halfWarmth = getWarmthOverlayColor(0.5);
    expect(halfWarmth).toContain('rgba(180, 160, 140, 0.15)');

    const maxWarmth = getWarmthOverlayColor(1.0);
    expect(maxWarmth).toContain('rgba(180, 160, 140, 0.30)');
  });
});

describe('Time and Duration Utilities', () => {
  it('formats seconds into clean short durations', () => {
    expect(formatDurationSeconds(0)).toBe('0s');
    expect(formatDurationSeconds(45)).toBe('45s');
    expect(formatDurationSeconds(60)).toBe('1m');
    expect(formatDurationSeconds(150)).toBe('2m');
    expect(formatDurationSeconds(3600)).toBe('1h');
    expect(formatDurationSeconds(3900)).toBe('1h 5m');
    expect(formatDurationSeconds(7200)).toBe('2h');
  });

  it('formats relative dates accurately', () => {
    expect(formatRelativeDate(null)).toBe('Never');
    expect(formatRelativeDate(undefined)).toBe('Never');

    const now = new Date();
    expect(formatRelativeDate(now)).toBe('Just now');

    const tenMinsAgo = new Date(now.getTime() - 10 * 60 * 1000);
    expect(formatRelativeDate(tenMinsAgo)).toBe('10m ago');

    const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);
    expect(formatRelativeDate(twoHoursAgo)).toBe('2h ago');

    const yesterday = new Date(now.getTime() - 25 * 60 * 60 * 1000);
    expect(formatRelativeDate(yesterday)).toBe('Yesterday');

    const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
    expect(formatRelativeDate(threeDaysAgo)).toBe('3d ago');
  });
});
