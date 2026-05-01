import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import type { MusicChallenge } from '../../../src/types';

// Mock react-native-safe-area-context
jest.mock('react-native-safe-area-context', () => {
  /* eslint-disable @typescript-eslint/no-require-imports */
  const React = require('react');
  const { View } = require('react-native');
  /* eslint-enable @typescript-eslint/no-require-imports */
  function MockSafeAreaView({ children, style }: { children: React.ReactNode; style?: unknown }) {
    return React.createElement(View, { style }, children);
  }
  return { SafeAreaView: MockSafeAreaView };
});

// Mock GlassCard
jest.mock('../../../src/components/ui/GlassCard', () => {
  /* eslint-disable @typescript-eslint/no-require-imports */
  const React = require('react');
  const { View } = require('react-native');
  /* eslint-enable @typescript-eslint/no-require-imports */
  function MockGlassCard({ children, style }: { children: React.ReactNode; style?: unknown }) {
    return React.createElement(View, { style }, children);
  }
  return { GlassCard: MockGlassCard };
});

// Mock GlassButton
jest.mock('../../../src/components/ui/GlassButton', () => {
  /* eslint-disable @typescript-eslint/no-require-imports */
  const React = require('react');
  const { TouchableOpacity, Text } = require('react-native');
  /* eslint-enable @typescript-eslint/no-require-imports */
  function MockGlassButton({ title, onPress }: { title: string; onPress: () => void }) {
    return React.createElement(
      TouchableOpacity,
      { onPress, accessibilityRole: 'button', accessibilityLabel: title },
      React.createElement(Text, null, title),
    );
  }
  return { GlassButton: MockGlassButton };
});

// Mock PointsCounter
jest.mock('../../../src/components/ui/PointsCounter', () => {
  /* eslint-disable @typescript-eslint/no-require-imports */
  const React = require('react');
  const { View } = require('react-native');
  /* eslint-enable @typescript-eslint/no-require-imports */
  function MockPointsCounter() {
    return React.createElement(View, { testID: 'points-counter' });
  }
  return { PointsCounter: MockPointsCounter };
});

// Mock PlayerProgress
jest.mock('../../../src/components/challenge/PlayerProgress', () => {
  /* eslint-disable @typescript-eslint/no-require-imports */
  const React = require('react');
  const { View } = require('react-native');
  /* eslint-enable @typescript-eslint/no-require-imports */
  function MockPlayerProgress() {
    return React.createElement(View, { testID: 'player-progress' });
  }
  return { PlayerProgress: MockPlayerProgress };
});

// Mock PlayerControls
jest.mock('../../../src/components/challenge/PlayerControls', () => {
  /* eslint-disable @typescript-eslint/no-require-imports */
  const React = require('react');
  const { View } = require('react-native');
  /* eslint-enable @typescript-eslint/no-require-imports */
  function MockPlayerControls() {
    return React.createElement(View, { testID: 'player-controls' });
  }
  return { PlayerControls: MockPlayerControls };
});

// Mock useMusicPlayer
const mockPlay = jest.fn();
let mockPlayerReturn = {
  currentTrack: null as MusicChallenge | null,
  isPlaying: false,
  currentPosition: 0,
  duration: 0,
  play: mockPlay,
  pause: jest.fn(),
  seekTo: jest.fn(),
  resume: jest.fn(),
  loading: false,
  error: null as string | null,
};

jest.mock('../../../src/hooks/useMusicPlayer', () => ({
  useMusicPlayer: () => mockPlayerReturn,
}));

// Mock usePointsCounter
jest.mock('../../../src/hooks/usePointsCounter', () => ({
  usePointsCounter: () => ({
    pointsEarned: 0,
    progress: 0,
    isActive: false,
    startCounting: jest.fn(),
    stopCounting: jest.fn(),
    resumeCounting: jest.fn(),
  }),
}));

// Mock userStore
jest.mock('../../../src/stores/userStore', () => ({
  useUserStore: (selector: (s: { totalPoints: number }) => unknown) =>
    selector({ totalPoints: 100 }),
}));

// Mock musicStore
jest.mock('../../../src/stores/musicStore', () => ({
  useMusicStore: (selector: (s: { challenges: MusicChallenge[] }) => unknown) =>
    selector({ challenges: [] }),
}));

// Import after all mocks
// eslint-disable-next-line import/first
import PlayerModal from '../../../src/app/(modals)/player';

const mockTrack: MusicChallenge = {
  id: 'track-1',
  title: 'Test Track',
  artist: 'Test Artist',
  duration: 180,
  points: 100,
  audioUrl: 'https://example.com/track.mp3',
  description: 'A test track',
  difficulty: 'easy',
  completed: false,
  progress: 0,
};

describe('PlayerModal', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockPlayerReturn = {
      currentTrack: null,
      isPlaying: false,
      currentPosition: 0,
      duration: 0,
      play: mockPlay,
      pause: jest.fn(),
      seekTo: jest.fn(),
      resume: jest.fn(),
      loading: false,
      error: null,
    };
  });

  it('renders "No track selected" when no track is active', () => {
    render(<PlayerModal />);
    expect(screen.getByText('No track selected')).toBeOnTheScreen();
  });

  it('renders track title when currentTrack is set', () => {
    mockPlayerReturn.currentTrack = mockTrack;
    mockPlayerReturn.duration = 180;
    render(<PlayerModal />);
    expect(screen.getByText('Test Track')).toBeOnTheScreen();
    expect(screen.getByText('Test Artist')).toBeOnTheScreen();
  });

  it('displays error banner when useMusicPlayer returns non-null error', () => {
    mockPlayerReturn.currentTrack = mockTrack;
    mockPlayerReturn.duration = 180;
    mockPlayerReturn.error = 'Playback failed';
    render(<PlayerModal />);
    expect(screen.getByText('Playback failed')).toBeOnTheScreen();
    expect(screen.getByLabelText('Retry')).toBeOnTheScreen();
  });

  it('Retry button calls play with current track', () => {
    mockPlayerReturn.currentTrack = mockTrack;
    mockPlayerReturn.duration = 180;
    mockPlayerReturn.error = 'Playback failed';
    render(<PlayerModal />);
    fireEvent.press(screen.getByLabelText('Retry'));
    expect(mockPlay).toHaveBeenCalledWith(mockTrack);
  });

  it('does not show error banner when error is null', () => {
    mockPlayerReturn.currentTrack = mockTrack;
    mockPlayerReturn.duration = 180;
    render(<PlayerModal />);
    expect(screen.queryByLabelText('Retry')).toBeNull();
  });
});
