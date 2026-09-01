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
  PageTransitionMode,
  AutoScrollMode,
  BionicFixation,
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

  // Reading Experience & Page Transitions
  readingDirection: ReadingDirection;
  pageTurnStyle: PageTurnStyle;
  pageTransition: PageTransitionMode;
  navigationMode: NavigationMode;
  volumeKeysTurnPages: boolean;
  dualPageMode: boolean | 'auto';

  // Bionic Reading Engine
  bionicReadingEnabled: boolean;
  bionicFixation: BionicFixation;

  // Auto-Scroll Suite
  isAutoScrolling: boolean;
  autoScrollSpeed: number; // px/sec or line rate (10 - 200)
  autoScrollMode: AutoScrollMode;
  pageTimerIntervalSeconds: number;

  // Real-Time Speedometer HUD
  showSpeedometer: boolean;

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
  setPageTransition: (transition: PageTransitionMode) => void;
  setNavigationMode: (mode: NavigationMode) => void;
  setVolumeKeysTurnPages: (enabled: boolean) => void;
  setDualPageMode: (mode: boolean | 'auto') => void;

  setBionicReadingEnabled: (enabled: boolean) => void;
  setBionicFixation: (fixation: BionicFixation) => void;

  toggleAutoScroll: () => void;
  setAutoScrolling: (active: boolean) => void;
  setAutoScrollSpeed: (speed: number) => void;
  setAutoScrollMode: (mode: AutoScrollMode) => void;
  setPageTimerInterval: (sec: number) => void;

  setShowSpeedometer: (show: boolean) => void;

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
  pageTransition: 'slide',
  navigationMode: 'both',
  volumeKeysTurnPages: false,
  dualPageMode: 'auto',

  bionicReadingEnabled: false,
  bionicFixation: 'medium',

  isAutoScrolling: false,
  autoScrollSpeed: 45,
  autoScrollMode: 'smooth',
  pageTimerIntervalSeconds: 20,

  showSpeedometer: false,

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
      isAutoScrolling: false,
    }),

  setCurrentChapter: (index, title) =>
    set({
      currentChapterIndex: index,
      currentChapterTitle: title,
    }),

  setLocation: (location, progress, minutesLeft) =>
    set((state) => ({
      currentLocation: location,
      progressPercentage: Math.max(0, Math.min(100, progress)),
      minutesLeftInChapter: minutesLeft !== undefined ? minutesLeft : state.minutesLeftInChapter,
    })),

  toggleFocusMode: () =>
    set((state) => ({
      isFocusMode: !state.isFocusMode,
      activeSheet: !state.isFocusMode ? 'none' : state.activeSheet,
    })),
  setFocusMode: (focus) => set((state) => ({ isFocusMode: focus, activeSheet: focus ? 'none' : state.activeSheet })),
  setActiveSheet: (sheet) => set({ activeSheet: sheet }),
  openDictionary: (word) => set({ activeSheet: 'dictionary', selectedTextForDictionary: word }),
  closeSheet: () => set({ activeSheet: 'none', selectedTextForDictionary: null }),

  setFontFamily: (fontFamily) => set({ fontFamily }),
  setFontSize: (fontSize) => set({ fontSize: Math.max(12, Math.min(36, fontSize)) }),
  setLineHeight: (lineHeight) => set({ lineHeight: Math.max(1.1, Math.min(2.5, lineHeight)) }),
  setMarginHorizontal: (marginHorizontal) => set({ marginHorizontal: Math.max(8, Math.min(48, marginHorizontal)) }),
  setTextAlign: (textAlign) => set({ textAlign }),
  setActiveTheme: (activeTheme) => set({ activeTheme }),
  setWarmthLevel: (warmthLevel) => set({ warmthLevel: Math.max(0.0, Math.min(0.95, warmthLevel)) }),

  setParagraphIndent: (paragraphIndent) => set({ paragraphIndent: Math.max(0.0, Math.min(2.5, paragraphIndent)) }),
  setParagraphSpacing: (paragraphSpacing) => set({ paragraphSpacing: Math.max(0.5, Math.min(2.5, paragraphSpacing)) }),
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
  setPageTransition: (pageTransition) => set({ pageTransition }),
  setNavigationMode: (navigationMode) => set({ navigationMode }),
  setVolumeKeysTurnPages: (volumeKeysTurnPages) => set({ volumeKeysTurnPages }),
  setDualPageMode: (dualPageMode) => set({ dualPageMode }),

  setBionicReadingEnabled: (bionicReadingEnabled) => set({ bionicReadingEnabled }),
  setBionicFixation: (bionicFixation) => set({ bionicFixation }),

  toggleAutoScroll: () => set((state) => ({ isAutoScrolling: !state.isAutoScrolling })),
  setAutoScrolling: (isAutoScrolling) => set({ isAutoScrolling }),
  setAutoScrollSpeed: (autoScrollSpeed) => set({ autoScrollSpeed: Math.max(10, Math.min(200, autoScrollSpeed)) }),
  setAutoScrollMode: (autoScrollMode) => set({ autoScrollMode }),
  setPageTimerInterval: (pageTimerIntervalSeconds) =>
    set({ pageTimerIntervalSeconds: Math.max(5, Math.min(120, pageTimerIntervalSeconds)) }),

  setShowSpeedometer: (showSpeedometer) => set({ showSpeedometer }),

  setReadingRulerEnabled: (readingRulerEnabled) => set({ readingRulerEnabled }),
  setReadingRulerMode: (readingRulerMode) => set({ readingRulerMode }),
  setReadingRulerHeight: (readingRulerHeight) => set({ readingRulerHeight: Math.max(16, Math.min(120, readingRulerHeight)) }),
  setReadingRulerOpacity: (readingRulerOpacity) => set({ readingRulerOpacity: Math.max(0.1, Math.min(0.95, readingRulerOpacity)) }),
}));
