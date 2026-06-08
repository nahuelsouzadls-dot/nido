import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LightColors, DarkColors, type ColorPalette } from '@/constants/theme';

export type ThemeMode = 'claro' | 'nocturno';

type ThemeContextValue = {
  themeMode: ThemeMode;
  colors: ColorPalette;
  isDark: boolean;
  setThemeMode: (mode: ThemeMode) => void;
};

const ThemeContext = createContext<ThemeContextValue>({
  themeMode: 'claro',
  colors: LightColors,
  isDark: false,
  setThemeMode: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [themeMode, setThemeModeState] = useState<ThemeMode>('claro');

  useEffect(() => {
    AsyncStorage.getItem('nido_theme').then((val) => {
      if (val === 'nocturno') setThemeModeState('nocturno');
    });
  }, []);

  const setThemeMode = (mode: ThemeMode) => {
    setThemeModeState(mode);
    AsyncStorage.setItem('nido_theme', mode);
  };

  const isDark = themeMode === 'nocturno';

  const colors = useMemo<ColorPalette>(
    () => (isDark ? DarkColors : LightColors),
    [isDark],
  );

  return (
    <ThemeContext.Provider value={{ themeMode, colors, isDark, setThemeMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}

export function useColors() {
  return useContext(ThemeContext).colors;
}
