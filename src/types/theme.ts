/** The user's stored preference — persisted locally. */
export type ThemePreference = 'dark' | 'light' | 'system';

/** The resolved binary theme after combining preference + system setting. */
export type ResolvedTheme = 'dark' | 'light';

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

export type ThemeState = {
  preference: ThemePreference;
};

export type ThemeStore = ThemeState & {
  setPreference: (preference: ThemePreference) => void;
};

export interface ThemeContextValue {
  colors: ColorPalette;
  resolvedTheme: ResolvedTheme;
  preference: ThemePreference;
  setPreference: (preference: ThemePreference) => void;
}
