import * as FileSystem from 'expo-file-system/legacy';
import JSZip from 'jszip';

export interface ParsedChapter {
  id: string;
  title: string;
  content: string; // Clean HTML or text
  orderIndex: number;
  wordCount: number;
  chapterNumber?: number; // 1, 2, 3... for story chapters
  isFrontMatter?: boolean;
}

export interface ParsedBookContent {
  title: string;
  author: string;
  chapters: ParsedChapter[];
  totalWords: number;
}

/**
 * Main dispatcher to parse any book format into structured chapters.
 * Resilient against non-zip files marked as EPUB, corrupt headers, and web/native filesystem differences.
 */
export async function parseBookFile(
  filePath: string,
  format: string,
  defaultTitle: string
): Promise<ParsedBookContent> {
  const normalizedFormat = format.toLowerCase().trim();

  try {
    // 1. If format is EPUB (or filename ends with .epub)
    if (normalizedFormat === 'epub' || filePath.toLowerCase().endsWith('.epub')) {
      try {
        return await parseEpubArchive(filePath, defaultTitle);
      } catch (epubErr) {
        console.warn(`[epubParser] Failed to parse EPUB archive at ${filePath}, checking for text/html fallback:`, epubErr);
        // Fallback: If the file was not a zip archive (e.g. plain text or HTML saved as .epub),
        // read it as text rather than displaying generic placeholder text!
        const rawContent = await readFileAsTextSafe(filePath);
        if (rawContent && rawContent.trim().length > 0) {
          if (rawContent.includes('<!DOCTYPE') || rawContent.includes('<html') || rawContent.includes('<p>')) {
            const { cleanHtml, chapterTitle, wordCount } = processChapterHtml(rawContent, 0, defaultTitle);
            return {
              title: chapterTitle || defaultTitle,
              author: 'Unknown Author',
              chapters: [
                {
                  id: 'chap_0',
                  title: chapterTitle || defaultTitle,
                  content: cleanHtml,
                  orderIndex: 0,
                  wordCount,
                },
              ],
              totalWords: wordCount,
            };
          }
          return parseTextContent(rawContent, defaultTitle);
        }
      }
    }

    // 2. FictionBook 2 (.fb2)
    if (normalizedFormat === 'fb2' || filePath.toLowerCase().endsWith('.fb2')) {
      const rawXml = await readFileAsTextSafe(filePath);
      return parseFb2Content(rawXml, defaultTitle);
    }

    // 3. Default plain text / Markdown / HTML reader
    const rawContent = await readFileAsTextSafe(filePath);
    return parseTextContent(rawContent, defaultTitle);
  } catch (err) {
    console.warn(`[epubParser] Failed to parse ${format} file at ${filePath}:`, err);
    return createSampleBookContent(defaultTitle);
  }
}

/**
 * Safely reads a file as a string across React Native, Expo, and Web environments.
 */
export async function readFileAsTextSafe(filePath: string): Promise<string> {
  try {
    if (filePath.startsWith('http://') || filePath.startsWith('https://') || filePath.startsWith('blob:')) {
      const res = await fetch(filePath);
      return await res.text();
    }

    if (FileSystem && typeof (FileSystem as any).readAsStringAsync === 'function') {
      try {
        return await FileSystem.readAsStringAsync(filePath);
      } catch {
        const res = await fetch(filePath);
        return await res.text();
      }
    }

    const res = await fetch(filePath);
    return await res.text();
  } catch (e) {
    console.warn(`[epubParser] readFileAsTextSafe failed for ${filePath}:`, e);
    return '';
  }
}

/**
 * Safely reads a binary file as Base64 or ArrayBuffer across React Native and Web.
 */
export async function readFileAsBase64OrBuffer(filePath: string): Promise<string | ArrayBuffer> {
  if (filePath.startsWith('http://') || filePath.startsWith('https://') || filePath.startsWith('blob:')) {
    const res = await fetch(filePath);
    return await res.arrayBuffer();
  }

  if (FileSystem && typeof (FileSystem as any).readAsStringAsync === 'function') {
    try {
      return await FileSystem.readAsStringAsync(filePath, {
        encoding: (FileSystem as any).EncodingType?.Base64 || 'base64',
      });
    } catch {
      const res = await fetch(filePath);
      return await res.arrayBuffer();
    }
  }

  const res = await fetch(filePath);
  return await res.arrayBuffer();
}

/**
 * Decompresses and extracts a true EPUB archive (ZIP container with OPF, NCX/Nav, and XHTML).
 */
export async function parseEpubArchive(
  filePath: string,
  defaultTitle: string
): Promise<ParsedBookContent> {
  // 1. Read binary EPUB file
  const rawData = await readFileAsBase64OrBuffer(filePath);

  // 2. Load the ZIP container with JSZip
  let zip: JSZip;
  if (typeof rawData === 'string') {
    const cleanStr = rawData.replace(/^data:.*?;base64,/, '').replace(/\r?\n|\r/g, '').trim();
    try {
      zip = await JSZip.loadAsync(cleanStr, { base64: true });
    } catch {
      zip = await JSZip.loadAsync(cleanStr);
    }
  } else {
    zip = await JSZip.loadAsync(rawData);
  }

  // 3. Locate root OPF package file from META-INF/container.xml
  let opfPath = '';
  const containerEntryKey = Object.keys(zip.files).find(
    (name) => name.toLowerCase() === 'meta-inf/container.xml'
  );

  if (containerEntryKey && zip.files[containerEntryKey]) {
    const containerXml = await zip.files[containerEntryKey].async('text');
    const rootfileMatch = containerXml.match(/full-path=["']([^"']+)["']/i);
    if (rootfileMatch && rootfileMatch[1]) {
      opfPath = rootfileMatch[1].trim();
    }
  }

  // 4. Find OPF package file in the ZIP archive
  let opfFile = opfPath ? findZipFile(zip, opfPath) : null;
  if (!opfFile) {
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
  const titleMatch = opfXml.match(/<dc:title[^>]*>([\s\S]*?)<\/dc:title>/i);
  const bookTitle = titleMatch ? decodeHtmlEntities(stripTags(titleMatch[1]).trim()) : defaultTitle;

  const authorMatch = opfXml.match(/<dc:creator[^>]*>([\s\S]*?)<\/dc:creator>/i);
  const bookAuthor = authorMatch ? decodeHtmlEntities(stripTags(authorMatch[1]).trim()) : 'Unknown Author';

  // 6. Extract manifest items (id -> href) with tag-by-tag parsing
  const manifestMap = new Map<string, string>();
  const itemTagRegex = /<item\b[^>]*>/gi;
  let itemTagMatch;
  while ((itemTagMatch = itemTagRegex.exec(opfXml)) !== null) {
    const tag = itemTagMatch[0];
    const idMatch = tag.match(/\bid=["']([^"']+)["']/i);
    const hrefMatch = tag.match(/\bhref=["']([^"']+)["']/i);
    if (idMatch && hrefMatch) {
      manifestMap.set(idMatch[1], hrefMatch[1]);
    }
  }

  // 7. Extract TOC titles from NCX or EPUB 3 Nav Document
  const tocTitlesMap = new Map<string, string>();

  // A. Try NCX
  const ncxIdMatch = opfXml.match(/<spine\b[^>]*\btoc=["']([^"']+)["']/i);
  const ncxHref = ncxIdMatch ? manifestMap.get(ncxIdMatch[1]) : undefined;
  const ncxPath = ncxHref ? resolveZipPath(opfDir, ncxHref) : Object.keys(zip.files).find((f) => f.toLowerCase().endsWith('.ncx'));

  if (ncxPath) {
    const ncxFile = findZipFile(zip, ncxPath);
    if (ncxFile) {
      try {
        const ncxXml = await ncxFile.async('text');
        const navPointRegex = /<navPoint\b[^>]*>[\s\S]*?<text\b[^>]*>([^<]+)<\/text>[\s\S]*?<content\b[^>]*src=["']([^"']+)["']/gi;
        let npMatch;
        while ((npMatch = navPointRegex.exec(ncxXml)) !== null) {
          const title = decodeHtmlEntities(npMatch[1].trim());
          const fullSrc = npMatch[2];
          const src = fullSrc.split('#')[0];
          const filename = src.split('/').pop() || src;
          tocTitlesMap.set(fullSrc, title);
          if (!tocTitlesMap.has(filename) || tocTitlesMap.get(filename)?.toLowerCase() === 'contents') {
            tocTitlesMap.set(filename, title);
            tocTitlesMap.set(src, title);
          }
        }
      } catch {}
    }
  }

  // B. Try EPUB 3 Nav Document
  const navItemKey = Array.from(manifestMap.entries()).find(([_, href]) => href.toLowerCase().includes('nav') || href.toLowerCase().includes('toc'));
  if (navItemKey) {
    const navFile = findZipFile(zip, resolveZipPath(opfDir, navItemKey[1]));
    if (navFile) {
      try {
        const navXml = await navFile.async('text');
        const aTagRegex = /<a\b[^>]*href=["']([^"']+)["'][^>]*>([^<]+)<\/a>/gi;
        let aMatch;
        while ((aMatch = aTagRegex.exec(navXml)) !== null) {
          const src = aMatch[1].split('#')[0];
          const title = decodeHtmlEntities(aMatch[2].trim());
          const filename = src.split('/').pop() || src;
          if (!tocTitlesMap.has(filename)) {
            tocTitlesMap.set(filename, title);
            tocTitlesMap.set(src, title);
          }
        }
      } catch {}
    }
  }

  // 8. Extract spine order (reading order of chapters)
  const spineItemRefs: string[] = [];
  const itemrefTagRegex = /<itemref\b[^>]*>/gi;
  let itemrefTagMatch;
  while ((itemrefTagMatch = itemrefTagRegex.exec(opfXml)) !== null) {
    const tag = itemrefTagMatch[0];
    const idrefMatch = tag.match(/\bidref=["']([^"']+)["']/i);
    if (idrefMatch) {
      spineItemRefs.push(idrefMatch[1]);
    }
  }

  // If no spine items were found, discover all XHTML/HTML files in the archive
  if (spineItemRefs.length === 0) {
    const htmlFiles = Object.keys(zip.files)
      .filter((name) => /\.(xhtml|html|htm)$/i.test(name) && !name.toLowerCase().includes('nav') && !name.toLowerCase().includes('toc'))
      .sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }));

    for (let i = 0; i < htmlFiles.length; i++) {
      manifestMap.set(`auto_${i}`, htmlFiles[i]);
      spineItemRefs.push(`auto_${i}`);
    }
  }

  // 9. Read and format each spine chapter
  const rawChapters: Array<{
    id: string;
    title: string;
    content: string;
    wordCount: number;
    href: string;
  }> = [];
  let totalWords = 0;

  for (const idref of spineItemRefs) {
    const href = manifestMap.get(idref);
    if (!href) continue;

    const targetPath = resolveZipPath(opfDir, href);
    const chapterFile = findZipFile(zip, targetPath) || findZipFile(zip, href);
    if (!chapterFile) continue;

    const rawHtmlText = await chapterFile.async('text');
    const rawHtml = await resolveEmbeddedImages(rawHtmlText, targetPath, zip);
    const filename = href.split('/').pop() || href;
    const { cleanHtml, chapterTitle, wordCount } = processChapterHtml(
      rawHtml,
      rawChapters.length,
      tocTitlesMap.get(href) || tocTitlesMap.get(filename)
    );

    // Skip empty filler chapters (like blank title pages with 0 words and no heading)
    if (wordCount === 0 && cleanHtml.length < 25) {
      continue;
    }

    totalWords += wordCount;
    rawChapters.push({
      id: `chap_${rawChapters.length}`,
      title: chapterTitle,
      content: cleanHtml,
      wordCount,
      href,
    });
  }

  // Classify front matter vs body chapters and assign accurate story chapter numbers
  let storyChapterCount = 0;
  const chapters: ParsedChapter[] = rawChapters.map((ch, idx) => {
    const isFront = isFrontMatterSection(ch.title, ch.href, ch.wordCount);
    let chapterNum: number | undefined;

    if (!isFront) {
      // Check if title has an explicit chapter/book/part/letter number
      const match = ch.title.match(/(?:chapter|chap\.?|book|part|letter)\s+([0-9IVXLCDM]+)/i);
      if (match) {
        const parsedInt = parseInt(match[1], 10);
        if (!isNaN(parsedInt)) {
          chapterNum = parsedInt;
          storyChapterCount = Math.max(storyChapterCount, parsedInt);
        } else {
          storyChapterCount++;
          chapterNum = storyChapterCount;
        }
      } else {
        storyChapterCount++;
        chapterNum = storyChapterCount;
      }
    }

    return {
      id: ch.id,
      title: ch.title,
      content: ch.content,
      orderIndex: idx,
      wordCount: ch.wordCount,
      chapterNumber: chapterNum,
      isFrontMatter: isFront,
    };
  });

  // Fallback if no spine chapters were extractable
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

export function isFrontMatterSection(
  title: string,
  filenameOrHref: string,
  wordCount: number
): boolean {
  const t = (title || '').toLowerCase().trim();
  const f = (filenameOrHref || '').toLowerCase();

  // Explicit front matter filenames/IDs
  if (
    f.includes('cover') ||
    f.includes('wrap000') ||
    f.includes('titlepage') ||
    f.includes('halftitle') ||
    f.includes('imprint') ||
    f.includes('colophon') ||
    f.includes('uncopyright') ||
    f.includes('copyright') ||
    f.includes('pg-header') ||
    f.includes('boilerplate') ||
    f.includes('toc') ||
    f.includes('contents') ||
    f.includes('nav')
  ) {
    return true;
  }

  // Common front-matter titles
  if (
    t === 'cover' ||
    t === 'title page' ||
    t === 'half title' ||
    t === 'half-title' ||
    t === 'contents' ||
    t === 'table of contents' ||
    t === 'copyright' ||
    t === 'colophon' ||
    t === 'imprint' ||
    t === 'epigraph' ||
    t === 'dedication' ||
    t.startsWith('the project gutenberg') ||
    t.startsWith('project gutenberg') ||
    t.includes('license') ||
    t === 'boilerplate'
  ) {
    return true;
  }

  // Short non-chapter pages
  if (
    wordCount < 40 &&
    !t.includes('chapter') &&
    !t.includes('book') &&
    !t.includes('part') &&
    !t.includes('act') &&
    !t.includes('scene') &&
    !t.includes('letter')
  ) {
    if (t.includes('title') || t.includes('edition') || t.includes('author') || t === '') {
      return true;
    }
  }

  return false;
}

/**
 * Case-insensitive and URI-decoded lookup of files inside a JSZip archive.
 */
export function findZipFile(zip: JSZip, targetPath: string): JSZip.JSZipObject | null {
  if (!targetPath) return null;

  // 1. Exact match
  if (zip.files[targetPath]) return zip.files[targetPath];

  // 2. URI decoded match
  try {
    const decoded = decodeURIComponent(targetPath);
    if (zip.files[decoded]) return zip.files[decoded];
  } catch {}

  // 3. Case-insensitive match
  const lower = targetPath.toLowerCase();
  const foundKey = Object.keys(zip.files).find((k) => k.toLowerCase() === lower);
  if (foundKey) return zip.files[foundKey];

  // 4. Match filename only
  const filename = targetPath.split('/').pop()?.toLowerCase();
  if (filename) {
    const fnKey = Object.keys(zip.files).find((k) => k.split('/').pop()?.toLowerCase() === filename);
    if (fnKey) return zip.files[fnKey];
  }

  return null;
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
    const rawLower = rawHtml.slice(0, 500).toLowerCase();
    if (rawLower.includes('cover')) {
      detectedTitle = 'Cover';
    } else if (rawLower.includes('title')) {
      detectedTitle = 'Title Page';
    } else if (rawLower.includes('contents')) {
      detectedTitle = 'Contents';
    } else {
      detectedTitle = `Chapter ${chapterIndex + 1}`;
    }
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

  // Strip any remaining unsupported HTML tags
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
 * Resolves all relative image sources into self-contained Base64 Data URIs directly from the ZIP archive.
 */
export async function resolveEmbeddedImages(
  rawHtml: string,
  chapterPath: string,
  zip: JSZip
): Promise<string> {
  const chapterDir = chapterPath.includes('/')
    ? chapterPath.substring(0, chapterPath.lastIndexOf('/') + 1)
    : '';

  // 1. Convert SVG images into standard <img> tags
  let html = rawHtml.replace(
    /<svg\b[^>]*>[\s\S]*?<image\b[^>]*(?:xlink:href|href)=["']([^"']+)["'][^>]*\/?>(?:[\s\S]*?<\/image>)?[\s\S]*?<\/svg>/gi,
    '<img src="$1" alt="Illustration" />'
  );

  // 2. Find all <img src="..."> tags
  const imgRegex = /<img\b([^>]*)\bsrc=["']([^"']+)["']([^>]*)>/gi;
  const matches: Array<{ fullTag: string; prefix: string; src: string; suffix: string }> = [];
  let m;
  while ((m = imgRegex.exec(html)) !== null) {
    matches.push({ fullTag: m[0], prefix: m[1], src: m[2], suffix: m[3] });
  }

  for (const match of matches) {
    const origSrc = match.src;
    if (origSrc.startsWith('data:') || origSrc.startsWith('http://') || origSrc.startsWith('https://')) {
      continue;
    }

    const resolvedPath = resolveZipPath(chapterDir, origSrc);
    const imgFile =
      findZipFile(zip, resolvedPath) ||
      findZipFile(zip, origSrc) ||
      findZipFile(zip, origSrc.split('/').pop() || '');

    if (imgFile) {
      try {
        const mimeType = getImageMimeType(resolvedPath);
        const base64Data = await imgFile.async('base64');
        const dataUri = `data:${mimeType};base64,${base64Data}`;
        const newTag = `<img${match.prefix} src="${dataUri}"${match.suffix}>`;
        html = html.replace(match.fullTag, newTag);
      } catch (err) {
        console.warn(`[epubParser] Failed to extract image ${origSrc}:`, err);
      }
    }
  }

  return html;
}

export function getImageMimeType(filePath: string): string {
  const lower = filePath.toLowerCase();
  if (lower.endsWith('.png')) return 'image/png';
  if (lower.endsWith('.jpg') || lower.endsWith('.jpeg')) return 'image/jpeg';
  if (lower.endsWith('.gif')) return 'image/gif';
  if (lower.endsWith('.webp')) return 'image/webp';
  if (lower.endsWith('.svg')) return 'image/svg+xml';
  return 'image/jpeg';
}

/**
 * Keeps essential reader typography and media tags.
 */
function stripUnsupportedTags(str: string): string {
  return str
    .replace(/<(?!\/?(h1|h2|h3|p|blockquote|em|strong|img|hr|figure|figcaption|pre|code|sup|a)\b)[^>]+>/gi, ' ')
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
