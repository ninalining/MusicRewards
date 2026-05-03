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

export const migrateUserStore = (persistedState: unknown, version: number): UserState => {
  const state = persistedState as Partial<UserState>;
  if (version === 0) {
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
      totalPoints: 0,
      completedChallenges: [],

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

export const selectTotalPoints = (state: UserState) => state.totalPoints;
export const selectCompletedChallenges = (state: UserState) => state.completedChallenges;
