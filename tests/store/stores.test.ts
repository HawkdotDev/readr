import { describe, it, expect, beforeEach } from 'bun:test';
import { useLibraryStore } from '../../src/store/libraryStore';
import { useReaderStore } from '../../src/store/readerStore';
import { Book } from '../../src/types';

describe('Library Store State & Actions', () => {
  beforeEach(() => {
    useLibraryStore.setState({
      searchQuery: '',
      selectedStatus: 'all',
      selectedFormat: 'all',
      selectedShelfId: null,
      sortOption: 'recent',
      viewMode: 'grid',
      isLoading: false,
    });
  });

  it('updates search query and filter states', () => {
    useLibraryStore.getState().setSearchQuery('Dostoevsky');
    expect(useLibraryStore.getState().searchQuery).toBe('Dostoevsky');

    useLibraryStore.getState().setSelectedStatus('reading');
    expect(useLibraryStore.getState().selectedStatus).toBe('reading');

    useLibraryStore.getState().setSelectedFormat('epub');
    expect(useLibraryStore.getState().selectedFormat).toBe('epub');

    useLibraryStore.getState().setViewMode('list');
    expect(useLibraryStore.getState().viewMode).toBe('list');

    useLibraryStore.getState().setSortOption('title');
    expect(useLibraryStore.getState().sortOption).toBe('title');
  });
});

describe('Reader Store State & Actions', () => {
  beforeEach(() => {
    useReaderStore.setState({
      currentBook: null,
      currentChapterIndex: 0,
      currentChapterTitle: 'Beginning',
      currentLocation: '',
      progressPercentage: 0,
      minutesLeftInChapter: 5,
      isFocusMode: false,
      activeSheet: 'none',
      selectedTextForDictionary: null,
      fontFamily: 'Literata',
      fontSize: 18,
      lineHeight: 1.5,
      marginHorizontal: 20,
      textAlign: 'left',
      activeTheme: 'light',
      warmthLevel: 0.0,
    });
  });

  it('sets and clears current book properly', () => {
    const mockBook: Book = {
      id: 'book_1',
      fileHash: 'hash_123',
      title: 'Crime and Punishment',
      originalFilename: 'crime.epub',
      filePath: 'file:///books/crime.epub',
      fileFormat: 'epub',
      fileSizeBytes: 1024,
      pageCount: 500,
      progressPercentage: 42.5,
      status: 'reading',
      isFavorite: true,
      totalTimeReadSeconds: 3600,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastReadLocation: 'chap_4',
    };

    useReaderStore.getState().setCurrentBook(mockBook);
    const state = useReaderStore.getState();
    expect(state.currentBook?.title).toBe('Crime and Punishment');
    expect(state.progressPercentage).toBe(42.5);
    expect(state.currentLocation).toBe('chap_4');
    expect(state.activeSheet).toBe('none');

    useReaderStore.getState().setCurrentBook(null);
    expect(useReaderStore.getState().currentBook).toBeNull();
  });

  it('updates reading location and clamps progress percentage', () => {
    useReaderStore.getState().setLocation('chap_5_pos_100', 120, 8);
    expect(useReaderStore.getState().progressPercentage).toBe(100);
    expect(useReaderStore.getState().minutesLeftInChapter).toBe(8);

    useReaderStore.getState().setLocation('chap_0', -10, 12);
    expect(useReaderStore.getState().progressPercentage).toBe(0);
  });

  it('manages focus mode and active bottom sheets', () => {
    useReaderStore.getState().setActiveSheet('typography');
    expect(useReaderStore.getState().activeSheet).toBe('typography');

    useReaderStore.getState().toggleFocusMode();
    expect(useReaderStore.getState().isFocusMode).toBe(true);
    expect(useReaderStore.getState().activeSheet).toBe('none');

    useReaderStore.getState().openDictionary('sanctuary');
    expect(useReaderStore.getState().selectedTextForDictionary).toBe('sanctuary');
    expect(useReaderStore.getState().activeSheet).toBe('dictionary');

    useReaderStore.getState().closeSheet();
    expect(useReaderStore.getState().activeSheet).toBe('none');
  });

  it('updates typography and theme configurations', () => {
    useReaderStore.getState().setFontFamily('Cinzel');
    useReaderStore.getState().setFontSize(22);
    useReaderStore.getState().setLineHeight(1.8);
    useReaderStore.getState().setMarginHorizontal(32);
    useReaderStore.getState().setTextAlign('justify');
    useReaderStore.getState().setActiveTheme('sepia');
    useReaderStore.getState().setWarmthLevel(0.4);

    const s = useReaderStore.getState();
    expect(s.fontFamily).toBe('Cinzel');
    expect(s.fontSize).toBe(22);
    expect(s.lineHeight).toBe(1.8);
    expect(s.marginHorizontal).toBe(32);
    expect(s.textAlign).toBe('justify');
    expect(s.activeTheme).toBe('sepia');
    expect(s.warmthLevel).toBe(0.4);
  });
});
