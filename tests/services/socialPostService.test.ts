import { describe, it, expect } from 'bun:test';
import {
  generateWordSocialPost,
  SOCIAL_CARD_THEMES,
} from '../../src/services/share/socialPostService';
import { LiteraryWord } from '../../src/services/editorial/literaryLexiconService';

const mockWord: LiteraryWord = {
  id: 'test_apricity',
  word: 'Apricity',
  phonetic: '/eɪˈprɪs.ə.ti/',
  partOfSpeech: 'noun',
  definition: 'The pleasant, restorative warmth of the sun on a cold winter day.',
  literaryExample: 'She paused in the monastery courtyard to bathe in the golden apricity.',
  citation: 'Historical English (1623)',
  etymology: 'From Latin apricitas, from apricus (“exposed to the sun”).',
};

describe('Social Post Service', () => {
  it('has all 4 signature themes configured with valid colors', () => {
    const themeIds = ['paper', 'obsidian', 'bookcloth', 'bento'];
    themeIds.forEach((id) => {
      const theme = SOCIAL_CARD_THEMES[id];
      expect(theme).toBeDefined();
      expect(theme.backgroundColor).toMatch(/^#[0-9A-Fa-f]{6}$/);
      expect(theme.cardBorderColor).toMatch(/^#[0-9A-Fa-f]{6}$/);
      expect(theme.primaryTextColor).toMatch(/^#[0-9A-Fa-f]{6}$/);
      expect(theme.accentColor).toMatch(/^#[0-9A-Fa-f]{6}$/);
    });
  });

  it('generates Twitter/X optimized post text with hashtags and handle', () => {
    const tweet = generateWordSocialPost(mockWord, 'twitter');
    expect(tweet).toContain('Apricity');
    expect(tweet).toContain('/eɪˈprɪs.ə.ti/');
    expect(tweet).toContain('noun');
    expect(tweet).toContain('warmth of the sun');
    expect(tweet).toContain('#WordOfTheDay');
    expect(tweet).toContain('@ReadrApp');
  });

  it('generates Threads and Instagram rich post with full literary breakdown', () => {
    const threadsPost = generateWordSocialPost(mockWord, 'threads');
    expect(threadsPost).toContain('WORD OF THE DAY: APRICITY');
    expect(threadsPost).toContain('Definition:');
    expect(threadsPost).toContain('In Literature:');
    expect(threadsPost).toContain('Origin:');
    expect(threadsPost).toContain('Latin apricitas');
    expect(threadsPost).toContain('#BookTok');
  });

  it('generates WhatsApp formatted text with bold and italic markdown markers', () => {
    const waText = generateWordSocialPost(mockWord, 'whatsapp');
    expect(waText).toContain('*Apricity*');
    expect(waText).toContain('_noun_');
    expect(waText).toContain('*Definition:*');
    expect(waText).toContain('_Shared via Readr_');
  });

  it('generates clean general fallback text', () => {
    const generalText = generateWordSocialPost(mockWord, 'general');
    expect(generalText).toContain('Word of the Day: Apricity');
    expect(generalText).toContain('Read via Readr');
  });
});
