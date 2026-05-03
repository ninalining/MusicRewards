import { useCallback, useEffect, useRef, useState } from 'react';
import TrackPlayer, {
  State,
  usePlaybackState,
  useProgress,
  Event,
  useTrackPlayerEvents,
} from 'react-native-track-player';
import { setupTrackPlayer } from '../services/audioService';
import { useMusicStore, selectCurrentTrack, selectIsPlaying } from '../stores/musicStore';
import { useUserStore } from '../stores/userStore';
import { hapticSuccess } from '../utils/haptics';
import type { MusicChallenge, UseMusicPlayerReturn } from '../types';

export const useMusicPlayer = (): UseMusicPlayerReturn => {
  const playbackState = usePlaybackState();
  const progress = useProgress(250);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [playbackRate, setPlaybackRateState] = useState(1);

  const completedInSession = useRef<Set<string>>(new Set());

  const currentTrack = useMusicStore(selectCurrentTrack);
  const isPlaying = useMusicStore(selectIsPlaying);
  const setCurrentTrack = useMusicStore((state) => state.setCurrentTrack);
  const setIsPlaying = useMusicStore((state) => state.setIsPlaying);
  const setCurrentPosition = useMusicStore((state) => state.setCurrentPosition);
  const updateProgress = useMusicStore((state) => state.updateProgress);
  const markChallengeComplete = useMusicStore((state) => state.markChallengeComplete);
  const completeChallenge = useUserStore((state) => state.completeChallenge);

  useEffect(() => {
    const state =
      typeof playbackState === 'object' && playbackState !== null && 'state' in playbackState
        ? playbackState.state
        : playbackState;
    const isCurrentlyPlaying = state === State.Playing;
    // Read store directly to avoid including isPlaying in deps (write→re-render loop).
    if (isCurrentlyPlaying !== useMusicStore.getState().isPlaying) {
      setIsPlaying(isCurrentlyPlaying);
    }
  }, [playbackState, setIsPlaying]);

  const trackId = currentTrack?.id;

  useEffect(() => {
    if (
      trackId &&
      progress.position > 0 &&
      Number.isFinite(progress.duration) &&
      progress.duration > 0
    ) {
      setCurrentPosition(progress.position);

      const progressPercentage = Math.min((progress.position / progress.duration) * 100, 100);
      updateProgress(trackId, progressPercentage);

      // Mark complete at 90%. Points are NOT awarded here — usePointsCounter
      // accumulates them proportionally. useRef guard prevents duplicates.
      if (progressPercentage >= 90 && !completedInSession.current.has(trackId)) {
        completedInSession.current.add(trackId);
        markChallengeComplete(trackId);
        completeChallenge(trackId);
        hapticSuccess();
      }
    }
  }, [
    progress.position,
    progress.duration,
    trackId,
    setCurrentPosition,
    updateProgress,
    markChallengeComplete,
    completeChallenge,
  ]);

  useTrackPlayerEvents([Event.PlaybackError], (event) => {
    if (event.type === Event.PlaybackError) {
      setError(`Playback error: ${event.message}`);
      setLoading(false);
    }
  });

  // TrackPlayer.reset() is NOT called on unmount. This hook is shared by
  // HomeScreen + PlayerModal — unmounting one must not destroy the other's state.

  const play = useCallback(
    async (track: MusicChallenge) => {
      completedInSession.current.delete(track.id);
      try {
        setLoading(true);
        setError(null);

        await setupTrackPlayer();

        await TrackPlayer.reset();
        await TrackPlayer.add({
          id: track.id,
          url: track.audioUrl,
          title: track.title,
          artist: track.artist,
          duration: track.duration,
        });

        // Restore saved progress so the user resumes where they left off.
        // Skip if < 1% (rounding noise) or ≥ 90% (completed — replay from start).
        const savedProgress = track.progress ?? 0;
        if (savedProgress > 1 && savedProgress < 90 && track.duration > 0) {
          await TrackPlayer.seekTo((savedProgress / 100) * track.duration);
        }

        await TrackPlayer.play();
        setCurrentTrack(track);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Playback failed';
        setError(errorMessage);
        if (__DEV__) console.error('TrackPlayer error:', err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [setCurrentTrack],
  );

  const pause = useCallback(async () => {
    try {
      await TrackPlayer.pause();
    } catch (err) {
      if (__DEV__) console.error('Pause error:', err);
    }
  }, []);

  const seekTo = useCallback(async (seconds: number) => {
    try {
      await TrackPlayer.seekTo(seconds);
    } catch (err) {
      if (__DEV__) console.error('Seek error:', err);
    }
  }, []);

  const resume = useCallback(async () => {
    try {
      await TrackPlayer.play();
    } catch (err) {
      if (__DEV__) console.error('Resume error:', err);
    }
  }, []);

  const setPlaybackRate = useCallback(async (rate: number): Promise<void> => {
    try {
      await TrackPlayer.setRate(rate);
      setPlaybackRateState(rate);
    } catch (err) {
      if (__DEV__) console.error('SetRate error:', err);
    }
  }, []);

  return {
    isPlaying,
    currentTrack,
    currentPosition: progress.position,
    duration: progress.duration,
    playbackRate,
    play,
    pause,
    seekTo,
    resume,
    setPlaybackRate,
    loading,
    error,
  };
};
