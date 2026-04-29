// useMusicPlayer hook - Integrates react-native-track-player with Zustand
import { useCallback, useEffect, useRef, useState } from 'react';
import TrackPlayer, {
  State,
  usePlaybackState,
  useProgress,
  Event,
  useTrackPlayerEvents,
} from 'react-native-track-player';
import { useMusicStore, selectCurrentTrack, selectIsPlaying } from '../stores/musicStore';
import { useUserStore } from '../stores/userStore';
import type { MusicChallenge, UseMusicPlayerReturn } from '../types';

export const useMusicPlayer = (): UseMusicPlayerReturn => {
  // TrackPlayer hooks
  const playbackState = usePlaybackState();
  const progress = useProgress();
  
  // Local state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
  const addPoints = useUserStore((state) => state.addPoints);
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
    if (isCurrentlyPlaying !== isPlaying) {
      setIsPlaying(isCurrentlyPlaying);
    }
  }, [playbackState, isPlaying, setIsPlaying]);

  // Update position and calculate progress/points
  useEffect(() => {
    if (currentTrack && progress.position > 0) {
      setCurrentPosition(progress.position);
      
      // Calculate progress percentage
      const progressPercentage = (progress.position / progress.duration) * 100;
      updateProgress(currentTrack.id, progressPercentage);
      
      // Award points and mark complete at 90% threshold.
      // useRef guard prevents duplicate calls when this effect fires on every progress tick
      // and Zustand's currentTrack reference is still stale from a previous render cycle.
      if (
        progressPercentage >= 90 &&
        !completedInSession.current.has(currentTrack.id)
      ) {
        completedInSession.current.add(currentTrack.id);
        markChallengeComplete(currentTrack.id);
        completeChallenge(currentTrack.id);
        addPoints(currentTrack.points);
      }
    }
  }, [progress.position, progress.duration, currentTrack, setCurrentPosition, updateProgress, markChallengeComplete, completeChallenge, addPoints]);

  // Handle track player events
  useTrackPlayerEvents([Event.PlaybackError], (event) => {
    if (event.type === Event.PlaybackError) {
      setError(`Playback error: ${event.message}`);
      setLoading(false);
    }
  });

  // Constitution Rule #3: reset TrackPlayer on unmount to release native resources.
  // If background playback is added later (Bonus Feature #4), revisit this cleanup.
  useEffect(() => {
    return () => {
      TrackPlayer.reset().catch(() => {});
    };
  }, []);

  const play = useCallback(async (track: MusicChallenge) => {
    // Clear the session guard for this track so the completion logic
    // can fire once in this new play session (while guarding against duplicates).
    completedInSession.current.delete(track.id);
    try {
      setLoading(true);
      setError(null);
      
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
      console.error('TrackPlayer error:', err);
    } finally {
      setLoading(false);
    }
  }, [setCurrentTrack]);

  const pause = useCallback(async () => {
    try {
      await TrackPlayer.pause();
    } catch (err) {
      console.error('Pause error:', err);
    }
  }, []);

  const seekTo = useCallback(async (seconds: number) => {
    try {
      await TrackPlayer.seekTo(seconds);
    } catch (err) {
      console.error('Seek error:', err);
    }
  }, []);

  const resume = useCallback(async () => {
    try {
      await TrackPlayer.play();
    } catch (err) {
      console.error('Resume error:', err);
    }
  }, []);

  // isPlaying is sourced from the Zustand selector (selectIsPlaying) which is kept
  // in sync by the playbackState useEffect above — no need to re-derive here.
  return {
    isPlaying,
    currentTrack,
    currentPosition: progress.position,
    duration: progress.duration,
    play,
    pause,
    seekTo,
    resume,
    loading,
    error,
  };
};