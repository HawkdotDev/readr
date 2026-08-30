import { create } from 'zustand';
import { Book, BookFormat, BookStatus } from '../types';

export type LibraryViewMode = 'grid' | 'list';
export type SortOption = 'recent' | 'title' | 'author' | 'progress';

export interface LibraryState {
  searchQuery: string;
  selectedStatus: BookStatus | 'all';
  selectedFormat: BookFormat | 'all';
  selectedShelfId: string | null;
  sortOption: SortOption;
  viewMode: LibraryViewMode;
  isLoading: boolean;

  setSearchQuery: (query: string) => void;
  setSelectedStatus: (status: BookStatus | 'all') => void;
  setSelectedFormat: (format: BookFormat | 'all') => void;
  setSelectedShelfId: (shelfId: string | null) => void;
  setSortOption: (sort: SortOption) => void;
  setViewMode: (mode: LibraryViewMode) => void;
  setIsLoading: (loading: boolean) => void;
}

export const useLibraryStore = create<LibraryState>((set) => ({
  searchQuery: '',
  selectedStatus: 'all',
  selectedFormat: 'all',
  selectedShelfId: null,
  sortOption: 'recent',
  viewMode: 'grid',
  isLoading: false,

  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setSelectedStatus: (selectedStatus) => set({ selectedStatus }),
  setSelectedFormat: (selectedFormat) => set({ selectedFormat }),
  setSelectedShelfId: (selectedShelfId) => set({ selectedShelfId }),
  setSortOption: (sortOption) => set({ sortOption }),
  setViewMode: (viewMode) => set({ viewMode }),
  setIsLoading: (isLoading) => set({ isLoading }),
}));
