import { describe, it, expect } from 'bun:test';
import JSZip from 'jszip';
import {
  decodeHtmlEntities,
  processChapterHtml,
  stripTags,
  parseFb2Content,
  parseTextContent,
  createSampleBookContent,
} from '../../src/services/reader/epubParser';
import { parseChapterContent } from '../../src/services/reader/epubBridge';

describe('EPUB & Multi-Format Parsing Engine', () => {
  it('decodes HTML entities correctly without corrupting text', () => {
    const raw = '&ldquo;Hello&mdash;World!&rdquo; &amp; &eacute;tude &rsquo;test&#39; &#x2605;';
    const decoded = decodeHtmlEntities(raw);
    expect(decoded).toContain('“Hello—World!”');
    expect(decoded).toContain('&');
    expect(decoded).toContain('étude');
    expect(decoded).toContain('’test\'');
    expect(decoded).toContain('★');
  });

  it('strips HTML tags and extracts plain text', () => {
    const html = '<div class="chapter"><p>This is <strong>bold</strong> and <em>italic</em>.</p></div>';
    const plain = stripTags(html);
    expect(plain).toBe('This is bold and italic.');
  });

  it('processes raw chapter HTML into clean semantic reader markup', () => {
    const rawChapter = `
      <?xml version="1.0" encoding="utf-8"?>
      <!DOCTYPE html>
      <html xmlns="http://www.w3.org/1999/xhtml">
        <head>
          <title>Chapter 1: The Arrival</title>
          <style>body { font-family: serif; }</style>
        </head>
        <body>
          <h1 class="chapter-title">Chapter 1: The Arrival</h1>
          <p class="first-para">It was a dark and stormy night&hellip;</p>
          <blockquote class="epigraph">Truth is stranger than fiction.</blockquote>
          <p>The carriage halted at the rusted iron gates.</p>
        </body>
      </html>
    `;

    const { cleanHtml, chapterTitle, wordCount } = processChapterHtml(rawChapter, 0);

    expect(chapterTitle).toBe('Chapter 1: The Arrival');
    expect(cleanHtml).toContain('<h1>Chapter 1: The Arrival</h1>');
    expect(cleanHtml).toContain('<p>It was a dark and stormy night…</p>');
    expect(cleanHtml).toContain('<blockquote>Truth is stranger than fiction.</blockquote>');
    expect(cleanHtml).toContain('<p>The carriage halted at the rusted iron gates.</p>');
    expect(wordCount).toBeGreaterThan(10);
  });

  it('parses structured blocks via epubBridge for native React Native rendering', () => {
    const cleanHtml = `
      <h1>Chapter 2: The Secret Path</h1>
      <p>The ancient forest stretched for miles.</p>
      <blockquote>Wisdom begins in wonder.</blockquote>
      <p>Every tree whispered in the evening breeze.</p>
    `;

    const blocks = parseChapterContent(cleanHtml);
    expect(blocks.length).toBe(4);
    expect(blocks[0].type).toBe('h1');
    expect(blocks[0].text).toBe('Chapter 2: The Secret Path');
    expect(blocks[1].type).toBe('paragraph');
    expect(blocks[1].text).toBe('The ancient forest stretched for miles.');
    expect(blocks[2].type).toBe('blockquote');
    expect(blocks[2].text).toBe('Wisdom begins in wonder.');
    expect(blocks[3].type).toBe('paragraph');
  });

  it('parses FictionBook 2 (FB2) XML into structured chapters', () => {
    const fb2Xml = `
      <?xml version="1.0" encoding="utf-8"?>
      <FictionBook xmlns="http://www.gribuser.ru/xml/fictionbook/2.0">
        <description>
          <title-info>
            <book-title>The Time Machine</book-title>
            <author>
              <first-name>H.G.</first-name>
              <last-name>Wells</last-name>
            </author>
          </title-info>
        </description>
        <body>
          <section>
            <title><p>Chapter I</p></title>
            <p>The Time Traveller was expounding a recondite matter to us.</p>
            <p>His grey eyes shone and twinkled.</p>
          </section>
        </body>
      </FictionBook>
    `;

    const result = parseFb2Content(fb2Xml, 'The Time Machine');
    expect(result.title).toBe('The Time Machine');
    expect(result.author).toBe('H.G. Wells');
    expect(result.chapters.length).toBe(1);
    expect(result.chapters[0].title).toBe('Chapter I');
    expect(result.chapters[0].content).toContain('<p>The Time Traveller was expounding a recondite matter to us.</p>');
  });

  it('parses plain text and markdown headings into chapters', () => {
    const text = `
# Prologue
In the beginning there was silence.

# Chapter 1
The sun rose over the horizon.
The day had finally arrived.
    `;

    const result = parseTextContent(text, 'Test Book');
    expect(result.chapters.length).toBe(2);
    expect(result.chapters[0].title).toBe('Prologue');
    expect(result.chapters[1].title).toBe('Chapter 1');
  });

  it('verifies in-memory JSZip EPUB extraction flow and structure', async () => {
    const zip = new JSZip();

    // 1. container.xml
    zip.file(
      'META-INF/container.xml',
      `<?xml version="1.0"?>
      <container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
        <rootfiles>
          <rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/>
        </rootfiles>
      </container>`
    );

    // 2. content.opf
    zip.file(
      'OEBPS/content.opf',
      `<?xml version="1.0" encoding="utf-8"?>
      <package xmlns="http://www.idpf.org/2007/opf" version="2.0" unique-identifier="BookId">
        <metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
          <dc:title>Pride and Prejudice</dc:title>
          <dc:creator>Jane Austen</dc:creator>
        </metadata>
        <manifest>
          <item id="chap1" href="chapter1.xhtml" media-type="application/xhtml+xml"/>
        </manifest>
        <spine>
          <itemref idref="chap1"/>
        </spine>
      </package>`
    );

    // 3. chapter1.xhtml
    zip.file(
      'OEBPS/chapter1.xhtml',
      `<?xml version="1.0" encoding="utf-8"?>
      <!DOCTYPE html>
      <html xmlns="http://www.w3.org/1999/xhtml">
        <body>
          <h1>Chapter 1</h1>
          <p>It is a truth universally acknowledged, that a single man in possession of a good fortune, must be in want of a wife.</p>
        </body>
      </html>`
    );

    const base64 = await zip.generateAsync({ type: 'base64' });
    const loadedZip = await JSZip.loadAsync(base64, { base64: true });

    const containerXml = await loadedZip.file('META-INF/container.xml')!.async('text');
    expect(containerXml).toContain('OEBPS/content.opf');

    const opfXml = await loadedZip.file('OEBPS/content.opf')!.async('text');
    expect(opfXml).toContain('Pride and Prejudice');
    expect(opfXml).toContain('Jane Austen');

    const chapterXml = await loadedZip.file('OEBPS/chapter1.xhtml')!.async('text');
    const { cleanHtml, chapterTitle, wordCount } = processChapterHtml(chapterXml, 0);

    expect(chapterTitle).toBe('Chapter 1');
    expect(cleanHtml).toContain('truth universally acknowledged');
    expect(wordCount).toBeGreaterThan(15);
  });
});
