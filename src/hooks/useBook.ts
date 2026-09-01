import { useState, useEffect, useCallback } from 'react';
import { Book, Bookmark, Highlight, TOCEntry, Tag } from '../types';
import {
  getBookById,
  getBookmarks,
  getHighlights,
  getBookTOC,
  toggleBookFavorite as toggleBookFavoriteQuery,
  updateBookRating as updateBookRatingQuery,
  deleteBook,
} from '../db/queries/books';
import {
  getBookTags,
  createTag,
  addTagToBook,
  removeTagFromBook,
  getAllTags,
} from '../db/queries/tags';
import * as Haptics from 'expo-haptics';

export interface UseBookResult {
  book: Book | null;
  bookmarks: Bookmark[];
  highlights: Highlight[];
  toc: TOCEntry[];
  tags: Tag[];
  allTags: Tag[];
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
  toggleBookFavorite: () => Promise<void>;
  updateRating: (rating: number) => Promise<void>;
  addTag: (tagName: string) => Promise<void>;
  removeTag: (tagId: string) => Promise<void>;
  removeBook: () => Promise<boolean>;
}

export function useBook(bookId: string): UseBookResult {
  const [book, setBook] = useState<Book | null>(null);
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const [toc, setToc] = useState<TOCEntry[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [allTags, setAllTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refresh = useCallback(async () => {
    if (!bookId) return;
    try {
      setLoading(true);
      setError(null);
      const [bookData, bms, hls, tocData, bookTagsList, globalTagsList] = await Promise.all([
        getBookById(bookId),
        getBookmarks(bookId),
        getHighlights(bookId),
        getBookTOC(bookId),
        getBookTags(bookId),
        getAllTags(),
      ]);
      setBook(bookData);
      setBookmarks(bms);
      setHighlights(hls);
      setToc(tocData);
      setTags(bookTagsList);
      setAllTags(globalTagsList);
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
    const previousState = book.isFavorite;
    const nextState = !previousState;

    setBook((prev) => (prev ? { ...prev, isFavorite: nextState } : null));

    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
      await toggleBookFavoriteQuery(book.id, previousState);
    } catch {
      setBook((prev) => (prev ? { ...prev, isFavorite: previousState } : null));
    }
  };

  const updateRating = async (rating: number) => {
    if (!book) return;
    setBook((prev) => (prev ? { ...prev, rating } : null));
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
      await updateBookRatingQuery(book.id, rating);
    } catch (err) {
      console.warn('Failed to update rating:', err);
    }
  };

  const addTag = async (tagName: string) => {
    if (!book || !tagName.trim()) return;
    try {
      const cleanName = tagName.trim();
      let targetTag = allTags.find((t) => t.name.toLowerCase() === cleanName.toLowerCase());
      if (!targetTag) {
        targetTag = await createTag(cleanName);
        setAllTags((prev) => [...prev, targetTag!]);
      }
      await addTagToBook(book.id, targetTag.id);
      setTags((prev) => (prev.some((t) => t.id === targetTag!.id) ? prev : [...prev, targetTag!]));
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    } catch (err) {
      console.warn('Failed to add tag:', err);
    }
  };

  const removeTag = async (tagId: string) => {
    if (!book) return;
    try {
      await removeTagFromBook(book.id, tagId);
      setTags((prev) => prev.filter((t) => t.id !== tagId));
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    } catch (err) {
      console.warn('Failed to remove tag:', err);
    }
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
    tags,
    allTags,
    loading,
    error,
    refresh,
    toggleBookFavorite,
    updateRating,
    addTag,
    removeTag,
    removeBook,
  };
}
