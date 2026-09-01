import { describe, it, expect } from 'bun:test';
import {
  isFontFile,
  cleanFontFamilyName,
  getLoadedCustomFonts,
} from '../../src/services/storage/fontManager';

describe('Font Manager Service', () => {
  it('correctly validates font file extensions', () => {
    expect(isFontFile('CrimsonPro.ttf')).toBe(true);
    expect(isFontFile('EB_Garamond.otf')).toBe(true);
    expect(isFontFile('Lora.woff')).toBe(true);
    expect(isFontFile('Inter.woff2')).toBe(true);
    expect(isFontFile('book.epub')).toBe(false);
    expect(isFontFile('image.png')).toBe(false);
  });

  it('cleans font family names from variant suffixes', () => {
    expect(cleanFontFamilyName('CrimsonPro-Regular.ttf')).toBe('CrimsonPro');
    expect(cleanFontFamilyName('Cinzel_Bold.otf')).toBe('Cinzel');
    expect(cleanFontFamilyName('FiraCode-Medium.woff2')).toBe('FiraCode');
    expect(cleanFontFamilyName('Literata.ttf')).toBe('Literata');
  });

  it('initializes with a loaded custom fonts array', () => {
    const fonts = getLoadedCustomFonts();
    expect(Array.isArray(fonts)).toBe(true);
  });
});
