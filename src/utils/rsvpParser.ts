import { RSVPWordToken } from '../types/rsvp';

/**
 * Calculates Optimal Recognition Point (ORP) index inside a word.
 * Based on eye-tracking research, the eye naturally fixates ~30-35%
 * into a word for optimal visual recognition without saccadic refixation.
 */
export function calculateORPIndex(wordLength: number): number {
  if (wordLength <= 1) return 0;
  if (wordLength <= 5) return 1;
  if (wordLength <= 9) return 2;
  if (wordLength <= 13) return 3;
  return 4;
}

/**
 * Calculates delay multiplier based on terminal/comma punctuation and word length.
 */
export function calculateDelayMultiplier(word: string): number {
  const trimmed = word.trim();
  if (/[.?!:][)'"”’]*$/.test(trimmed)) {
    return 1.8; // Sentence end pause
  }
  if (/[,;—–-][)'"”’]*$/.test(trimmed)) {
    return 1.4; // Mid-sentence clause pause
  }
  if (trimmed.length >= 11) {
    return 1.3; // Extended technical/complex word
  }
  return 1.0;
}

/**
 * Tokenizes raw chapter text or HTML into structured RSVP word tokens.
 */
export function tokenizeChapterForRSVP(rawText: string): RSVPWordToken[] {
  if (!rawText) return [];

  // Strip HTML tags if present
  const plainText = rawText
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim();

  const words = plainText.split(' ').filter((w) => w.trim().length > 0);

  return words.map((word) => {
    const orpIndex = calculateORPIndex(word.length);
    const prefix = word.slice(0, orpIndex);
    const orpChar = word.charAt(orpIndex);
    const suffix = word.slice(orpIndex + 1);
    const delayMultiplier = calculateDelayMultiplier(word);

    return {
      text: word,
      prefix,
      orpChar,
      suffix,
      orpIndex,
      delayMultiplier,
    };
  });
}

/**
 * Converts Words-Per-Minute (WPM) to base frame interval in milliseconds.
 */
export function wpmToBaseIntervalMs(wpm: number): number {
  const clampedWpm = Math.max(150, Math.min(1200, wpm || 350));
  return Math.round(60000 / clampedWpm);
}
