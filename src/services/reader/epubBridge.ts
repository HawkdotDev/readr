export interface FormattedBlock {
  type: 'h1' | 'h2' | 'h3' | 'blockquote' | 'paragraph';
  text: string;
  words?: string[];
}

const PARSED_CHAPTER_CACHE = new Map<string, FormattedBlock[]>();
const MAX_CHAPTER_CACHE = 48;

/**
 * Parses chapter HTML content into clean typography blocks for native rendering.
 */
export function parseChapterContent(rawHtml: string): FormattedBlock[] {
  if (!rawHtml) return [];

  const cached = PARSED_CHAPTER_CACHE.get(rawHtml);
  if (cached) return cached;

  const rawParagraphs = rawHtml
    .replace(/<h1[^>]*>([\s\S]*?)<\/h1>/gi, '###H1###$1###END###\n\n')
    .replace(/<h2[^>]*>([\s\S]*?)<\/h2>/gi, '###H2###$1###END###\n\n')
    .replace(/<h3[^>]*>([\s\S]*?)<\/h3>/gi, '###H3###$1###END###\n\n')
    .replace(/<blockquote[^>]*>([\s\S]*?)<\/blockquote>/gi, '###BLOCKQUOTE###$1###END###\n\n')
    .replace(/<p[^>]*>([\s\S]*?)<\/p>/gi, '$1\n\n')
    .replace(/<br\s*[\/]?>/gi, '\n')
    .split('\n\n')
    .map((p) => p.trim())
    .filter(Boolean);

  const blocks: FormattedBlock[] = [];

  for (const para of rawParagraphs) {
    if (para.startsWith('###H1###')) {
      const text = stripAllHtmlTags(para.replace('###H1###', '').replace('###END###', '')).trim();
      if (text) blocks.push({ type: 'h1', text });
      continue;
    }

    if (para.startsWith('###H2###')) {
      const text = stripAllHtmlTags(para.replace('###H2###', '').replace('###END###', '')).trim();
      if (text) blocks.push({ type: 'h2', text });
      continue;
    }

    if (para.startsWith('###H3###')) {
      const text = stripAllHtmlTags(para.replace('###H3###', '').replace('###END###', '')).trim();
      if (text) blocks.push({ type: 'h3', text });
      continue;
    }

    if (para.startsWith('###BLOCKQUOTE###')) {
      const text = stripAllHtmlTags(para.replace('###BLOCKQUOTE###', '').replace('###END###', '')).trim();
      if (text) blocks.push({ type: 'blockquote', text });
      continue;
    }

    const cleanText = stripAllHtmlTags(para).trim();
    if (cleanText) {
      const words = cleanText.split(/\s+/).filter(Boolean);
      blocks.push({ type: 'paragraph', text: cleanText, words });
    }
  }

  if (PARSED_CHAPTER_CACHE.size >= MAX_CHAPTER_CACHE) {
    const oldestKey = PARSED_CHAPTER_CACHE.keys().next().value;
    if (oldestKey) PARSED_CHAPTER_CACHE.delete(oldestKey);
  }
  PARSED_CHAPTER_CACHE.set(rawHtml, blocks);

  return blocks;
}

function stripAllHtmlTags(str: string): string {
  return str.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}
