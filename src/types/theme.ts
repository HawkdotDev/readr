export type ThemeMode =
  | 'light'
  | 'sepia'
  | 'dark'
  | 'oled'
  | 'system'
  | 'forest'
  | 'slate'
  | 'solarizedDark'
  | 'solarizedLight'
  | 'rosePine'
  | 'nord'
  | 'parchment'
  | 'amberGlow';

export type TextAlign = 'left' | 'justify';
export type HeadingAlign = 'left' | 'center' | 'right';
export type ReadingDirection = 'horizontal' | 'vertical';
export type PageTurnStyle = 'slide' | 'curl' | 'fade' | 'none';
export type PageTransitionMode = 'curl' | 'slide' | 'cover' | 'fade' | 'scroll' | 'none';
export type AutoScrollMode = 'smooth' | 'line' | 'pageTimer' | 'pixel' | 'wave';
export type BionicFixation = 'low' | 'medium' | 'high';
export type NavigationMode = 'tap' | 'swipe' | 'buttons' | 'both';
export type ReadingRulerMode = 'underline' | 'highlight' | 'dimBackground' | 'dualGuide' | 'focusBox' | 'laser';
export type PaperTexture = 'clean' | 'parchment' | 'grain' | 'linen';

export interface ThemeColors {
  canvas: string;
  surface: string;
  border: string;
  textPrimary: string;
  textSecondary: string;
  accent: string;
  isDark: boolean;
}

export interface UserSettings {
  id: string;
  activeTheme: ThemeMode;
  warmthLevel: number; // 0.0 to 1.0
  fontFamily: string;
  fontSize: number; // pt
  lineHeight: number; // multiplier
  marginHorizontal: number; // dp
  textAlign: TextAlign;
  chapterHeadingAlign?: HeadingAlign;
  keepAwake: boolean;
  hapticFeedback: boolean;
  ttsVoice?: string | null;
  ttsRate: number;
  ttsPitch?: number;
  onlineMetadataEnabled?: boolean;
  openLibraryMetadataSearch?: boolean;
}

export interface CircadianConfig {
  enabled: boolean;
  mode: 'solar' | 'schedule';
  startHour: number; // 0-23, default 21 (9 PM)
  endHour: number;   // 0-23, default 7 (7 AM)
  targetWarmth: number; // 0.0 - 1.0, default 0.65
}

