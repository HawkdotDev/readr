import { ThemeMode } from '../types';

export interface ThemeColors {
  canvas: string;
  surface: string;
  border: string;
  textPrimary: string;
  textSecondary: string;
  accent: string;
  isDark: boolean;
}

export const THEME_PALETTES: Record<'light' | 'sepia' | 'dark' | 'oled', ThemeColors> = {
  light: {
    canvas: '#FFFFFF',
    surface: '#F4F4F5',
    border: '#E4E4E7',
    textPrimary: '#18181B',
    textSecondary: '#71717A',
    accent: '#18181B',
    isDark: false,
  },
  sepia: {
    canvas: '#F5F5F0',
    surface: '#ECECE6',
    border: '#DDDDD5',
    textPrimary: '#262624',
    textSecondary: '#73736E',
    accent: '#262624',
    isDark: false,
  },
  dark: {
    canvas: '#18181B',
    surface: '#27272A',
    border: '#3F3F46',
    textPrimary: '#FAFAFA',
    textSecondary: '#A1A1AA',
    accent: '#FAFAFA',
    isDark: true,
  },
  oled: {
    canvas: '#000000',
    surface: '#121212',
    border: '#27272A',
    textPrimary: '#F4F4F5',
    textSecondary: '#71717A',
    accent: '#FFFFFF',
    isDark: true,
  },
};

export function getResolvedThemeColors(theme: ThemeMode, systemIsDark: boolean): ThemeColors {
  if (theme === 'system') {
    return systemIsDark ? THEME_PALETTES.dark : THEME_PALETTES.light;
  }
  return THEME_PALETTES[theme] || THEME_PALETTES.light;
}

export function getWarmthOverlayColor(warmthLevel: number): string {
  if (warmthLevel <= 0.01) return 'transparent';
  // Monochromatic warm tint overlay
  const alpha = Math.min(0.3, warmthLevel * 0.3);
  return `rgba(180, 160, 140, ${alpha.toFixed(2)})`;
}
