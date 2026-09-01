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
  ReadingRulerMode,
  PaperTexture,
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
  warmthLevel: number; // 0.0 to 1.0 (0-95% blue light filter scale)

  // Advanced Paragraph Formatting
  paragraphIndent: number; // 0.0 to 2.5em
  paragraphSpacing: number; // multiplier 0.5 to 2.5
  dropCaps: boolean;
  paperTexture: PaperTexture;
  customFonts: string[];

  // Reading Experience settings
  readingDirection: ReadingDirection;
  pageTurnStyle: PageTurnStyle;
  navigationMode: NavigationMode;
  volumeKeysTurnPages: boolean;
  dualPageMode: boolean | 'auto';

  // Reading Ruler Focus Tool
  readingRulerEnabled: boolean;
  readingRulerMode: ReadingRulerMode;
  readingRulerHeight: number;
  readingRulerOpacity: number;

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

  setParagraphIndent: (indent: number) => void;
  setParagraphSpacing: (spacing: number) => void;
  setDropCaps: (enabled: boolean) => void;
  setPaperTexture: (texture: PaperTexture) => void;
  setCustomFonts: (fonts: string[]) => void;
  addCustomFont: (font: string) => void;

  setReadingDirection: (dir: ReadingDirection) => void;
  setPageTurnStyle: (style: PageTurnStyle) => void;
  setNavigationMode: (mode: NavigationMode) => void;
  setVolumeKeysTurnPages: (enabled: boolean) => void;
  setDualPageMode: (mode: boolean | 'auto') => void;

  setReadingRulerEnabled: (enabled: boolean) => void;
  setReadingRulerMode: (mode: ReadingRulerMode) => void;
  setReadingRulerHeight: (height: number) => void;
  setReadingRulerOpacity: (opacity: number) => void;
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

  paragraphIndent: 0.0,
  paragraphSpacing: 1.0,
  dropCaps: false,
  paperTexture: 'clean',
  customFonts: [],

  readingDirection: 'horizontal',
  pageTurnStyle: 'slide',
  navigationMode: 'both',
  volumeKeysTurnPages: false,
  dualPageMode: 'auto',

  readingRulerEnabled: false,
  readingRulerMode: 'highlight',
  readingRulerHeight: 38,
  readingRulerOpacity: 0.55,

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

  setParagraphIndent: (paragraphIndent) => set({ paragraphIndent }),
  setParagraphSpacing: (paragraphSpacing) => set({ paragraphSpacing }),
  setDropCaps: (dropCaps) => set({ dropCaps }),
  setPaperTexture: (paperTexture) => set({ paperTexture }),
  setCustomFonts: (customFonts) => set({ customFonts }),
  addCustomFont: (font) =>
    set((state) => ({
      customFonts: state.customFonts.includes(font) ? state.customFonts : [...state.customFonts, font],
      fontFamily: font,
    })),

  setReadingDirection: (readingDirection) => set({ readingDirection }),
  setPageTurnStyle: (pageTurnStyle) => set({ pageTurnStyle }),
  setNavigationMode: (navigationMode) => set({ navigationMode }),
  setVolumeKeysTurnPages: (volumeKeysTurnPages) => set({ volumeKeysTurnPages }),
  setDualPageMode: (dualPageMode) => set({ dualPageMode }),

  setReadingRulerEnabled: (readingRulerEnabled) => set({ readingRulerEnabled }),
  setReadingRulerMode: (readingRulerMode) => set({ readingRulerMode }),
  setReadingRulerHeight: (readingRulerHeight) => set({ readingRulerHeight }),
  setReadingRulerOpacity: (readingRulerOpacity) => set({ readingRulerOpacity }),
}));
