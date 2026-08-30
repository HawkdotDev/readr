export interface BookMetadataResult {
  title?: string;
  author?: string;
  description?: string;
  publisher?: string;
  publishedDate?: string;
  coverUrl?: string;
}

export async function fetchOpenLibraryMetadata(query: string): Promise<BookMetadataResult | null> {
  try {
    const encoded = encodeURIComponent(query);
    const res = await fetch(`https://openlibrary.org/search.json?q=${encoded}&limit=1`);
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
