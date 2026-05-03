import TrackPlayer, { Event, State } from 'react-native-track-player';

// Tracks whether playback was active before an audio interruption.
// Only true when State.Playing at the moment of interruption, so manual pauses are preserved.
let wasPlayingBeforeDuck = false;

export async function playbackService(): Promise<void> {
  wasPlayingBeforeDuck = false;

  TrackPlayer.addEventListener(Event.RemotePause, async () => {
    // Cancel any pending auto-resume from a prior duck event.
    wasPlayingBeforeDuck = false;
    await TrackPlayer.pause();
  });

  TrackPlayer.addEventListener(Event.RemotePlay, async () => {
    await TrackPlayer.play();
  });

  TrackPlayer.addEventListener(Event.RemoteNext, async () => {
    await TrackPlayer.skipToNext();
  });

  TrackPlayer.addEventListener(Event.RemotePrevious, async () => {
    await TrackPlayer.skipToPrevious();
  });

  TrackPlayer.addEventListener(Event.RemoteSeek, async (event) => {
    await TrackPlayer.seekTo(event.position);
  });

  TrackPlayer.addEventListener(Event.PlaybackQueueEnded, () => {});

  TrackPlayer.addEventListener(Event.PlaybackError, async () => {
    try {
      await TrackPlayer.stop();
    } catch {
      // Ignore secondary stop failures during error handling.
    }
  });

  // Audio interruptions (phone calls, other apps taking focus).
  // Manual pauses are respected via the wasPlayingBeforeDuck flag.
  TrackPlayer.addEventListener(Event.RemoteDuck, async (event) => {
    // Check permanent FIRST — permanent events can also carry paused=true.
    if (event.permanent) {
      wasPlayingBeforeDuck = false;
      await TrackPlayer.stop();
    } else if (event.paused) {
      // Only record flag if actually playing — preserves manual pauses.
      const { state } = await TrackPlayer.getPlaybackState();
      wasPlayingBeforeDuck = state === State.Playing;
      await TrackPlayer.pause();
    } else {
      // Interruption ended — resume only if we were playing before.
      if (wasPlayingBeforeDuck) {
        wasPlayingBeforeDuck = false;
        await TrackPlayer.play();
      }
    }
  });
}
