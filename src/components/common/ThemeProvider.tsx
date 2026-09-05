import React, { createContext, useContext, useEffect, useState } from 'react';
import { useColorScheme, View, StyleSheet } from 'react-native';
import { ThemeMode, CircadianConfig } from '../../types';
import { ThemeColors, getResolvedThemeColors, getWarmthOverlayColor } from '../../utils/theme';
import { getUserSettings, updateUserSettings } from '../../db/queries/settings';
import { useReaderStore } from '../../store/readerStore';
import { CircadianService, DEFAULT_CIRCADIAN_CONFIG } from '../../services/theme/circadianService';

interface ThemeContextValue {
  themeMode: ThemeMode;
  colors: ThemeColors;
  warmthLevel: number;
  effectiveWarmth: number;
  circadianConfig: CircadianConfig;
  setThemeMode: (mode: ThemeMode) => void;
  setWarmthLevel: (level: number) => void;
  setCircadianConfig: (config: CircadianConfig) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const systemScheme = useColorScheme();
  const systemIsDark = systemScheme === 'dark';

  const [themeMode, setThemeModeState] = useState<ThemeMode>('light');
  const [warmthLevel, setWarmthLevelState] = useState<number>(0.0);
  const [circadianConfig, setCircadianConfigState] = useState<CircadianConfig>(DEFAULT_CIRCADIAN_CONFIG);
  const [circadianWarmth, setCircadianWarmth] = useState<number>(0.0);

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

  // Periodic recalculation of circadian warmth
  useEffect(() => {
    const update = () => {
      const calculated = CircadianService.evaluateWarmth(circadianConfig);
      setCircadianWarmth(calculated);
    };

    update();
    const interval = setInterval(update, 60000); // Re-evaluate every 60s
    return () => clearInterval(interval);
  }, [circadianConfig]);

  const setThemeMode = React.useCallback((mode: ThemeMode) => {
    setThemeModeState(mode);
    useReaderStore.getState().setActiveTheme(mode);
    updateUserSettings({ activeTheme: mode });
  }, []);

  const setWarmthLevel = React.useCallback((level: number) => {
    const clamped = Math.max(0, Math.min(1, level));
    setWarmthLevelState(clamped);
    useReaderStore.getState().setWarmthLevel(clamped);
    updateUserSettings({ warmthLevel: clamped });
  }, []);

  const setCircadianConfig = React.useCallback((config: CircadianConfig) => {
    setCircadianConfigState(config);
    const calculated = CircadianService.evaluateWarmth(config);
    setCircadianWarmth(calculated);
  }, []);

  const colors = React.useMemo(() => {
    return getResolvedThemeColors(themeMode, systemIsDark);
  }, [themeMode, systemIsDark]);

  // Effective warmth is maximum of manual warmth level and automated circadian warmth
  const effectiveWarmth = React.useMemo(() => {
    return Math.max(warmthLevel, circadianWarmth);
  }, [warmthLevel, circadianWarmth]);

  const warmthColor = React.useMemo(() => {
    return getWarmthOverlayColor(effectiveWarmth);
  }, [effectiveWarmth]);

  const contextValue = React.useMemo<ThemeContextValue>(() => ({
    themeMode,
    colors,
    warmthLevel,
    effectiveWarmth,
    circadianConfig,
    setThemeMode,
    setWarmthLevel,
    setCircadianConfig,
  }), [themeMode, colors, warmthLevel, effectiveWarmth, circadianConfig, setThemeMode, setWarmthLevel, setCircadianConfig]);

  return (
    <ThemeContext.Provider value={contextValue}>
      <View style={[styles.root, { backgroundColor: colors.canvas }] as any}>
        {children}
        {effectiveWarmth > 0.01 && (
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
