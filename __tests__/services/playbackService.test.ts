// Tests for src/services/playbackService.ts
// Covers the RemoteDuck handler: the core audio-interruption logic added in
// the 010-audio-background-interruption feature branch.
//
// Strategy: mock TrackPlayer at the module boundary, invoke the service function
// to register its listeners, then call those listeners directly to assert behaviour.

import TrackPlayer, { Event, State } from 'react-native-track-player';
import { playbackService } from '../../src/services/playbackService';

// ─── Mock react-native-track-player ──────────────────────────────────────────

const eventListeners: Record<string, ((event: Record<string, unknown>) => Promise<void> | void)[]> =
  {};

jest.mock('react-native-track-player', () => ({
  __esModule: true,
  default: {
    addEventListener: jest.fn((event: string, handler: (e: Record<string, unknown>) => void) => {
      if (!eventListeners[event]) eventListeners[event] = [];
      eventListeners[event].push(handler);
    }),
    pause: jest.fn().mockResolvedValue(undefined),
    play: jest.fn().mockResolvedValue(undefined),
    stop: jest.fn().mockResolvedValue(undefined),
    skipToNext: jest.fn().mockResolvedValue(undefined),
    skipToPrevious: jest.fn().mockResolvedValue(undefined),
    seekTo: jest.fn().mockResolvedValue(undefined),
    getPlaybackState: jest.fn().mockResolvedValue({ state: 'playing' }),
  },
  Event: {
    RemotePause: 'remote-pause',
    RemotePlay: 'remote-play',
    RemoteNext: 'remote-next',
    RemotePrevious: 'remote-previous',
    RemoteSeek: 'remote-seek',
    PlaybackQueueEnded: 'playback-queue-ended',
    PlaybackError: 'playback-error',
    RemoteDuck: 'remote-duck',
  },
  State: {
    Playing: 'playing',
    Paused: 'paused',
    Stopped: 'stopped',
    None: 'none',
  },
}));

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Fire a registered TrackPlayer event listener by name */
async function fireEvent(eventName: string, payload: Record<string, unknown> = {}): Promise<void> {
  const handlers = eventListeners[eventName] ?? [];
  for (const handler of handlers) {
    await handler(payload);
  }
}

function setPlaybackState(state: string): void {
  (TrackPlayer.getPlaybackState as jest.Mock).mockResolvedValue({ state });
}

// ─── Setup ───────────────────────────────────────────────────────────────────

beforeEach(async () => {
  // Clear captured listeners and mock call history between tests
  for (const key of Object.keys(eventListeners)) {
    delete eventListeners[key];
  }
  jest.clearAllMocks();

  // Calling playbackService() resets wasPlayingBeforeDuck to false at the top of
  // its function body, giving each test a clean slate without module re-evaluation.
  await playbackService();
});

// ─── RemoteDuck handler ───────────────────────────────────────────────────────

describe('RemoteDuck handler', () => {
  describe('transient interruption begins (event.paused = true)', () => {
    it('pauses playback when the player is actively playing', async () => {
      setPlaybackState(State.Playing);

      await fireEvent(Event.RemoteDuck, { paused: true, permanent: false });

      expect(TrackPlayer.pause).toHaveBeenCalledTimes(1);
    });

    it('sets wasPlayingBeforeDuck to true when player was playing', async () => {
      setPlaybackState(State.Playing);
      await fireEvent(Event.RemoteDuck, { paused: true, permanent: false });

      // Resume event should trigger play() — proving the flag was true
      await fireEvent(Event.RemoteDuck, { paused: false, permanent: false });
      expect(TrackPlayer.play).toHaveBeenCalledTimes(1);
    });

    it('does NOT set wasPlayingBeforeDuck when player was already paused', async () => {
      setPlaybackState(State.Paused);
      await fireEvent(Event.RemoteDuck, { paused: true, permanent: false });

      // Resume event should NOT trigger play() — flag must be false
      await fireEvent(Event.RemoteDuck, { paused: false, permanent: false });
      expect(TrackPlayer.play).not.toHaveBeenCalled();
    });
  });

  describe('interruption ends (event.paused = false, event.permanent = false)', () => {
    it('resumes playback when wasPlayingBeforeDuck is true', async () => {
      setPlaybackState(State.Playing);

      // Simulate: was playing → call starts → call ends
      await fireEvent(Event.RemoteDuck, { paused: true, permanent: false });
      await fireEvent(Event.RemoteDuck, { paused: false, permanent: false });

      expect(TrackPlayer.play).toHaveBeenCalledTimes(1);
    });

    it('resets wasPlayingBeforeDuck to false after resuming', async () => {
      setPlaybackState(State.Playing);

      await fireEvent(Event.RemoteDuck, { paused: true, permanent: false });
      await fireEvent(Event.RemoteDuck, { paused: false, permanent: false });

      // A second resume event must NOT trigger play again
      jest.clearAllMocks();
      await fireEvent(Event.RemoteDuck, { paused: false, permanent: false });
      expect(TrackPlayer.play).not.toHaveBeenCalled();
    });

    it('does NOT resume when wasPlayingBeforeDuck is false (user had manually paused)', async () => {
      setPlaybackState(State.Paused);

      await fireEvent(Event.RemoteDuck, { paused: true, permanent: false });
      await fireEvent(Event.RemoteDuck, { paused: false, permanent: false });

      expect(TrackPlayer.play).not.toHaveBeenCalled();
    });
  });

  describe('permanent interruption (event.permanent = true)', () => {
    it('stops playback', async () => {
      await fireEvent(Event.RemoteDuck, { paused: false, permanent: true });

      expect(TrackPlayer.stop).toHaveBeenCalledTimes(1);
      expect(TrackPlayer.play).not.toHaveBeenCalled();
    });

    it('clears wasPlayingBeforeDuck so a subsequent resume event does not auto-play', async () => {
      // First: was playing and got ducked
      setPlaybackState(State.Playing);
      await fireEvent(Event.RemoteDuck, { paused: true, permanent: false });

      // Then: permanent takeover
      await fireEvent(Event.RemoteDuck, { paused: false, permanent: true });

      // Resume event should NOT play — permanent takeover cleared the flag
      jest.clearAllMocks();
      await fireEvent(Event.RemoteDuck, { paused: false, permanent: false });
      expect(TrackPlayer.play).not.toHaveBeenCalled();
    });
  });
});

// ─── Other handlers (smoke tests) ────────────────────────────────────────────

describe('RemotePause handler', () => {
  it('calls TrackPlayer.pause()', async () => {
    await fireEvent(Event.RemotePause);
    expect(TrackPlayer.pause).toHaveBeenCalledTimes(1);
  });
});

describe('RemotePlay handler', () => {
  it('calls TrackPlayer.play()', async () => {
    await fireEvent(Event.RemotePlay);
    expect(TrackPlayer.play).toHaveBeenCalledTimes(1);
  });
});

describe('PlaybackError handler', () => {
  it('calls TrackPlayer.stop() instead of logging', async () => {
    const consoleSpy = jest.spyOn(console, 'error');
    await fireEvent(Event.PlaybackError);
    expect(TrackPlayer.stop).toHaveBeenCalledTimes(1);
    expect(consoleSpy).not.toHaveBeenCalled();
  });
});
