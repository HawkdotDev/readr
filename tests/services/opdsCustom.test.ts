import { describe, it, expect } from 'bun:test';
import {
  parseOPDSXmlFeed,
  fetchOPDSCatalog,
  CURATED_PUBLIC_DOMAIN_BOOKS,
} from '../../src/services/opds/opdsService';

describe('Custom OPDS & XML Parser Service', () => {
  const sampleAtomXml = `<?xml version="1.0" encoding="utf-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>Sample Calibre Catalog</title>
  <entry>
    <title>The Picture of Dorian Gray</title>
    <id>urn:uuid:doriangray-12345</id>
    <author>
      <name>Oscar Wilde</name>
    </author>
    <summary>A philosophical novel by Oscar Wilde.</summary>
    <published>1890-06-20</published>
    <link rel="http://opds-spec.org/image" href="https://example.com/covers/dorian.jpg" type="image/jpeg" />
    <link rel="http://opds-spec.org/acquisition" href="https://example.com/ebooks/dorian.epub" type="application/epub+zip" />
  </entry>
  <entry>
    <title>Dracula</title>
    <id>urn:uuid:dracula-67890</id>
    <author>
      <name>Bram Stoker</name>
    </author>
    <summary>An 1897 Gothic horror novel.</summary>
    <link rel="http://opds-spec.org/image" href="/covers/dracula.jpg" type="image/jpeg" />
    <link rel="http://opds-spec.org/acquisition" href="/ebooks/dracula.epub" type="application/epub+zip" />
  </entry>
</feed>`;

  it('parses Atom XML feed entries into structured OPDSBookEntry objects', () => {
    const entries = parseOPDSXmlFeed(sampleAtomXml, 'https://example.com');
    expect(entries.length).toBe(2);

    const dorian = entries[0];
    expect(dorian.title).toBe('The Picture of Dorian Gray');
    expect(dorian.author).toBe('Oscar Wilde');
    expect(dorian.summary).toContain('philosophical novel');
    expect(dorian.downloadUrl).toBe('https://example.com/ebooks/dorian.epub');
    expect(dorian.coverUrl).toBe('https://example.com/covers/dorian.jpg');
    expect(dorian.fileFormat).toBe('epub');

    const dracula = entries[1];
    expect(dracula.title).toBe('Dracula');
    expect(dracula.author).toBe('Bram Stoker');
    expect(dracula.downloadUrl).toBe('https://example.com/ebooks/dracula.epub');
    expect(dracula.coverUrl).toBe('https://example.com/covers/dracula.jpg');
  });

  it('filters curated public domain OPDS catalog by search terms', async () => {
    const all = await fetchOPDSCatalog();
    expect(all.length).toBe(CURATED_PUBLIC_DOMAIN_BOOKS.length);

    const austen = await fetchOPDSCatalog('Austen');
    expect(austen.length).toBeGreaterThan(0);
    expect(austen[0].title).toBe('Pride and Prejudice');

    const meditations = await fetchOPDSCatalog('Marcus');
    expect(meditations.length).toBe(1);
    expect(meditations[0].author).toContain('Marcus');
  });
});
