import TrackPlayer, { Capability, AppKilledPlaybackBehavior } from 'react-native-track-player';

// Ensures setupPlayer is called exactly once, even with concurrent callers.
let setupPromise: Promise<void> | null = null;

export const setupTrackPlayer = async (): Promise<void> => {
  if (setupPromise) {
    return setupPromise;
  }

  setupPromise = (async () => {
    try {
      await TrackPlayer.setupPlayer({
        waitForBuffer: true,
        maxCacheSize: 1024 * 10,
      });
    } catch (error: unknown) {
      // setupPlayer throws "already initialized" on repeat calls — safe to ignore.
      const message = error instanceof Error ? error.message : String(error);
      if (!message.includes('already been initialized')) {
        setupPromise = null;
        throw error;
      }
    }

    try {
      await TrackPlayer.updateOptions({
        capabilities: [
          Capability.Play,
          Capability.Pause,
          Capability.SkipToNext,
          Capability.SkipToPrevious,
          Capability.SeekTo,
        ],
        compactCapabilities: [Capability.Play, Capability.Pause],
        android: {
          appKilledPlaybackBehavior: AppKilledPlaybackBehavior.StopPlaybackAndRemoveNotification,
        },
        notificationCapabilities: [Capability.Play, Capability.Pause],
      });
    } catch (error: unknown) {
      setupPromise = null;
      throw error;
    }
  })();

  return setupPromise;
};

export const resetPlayer = async (): Promise<void> => {
  try {
    await TrackPlayer.reset();
  } catch (error) {
    if (__DEV__) console.error('Reset player error:', error);
  }
};

export const addTrack = async (track: {
  id: string;
  url: string;
  title: string;
  artist: string;
  duration?: number;
}): Promise<void> => {
  try {
    await TrackPlayer.add({
      id: track.id,
      url: track.url,
      title: track.title,
      artist: track.artist,
      duration: track.duration,
    });
  } catch (error) {
    if (__DEV__) console.error('Add track error:', error);
    throw error;
  }
};

export const playTrack = async (): Promise<void> => {
  try {
    await TrackPlayer.play();
  } catch (error) {
    if (__DEV__) console.error('Play track error:', error);
    throw error;
  }
};

export const pauseTrack = async (): Promise<void> => {
  try {
    await TrackPlayer.pause();
  } catch (error) {
    if (__DEV__) console.error('Pause track error:', error);
    throw error;
  }
};

export const seekToPosition = async (seconds: number): Promise<void> => {
  try {
    await TrackPlayer.seekTo(seconds);
  } catch (error) {
    if (__DEV__) console.error('Seek error:', error);
    throw error;
  }
};

export const getCurrentPosition = async (): Promise<number> => {
  try {
    return await TrackPlayer.getPosition();
  } catch (error) {
    if (__DEV__) console.error('Get position error:', error);
    return 0;
  }
};

export const getTrackDuration = async (): Promise<number> => {
  try {
    return await TrackPlayer.getDuration();
  } catch (error) {
    if (__DEV__) console.error('Get duration error:', error);
    return 0;
  }
};

export const cleanupTrackPlayer = async (): Promise<void> => {
  try {
    await TrackPlayer.reset();
  } catch (error) {
    if (__DEV__) console.error('Cleanup error:', error);
  } finally {
    // Allow re-initialization after cleanup (e.g. hot reload).
    setupPromise = null;
  }
};
