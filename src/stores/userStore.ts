// Zustand store for user data and points
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

type UserState = {
  totalPoints: number;
  completedChallenges: string[];
};

type UserStore = UserState & {
  addPoints: (points: number) => void;
  completeChallenge: (challengeId: string) => void;
  resetProgress: () => void;
};

/** Exported for testing — handles store schema migrations. */
export const migrateUserStore = (persistedState: unknown, version: number): UserState => {
  const state = persistedState as Partial<UserState>;
  if (version === 0) {
    // v0 → v1: ensure required fields exist with defaults
    return {
      totalPoints: state.totalPoints ?? 0,
      completedChallenges: state.completedChallenges ?? [],
    };
  }
  return state as UserState;
};

export const useUserStore = create<UserStore>()(
  persist(
    (set, get) => ({
      // Initial state
      totalPoints: 0,
      completedChallenges: [],

      // Actions
      addPoints: (points: number) => {
        set((state) => ({
          totalPoints: state.totalPoints + points,
        }));
      },

      completeChallenge: (challengeId: string) => {
        set((state) => ({
          completedChallenges: state.completedChallenges.includes(challengeId)
            ? state.completedChallenges
            : [...state.completedChallenges, challengeId],
        }));
      },

      resetProgress: () => {
        set({
          totalPoints: 0,
          completedChallenges: [],
        });
      },
    }),
    {
      name: 'user-store',
      version: 1,
      storage: createJSONStorage(() => AsyncStorage),
      migrate: migrateUserStore,
    },
  ),
);

// Selector functions
export const selectTotalPoints = (state: UserState) => state.totalPoints;
export const selectCompletedChallenges = (state: UserState) => state.completedChallenges;
