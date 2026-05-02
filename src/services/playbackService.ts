// Playback service for react-native-track-player
// This file handles background playback events
import TrackPlayer, { Event, State } from 'react-native-track-player';

// Module-level flag: tracks whether playback was active before an audio interruption.
// Persists across event firings for the process lifetime — no React/Zustand access here.
// Only set to true when the player was actually in State.Playing at the moment of interruption,
// so that a manual pause before a call is not overwritten by the duck handler.
let wasPlayingBeforeDuck = false;

export async function playbackService(): Promise<void> {
  // Reset interruption flag on service start — ensures a clean state if the
  // service is restarted (and gives tests a deterministic baseline each run).
  wasPlayingBeforeDuck = false;

  // This service needs to be registered in order for the TrackPlayer to work
  // when the app is in the background

  TrackPlayer.addEventListener(Event.RemotePause, async () => {
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

  // Queue ended — no action needed; progress tracking handles challenge completion
  TrackPlayer.addEventListener(Event.PlaybackQueueEnded, () => {
    // intentionally empty
  });

  // Playback error — stop silently; the UI reflects state via useProgress/PlaybackState
  TrackPlayer.addEventListener(Event.PlaybackError, () => {
    TrackPlayer.stop();
  });

  // Handle audio interruptions (phone calls, other audio apps taking focus).
  // Uses the module-level wasPlayingBeforeDuck flag so that manual pauses are respected —
  // if the user paused before the interruption, we do NOT auto-resume after it ends.
  TrackPlayer.addEventListener(Event.RemoteDuck, async (event) => {
    if (event.paused) {
      // Transient interruption began (e.g. incoming call, notification sound).
      // Only record the flag as true if we were actually playing — preserves manual pauses.
      const { state } = await TrackPlayer.getPlaybackState();
      wasPlayingBeforeDuck = state === State.Playing;
      await TrackPlayer.pause();
    } else if (event.permanent) {
      // Another audio app permanently took audio focus — do not auto-resume
      wasPlayingBeforeDuck = false;
      await TrackPlayer.stop();
    } else {
      // Interruption ended — only resume if we were playing before the interruption
      if (wasPlayingBeforeDuck) {
        wasPlayingBeforeDuck = false;
        await TrackPlayer.play();
      }
    }
  });
}
