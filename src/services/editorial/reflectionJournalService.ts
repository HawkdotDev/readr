import { EnrichedHighlight } from '../../db/queries/books';

export interface ReflectionPrompt {
  id: string;
  category: 'insight' | 'character' | 'philosophy' | 'craft' | 'takeaway';
  prompt: string;
  subtext: string;
}

export const LITERARY_REFLECTION_PROMPTS: ReflectionPrompt[] = [
  {
    id: 'ref_provocation',
    category: 'philosophy',
    prompt: 'What core belief or preconception of yours did your reading challenge today?',
    subtext: 'Great literature disquiets what was previously settled in our minds.',
  },
  {
    id: 'ref_decision',
    category: 'character',
    prompt: 'Which character made the most controversial or flawed decision today, and why?',
    subtext: 'Character is revealed not by intention, but under pressure.',
  },
  {
    id: 'ref_phrase',
    category: 'craft',
    prompt: 'What was the single most striking sentence, metaphor, or line of dialogue you encountered?',
    subtext: 'Language resonates long after the plot recedes.',
  },
  {
    id: 'ref_modern_parallel',
    category: 'insight',
    prompt: 'How does the central conflict or dilemma you read today mirror our present modern world?',
    subtext: 'Human nature rarely changes; only our instruments do.',
  },
  {
    id: 'ref_author_motive',
    category: 'craft',
    prompt: 'What urgent truth or warning do you think the author was most desperate to communicate?',
    subtext: 'Every masterpiece is an answer to a question that haunted its creator.',
  },
  {
    id: 'ref_takeaway',
    category: 'takeaway',
    prompt: 'If you could carry only one realization from this reading into your tomorrow, what would it be?',
    subtext: 'A book read without reflection is a journey without an arrival.',
  },
  {
    id: 'ref_silence',
    category: 'insight',
    prompt: 'What remains unsaid or lingering between the lines in the scenes you just read?',
    subtext: 'Subtext is often the loudest voice in the room.',
  },
  {
    id: 'ref_sympathy',
    category: 'character',
    prompt: 'Did your empathy shift toward or away from any character during today’s session?',
    subtext: 'Observing where our sympathies lie reveals our own hidden values.',
  },
];

/**
 * Returns today's reflection prompt deterministically based on date
 */
export function getTodayReflectionPrompt(date: Date = new Date()): ReflectionPrompt {
  const dayOfYear = Math.floor(
    (date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24)
  );
  const index = Math.abs(dayOfYear) % LITERARY_REFLECTION_PROMPTS.length;
  return LITERARY_REFLECTION_PROMPTS[index];
}

/**
 * Returns a random reflection prompt different from the provided id
 */
export function getRandomReflectionPrompt(excludeId?: string): ReflectionPrompt {
  const filtered = excludeId
    ? LITERARY_REFLECTION_PROMPTS.filter((p) => p.id !== excludeId)
    : LITERARY_REFLECTION_PROMPTS;
  const pool = filtered.length > 0 ? filtered : LITERARY_REFLECTION_PROMPTS;
  const randomIndex = Math.floor(Math.random() * pool.length);
  return pool[randomIndex];
}

/**
 * Formats a reflection note into clean GitHub / Obsidian flavored Markdown for export
 */
export function formatReflectionForExport(
  prompt: string,
  response: string,
  bookTitle?: string,
  author?: string,
  date: Date = new Date()
): string {
  const formattedDate = date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  let md = `## Literary Reflection — ${formattedDate}\n\n`;
  if (bookTitle) {
    md += `**Reading**: *${bookTitle}*${author ? ` by ${author}` : ''}\n\n`;
  }
  md += `> **Prompt**: *${prompt}*\n\n`;
  md += `${response.trim()}\n\n`;
  md += `---\n*Exported from Readr*`;
  return md;
}

/**
 * Selects a serendipitous "Memory Recall" highlight from past library readings
 */
export function selectMemoryRecallHighlight(
  highlights: EnrichedHighlight[],
  currentBookId?: string
): EnrichedHighlight | null {
  if (!highlights || highlights.length === 0) return null;

  // Prefer highlights from other books if available
  const otherBookHighlights = currentBookId
    ? highlights.filter((h) => h.bookId !== currentBookId)
    : highlights;

  const pool = otherBookHighlights.length > 0 ? otherBookHighlights : highlights;
  const randomIndex = Math.floor(Math.random() * pool.length);
  return pool[randomIndex];
}
