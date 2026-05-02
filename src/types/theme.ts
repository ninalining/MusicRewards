// Theme-related type definitions

/** The user's stored preference — persisted locally. */
export type ThemePreference = 'dark' | 'light' | 'system';

/** The resolved binary theme after combining preference + system setting. */
export type ResolvedTheme = 'dark' | 'light';

/** Complete set of semantic color tokens for one theme mode. */
export interface ColorPalette {
  // Surfaces
  surfacePrimary: string;
  surfaceSecondary: string;
  surfaceGlass: string;
  surfaceGlassStrong: string;

  // Text
  textPrimary: string;
  textSecondary: string;
  textTertiary: string;

  // Brand (constant across themes)
  brandPrimary: string;
  brandSecondary: string;
  brandAccent: string;

  /** High-contrast text used on brand-colored backgrounds (badges, etc.). */
  textOnBrand: string;

  // Semantic
  border: string;
  error: string;

  // Glass gradients
  glassPrimary: readonly [string, string];
  glassSecondary: readonly [string, string];
  glassCard: readonly [string, string];
}

/** Zustand state shape (persisted). */
export type ThemeState = {
  preference: ThemePreference;
};

/** Zustand store shape (state + actions). */
export type ThemeStore = ThemeState & {
  setPreference: (preference: ThemePreference) => void;
};

/** Value distributed via React Context. */
export interface ThemeContextValue {
  colors: ColorPalette;
  resolvedTheme: ResolvedTheme;
  preference: ThemePreference;
  setPreference: (preference: ThemePreference) => void;
}
