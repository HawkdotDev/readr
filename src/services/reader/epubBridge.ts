export interface FormattedBlock {
  type: 'h1' | 'h2' | 'paragraph';
  text: string;
  words?: string[];
}

const PARSED_CHAPTER_CACHE = new Map<string, FormattedBlock[]>();
const MAX_CHAPTER_CACHE = 32;

export function parseChapterContent(rawHtml: string): FormattedBlock[] {
  if (!rawHtml) return [];

  const cached = PARSED_CHAPTER_CACHE.get(rawHtml);
  if (cached) return cached;

  const rawParagraphs = rawHtml
    .replace(/<h1[^>]*>(.*?)<\/h1>/gi, '###H1###$1###END###\n\n')
    .replace(/<h2[^>]*>(.*?)<\/h2>/gi, '###H2###$1###END###\n\n')
    .replace(/<p[^>]*>(.*?)<\/p>/gi, '$1\n\n')
    .replace(/<br\s*[\/]?>/gi, '\n')
    .split('\n\n')
    .map((p) => p.trim())
    .filter(Boolean);

  const blocks: FormattedBlock[] = rawParagraphs.map((para) => {
    if (para.startsWith('###H1###')) {
      const text = para.replace('###H1###', '').replace('###END###', '').trim();
      return { type: 'h1', text };
    }

    if (para.startsWith('###H2###')) {
      const text = para.replace('###H2###', '').replace('###END###', '').trim();
      return { type: 'h2', text };
    }

    const words = para.split(/\s+/);
    return { type: 'paragraph', text: para, words };
  });

  if (PARSED_CHAPTER_CACHE.size >= MAX_CHAPTER_CACHE) {
    const oldestKey = PARSED_CHAPTER_CACHE.keys().next().value;
    if (oldestKey) PARSED_CHAPTER_CACHE.delete(oldestKey);
  }
  PARSED_CHAPTER_CACHE.set(rawHtml, blocks);

  return blocks;
}
