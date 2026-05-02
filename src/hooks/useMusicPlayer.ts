// useMusicPlayer hook - Integrates react-native-track-player with Zustand
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
  // TrackPlayer hooks
  const playbackState = usePlaybackState();
  const progress = useProgress(250);

  // Local state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [playbackRate, setPlaybackRateState] = useState(1);

  // Tracks which challenge IDs have had completion fired in this session.
  // useRef (not useState) so updates don't trigger re-renders and are
  // immune to stale Zustand closures between render cycles.
  const completedInSession = useRef<Set<string>>(new Set());

  // Zustand store selectors
  const currentTrack = useMusicStore(selectCurrentTrack);
  const isPlaying = useMusicStore(selectIsPlaying);
  const setCurrentTrack = useMusicStore((state) => state.setCurrentTrack);
  const setIsPlaying = useMusicStore((state) => state.setIsPlaying);
  const setCurrentPosition = useMusicStore((state) => state.setCurrentPosition);
  const updateProgress = useMusicStore((state) => state.updateProgress);
  const markChallengeComplete = useMusicStore((state) => state.markChallengeComplete);
  // completeChallenge marks the challenge in userStore. Points are handled
  // separately by usePointsCounter (proportional accumulation, Constitution Rule #5).
  const completeChallenge = useUserStore((state) => state.completeChallenge);

  // Track playback state changes
  useEffect(() => {
    // usePlaybackState() returns PlaybackState | { state: undefined } depending on RNTP version.
    // Narrow without casting to any — extract .state if present, otherwise use value directly.
    const state =
      typeof playbackState === 'object' && playbackState !== null && 'state' in playbackState
        ? playbackState.state
        : playbackState;
    const isCurrentlyPlaying = state === State.Playing;
    // Read current store value directly to avoid including isPlaying in deps,
    // which would create a write→re-render→read→write loop.
    if (isCurrentlyPlaying !== useMusicStore.getState().isPlaying) {
      setIsPlaying(isCurrentlyPlaying);
    }
  }, [playbackState, setIsPlaying]);

  // Extract primitives from currentTrack to avoid re-firing when store creates new object refs.
  const trackId = currentTrack?.id;

  // Update position and calculate progress/points
  useEffect(() => {
    if (
      trackId &&
      progress.position > 0 &&
      Number.isFinite(progress.duration) &&
      progress.duration > 0
    ) {
      setCurrentPosition(progress.position);

      // Calculate progress percentage — duration guard above prevents Infinity/NaN
      const progressPercentage = Math.min((progress.position / progress.duration) * 100, 100);
      updateProgress(trackId, progressPercentage);

      // Mark challenge complete at 90% threshold.
      // Points are NOT awarded here — usePointsCounter accumulates them
      // proportionally on each progress tick (Constitution Rule #5).
      // useRef guard prevents duplicate completion calls across progress ticks.
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

  // Handle track player events
  useTrackPlayerEvents([Event.PlaybackError], (event) => {
    if (event.type === Event.PlaybackError) {
      setError(`Playback error: ${event.message}`);
      setLoading(false);
    }
  });

  // Constitution Rule #3 exception: TrackPlayer.reset() is NOT called on unmount.
  // This hook is shared by HomeScreen + PlayerModal. Unmounting one screen must not
  // destroy playback state for the other. Playback is paused on modal dismiss instead.
  // See constitution.md Rule #3 for the documented exception.

  const play = useCallback(
    async (track: MusicChallenge) => {
      // Clear the session guard for this track so the completion logic
      // can fire once in this new play session (while guarding against duplicates).
      completedInSession.current.delete(track.id);
      try {
        setLoading(true);
        setError(null);

        // Ensure player is initialized before use
        await setupTrackPlayer();

        // Reset and add new track
        await TrackPlayer.reset();
        await TrackPlayer.add({
          id: track.id,
          url: track.audioUrl,
          title: track.title,
          artist: track.artist,
          duration: track.duration,
        });

        // Start playback
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

  // isPlaying is sourced from the Zustand selector (selectIsPlaying) which is kept
  // in sync by the playbackState useEffect above — no need to re-derive here.
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
