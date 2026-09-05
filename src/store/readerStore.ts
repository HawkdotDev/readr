import { create } from 'zustand';
import {
  Book,
  Bookmark,
  Highlight,
  TOCEntry,
  ThemeMode,
  TextAlign,
  HeadingAlign,
  ReadingDirection,
  PageTurnStyle,
  PageTransitionMode,
  AutoScrollMode,
  BionicFixation,
  NavigationMode,
  ReadingRulerMode,
  PaperTexture,
  NameReplacementRule,
} from '../types';
import {
  TouchZone,
  TouchAction,
  TouchZoneConfig,
  DEFAULT_TOUCH_ZONE_CONFIG,
} from '../services/reader/touchZoneService';

export type ActiveSheet =
  | 'none'
  | 'toc'
  | 'typography'
  | 'theme'
  | 'tts'
  | 'annotations'
  | 'dictionary'
  | 'search'
  | 'nameReplacement'
  | 'ambientAudio'
  | 'rsvp';


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
  chapterHeadingAlign: HeadingAlign;
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
  invertVolumeKeys: boolean;
  dualPageMode: boolean | 'auto';
  readingEngine: 'modern' | 'native';

  // 9-Zone Touch Grid & Gestures
  touchZoneMappings: TouchZoneConfig;
  edgeBrightnessEnabled: boolean;
  brightness: number; // 0.0 to 1.0

  // Sensors & Gestures
  shakeToSpeechEnabled: boolean;
  tiltToTurnEnabled: boolean;
  tiltSensitivity: number; // 15 to 45 deg

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

  // Name Replacement & Role Reversal Rules
  nameReplacements: NameReplacementRule[];

  // Actions
  setCurrentBook: (book: Book | null) => void;
  setCurrentChapter: (index: number, title: string) => void;
  setLocation: (location: string, progress: number, minutesLeft?: number) => void;
  toggleFocusMode: () => void;
  setFocusMode: (focus: boolean) => void;
  setActiveSheet: (sheet: ActiveSheet) => void;
  openDictionary: (word: string) => void;
  closeSheet: () => void;

  setNameReplacements: (rules: NameReplacementRule[]) => void;
  addNameReplacement: (rule: NameReplacementRule) => void;
  updateNameReplacement: (id: string, updates: Partial<NameReplacementRule>) => void;
  removeNameReplacement: (id: string) => void;
  toggleNameReplacement: (id: string) => void;

  setFontFamily: (font: string) => void;

  setFontSize: (size: number) => void;
  setLineHeight: (height: number) => void;
  setMarginHorizontal: (margin: number) => void;
  setTextAlign: (align: TextAlign) => void;
  setChapterHeadingAlign: (align: HeadingAlign) => void;
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
  setInvertVolumeKeys: (invert: boolean) => void;
  setDualPageMode: (mode: boolean | 'auto') => void;
  setReadingEngine: (engine: 'modern' | 'native') => void;

  setTouchZoneMappings: (config: TouchZoneConfig) => void;
  updateTouchZoneAction: (zone: TouchZone, action: TouchAction) => void;
  setEdgeBrightnessEnabled: (enabled: boolean) => void;
  setBrightness: (val: number) => void;

  setShakeToSpeechEnabled: (enabled: boolean) => void;
  setTiltToTurnEnabled: (enabled: boolean) => void;
  setTiltSensitivity: (sens: number) => void;

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
  chapterHeadingAlign: 'left',
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
  invertVolumeKeys: false,
  dualPageMode: 'auto',
  readingEngine: 'modern',

  touchZoneMappings: DEFAULT_TOUCH_ZONE_CONFIG,
  edgeBrightnessEnabled: true,
  brightness: 0.8,

  shakeToSpeechEnabled: false,
  tiltToTurnEnabled: false,
  tiltSensitivity: 25,

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

  nameReplacements: [],

  setCurrentBook: (book) =>
    set({
      currentBook: book,
      progressPercentage: book ? book.progressPercentage : 0,
      currentLocation: book?.lastReadLocation || '',
      currentChapterIndex: 0,
      isFocusMode: false,
      activeSheet: 'none',
      isAutoScrolling: false,
      nameReplacements: [],
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

  setNameReplacements: (rules) => set({ nameReplacements: rules }),
  addNameReplacement: (rule) =>
    set((state) => ({
      nameReplacements: [...state.nameReplacements.filter((r) => r.id !== rule.id), rule],
    })),
  updateNameReplacement: (id, updates) =>
    set((state) => ({
      nameReplacements: state.nameReplacements.map((r) => (r.id === id ? { ...r, ...updates } : r)),
    })),
  removeNameReplacement: (id) =>
    set((state) => ({
      nameReplacements: state.nameReplacements.filter((r) => r.id !== id),
    })),
  toggleNameReplacement: (id) =>
    set((state) => ({
      nameReplacements: state.nameReplacements.map((r) =>
        r.id === id ? { ...r, isActive: !r.isActive } : r
      ),
    })),


  setFontFamily: (fontFamily) => set({ fontFamily }),
  setFontSize: (fontSize) => set({ fontSize: Math.max(12, Math.min(36, fontSize)) }),
  setLineHeight: (lineHeight) => set({ lineHeight: Math.max(1.1, Math.min(2.5, lineHeight)) }),
  setMarginHorizontal: (marginHorizontal) => set({ marginHorizontal: Math.max(8, Math.min(48, marginHorizontal)) }),
  setTextAlign: (textAlign) => set({ textAlign }),
  setChapterHeadingAlign: (chapterHeadingAlign) => set({ chapterHeadingAlign }),
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
  setInvertVolumeKeys: (invertVolumeKeys) => set({ invertVolumeKeys }),
  setDualPageMode: (dualPageMode) => set({ dualPageMode }),
  setReadingEngine: (readingEngine) => set({ readingEngine }),

  setTouchZoneMappings: (touchZoneMappings) => set({ touchZoneMappings }),
  updateTouchZoneAction: (zone, action) =>
    set((state) => ({
      touchZoneMappings: {
        ...state.touchZoneMappings,
        [zone]: action,
      },
    })),
  setEdgeBrightnessEnabled: (edgeBrightnessEnabled) => set({ edgeBrightnessEnabled }),
  setBrightness: (brightness) => set({ brightness: Math.max(0.05, Math.min(1.0, brightness)) }),

  setShakeToSpeechEnabled: (shakeToSpeechEnabled) => set({ shakeToSpeechEnabled }),
  setTiltToTurnEnabled: (tiltToTurnEnabled) => set({ tiltToTurnEnabled }),
  setTiltSensitivity: (tiltSensitivity) =>
    set({ tiltSensitivity: Math.max(15, Math.min(50, tiltSensitivity)) }),

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
