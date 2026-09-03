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

export const THEME_PALETTES: Record<
  | 'light'
  | 'sepia'
  | 'dark'
  | 'oled'
  | 'forest'
  | 'slate'
  | 'solarizedDark'
  | 'solarizedLight'
  | 'rosePine'
  | 'nord'
  | 'parchment'
  | 'amberGlow',
  ThemeColors
> = {
  light: {
    canvas: '#FAF7F2',
    surface: '#F1EFEA',
    border: '#E3DFD5',
    textPrimary: '#1A1918',
    textSecondary: '#7A766D',
    accent: '#C2410C', // Warm Editorial Terracotta
    isDark: false,
  },
  sepia: {
    canvas: '#F4EFE6',
    surface: '#FAF6EE',
    border: '#DFD8CA',
    textPrimary: '#262421',
    textSecondary: '#7A756D',
    accent: '#262421', // Charcoal Black
    isDark: false,
  },
  dark: {
    canvas: '#18181B',
    surface: '#27272A',
    border: '#3F3F46',
    textPrimary: '#FAFAFA',
    textSecondary: '#A1A1AA',
    accent: '#FB923C', // Soft Amber Flame
    isDark: true,
  },
  oled: {
    canvas: '#000000',
    surface: '#121212',
    border: '#27272A',
    textPrimary: '#F4F4F5',
    textSecondary: '#71717A',
    accent: '#F97316', // High-Contrast Radiant Amber
    isDark: true,
  },
  forest: {
    canvas: '#121E17',
    surface: '#1B2C22',
    border: '#283E31',
    textPrimary: '#E2E8F0',
    textSecondary: '#8CA395',
    accent: '#10B981',
    isDark: true,
  },
  slate: {
    canvas: '#0F172A',
    surface: '#1E293B',
    border: '#334155',
    textPrimary: '#F8FAFC',
    textSecondary: '#94A3B8',
    accent: '#38BDF8',
    isDark: true,
  },
  solarizedDark: {
    canvas: '#002B36',
    surface: '#073642',
    border: '#0C4A5A',
    textPrimary: '#93A1A1',
    textSecondary: '#657B83',
    accent: '#268BD2',
    isDark: true,
  },
  solarizedLight: {
    canvas: '#FDF6E3',
    surface: '#EEE8D5',
    border: '#DFD5BE',
    textPrimary: '#586E75',
    textSecondary: '#839496',
    accent: '#268BD2',
    isDark: false,
  },
  rosePine: {
    canvas: '#191724',
    surface: '#26233A',
    border: '#393552',
    textPrimary: '#E0DEF4',
    textSecondary: '#908CAA',
    accent: '#EBBCBA',
    isDark: true,
  },
  nord: {
    canvas: '#2E3440',
    surface: '#3B4252',
    border: '#4C566A',
    textPrimary: '#ECEFF4',
    textSecondary: '#D8DEE9',
    accent: '#88C0D0',
    isDark: true,
  },
  parchment: {
    canvas: '#F5ECD7',
    surface: '#EAE0C8',
    border: '#D8CBB0',
    textPrimary: '#382E1E',
    textSecondary: '#7C6C53',
    accent: '#B45309',
    isDark: false,
  },
  amberGlow: {
    canvas: '#1A120B',
    surface: '#281C12',
    border: '#3D2A1C',
    textPrimary: '#FDE68A',
    textSecondary: '#D97706',
    accent: '#F59E0B',
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
  // Amber blue-light filter spectrum (up to 95% opacity scale max 0.45 alpha for readability)
  const alpha = Math.min(0.45, (warmthLevel * 0.95) * 0.45);
  return `rgba(230, 138, 34, ${alpha.toFixed(3)})`;
}
