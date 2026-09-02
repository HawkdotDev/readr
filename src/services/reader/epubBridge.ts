export interface FormattedBlock {
  type: 'h1' | 'h2' | 'h3' | 'blockquote' | 'paragraph' | 'image' | 'hr' | 'code';
  text: string;
  words?: string[];
  imageSrc?: string;
  imageAlt?: string;
  imageCaption?: string;
  footnoteId?: string;
}

const PARSED_CHAPTER_CACHE = new Map<string, FormattedBlock[]>();
const MAX_CHAPTER_CACHE = 64;

/**
 * Parses chapter HTML content into clean typography and media blocks for native rendering.
 */
export function parseChapterContent(rawHtml: string): FormattedBlock[] {
  if (!rawHtml) return [];

  const cached = PARSED_CHAPTER_CACHE.get(rawHtml);
  if (cached) return cached;

  const rawParagraphs = rawHtml
    // Headings
    .replace(/<h1[^>]*>([\s\S]*?)<\/h1>/gi, '###H1###$1###END###\n\n')
    .replace(/<h2[^>]*>([\s\S]*?)<\/h2>/gi, '###H2###$1###END###\n\n')
    .replace(/<h3[^>]*>([\s\S]*?)<\/h3>/gi, '###H3###$1###END###\n\n')
    // Blockquotes & preformatted code
    .replace(/<blockquote[^>]*>([\s\S]*?)<\/blockquote>/gi, '###BLOCKQUOTE###$1###END###\n\n')
    .replace(/<pre[^>]*>([\s\S]*?)<\/pre>/gi, '###CODE###$1###END###\n\n')
    // Dividers & Horizontal Rules
    .replace(/<hr\s*[\/]?>/gi, '###HR###\n\n')
    // Images & Illustrations
    .replace(/<figure[^>]*>[\s\S]*?<img\b[^>]*src=["']([^"']+)["'][^>]*>[\s\S]*?<figcaption[^>]*>([\s\S]*?)<\/figcaption>[\s\S]*?<\/figure>/gi, '###IMG###$1###CAP###$2###END###\n\n')
    .replace(/<img\b[^>]*src=["']([^"']+)["'][^>]*alt=["']([^"']*)["'][^>]*>/gi, '###IMG###$1###ALT###$2###END###\n\n')
    .replace(/<img\b[^>]*src=["']([^"']+)["'][^>]*>/gi, '###IMG###$1###END###\n\n')
    // Paragraphs & Line Breaks
    .replace(/<p[^>]*>([\s\S]*?)<\/p>/gi, '$1\n\n')
    .replace(/<div[^>]*>([\s\S]*?)<\/div>/gi, '$1\n\n')
    .replace(/<br\s*[\/]?>/gi, '\n')
    .split('\n\n')
    .map((p) => p.trim())
    .filter(Boolean);

  const blocks: FormattedBlock[] = [];

  for (const para of rawParagraphs) {
    // 1. Heading 1
    if (para.startsWith('###H1###')) {
      const text = stripAllHtmlTags(para.replace('###H1###', '').replace('###END###', '')).trim();
      if (text) blocks.push({ type: 'h1', text });
      continue;
    }

    // 2. Heading 2
    if (para.startsWith('###H2###')) {
      const text = stripAllHtmlTags(para.replace('###H2###', '').replace('###END###', '')).trim();
      if (text) blocks.push({ type: 'h2', text });
      continue;
    }

    // 3. Heading 3
    if (para.startsWith('###H3###')) {
      const text = stripAllHtmlTags(para.replace('###H3###', '').replace('###END###', '')).trim();
      if (text) blocks.push({ type: 'h3', text });
      continue;
    }

    // 4. Blockquote
    if (para.startsWith('###BLOCKQUOTE###')) {
      const text = stripAllHtmlTags(para.replace('###BLOCKQUOTE###', '').replace('###END###', '')).trim();
      if (text) blocks.push({ type: 'blockquote', text });
      continue;
    }

    // 5. Code Block
    if (para.startsWith('###CODE###')) {
      const code = stripAllHtmlTags(para.replace('###CODE###', '').replace('###END###', '')).trim();
      if (code) blocks.push({ type: 'code', text: code });
      continue;
    }

    // 6. Horizontal Rule / Ornament
    if (para.startsWith('###HR###')) {
      blocks.push({ type: 'hr', text: '---' });
      continue;
    }

    // 7. Image / Illustration
    if (para.startsWith('###IMG###')) {
      let src = '';
      let alt = '';
      let caption = '';

      if (para.includes('###CAP###')) {
        const parts = para.replace('###IMG###', '').replace('###END###', '').split('###CAP###');
        src = parts[0]?.trim() || '';
        caption = stripAllHtmlTags(parts[1] || '').trim();
      } else if (para.includes('###ALT###')) {
        const parts = para.replace('###IMG###', '').replace('###END###', '').split('###ALT###');
        src = parts[0]?.trim() || '';
        alt = stripAllHtmlTags(parts[1] || '').trim();
      } else {
        src = para.replace('###IMG###', '').replace('###END###', '').trim();
      }

      if (src) {
        blocks.push({
          type: 'image',
          text: caption || alt || 'Illustration',
          imageSrc: src,
          imageAlt: alt,
          imageCaption: caption,
        });
      }
      continue;
    }

    // 8. Standard Paragraph
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
