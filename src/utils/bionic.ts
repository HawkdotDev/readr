import { BionicFixation } from '../types';

/**
 * Calculates the number of characters to bold in a word based on fixation intensity
 */
export function getFixationLength(wordLength: number, fixation: BionicFixation = 'medium'): number {
  if (wordLength <= 0) return 0;
  if (wordLength === 1) return 1;

  let ratio = 0.5;
  if (fixation === 'low') ratio = 0.35;
  if (fixation === 'high') ratio = 0.65;

  const count = Math.ceil(wordLength * ratio);
  return Math.max(1, Math.min(wordLength, count));
}

/**
 * Transforms a single plain text word into Bionic Reading HTML (<b>fixation</b>rest)
 */
export function bionicWord(word: string, fixation: BionicFixation = 'medium'): string {
  if (!word || word.trim().length === 0) return word;

  // Separate leading punctuation (e.g. quotes, brackets)
  const leadMatch = word.match(/^([^a-zA-Z0-9]+)/);
  const lead = leadMatch ? leadMatch[1] : '';
  const coreWithTrail = word.slice(lead.length);

  // Separate trailing punctuation (e.g. periods, commas, question marks)
  const trailMatch = coreWithTrail.match(/([^a-zA-Z0-9]+)$/);
  const trail = trailMatch ? trailMatch[1] : '';
  const core = coreWithTrail.slice(0, coreWithTrail.length - trail.length);

  if (!core) return word;

  const fixLen = getFixationLength(core.length, fixation);
  const boldPart = core.slice(0, fixLen);
  const normalPart = core.slice(fixLen);

  return `${lead}<b>${boldPart}</b>${normalPart}${trail}`;
}

/**
 * Transforms plain text content into Bionic Reading HTML
 */
export function transformPlainTextToBionic(text: string, fixation: BionicFixation = 'medium'): string {
  if (!text) return '';
  return text
    .split(/(\s+)/)
    .map((token) => {
      if (/^\s+$/.test(token)) return token;
      return bionicWord(token, fixation);
    })
    .join('');
}

/**
 * Transforms HTML chapter content into Bionic Reading HTML without altering HTML tags or attributes
 */
export function transformToBionicHtml(html: string, fixation: BionicFixation = 'medium'): string {
  if (!html) return '';

  // Split by HTML tags `<...>`
  const tokens = html.split(/(<[^>]+>)/g);

  return tokens
    .map((token) => {
      // If this token is an HTML tag, return it unchanged
      if (token.startsWith('<') && token.endsWith('>')) {
        return token;
      }
      // Otherwise, transform text content
      return transformPlainTextToBionic(token, fixation);
    })
    .join('');
}
