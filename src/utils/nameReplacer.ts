import { NameReplacementRule, NameReplacementPreset } from '../types/nameReplacer';

/**
 * Escapes regex special characters to safely use user input inside RegExp.
 */
export function escapeRegex(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Constructs a RegExp for a given search string, respecting matchCase and wholeWord boundary options.
 */
export function buildReplacementRegex(findText: string, matchCase: boolean, wholeWord: boolean): RegExp | null {
  const trimmed = findText.trim();
  if (!trimmed) return null;

  const escaped = escapeRegex(trimmed);
  const flags = matchCase ? 'g' : 'gi';

  if (!wholeWord) {
    return new RegExp(escaped, flags);
  }

  // Word boundary construction that handles phrases & punctuation cleanly
  const startsWithWordChar = /^\w/.test(trimmed);
  const endsWithWordChar = /\w$/.test(trimmed);

  const leadingBoundary = startsWithWordChar ? '\\b' : '';
  const trailingBoundary = endsWithWordChar ? '\\b' : '';

  return new RegExp(`${leadingBoundary}${escaped}${trailingBoundary}`, flags);
}

interface CompiledRuleBundle {
  regex: RegExp;
  sortedRules: NameReplacementRule[];
}

const REGEX_BUNDLE_CACHE = new Map<string, CompiledRuleBundle>();
const MAX_CACHE_SIZE = 64;

function getRuleBundleKey(rules: NameReplacementRule[]): string {
  return rules
    .filter((r) => r.isActive && r.findText.trim())
    .map((r) => `${r.findText}:${r.replaceText}:${r.matchCase ? 1 : 0}:${r.wholeWord ? 1 : 0}`)
    .join('|');
}

/**
 * Compiles or retrieves the cached combined RegExp bundle for a set of rules.
 */
export function getCompiledRuleBundle(rules: NameReplacementRule[]): CompiledRuleBundle | null {
  const cacheKey = getRuleBundleKey(rules);
  if (!cacheKey) return null;

  const cached = REGEX_BUNDLE_CACHE.get(cacheKey);
  if (cached) return cached;

  const activeRules = rules.filter((r) => r.isActive && r.findText.trim());
  if (activeRules.length === 0) return null;

  // Sort by findText length descending so longer multi-word phrases match before shorter substrings
  const sortedRules = [...activeRules].sort(
    (a, b) => b.findText.trim().length - a.findText.trim().length
  );

  const patternParts = sortedRules.map((rule, index) => {
    const trimmed = rule.findText.trim();
    const escaped = escapeRegex(trimmed);
    const startsWithWordChar = /^\w/.test(trimmed);
    const endsWithWordChar = /\w$/.test(trimmed);
    const lb = rule.wholeWord && startsWithWordChar ? '\\b' : '';
    const tb = rule.wholeWord && endsWithWordChar ? '\\b' : '';
    return `(?<r${index}>${lb}${escaped}${tb})`;
  });

  const bundle: CompiledRuleBundle = {
    regex: new RegExp(patternParts.join('|'), 'gi'),
    sortedRules,
  };

  if (REGEX_BUNDLE_CACHE.size >= MAX_CACHE_SIZE) {
    const firstKey = REGEX_BUNDLE_CACHE.keys().next().value;
    if (firstKey) REGEX_BUNDLE_CACHE.delete(firstKey);
  }
  REGEX_BUNDLE_CACHE.set(cacheKey, bundle);

  return bundle;
}

/**
 * Applies all active name replacement rules to a plain text string.
 * Uses a single-pass simultaneous replacement strategy sorted by phrase length
 * to avoid cascading collisions (e.g., swapping A <-> B or multi-word character swaps).
 */
export function applyNameReplacements(text: string, rules: NameReplacementRule[]): string {
  if (!text || !rules || rules.length === 0) return text;

  const bundle = getCompiledRuleBundle(rules);
  if (!bundle) return text;

  const { regex, sortedRules } = bundle;

  try {
    return text.replace(regex, (match, ...args) => {
      const groups = args[args.length - 1];
      if (groups && typeof groups === 'object') {
        for (let i = 0; i < sortedRules.length; i++) {
          if (groups[`r${i}`] !== undefined) {
            const rule = sortedRules[i];
            if (rule.matchCase && match !== rule.findText.trim()) {
              return match;
            }
            return rule.replaceText;
          }
        }
      }

      // Fallback if named capture groups are unpopulated
      for (const rule of sortedRules) {
        const singleRegex = buildReplacementRegex(rule.findText, rule.matchCase, rule.wholeWord);
        if (singleRegex) {
          singleRegex.lastIndex = 0;
          if (singleRegex.test(match)) {
            return rule.replaceText;
          }
        }
      }

      return match;
    });
  } catch {
    // Graceful sequential fallback if RegExp execution fails
    let result = text;
    for (const rule of sortedRules) {
      const singleRegex = buildReplacementRegex(rule.findText, rule.matchCase, rule.wholeWord);
      if (!singleRegex) continue;
      result = result.replace(singleRegex, rule.replaceText);
    }
    return result;
  }
}


/**
 * Safely applies name replacement rules to HTML content without corrupting HTML tags and attributes.
 */
export function applyNameReplacementsToHtml(html: string, rules: NameReplacementRule[]): string {
  if (!html || !rules || rules.length === 0) return html;

  const activeRules = rules.filter((r) => r.isActive && r.findText.trim());
  if (activeRules.length === 0) return html;

  // Split HTML into tags and text tokens
  const tokens = html.split(/(<[^>]+>)/g);

  const processed = tokens.map((token) => {
    // If token starts with '<' and ends with '>', it is an HTML tag -> do not alter
    if (token.startsWith('<') && token.endsWith('>')) {
      return token;
    }
    // Plain text content node -> apply name replacements
    return applyNameReplacements(token, activeRules);
  });

  return processed.join('');
}

/**
 * Curated preset name replacement collections for quick role reversals and fun adaptations.
 */
export const NAME_REPLACEMENT_PRESETS: NameReplacementPreset[] = [
  {
    id: 'holmes_watson_swap',
    label: 'Sherlock & Watson Swap',
    description: 'Reverses the roles of Detective Sherlock Holmes and Dr. John Watson.',
    rules: [
      { findText: 'Sherlock Holmes', replaceText: 'Dr. Watson', matchCase: false, wholeWord: true, isActive: true },
      { findText: 'Sherlock', replaceText: 'Watson', matchCase: false, wholeWord: true, isActive: true },
      { findText: 'Holmes', replaceText: 'Watson', matchCase: false, wholeWord: true, isActive: true },
      { findText: 'Dr. Watson', replaceText: 'Detective Holmes', matchCase: false, wholeWord: true, isActive: true },
      { findText: 'Watson', replaceText: 'Holmes', matchCase: false, wholeWord: true, isActive: true },
    ],
  },
  {
    id: 'cyberpunk_noir',
    label: 'Cyberpunk Sci-Fi Twist',
    description: 'Transposes classic settings into a futuristic cyberpunk metropolis.',
    rules: [
      { findText: 'carriage', replaceText: 'hover-cab', matchCase: false, wholeWord: true, isActive: true },
      { findText: 'cab', replaceText: 'spinner', matchCase: false, wholeWord: true, isActive: true },
      { findText: 'letter', replaceText: 'neural-dispatch', matchCase: false, wholeWord: true, isActive: true },
      { findText: 'telegram', replaceText: 'quantum encrypted packet', matchCase: false, wholeWord: true, isActive: true },
      { findText: 'revolver', replaceText: 'plasma pistol', matchCase: false, wholeWord: true, isActive: true },
      { findText: 'gas-lamp', replaceText: 'neon halo', matchCase: false, wholeWord: true, isActive: true },
    ],
  },
  {
    id: 'modern_detective',
    label: 'Modern Tech Investigator',
    description: 'Modernizes Victorian terms to contemporary digital investigative jargon.',
    rules: [
      { findText: 'scandal', replaceText: 'data leak', matchCase: false, wholeWord: true, isActive: true },
      { findText: 'journal', replaceText: 'encrypted tablet', matchCase: false, wholeWord: true, isActive: true },
      { findText: 'hansom', replaceText: 'rideshare', matchCase: false, wholeWord: true, isActive: true },
      { findText: 'Scotland Yard', replaceText: 'Interpol HQ', matchCase: false, wholeWord: true, isActive: true },
    ],
  },
  {
    id: 'regal_gender_flip',
    label: 'Regal Title Swap',
    description: 'Swaps traditional royal and noble hierarchy titles.',
    rules: [
      { findText: 'King', replaceText: 'Queen', matchCase: true, wholeWord: true, isActive: true },
      { findText: 'Queen', replaceText: 'King', matchCase: true, wholeWord: true, isActive: true },
      { findText: 'Prince', replaceText: 'Princess', matchCase: true, wholeWord: true, isActive: true },
      { findText: 'Princess', replaceText: 'Prince', matchCase: true, wholeWord: true, isActive: true },
      { findText: 'Lord', replaceText: 'Lady', matchCase: true, wholeWord: true, isActive: true },
      { findText: 'Lady', replaceText: 'Lord', matchCase: true, wholeWord: true, isActive: true },
    ],
  },
];
