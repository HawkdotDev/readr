import { updateBookCover } from '../../db/queries/books';

export interface BookMetadataResult {
  title?: string;
  author?: string;
  description?: string;
  publisher?: string;
  publishedDate?: string;
  coverUrl?: string;
}

/**
 * Fetch book metadata and high-res cover image from Google Books public API
 */
export async function fetchGoogleBooksMetadata(title: string, author?: string): Promise<BookMetadataResult | null> {
  try {
    const q = author ? `intitle:${title}+inauthor:${author}` : title;
    const encoded = encodeURIComponent(q);
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 2500);

    const res = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${encoded}&maxResults=1&printType=books`, {
      signal: controller.signal,
    });
    clearTimeout(timer);

    if (!res.ok) return null;
    const json = await res.json();
    if (!json.items || json.items.length === 0) return null;

    const volumeInfo = json.items[0].volumeInfo || {};
    const imageLinks = volumeInfo.imageLinks || {};

    let coverUrl =
      imageLinks.extraLarge ||
      imageLinks.large ||
      imageLinks.medium ||
      imageLinks.thumbnail ||
      imageLinks.smallThumbnail;

    if (coverUrl) {
      // Ensure https protocol and remove curl distortion parameters
      coverUrl = coverUrl.replace(/^http:\/\//i, 'https://').replace('&edge=curl', '');
    }

    return {
      title: volumeInfo.title || title,
      author: volumeInfo.authors ? volumeInfo.authors.join(', ') : author,
      description: volumeInfo.description,
      publisher: volumeInfo.publisher,
      publishedDate: volumeInfo.publishedDate,
      coverUrl,
    };
  } catch {
    return null;
  }
}

/**
 * Fetch book metadata and cover image from Open Library public API
 */
export async function fetchOpenLibraryMetadata(query: string): Promise<BookMetadataResult | null> {
  try {
    const encoded = encodeURIComponent(query);
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 2000);

    const res = await fetch(`https://openlibrary.org/search.json?q=${encoded}&limit=1`, {
      signal: controller.signal,
    });
    clearTimeout(timer);

    if (!res.ok) return null;
    const json = await res.json();
    if (!json.docs || json.docs.length === 0) return null;

    const doc = json.docs[0];
    const coverId = doc.cover_i;
    const coverUrl = coverId ? `https://covers.openlibrary.org/b/id/${coverId}-L.jpg` : undefined;

    return {
      title: doc.title,
      author: doc.author_name ? doc.author_name.join(', ') : undefined,
      publisher: doc.publisher ? doc.publisher[0] : undefined,
      publishedDate: doc.first_publish_year ? String(doc.first_publish_year) : undefined,
      coverUrl,
    };
  } catch {
    return null;
  }
}

const METADATA_CACHE = new Map<string, BookMetadataResult | null>();
const MAX_METADATA_CACHE = 128;

/**
 * Unified public API book search: checks Google Books first, then falls back to Open Library
 */
export async function fetchBookMetadataOnline(title: string, author?: string): Promise<BookMetadataResult | null> {
  const cleanTitle = title.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ').trim();
  const cacheKey = `${cleanTitle.toLowerCase()}_${(author || '').toLowerCase()}`;

  if (METADATA_CACHE.has(cacheKey)) {
    return METADATA_CACHE.get(cacheKey) || null;
  }
  
  // 1. Try Google Books API
  const googleResult = await fetchGoogleBooksMetadata(cleanTitle, author);
  if (googleResult && googleResult.coverUrl) {
    if (METADATA_CACHE.size >= MAX_METADATA_CACHE) {
      const oldestKey = METADATA_CACHE.keys().next().value;
      if (oldestKey) METADATA_CACHE.delete(oldestKey);
    }
    METADATA_CACHE.set(cacheKey, googleResult);
    return googleResult;
  }

  // 2. Fallback to Open Library API
  const openLibResult = await fetchOpenLibraryMetadata(`${cleanTitle} ${author || ''}`);
  if (openLibResult && openLibResult.coverUrl) {
    if (METADATA_CACHE.size >= MAX_METADATA_CACHE) {
      const oldestKey = METADATA_CACHE.keys().next().value;
      if (oldestKey) METADATA_CACHE.delete(oldestKey);
    }
    METADATA_CACHE.set(cacheKey, openLibResult);
    return openLibResult;
  }

  const finalResult = googleResult || openLibResult;
  if (METADATA_CACHE.size >= MAX_METADATA_CACHE) {
    const oldestKey = METADATA_CACHE.keys().next().value;
    if (oldestKey) METADATA_CACHE.delete(oldestKey);
  }
  METADATA_CACHE.set(cacheKey, finalResult);

  return finalResult;
}

/**
 * Background helper that automatically retrieves and caches cover art in SQLite if missing
 */
export async function autoEnrichBookCoverIfMissing(book: {
  id: string;
  title: string;
  authors?: { name: string }[];
  coverImagePath?: string | null;
}): Promise<string | null> {
  if (book.coverImagePath && book.coverImagePath.trim().length > 0) {
    return book.coverImagePath;
  }

  const authorName = book.authors && book.authors.length > 0 ? book.authors[0].name : undefined;
  const meta = await fetchBookMetadataOnline(book.title, authorName);

  if (meta && meta.coverUrl) {
    await updateBookCover(book.id, meta.coverUrl);
    return meta.coverUrl;
  }

  return null;
}
