import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MusicChallenge } from '../types';
import { SAMPLE_CHALLENGES } from '../constants/theme';

type MusicState = {
  challenges: MusicChallenge[];
  currentTrack: MusicChallenge | null;
  isPlaying: boolean;
  currentPosition: number;
};

type PersistedMusicState = Pick<MusicState, 'challenges'>;

/** Current schema version for the music store. */
const MUSIC_STORE_VERSION = 1;

export const migrateMusicStore = (
  persistedState: unknown,
  version: number,
): PersistedMusicState => {
  if (persistedState == null || typeof persistedState !== 'object') {
    return { challenges: SAMPLE_CHALLENGES };
  }

  const state = persistedState as Partial<PersistedMusicState>;

  if (version === 0) {
    return { challenges: state.challenges ?? SAMPLE_CHALLENGES };
  }

  if (version > MUSIC_STORE_VERSION) {
    return { challenges: SAMPLE_CHALLENGES };
  }

  return state as PersistedMusicState;
};

type MusicStore = MusicState & {
  loadChallenges: () => void;
  setCurrentTrack: (track: MusicChallenge) => void;
  updateProgress: (challengeId: string, progress: number) => void;
  markChallengeComplete: (challengeId: string) => void;
  setIsPlaying: (playing: boolean) => void;
  setCurrentPosition: (position: number) => void;
};

export const useMusicStore = create<MusicStore>()(
  persist(
    (set, get) => ({
      challenges: SAMPLE_CHALLENGES,
      currentTrack: null,
      isPlaying: false,
      currentPosition: 0,

      loadChallenges: () => {
        set({ challenges: SAMPLE_CHALLENGES });
      },

      setCurrentTrack: (track: MusicChallenge) => {
        set({ currentTrack: track });
      },

      updateProgress: (challengeId: string, progress: number) => {
        set((state) => ({
          challenges: state.challenges.map((challenge) =>
            challenge.id === challengeId
              ? { ...challenge, progress: Math.min(progress, 100) }
              : challenge,
          ),
        }));
      },

      markChallengeComplete: (challengeId: string) => {
        set((state) => ({
          challenges: state.challenges.map((challenge) =>
            challenge.id === challengeId
              ? {
                  ...challenge,
                  completed: true,
                  progress: 100,
                  completedAt: new Date().toISOString(),
                }
              : challenge,
          ),
        }));
      },

      setIsPlaying: (playing: boolean) => {
        set({ isPlaying: playing });
      },

      setCurrentPosition: (position: number) => {
        set({ currentPosition: position });
      },
    }),
    {
      name: 'music-store',
      version: 1,
      storage: createJSONStorage(() => AsyncStorage),
      // Only persist challenges, not transient playback state.
      partialize: (state) => ({
        challenges: state.challenges,
      }),
      migrate: migrateMusicStore,
    },
  ),
);

export const selectCurrentTrack = (state: MusicStore) => state.currentTrack;
export const selectIsPlaying = (state: MusicStore) => state.isPlaying;
export const selectChallenges = (state: MusicStore) => state.challenges;
export const selectTotalAvailablePoints = (state: MusicStore): number =>
  state.challenges.reduce((sum, c) => sum + c.points, 0);
