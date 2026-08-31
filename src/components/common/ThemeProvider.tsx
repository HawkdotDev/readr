import React, { createContext, useContext, useEffect, useState } from 'react';
import { useColorScheme, View, StyleSheet } from 'react-native';
import { ThemeMode } from '../../types';
import { ThemeColors, getResolvedThemeColors, getWarmthOverlayColor } from '../../utils/theme';
import { getUserSettings, updateUserSettings } from '../../db/queries/settings';
import { useReaderStore } from '../../store/readerStore';

interface ThemeContextValue {
  themeMode: ThemeMode;
  colors: ThemeColors;
  warmthLevel: number;
  setThemeMode: (mode: ThemeMode) => void;
  setWarmthLevel: (level: number) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const systemScheme = useColorScheme();
  const systemIsDark = systemScheme === 'dark';

  const [themeMode, setThemeModeState] = useState<ThemeMode>('light');
  const [warmthLevel, setWarmthLevelState] = useState<number>(0.0);

  const readerStoreTheme = useReaderStore((s) => s.activeTheme);
  const readerStoreWarmth = useReaderStore((s) => s.warmthLevel);

  useEffect(() => {
    // Load persisted settings on mount
    getUserSettings().then((settings) => {
      setThemeModeState(settings.activeTheme);
      setWarmthLevelState(settings.warmthLevel);
      useReaderStore.getState().setActiveTheme(settings.activeTheme);
      useReaderStore.getState().setWarmthLevel(settings.warmthLevel);
    });
  }, []);

  // Sync when readerStore changes
  useEffect(() => {
    if (readerStoreTheme) {
      setThemeModeState(readerStoreTheme);
    }
  }, [readerStoreTheme]);

  useEffect(() => {
    setWarmthLevelState(readerStoreWarmth);
  }, [readerStoreWarmth]);

  const setThemeMode = (mode: ThemeMode) => {
    setThemeModeState(mode);
    useReaderStore.getState().setActiveTheme(mode);
    updateUserSettings({ activeTheme: mode });
  };

  const setWarmthLevel = (level: number) => {
    const clamped = Math.max(0, Math.min(1, level));
    setWarmthLevelState(clamped);
    useReaderStore.getState().setWarmthLevel(clamped);
    updateUserSettings({ warmthLevel: clamped });
  };

  const colors = getResolvedThemeColors(themeMode, systemIsDark);
  const warmthColor = getWarmthOverlayColor(warmthLevel);

  return (
    <ThemeContext.Provider value={{ themeMode, colors, warmthLevel, setThemeMode, setWarmthLevel }}>
      <View style={[styles.root, { backgroundColor: colors.canvas }] as any}>
        {children}
        {warmthLevel > 0.01 && (
          <View
            pointerEvents="none"
            style={[
              StyleSheet.absoluteFill,
              {
                backgroundColor: warmthColor,
                zIndex: 999999,
              },
            ] as any}
          />
        )}
      </View>
    </ThemeContext.Provider>
  );
};

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});
