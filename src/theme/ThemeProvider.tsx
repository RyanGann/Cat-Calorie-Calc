import React, { createContext, useContext, useMemo } from 'react';
import { useColorScheme } from 'react-native';
import { lightColors, darkColors, type ColorScheme } from './colors';
import { useSettingsStore } from '@/state/settings';

type ThemeMode = 'light' | 'dark';

type ThemeContextValue = {
  mode: ThemeMode;
  colors: ColorScheme;
};

const ThemeContext = createContext<ThemeContextValue>({
  mode: 'light',
  colors: lightColors,
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useColorScheme();
  const themePref = useSettingsStore((s) => s.theme);

  const mode: ThemeMode = useMemo(() => {
    if (themePref === 'system') return systemScheme === 'dark' ? 'dark' : 'light';
    return themePref === 'dark' ? 'dark' : 'light';
  }, [themePref, systemScheme]);

  const value = useMemo<ThemeContextValue>(
    () => ({
      mode,
      colors: mode === 'dark' ? darkColors : lightColors,
    }),
    [mode],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  return useContext(ThemeContext);
}
