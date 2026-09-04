import { useState, useCallback, useMemo, useEffect } from 'react';
import { Book, BookFormat, Tag } from '../types';
import {
  getAllBooks,
  toggleBookFavorite as toggleBookFavoriteQuery,
  updateBookRating as updateBookRatingQuery,
} from '../db/queries/books';
import { getAllTags } from '../db/queries/tags';
import { autoEnrichBookCoverIfMissing } from '../services/metadata/metadataService';
import { useLibraryStore, SortOption, LibraryViewMode, LibraryFilterStatus } from '../store/libraryStore';
import * as Haptics from 'expo-haptics';
import { prewarmBookCache } from '../services/reader/epubParser';

// In-memory set to prevent repetitive network requests on idle for books with no online cover
const ATTEMPTED_COVER_ENRICHMENT_IDS = new Set<string>();

export interface UseLibraryResult {
  books: Book[];
  filteredBooks: Book[];
  featuredBook: Book | null;
  inProgressBooks: Book[];
  favoriteBooks: Book[];
  allTags: Tag[];
  loading: boolean;
  refreshing: boolean;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedStatus: LibraryFilterStatus;
  setSelectedStatus: (status: LibraryFilterStatus) => void;
  selectedFormat: BookFormat | 'all';
  setSelectedFormat: (format: BookFormat | 'all') => void;
  selectedTagId: string | null;
  setSelectedTagId: (tagId: string | null) => void;
  viewMode: LibraryViewMode;
  setViewMode: (mode: LibraryViewMode) => void;
  sortOption: SortOption;
  setSortOption: (sort: SortOption) => void;
  toggleFavorite: (bookId: string) => Promise<boolean>;
  updateRating: (bookId: string, rating: number) => Promise<void>;
  loadBooks: () => Promise<void>;
  onRefresh: () => Promise<void>;
}

export function useLibrary(): UseLibraryResult {
  const books = useLibraryStore((s) => s.books);
  const allTags = useLibraryStore((s) => s.tags);
  const setStoreBooks = useLibraryStore((s) => s.setBooks);
  const setStoreTags = useLibraryStore((s) => s.setTags);
  const updateBookInStore = useLibraryStore((s) => s.updateBookInStore);

  const [loading, setLoading] = useState(books.length === 0);
  const [refreshing, setRefreshing] = useState(false);

  const {
    searchQuery,
    setSearchQuery,
    selectedStatus,
    setSelectedStatus,
    selectedFormat,
    setSelectedFormat,
    selectedTagId,
    setSelectedTagId,
    viewMode,
    setViewMode,
    sortOption,
    setSortOption,
  } = useLibraryStore();

  const loadBooks = useCallback(async () => {
    try {
      if (useLibraryStore.getState().books.length === 0) {
        setLoading(true);
      }
      const [data, tagsData] = await Promise.all([getAllBooks(), getAllTags()]);
      setStoreBooks(data);
      setStoreTags(tagsData);

      // Pre-warm the featured/most recent book in the background for 0ms continue reading
      const featured =
        data.find((b) => b.status === 'reading' && (b.progressPercentage || 0) > 0) ||
        data.find((b) => (b.progressPercentage || 0) > 0) ||
        (data.length > 0 ? data[0] : null);

      if (featured && featured.filePath) {
        prewarmBookCache(featured.filePath, featured.fileFormat, featured.title).catch(() => {});
      }

      // Auto-enrich any books without cover art in the background (only once per book per session)
      const missingCovers = data.filter((b) => !b.coverImagePath && !ATTEMPTED_COVER_ENRICHMENT_IDS.has(b.id));
      if (missingCovers.length > 0) {
        missingCovers.forEach((b) => ATTEMPTED_COVER_ENRICHMENT_IDS.add(b.id));
        (async () => {
          let hasUpdates = false;
          for (const book of missingCovers) {
            const coverUrl = await autoEnrichBookCoverIfMissing(book);
            if (coverUrl) hasUpdates = true;
          }
          if (hasUpdates) {
            const refreshed = await getAllBooks();
            setStoreBooks(refreshed);
          }
        })();
      }
    } catch (e) {
      console.warn('Failed to load books in useLibrary:', e);
    } finally {
      setLoading(false);
    }
  }, [setStoreBooks, setStoreTags]);

  useEffect(() => {
    loadBooks();
  }, [loadBooks]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadBooks();
    setRefreshing(false);
  }, [loadBooks]);

  /**
   * Optimistic favorite toggle (0ms UI latency + background sync)
   */
  const toggleFavorite = useCallback(
    async (bookId: string): Promise<boolean> => {
      let currentVal = false;
      const targetBook = books.find((b) => b.id === bookId);
      if (targetBook) {
        currentVal = targetBook.isFavorite;
        updateBookInStore(bookId, { isFavorite: !currentVal });
      }
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
        const newVal = await toggleBookFavoriteQuery(bookId, currentVal);
        updateBookInStore(bookId, { isFavorite: newVal });
        return newVal;
      } catch (err) {
        console.warn('Failed to toggle favorite:', err);
        if (targetBook) {
          updateBookInStore(bookId, { isFavorite: currentVal });
        }
        return currentVal;
      }
    },
    [books, updateBookInStore]
  );

  /**
   * Update 1-5 Star Book Rating
   */
  const updateRating = useCallback(
    async (bookId: string, rating: number): Promise<void> => {
      updateBookInStore(bookId, { rating });
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
        await updateBookRatingQuery(bookId, rating);
      } catch (err) {
        console.warn('Failed to update rating:', err);
      }
    },
    [updateBookInStore]
  );

  const featuredBook = useMemo(() => {
    return (
      books.find((b) => b.status === 'reading' && (b.progressPercentage || 0) > 0) ||
      books.find((b) => (b.progressPercentage || 0) > 0) ||
      (books.length > 0 ? books[0] : null)
    );
  }, [books]);

  const inProgressBooks = useMemo(() => {
    if (!featuredBook) return [];
    return books.filter(
      (b) =>
        b.id !== featuredBook.id &&
        b.status !== 'finished' &&
        (b.progressPercentage || 0) > 0 &&
        (b.progressPercentage || 0) < 100
    );
  }, [books, featuredBook]);

  const favoriteBooks = useMemo(() => {
    return books.filter((b) => b.isFavorite);
  }, [books]);

  const filteredBooks = useMemo(() => {
    const baseList = searchQuery.trim()
      ? books
      : books.some((b) => b.isFavorite)
      ? books.filter((b) => b.isFavorite)
      : books;

    const list = baseList.filter((b) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchTitle = b.title.toLowerCase().includes(q);
        const matchAuthor = b.authors?.some((a) =>
          a.name.toLowerCase().includes(q)
        ) ?? false;
        if (!matchTitle && !matchAuthor) return false;
      }

      if (selectedStatus !== 'all' && b.status !== selectedStatus) {
        return false;
      }

      if (selectedFormat !== 'all' && b.fileFormat !== selectedFormat) {
        return false;
      }

      if (selectedTagId) {
        const hasTag = b.tags?.some((t) => t.id === selectedTagId);
        if (!hasTag) return false;
      }

      return true;
    });

    // Apply sorting
    return [...list].sort((a, b) => {
      if (sortOption === 'rating') {
        return (b.rating || 0) - (a.rating || 0);
      }
      if (sortOption === 'title') {
        return a.title.localeCompare(b.title);
      }
      if (sortOption === 'author') {
        const authA = a.authors?.[0]?.name || '';
        const authB = b.authors?.[0]?.name || '';
        return authA.localeCompare(authB);
      }
      if (sortOption === 'progress') {
        return (b.progressPercentage || 0) - (a.progressPercentage || 0);
      }
      // 'recent' default
      const timeA = a.lastReadAt
        ? typeof a.lastReadAt === 'number' ? a.lastReadAt * 1000 : new Date(a.lastReadAt).getTime()
        : typeof a.updatedAt === 'number' ? a.updatedAt * 1000 : new Date(a.updatedAt).getTime();
      const timeB = b.lastReadAt
        ? typeof b.lastReadAt === 'number' ? b.lastReadAt * 1000 : new Date(b.lastReadAt).getTime()
        : typeof b.updatedAt === 'number' ? b.updatedAt * 1000 : new Date(b.updatedAt).getTime();
      return timeB - timeA;
    });
  }, [books, searchQuery, selectedStatus, selectedFormat, selectedTagId, sortOption]);

  return {
    books,
    filteredBooks,
    featuredBook,
    inProgressBooks,
    favoriteBooks,
    allTags,
    loading,
    refreshing,
    searchQuery,
    setSearchQuery,
    selectedStatus,
    setSelectedStatus,
    selectedFormat,
    setSelectedFormat,
    selectedTagId,
    setSelectedTagId,
    viewMode,
    setViewMode,
    sortOption,
    setSortOption,
    toggleFavorite,
    updateRating,
    loadBooks,
    onRefresh,
  };
}
