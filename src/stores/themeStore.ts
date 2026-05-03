import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { ThemePreference, ThemeState, ThemeStore } from '../types/theme';

/** Exported for testing. */
export const migrateThemeStore = (persistedState: unknown, version: number): ThemeState => {
  const state: Partial<ThemeState> =
    typeof persistedState === 'object' && persistedState !== null
      ? (persistedState as Partial<ThemeState>)
      : {};
  if (version === 0) {
    return {
      preference: state.preference ?? 'system',
    };
  }
  return {
    preference: state.preference ?? 'system',
  };
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

export const selectThemePreference = (state: ThemeStore): ThemePreference => state.preference;
