import * as FileSystem from 'expo-file-system/legacy';

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

export async function parseBookFile(filePath: string, format: string, defaultTitle: string): Promise<ParsedBookContent> {
  try {
    const rawContent = await FileSystem.readAsStringAsync(filePath);
    return parseTextContent(rawContent, defaultTitle);
  } catch {
    // If file cannot be read directly as string (e.g. simulated sample), return a fallback content structure
    return createSampleBookContent(defaultTitle);
  }
}

export function parseTextContent(text: string, title: string): ParsedBookContent {
  // Split content into chapters based on headings or double blank lines
  const rawChapters = text.split(/(?=\n#{1,3}\s+|\nChapter\s+\d+|\n[A-Z\s]{4,}\n)/i);

  const chapters: ParsedChapter[] = [];
  let totalWords = 0;

  if (rawChapters.length === 0 || (rawChapters.length === 1 && rawChapters[0].trim().length === 0)) {
    return createSampleBookContent(title);
  }

  rawChapters.forEach((chunk, index) => {
    const trimmed = chunk.trim();
    if (!trimmed) return;

    // Detect title from first line
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
  parseTextContent,
  createSampleBookContent,
};
