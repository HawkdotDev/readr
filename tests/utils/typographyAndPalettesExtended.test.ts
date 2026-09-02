import { describe, it, expect } from 'bun:test';
import {
  THEME_PALETTES,
  getResolvedThemeColors,
  getWarmthOverlayColor,
} from '../../src/utils/theme';

describe('Typography, Palette & Display Math Engine', () => {
  it('verifies all 12 signature reading palettes have complete color sets', () => {
    const paletteKeys = Object.keys(THEME_PALETTES) as (keyof typeof THEME_PALETTES)[];
    expect(paletteKeys.length).toBe(12);

    for (const key of paletteKeys) {
      const p = THEME_PALETTES[key];
      expect(p.canvas).toMatch(/^#[0-9A-Fa-f]{6}$/);
      expect(p.surface).toMatch(/^#[0-9A-Fa-f]{6}$/);
      expect(p.border).toMatch(/^#[0-9A-Fa-f]{6}$/);
      expect(p.textPrimary).toMatch(/^#[0-9A-Fa-f]{6}$/);
      expect(p.textSecondary).toMatch(/^#[0-9A-Fa-f]{6}$/);
      expect(p.accent).toMatch(/^#[0-9A-Fa-f]{6}$/);
      expect(typeof p.isDark).toBe('boolean');
    }
  });

  it('correctly resolves system theme mode based on device dark/light state', () => {
    const lightSys = getResolvedThemeColors('system', false);
    expect(lightSys.isDark).toBe(false);
    expect(lightSys.canvas).toBe(THEME_PALETTES.light.canvas);

    const darkSys = getResolvedThemeColors('system', true);
    expect(darkSys.isDark).toBe(true);
    expect(darkSys.canvas).toBe(THEME_PALETTES.dark.canvas);
  });

  it('calculates warmth overlay alpha correctly without exceeding maximum opacity', () => {
    expect(getWarmthOverlayColor(0.0)).toBe('transparent');
    expect(getWarmthOverlayColor(0.005)).toBe('transparent');

    const midWarmth = getWarmthOverlayColor(0.5);
    expect(midWarmth).toContain('rgba(230, 138, 34,');

    const maxWarmth = getWarmthOverlayColor(1.0);
    expect(maxWarmth).toContain('rgba(230, 138, 34,');
  });

  it('validates theme contrast and accessibility for dark and light palettes', () => {
    const darkPalette = THEME_PALETTES.oled;
    expect(darkPalette.isDark).toBe(true);
    expect(darkPalette.canvas).toBe('#000000');

    const sepiaPalette = THEME_PALETTES.sepia;
    expect(sepiaPalette.isDark).toBe(false);
    expect(sepiaPalette.textPrimary).toBe('#262421');
  });
});

