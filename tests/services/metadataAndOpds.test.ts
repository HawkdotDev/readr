import { describe, it, expect } from 'bun:test';
import { fetchOPDSCatalog, CURATED_PUBLIC_DOMAIN_BOOKS } from '../../src/services/opds/opdsService';
import {
  fetchOpenLibraryMetadata,
  fetchGoogleBooksMetadata,
  fetchBookMetadataOnline,
} from '../../src/services/metadata/metadataService';

describe('OPDS Catalog & Public Domain Service', () => {
  it('returns all curated public domain books when query is empty', async () => {
    const catalog = await fetchOPDSCatalog();
    expect(catalog.length).toBe(CURATED_PUBLIC_DOMAIN_BOOKS.length);
    expect(catalog.some((b) => b.title === 'Pride and Prejudice')).toBe(true);
    expect(catalog.some((b) => b.title === 'Meditations')).toBe(true);
  });

  it('filters OPDS catalog by search query (case-insensitive)', async () => {
    const results = await fetchOPDSCatalog('marcus');
    expect(results.length).toBe(1);
    expect(results[0].title).toBe('Meditations');
    expect(results[0].author).toBe('Marcus Aurelius');

    const austenResults = await fetchOPDSCatalog('Austen');
    expect(austenResults.length).toBe(1);
    expect(austenResults[0].title).toBe('Pride and Prejudice');

    const emptyResults = await fetchOPDSCatalog('NonExistentTitleXYZ');
    expect(emptyResults.length).toBe(0);
  });
});

describe('Public Metadata Lookup Service (Google Books & Open Library)', () => {
  it('handles offline or malformed queries in Open Library gracefully', async () => {
    const res = await fetchOpenLibraryMetadata('random-unfindable-xyz-book-title-12345');
    expect(res === null || typeof res === 'object').toBe(true);
  });

  it('handles offline or malformed queries in Google Books gracefully', async () => {
    const res = await fetchGoogleBooksMetadata('random-unfindable-xyz-book-title-12345');
    expect(res === null || typeof res === 'object').toBe(true);
  });

  it('unifies metadata search across public APIs without throwing', async () => {
    const res = await fetchBookMetadataOnline('Meditations', 'Marcus Aurelius');
    expect(res === null || typeof res === 'object').toBe(true);
  });
});
