import { useState, useEffect, useCallback } from 'react';
import { Book, Bookmark, Highlight, TOCEntry } from '../types';
import {
  getBookById,
  getBookmarks,
  getHighlights,
  getBookTOC,
  toggleBookFavorite as toggleBookFavoriteQuery,
  deleteBook,
} from '../db/queries/books';

export interface UseBookResult {
  book: Book | null;
  bookmarks: Bookmark[];
  highlights: Highlight[];
  toc: TOCEntry[];
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
  toggleBookFavorite: () => Promise<void>;
  removeBook: () => Promise<boolean>;
}

export function useBook(bookId: string): UseBookResult {
  const [book, setBook] = useState<Book | null>(null);
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const [toc, setToc] = useState<TOCEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refresh = useCallback(async () => {
    if (!bookId) return;
    try {
      setLoading(true);
      setError(null);
      const [bookData, bms, hls, tocData] = await Promise.all([
        getBookById(bookId),
        getBookmarks(bookId),
        getHighlights(bookId),
        getBookTOC(bookId),
      ]);
      setBook(bookData);
      setBookmarks(bms);
      setHighlights(hls);
      setToc(tocData);
    } catch (e: any) {
      setError(e instanceof Error ? e : new Error(String(e)));
    } finally {
      setLoading(false);
    }
  }, [bookId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const toggleBookFavorite = async () => {
    if (!book) return;
    const nextState = await toggleBookFavoriteQuery(book.id, book.isFavorite);
    setBook((prev) => (prev ? { ...prev, isFavorite: nextState } : null));
  };

  const removeBook = async (): Promise<boolean> => {
    if (!book) return false;
    try {
      await deleteBook(book.id);
      return true;
    } catch {
      return false;
    }
  };

  return {
    book,
    bookmarks,
    highlights,
    toc,
    loading,
    error,
    refresh,
    toggleBookFavorite,
    removeBook,
  };
}
