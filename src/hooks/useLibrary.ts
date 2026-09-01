import { useState, useCallback, useMemo } from 'react';
import { Book, BookFormat } from '../types';
import { getAllBooks, toggleBookFavorite as toggleBookFavoriteQuery } from '../db/queries/books';
import { autoEnrichBookCoverIfMissing } from '../services/metadata/metadataService';
import { useLibraryStore, SortOption, LibraryViewMode, LibraryFilterStatus } from '../store/libraryStore';
import * as Haptics from 'expo-haptics';

export interface UseLibraryResult {
  books: Book[];
  filteredBooks: Book[];
  featuredBook: Book | null;
  inProgressBooks: Book[];
  favoriteBooks: Book[];
  loading: boolean;
  refreshing: boolean;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedStatus: LibraryFilterStatus;
  setSelectedStatus: (status: LibraryFilterStatus) => void;
  selectedFormat: BookFormat | 'all';
  setSelectedFormat: (format: BookFormat | 'all') => void;
  viewMode: LibraryViewMode;
  setViewMode: (mode: LibraryViewMode) => void;
  sortOption: SortOption;
  setSortOption: (sort: SortOption) => void;
  toggleFavorite: (bookId: string) => Promise<boolean>;
  loadBooks: () => Promise<void>;
  onRefresh: () => Promise<void>;
}

export function useLibrary(): UseLibraryResult {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const {
    searchQuery,
    setSearchQuery,
    selectedStatus,
    setSelectedStatus,
    selectedFormat,
    setSelectedFormat,
    viewMode,
    setViewMode,
    sortOption,
    setSortOption,
  } = useLibraryStore();

  const loadBooks = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getAllBooks();
      setBooks(data);

      // Auto-enrich any books without cover art in the background
      const missingCovers = data.filter((b) => !b.coverImagePath);
      if (missingCovers.length > 0) {
        (async () => {
          let hasUpdates = false;
          for (const book of missingCovers) {
            const coverUrl = await autoEnrichBookCoverIfMissing(book);
            if (coverUrl) hasUpdates = true;
          }
          if (hasUpdates) {
            const refreshed = await getAllBooks();
            setBooks(refreshed);
          }
        })();
      }
    } catch (e) {
      console.warn('Failed to load books in useLibrary:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadBooks();
    setRefreshing(false);
  }, [loadBooks]);

  /**
   * Ultra-fast optimistic favorite toggle (0ms UI latency + background sync)
   */
  const toggleFavorite = useCallback(
    async (bookId: string): Promise<boolean> => {
      let currentVal = false;
      
      // 1. Optimistically mutate local state with immediate haptic response
      setBooks((prevBooks) => {
        const target = prevBooks.find((b) => b.id === bookId);
        if (target) {
          currentVal = target.isFavorite;
        }
        return prevBooks.map((b) =>
          b.id === bookId ? { ...b, isFavorite: !b.isFavorite } : b
        );
      });

      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
      } catch {}

      // 2. Persist to SQLite in background
      try {
        await toggleBookFavoriteQuery(bookId, currentVal);
        return !currentVal;
      } catch (err) {
        console.error('Failed to persist favorite toggle, rolling back:', err);
        // Rollback state
        setBooks((prevBooks) =>
          prevBooks.map((b) =>
            b.id === bookId ? { ...b, isFavorite: currentVal } : b
          )
        );
        return currentVal;
      }
    },
    []
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
    const list = books.filter((b) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchTitle = b.title.toLowerCase().includes(q);
        const matchAuthor = b.authors?.some((a) =>
          a.name.toLowerCase().includes(q)
        ) ?? false;
        if (!matchTitle && !matchAuthor) return false;
      }

      if (selectedStatus === 'favorites') {
        if (!b.isFavorite) return false;
      } else if (selectedStatus !== 'all' && b.status !== selectedStatus) {
        return false;
      }

      if (selectedFormat !== 'all' && b.fileFormat !== selectedFormat) {
        return false;
      }

      return true;
    });

    // Apply sorting
    return list.sort((a, b) => {
      if (sortOption === 'favorites') {
        if (a.isFavorite && !b.isFavorite) return -1;
        if (!a.isFavorite && b.isFavorite) return 1;
        return a.title.localeCompare(b.title);
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
      const timeA = a.lastReadAt ? new Date(a.lastReadAt).getTime() : new Date(a.updatedAt).getTime();
      const timeB = b.lastReadAt ? new Date(b.lastReadAt).getTime() : new Date(b.updatedAt).getTime();
      return timeB - timeA;
    });
  }, [books, searchQuery, selectedStatus, selectedFormat, sortOption]);

  return {
    books,
    filteredBooks,
    featuredBook,
    inProgressBooks,
    favoriteBooks,
    loading,
    refreshing,
    searchQuery,
    setSearchQuery,
    selectedStatus,
    setSelectedStatus,
    selectedFormat,
    setSelectedFormat,
    viewMode,
    setViewMode,
    sortOption,
    setSortOption,
    toggleFavorite,
    loadBooks,
    onRefresh,
  };
}
