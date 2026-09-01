export type ThemeMode = 'light' | 'sepia' | 'dark' | 'oled' | 'system';
export type TextAlign = 'left' | 'justify';
export type ReadingDirection = 'horizontal' | 'vertical';
export type PageTurnStyle = 'slide' | 'curl' | 'fade' | 'none';
export type NavigationMode = 'tap' | 'swipe' | 'buttons' | 'both';

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
  keepAwake: boolean;
  hapticFeedback: boolean;
  ttsVoice?: string | null;
  ttsRate: number;
  ttsPitch?: number;
  onlineMetadataEnabled?: boolean;
  openLibraryMetadataSearch?: boolean;
}
