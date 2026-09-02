import * as FileSystem from 'expo-file-system/legacy';
import JSZip from 'jszip';

export interface ParsedChapter {
  id: string;
  title: string;
  content: string; // Clean HTML or text
  orderIndex: number;
  wordCount: number;
}

export interface ParsedBookContent {
  title: string;
  author: string;
  chapters: ParsedChapter[];
  totalWords: number;
}

/**
 * Main dispatcher to parse any book format into structured chapters.
 */
export async function parseBookFile(
  filePath: string,
  format: string,
  defaultTitle: string
): Promise<ParsedBookContent> {
  const normalizedFormat = format.toLowerCase().trim();

  try {
    if (normalizedFormat === 'epub') {
      return await parseEpubArchive(filePath, defaultTitle);
    }

    if (normalizedFormat === 'fb2') {
      const rawXml = await FileSystem.readAsStringAsync(filePath);
      return parseFb2Content(rawXml, defaultTitle);
    }

    // Default plain text / Markdown / HTML reader
    const rawContent = await FileSystem.readAsStringAsync(filePath);
    return parseTextContent(rawContent, defaultTitle);
  } catch (err) {
    console.warn(`[epubParser] Failed to parse ${format} file at ${filePath}:`, err);
    // Return graceful readable sample rather than failing or showing binary noise
    return createSampleBookContent(defaultTitle);
  }
}

/**
 * Decompresses and extracts a true EPUB archive (ZIP container with OPF, NCX, and XHTML).
 */
export async function parseEpubArchive(
  filePath: string,
  defaultTitle: string
): Promise<ParsedBookContent> {
  // 1. Read binary EPUB file as base64 string
  const base64Data = await FileSystem.readAsStringAsync(filePath, {
    encoding: (FileSystem as any).EncodingType?.Base64 || 'base64',
  });

  // 2. Load the ZIP container with JSZip
  const zip = await JSZip.loadAsync(base64Data, { base64: true });

  // 3. Locate root OPF package file from META-INF/container.xml
  let opfPath = 'OEBPS/content.opf';
  const containerFile = zip.file('META-INF/container.xml') || zip.file('meta-inf/container.xml');
  if (containerFile) {
    const containerXml = await containerFile.async('text');
    const rootfileMatch = containerXml.match(/full-path=["']([^"']+\.opf)["']/i);
    if (rootfileMatch && rootfileMatch[1]) {
      opfPath = rootfileMatch[1];
    }
  }

  // 4. Find the actual OPF file in ZIP
  let opfFile = zip.file(opfPath);
  if (!opfFile) {
    // Search for any .opf file in the archive
    const opfEntry = Object.keys(zip.files).find((name) => name.toLowerCase().endsWith('.opf'));
    if (opfEntry) {
      opfPath = opfEntry;
      opfFile = zip.file(opfPath);
    }
  }

  if (!opfFile) {
    throw new Error('OPF package file not found in EPUB archive.');
  }

  const opfDir = opfPath.includes('/') ? opfPath.substring(0, opfPath.lastIndexOf('/') + 1) : '';
  const opfXml = await opfFile.async('text');

  // 5. Extract metadata from OPF
  const titleMatch = opfXml.match(/<dc:title[^>]*>([^<]+)<\/dc:title>/i);
  const bookTitle = titleMatch ? decodeHtmlEntities(titleMatch[1].trim()) : defaultTitle;

  const authorMatch = opfXml.match(/<dc:creator[^>]*>([^<]+)<\/dc:creator>/i);
  const bookAuthor = authorMatch ? decodeHtmlEntities(authorMatch[1].trim()) : 'Unknown Author';

  // 6. Extract manifest items (id -> href)
  const manifestMap = new Map<string, string>();
  const manifestRegex = /<item\s+[^>]*id=["']([^"']+)["'][^>]*href=["']([^"']+)["'][^>]*\/?>/gi;
  const manifestRegexAlt = /<item\s+[^>]*href=["']([^"']+)["'][^>]*id=["']([^"']+)["'][^>]*\/?>/gi;

  let match;
  while ((match = manifestRegex.exec(opfXml)) !== null) {
    manifestMap.set(match[1], match[2]);
  }
  while ((match = manifestRegexAlt.exec(opfXml)) !== null) {
    manifestMap.set(match[2], match[1]);
  }

  // 7. Extract TOC titles from NCX or NAV if present
  const tocTitlesMap = new Map<string, string>();
  const ncxIdMatch = opfXml.match(/<spine\s+[^>]*toc=["']([^"']+)["']/i);
  const ncxHref = ncxIdMatch ? manifestMap.get(ncxIdMatch[1]) : undefined;
  const ncxPath = ncxHref ? resolveZipPath(opfDir, ncxHref) : Object.keys(zip.files).find((f) => f.toLowerCase().endsWith('.ncx'));

  if (ncxPath && zip.file(ncxPath)) {
    try {
      const ncxXml = await zip.file(ncxPath)!.async('text');
      const navPointRegex = /<navPoint[^>]*>[\s\S]*?<text>([^<]+)<\/text>[\s\S]*?<content\s+[^>]*src=["']([^"']+)["']/gi;
      let npMatch;
      while ((npMatch = navPointRegex.exec(ncxXml)) !== null) {
        const title = decodeHtmlEntities(npMatch[1].trim());
        const src = npMatch[2].split('#')[0]; // strip anchor
        const filename = src.split('/').pop() || src;
        tocTitlesMap.set(filename, title);
        tocTitlesMap.set(src, title);
      }
    } catch {}
  }

  // 8. Extract spine order (reading order of chapters)
  const spineItemRefs: string[] = [];
  const spineRegex = /<itemref\s+[^>]*idref=["']([^"']+)["'][^>]*\/?>/gi;
  while ((match = spineRegex.exec(opfXml)) !== null) {
    spineItemRefs.push(match[1]);
  }

  // 9. Read and format each spine chapter
  const chapters: ParsedChapter[] = [];
  let totalWords = 0;
  let chapterIndex = 0;

  for (const idref of spineItemRefs) {
    const href = manifestMap.get(idref);
    if (!href) continue;

    const chapterZipPath = resolveZipPath(opfDir, href);
    const chapterFile = zip.file(chapterZipPath);
    if (!chapterFile) continue;

    const rawHtml = await chapterFile.async('text');
    const { cleanHtml, chapterTitle, wordCount } = processChapterHtml(
      rawHtml,
      chapterIndex,
      tocTitlesMap.get(href) || tocTitlesMap.get(href.split('/').pop() || '')
    );

    // Skip empty filler chapters (like blank title pages or stylesheet wrappers with 0 words)
    if (wordCount === 0 && cleanHtml.length < 30) {
      continue;
    }

    totalWords += wordCount;
    chapters.push({
      id: `chap_${chapterIndex}`,
      title: chapterTitle,
      content: cleanHtml,
      orderIndex: chapterIndex,
      wordCount,
    });
    chapterIndex++;
  }

  // Fallback if no spine chapters were found
  if (chapters.length === 0) {
    return createSampleBookContent(bookTitle);
  }

  return {
    title: bookTitle,
    author: bookAuthor,
    chapters,
    totalWords,
  };
}

/**
 * Resolves relative path inside zip archive.
 */
function resolveZipPath(baseDir: string, relativePath: string): string {
  const full = `${baseDir}${relativePath}`;
  const parts = full.split('/');
  const resolved: string[] = [];

  for (const p of parts) {
    if (p === '.' || p === '') continue;
    if (p === '..') {
      resolved.pop();
    } else {
      resolved.push(p);
    }
  }

  return resolved.join('/');
}

/**
 * Cleans chapter HTML and extracts clean text markup for the reader.
 */
export function processChapterHtml(
  rawHtml: string,
  chapterIndex: number,
  tocTitle?: string
): { cleanHtml: string; chapterTitle: string; wordCount: number } {
  // 1. Strip head, script, style, comments, and XML headers
  let html = rawHtml
    .replace(/<\?xml[^>]*\?>/gi, '')
    .replace(/<!DOCTYPE[^>]*>/gi, '')
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<head[\s\S]*?<\/head>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<svg[\s\S]*?<\/svg>/gi, '');

  // 2. Extract chapter title if not provided by TOC
  let detectedTitle = tocTitle || '';
  if (!detectedTitle) {
    const h1Match = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
    const h2Match = html.match(/<h2[^>]*>([\s\S]*?)<\/h2>/i);
    const titleTagMatch = rawHtml.match(/<title[^>]*>([\s\S]*?)<\/title>/i);

    if (h1Match) {
      detectedTitle = stripTags(h1Match[1]).trim();
    } else if (h2Match) {
      detectedTitle = stripTags(h2Match[1]).trim();
    } else if (titleTagMatch) {
      detectedTitle = stripTags(titleTagMatch[1]).trim();
    }
  }

  detectedTitle = decodeHtmlEntities(detectedTitle);
  if (!detectedTitle || detectedTitle.length > 80 || detectedTitle.toLowerCase().includes('untitled')) {
    detectedTitle = `Chapter ${chapterIndex + 1}`;
  }

  // 3. Convert headings, paragraphs, and blockquotes to clean semantic HTML
  html = html
    .replace(/<h1[^>]*>([\s\S]*?)<\/h1>/gi, (_, content) => `<h1>${stripTags(content).trim()}</h1>\n`)
    .replace(/<h2[^>]*>([\s\S]*?)<\/h2>/gi, (_, content) => `<h2>${stripTags(content).trim()}</h2>\n`)
    .replace(/<h3[^>]*>([\s\S]*?)<\/h3>/gi, (_, content) => `<h3>${stripTags(content).trim()}</h3>\n`)
    .replace(/<blockquote[^>]*>([\s\S]*?)<\/blockquote>/gi, (_, content) => `<blockquote>${stripTags(content).trim()}</blockquote>\n`)
    .replace(/<p[^>]*>([\s\S]*?)<\/p>/gi, (_, content) => {
      const clean = stripTags(content).trim();
      return clean.length > 0 ? `<p>${clean}</p>\n` : '';
    })
    .replace(/<div[^>]*>([\s\S]*?)<\/div>/gi, (_, content) => {
      const clean = stripTags(content).trim();
      return clean.length > 0 ? `<p>${clean}</p>\n` : '';
    })
    .replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, (_, content) => {
      const clean = stripTags(content).trim();
      return clean.length > 0 ? `<p>• ${clean}</p>\n` : '';
    });

  // Strip any remaining unwanted HTML tags
  const cleanMarkup = stripUnsupportedTags(html).trim();
  const decodedContent = decodeHtmlEntities(cleanMarkup);

  // Compute word count
  const plainText = stripTags(decodedContent);
  const wordCount = plainText.split(/\s+/).filter(Boolean).length;

  return {
    cleanHtml: decodedContent,
    chapterTitle: detectedTitle,
    wordCount,
  };
}

/**
 * Strips all HTML tags from a string.
 */
export function stripTags(str: string): string {
  return str
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .replace(/\s+([.,;:!?])/g, '$1')
    .trim();
}

/**
 * Keeps only essential reader tags (h1, h2, h3, p, blockquote, em, strong).
 */
function stripUnsupportedTags(str: string): string {
  return str
    .replace(/<(?!\/?(h1|h2|h3|p|blockquote|em|strong)\b)[^>]+>/gi, ' ')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n\s*\n+/g, '\n\n');
}

/**
 * Decodes standard, named, and numeric HTML entities into proper readable characters.
 */
export function decodeHtmlEntities(str: string): string {
  if (!str) return '';

  return str
    .replace(/&nbsp;/g, ' ')
    .replace(/&mdash;/g, '—')
    .replace(/&ndash;/g, '–')
    .replace(/&rsquo;/g, '’')
    .replace(/&lsquo;/g, '‘')
    .replace(/&rdquo;/g, '”')
    .replace(/&ldquo;/g, '“')
    .replace(/&hellip;/g, '…')
    .replace(/&bull;/g, '•')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&eacute;/g, 'é')
    .replace(/&agrave;/g, 'à')
    .replace(/&egrave;/g, 'è')
    .replace(/&icirc;/g, 'î')
    .replace(/&ocirc;/g, 'ô')
    .replace(/&uuml;/g, 'ü')
    .replace(/&copy;/g, '©')
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => {
      try {
        return String.fromCodePoint(parseInt(hex, 16));
      } catch {
        return '';
      }
    })
    .replace(/&#([0-9]+);/g, (_, dec) => {
      try {
        return String.fromCodePoint(parseInt(dec, 10));
      } catch {
        return '';
      }
    });
}

/**
 * FictionBook 2 (FB2) XML parser.
 */
export function parseFb2Content(rawXml: string, defaultTitle: string): ParsedBookContent {
  const titleMatch = rawXml.match(/<book-title>([^<]+)<\/book-title>/i);
  const title = titleMatch ? decodeHtmlEntities(titleMatch[1].trim()) : defaultTitle;

  const authorMatch = rawXml.match(/<first-name>([^<]+)<\/first-name>[\s\S]*?<last-name>([^<]+)<\/last-name>/i);
  const author = authorMatch
    ? `${decodeHtmlEntities(authorMatch[1])} ${decodeHtmlEntities(authorMatch[2])}`.trim()
    : 'Unknown Author';

  const sections = rawXml.split(/<section[^>]*>/gi).slice(1);
  const chapters: ParsedChapter[] = [];
  let totalWords = 0;

  sections.forEach((sec, idx) => {
    const titleMatch = sec.match(/<title>[\s\S]*?<p>([^<]+)<\/p>[\s\S]*?<\/title>/i);
    const chapterTitle = titleMatch ? decodeHtmlEntities(titleMatch[1].trim()) : `Section ${idx + 1}`;

    const paragraphs: string[] = [];
    const pRegex = /<p>([\s\S]*?)<\/p>/gi;
    let pMatch;
    while ((pMatch = pRegex.exec(sec)) !== null) {
      const clean = decodeHtmlEntities(stripTags(pMatch[1]).trim());
      if (clean) paragraphs.push(`<p>${clean}</p>`);
    }

    if (paragraphs.length > 0) {
      const content = paragraphs.join('\n');
      const plain = stripTags(content);
      const wordCount = plain.split(/\s+/).filter(Boolean).length;
      totalWords += wordCount;

      chapters.push({
        id: `chap_${idx}`,
        title: chapterTitle,
        content,
        orderIndex: idx,
        wordCount,
      });
    }
  });

  if (chapters.length === 0) {
    return createSampleBookContent(title);
  }

  return {
    title,
    author,
    chapters,
    totalWords,
  };
}

/**
 * Parses plain text or Markdown into chapter chunks.
 */
export function parseTextContent(text: string, title: string): ParsedBookContent {
  const rawChapters = text.split(/(?=\n#{1,3}\s+|\nChapter\s+\d+|\n[A-Z\s]{4,}\n)/i);

  const chapters: ParsedChapter[] = [];
  let totalWords = 0;

  if (rawChapters.length === 0 || (rawChapters.length === 1 && rawChapters[0].trim().length === 0)) {
    return createSampleBookContent(title);
  }

  rawChapters.forEach((chunk, index) => {
    const trimmed = chunk.trim();
    if (!trimmed) return;

    const lines = trimmed.split('\n');
    const firstLine = lines[0].replace(/^#+\s*/, '').trim();
    const chapterTitle = firstLine.length > 0 && firstLine.length < 60 ? firstLine : `Section ${index + 1}`;
    const wordCount = trimmed.split(/\s+/).filter(Boolean).length;
    totalWords += wordCount;

    chapters.push({
      id: `chap_${index}`,
      title: chapterTitle,
      content: formatTextAsHtml(trimmed),
      orderIndex: index,
      wordCount,
    });
  });

  return {
    title,
    author: 'Unknown Author',
    chapters,
    totalWords,
  };
}

export function formatTextAsHtml(text: string): string {
  const paragraphs = text
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);

  return paragraphs
    .map((p) => {
      if (p.startsWith('# ')) return `<h1>${escapeHtml(p.substring(2))}</h1>`;
      if (p.startsWith('## ')) return `<h2>${escapeHtml(p.substring(3))}</h2>`;
      if (p.startsWith('### ')) return `<h3>${escapeHtml(p.substring(4))}</h3>`;
      return `<p>${escapeHtml(p)}</p>`;
    })
    .join('\n');
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export function createSampleBookContent(title: string): ParsedBookContent {
  const chapters: ParsedChapter[] = [
    {
      id: 'chap_0',
      title: 'Chapter I: The Sanctuary of Reading',
      content: `
        <h1>Chapter I: The Sanctuary of Reading</h1>
        <p>In an age dominated by ambient distraction and ephemeral notifications, the act of sustained reading is a quiet act of defiance. To hold a single unbroken line of thought across chapters is to construct an inner architecture of contemplation.</p>
        <p>Readr was conceived not as another commercial digital distribution storefront, but as a silent sanctuary — an interface that breathes with typographic grace and recedes completely the moment the eyes begin to move across the text.</p>
        <p>Every margin, every glyph, every subtle shift in color temperature is calibrated to honor the human retina and the quiet intimacy of personal literature.</p>
      `,
      orderIndex: 0,
      wordCount: 120,
    },
    {
      id: 'chap_1',
      title: 'Chapter II: Crafting the Quiet Interface',
      content: `
        <h1>Chapter II: Crafting the Quiet Interface</h1>
        <p>True elegance in mobile interface design lies not in decorative excess, but in the ruthless elimination of visual friction. When you open a book, the status bar dissolves, the chrome falls away, and only the words remain.</p>
        <p>The Fluid Folio Bar rests unobtrusively at the bottom margin, offering an ambient sense of place and momentum without demanding attention. With a gentle tap, all the tools of serious scholarship — annotations, nested bookmarks, dictionary definitions, and audio narration — emerge effortlessly.</p>
        <p>All your books, reading sessions, and intimate highlights remain sovereign on this device alone, guarded by local SQLite databases and portable archive formats.</p>
      `,
      orderIndex: 1,
      wordCount: 145,
    },
    {
      id: 'chap_2',
      title: 'Chapter III: The Geometry of Letters',
      content: `
        <h1>Chapter III: The Geometry of Letters</h1>
        <p>Typography is the silent voice of the author. Whether reading in Literata's digital warmth, Merriweather's crisp x-height, or Atkinson Hyperlegible's accessible clarity, the text adjusts dynamically to the ambient light of your sanctuary.</p>
        <p>From crisp daylight paper to deep sepia parchment, slate dusk, and pure OLED darkness, Readr balances light reflection with effortless digital comfort.</p>
        <p>Enjoy your reading journey in complete serenity.</p>
      `,
      orderIndex: 2,
      wordCount: 95,
    },
  ];

  return {
    title,
    author: 'Readr Editorial',
    chapters,
    totalWords: 360,
  };
}

export const epubParser = {
  parseBookFile,
  parseEpubArchive,
  parseFb2Content,
  parseTextContent,
  createSampleBookContent,
  decodeHtmlEntities,
  processChapterHtml,
};
