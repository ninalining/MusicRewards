// Hook that resolves the active theme palette from store preference + system setting
import { useContext, createContext } from 'react';
import type { ThemeContextValue } from '../types/theme';

/**
 * ThemeContext — created here, provided by ThemeProvider.
 * Default value is undefined; consumers must be inside a ThemeProvider.
 */
export const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

/**
 * useTheme — access the resolved color palette and theme controls.
 * Must be called within a ThemeProvider.
 */
export const useTheme = (): ThemeContextValue => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
