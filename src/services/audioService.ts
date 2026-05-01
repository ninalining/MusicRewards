import TrackPlayer, { Capability, AppKilledPlaybackBehavior } from 'react-native-track-player';

// Module-level promise ensures setupPlayer is called exactly once,
// even if multiple callers invoke setupTrackPlayer concurrently.
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
      // setupPlayer throws when already initialized — this is safe to ignore.
      const message = error instanceof Error ? error.message : String(error);
      if (!message.includes('already been initialized')) {
        setupPromise = null;
        throw error;
      }
    }

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
  })();

  return setupPromise;
};

export const resetPlayer = async (): Promise<void> => {
  try {
    await TrackPlayer.reset();
  } catch (error) {
    console.error('Reset player error:', error);
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
    console.error('Add track error:', error);
    throw error;
  }
};

export const playTrack = async (): Promise<void> => {
  try {
    await TrackPlayer.play();
  } catch (error) {
    console.error('Play track error:', error);
    throw error;
  }
};

export const pauseTrack = async (): Promise<void> => {
  try {
    await TrackPlayer.pause();
  } catch (error) {
    console.error('Pause track error:', error);
    throw error;
  }
};

export const seekToPosition = async (seconds: number): Promise<void> => {
  try {
    await TrackPlayer.seekTo(seconds);
  } catch (error) {
    console.error('Seek error:', error);
    throw error;
  }
};

export const getCurrentPosition = async (): Promise<number> => {
  try {
    return await TrackPlayer.getPosition();
  } catch (error) {
    console.error('Get position error:', error);
    return 0;
  }
};

export const getTrackDuration = async (): Promise<number> => {
  try {
    return await TrackPlayer.getDuration();
  } catch (error) {
    console.error('Get duration error:', error);
    return 0;
  }
};

export const cleanupTrackPlayer = async (): Promise<void> => {
  try {
    await TrackPlayer.reset();
  } catch (error) {
    console.error('Cleanup error:', error);
  } finally {
    // Allow re-initialization after cleanup (e.g. hot reload)
    setupPromise = null;
  }
};
