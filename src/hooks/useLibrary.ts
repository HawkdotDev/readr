import { useState, useCallback, useMemo } from 'react';
import { Book, BookStatus, BookFormat } from '../types';
import { getAllBooks } from '../db/queries/books';
import { autoEnrichBookCoverIfMissing } from '../services/metadata/metadataService';
import { useLibraryStore, SortOption, LibraryViewMode } from '../store/libraryStore';

export interface UseLibraryResult {
  books: Book[];
  filteredBooks: Book[];
  featuredBook: Book | null;
  loading: boolean;
  refreshing: boolean;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedStatus: BookStatus | 'all';
  setSelectedStatus: (status: BookStatus | 'all') => void;
  selectedFormat: BookFormat | 'all';
  setSelectedFormat: (format: BookFormat | 'all') => void;
  viewMode: LibraryViewMode;
  setViewMode: (mode: LibraryViewMode) => void;
  sortOption: SortOption;
  setSortOption: (sort: SortOption) => void;
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

  const featuredBook = useMemo(() => {
    return (
      books.find((b) => b.status === 'reading' && (b.progressPercentage || 0) > 0) ||
      books.find((b) => (b.progressPercentage || 0) > 0) ||
      (books.length > 0 ? books[0] : null)
    );
  }, [books]);

  const filteredBooks = useMemo(() => {
    return books.filter((b) => {
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

      return true;
    });
  }, [books, searchQuery, selectedStatus, selectedFormat]);

  return {
    books,
    filteredBooks,
    featuredBook,
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
    loadBooks,
    onRefresh,
  };
}
