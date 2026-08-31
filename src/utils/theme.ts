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
    canvas: '#FAF7F2',
    surface: '#F1EFEA',
    border: '#E3DFD5',
    textPrimary: '#1A1918',
    textSecondary: '#7A766D',
    accent: '#1A1918',
    isDark: false,
  },
  sepia: {
    canvas: '#F4EFE6',
    surface: '#FAF6EE',
    border: '#DFD8CA',
    textPrimary: '#262421',
    textSecondary: '#7A756D',
    accent: '#262421',
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
