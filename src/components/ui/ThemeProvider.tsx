import React, { useMemo } from 'react';
import { useColorScheme } from 'react-native';
import { ThemeContext } from '../../hooks/useTheme';
import { useThemeStore, selectThemePreference } from '../../stores/themeStore';
import { darkPalette, lightPalette } from '../../constants/theme';
import type { ColorPalette, ResolvedTheme, ThemeContextValue } from '../../types/theme';

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const preference = useThemeStore(selectThemePreference);
  const setPreference = useThemeStore((s) => s.setPreference);
  const systemScheme = useColorScheme();

  const resolvedTheme: ResolvedTheme =
    preference === 'system' ? (systemScheme === 'light' ? 'light' : 'dark') : preference;

  const colors: ColorPalette = resolvedTheme === 'dark' ? darkPalette : lightPalette;

  const value: ThemeContextValue = useMemo(
    () => ({
      colors,
      resolvedTheme,
      preference,
      setPreference,
    }),
    [colors, resolvedTheme, preference, setPreference],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};
