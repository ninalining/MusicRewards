// Zustand store for theme preference
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { ThemePreference, ThemeState, ThemeStore } from '../types/theme';

/** Exported for testing — handles store schema migrations. */
export const migrateThemeStore = (persistedState: unknown, version: number): ThemeState => {
  const state: Partial<ThemeState> =
    typeof persistedState === 'object' && persistedState !== null
      ? (persistedState as Partial<ThemeState>)
      : {};
  if (version === 0) {
    // v0 → v1: ensure preference exists with default
    return {
      preference: state.preference ?? 'system',
    };
  }
  return state as ThemeState;
};

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set) => ({
      preference: 'system' as ThemePreference,

      setPreference: (preference: ThemePreference): void => {
        set({ preference });
      },
    }),
    {
      name: 'theme-storage',
      storage: createJSONStorage(() => AsyncStorage),
      version: 1,
      migrate: migrateThemeStore,
    },
  ),
);

// Selectors
export const selectThemePreference = (state: ThemeStore): ThemePreference => state.preference;
