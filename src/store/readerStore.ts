import { create } from 'zustand';
import {
  Book,
  Bookmark,
  Highlight,
  TOCEntry,
  ThemeMode,
  TextAlign,
  ReadingDirection,
  PageTurnStyle,
  NavigationMode,
} from '../types';

export type ActiveSheet = 'none' | 'toc' | 'typography' | 'theme' | 'tts' | 'annotations' | 'dictionary' | 'search';

export interface ReaderState {
  currentBook: Book | null;
  currentChapterIndex: number;
  currentChapterTitle: string;
  currentLocation: string; // CFI or page or scroll percentage
  progressPercentage: number;
  minutesLeftInChapter: number;
  isFocusMode: boolean;
  activeSheet: ActiveSheet;
  selectedTextForDictionary: string | null;
  
  // Typography settings
  fontFamily: string;
  fontSize: number;
  lineHeight: number;
  marginHorizontal: number;
  textAlign: TextAlign;
  activeTheme: ThemeMode;
  warmthLevel: number; // 0.0 to 1.0

  // Reading Experience settings
  readingDirection: ReadingDirection;
  pageTurnStyle: PageTurnStyle;
  navigationMode: NavigationMode;
  volumeKeysTurnPages: boolean;

  // Actions
  setCurrentBook: (book: Book | null) => void;
  setCurrentChapter: (index: number, title: string) => void;
  setLocation: (location: string, progress: number, minutesLeft?: number) => void;
  toggleFocusMode: () => void;
  setFocusMode: (focus: boolean) => void;
  setActiveSheet: (sheet: ActiveSheet) => void;
  openDictionary: (word: string) => void;
  closeSheet: () => void;

  setFontFamily: (font: string) => void;
  setFontSize: (size: number) => void;
  setLineHeight: (height: number) => void;
  setMarginHorizontal: (margin: number) => void;
  setTextAlign: (align: TextAlign) => void;
  setActiveTheme: (theme: ThemeMode) => void;
  setWarmthLevel: (warmth: number) => void;

  setReadingDirection: (dir: ReadingDirection) => void;
  setPageTurnStyle: (style: PageTurnStyle) => void;
  setNavigationMode: (mode: NavigationMode) => void;
  setVolumeKeysTurnPages: (enabled: boolean) => void;
}

export const useReaderStore = create<ReaderState>((set) => ({
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

  readingDirection: 'horizontal',
  pageTurnStyle: 'slide',
  navigationMode: 'both',
  volumeKeysTurnPages: false,

  setCurrentBook: (book) =>
    set({
      currentBook: book,
      progressPercentage: book ? book.progressPercentage : 0,
      currentLocation: book?.lastReadLocation || '',
      currentChapterIndex: 0,
      isFocusMode: false,
      activeSheet: 'none',
    }),

  setCurrentChapter: (index, title) =>
    set({
      currentChapterIndex: index,
      currentChapterTitle: title,
    }),

  setLocation: (location, progress, minutesLeft = 5) =>
    set({
      currentLocation: location,
      progressPercentage: Math.max(0, Math.min(100, progress)),
      minutesLeftInChapter: minutesLeft,
    }),

  toggleFocusMode: () => set((state) => ({ isFocusMode: !state.isFocusMode, activeSheet: 'none' })),
  setFocusMode: (focus) => set({ isFocusMode: focus, activeSheet: focus ? 'none' : 'none' }),
  setActiveSheet: (sheet) => set({ activeSheet: sheet }),
  openDictionary: (word) => set({ selectedTextForDictionary: word, activeSheet: 'dictionary' }),
  closeSheet: () => set({ activeSheet: 'none' }),

  setFontFamily: (fontFamily) => set({ fontFamily }),
  setFontSize: (fontSize) => set({ fontSize }),
  setLineHeight: (lineHeight) => set({ lineHeight }),
  setMarginHorizontal: (marginHorizontal) => set({ marginHorizontal }),
  setTextAlign: (textAlign) => set({ textAlign }),
  setActiveTheme: (activeTheme) => set({ activeTheme }),
  setWarmthLevel: (warmthLevel) => set({ warmthLevel }),

  setReadingDirection: (readingDirection) => set({ readingDirection }),
  setPageTurnStyle: (pageTurnStyle) => set({ pageTurnStyle }),
  setNavigationMode: (navigationMode) => set({ navigationMode }),
  setVolumeKeysTurnPages: (volumeKeysTurnPages) => set({ volumeKeysTurnPages }),
}));
