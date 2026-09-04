import { create } from 'zustand';
import { Book, BookFormat, BookStatus, Tag } from '../types';

export type LibraryViewMode = 'grid' | 'list';
export type SortOption = 'recent' | 'title' | 'author' | 'progress' | 'rating';
export type LibraryFilterStatus = BookStatus | 'all';

export interface LibraryState {
  books: Book[];
  tags: Tag[];
  searchQuery: string;
  selectedStatus: LibraryFilterStatus;
  selectedFormat: BookFormat | 'all';
  selectedShelfId: string | null;
  selectedTagId: string | null;
  sortOption: SortOption;
  viewMode: LibraryViewMode;
  isLoading: boolean;

  setBooks: (books: Book[]) => void;
  setTags: (tags: Tag[]) => void;
  updateBookInStore: (bookId: string, partial: Partial<Book>) => void;
  setSearchQuery: (query: string) => void;
  setSelectedStatus: (status: LibraryFilterStatus) => void;
  setSelectedFormat: (format: BookFormat | 'all') => void;
  setSelectedShelfId: (shelfId: string | null) => void;
  setSelectedTagId: (tagId: string | null) => void;
  setSortOption: (sort: SortOption) => void;
  setViewMode: (mode: LibraryViewMode) => void;
  setIsLoading: (loading: boolean) => void;
}

export const useLibraryStore = create<LibraryState>((set) => ({
  books: [],
  tags: [],
  searchQuery: '',
  selectedStatus: 'all',
  selectedFormat: 'all',
  selectedShelfId: null,
  selectedTagId: null,
  sortOption: 'recent',
  viewMode: 'list', // Default to list view
  isLoading: false,

  setBooks: (books) => set({ books }),
  setTags: (tags) => set({ tags }),
  updateBookInStore: (bookId, partial) =>
    set((state) => ({
      books: state.books.map((b) => (b.id === bookId ? { ...b, ...partial } : b)),
    })),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setSelectedStatus: (selectedStatus) => set({ selectedStatus }),
  setSelectedFormat: (selectedFormat) => set({ selectedFormat }),
  setSelectedShelfId: (selectedShelfId) => set({ selectedShelfId }),
  setSelectedTagId: (selectedTagId) => set({ selectedTagId }),
  setSortOption: (sortOption) => set({ sortOption }),
  setViewMode: (viewMode) => set({ viewMode }),
  setIsLoading: (isLoading) => set({ isLoading }),
}));
