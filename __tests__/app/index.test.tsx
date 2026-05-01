import React from 'react';
import { render, screen } from '@testing-library/react-native';
import type { MusicChallenge } from '../../src/types';

// Mock expo-router
jest.mock('expo-router', () => ({
  router: { push: jest.fn() },
}));

// Mock GlassCard
jest.mock('../../src/components/ui/GlassCard', () => {
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
jest.mock('../../src/components/ui/GlassButton', () => {
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

// Mock useMusicPlayer
jest.mock('../../src/hooks/useMusicPlayer', () => ({
  useMusicPlayer: () => ({
    currentTrack: null,
    isPlaying: false,
    play: jest.fn(),
    resume: jest.fn(),
    loading: false,
    error: null,
  }),
}));

// Mock useChallenges
let mockChallengesReturn = {
  challenges: [] as MusicChallenge[],
  loading: false,
};

jest.mock('../../src/hooks/useChallenges', () => ({
  useChallenges: () => mockChallengesReturn,
}));

// Mock musicStore
jest.mock('../../src/stores/musicStore', () => ({
  useMusicStore: (selector: (s: { currentTrack: null; isPlaying: boolean }) => unknown) =>
    selector({ currentTrack: null, isPlaying: false }),
}));

// Import after all mocks
// eslint-disable-next-line import/first
import HomeScreen from '../../src/app/(tabs)/index';

const mockChallenge: MusicChallenge = {
  id: 'challenge-1',
  title: 'All Night',
  artist: 'Camo & Krooked',
  duration: 219,
  points: 150,
  audioUrl: 'https://example.com/track.mp3',
  description: 'Listen to this drum & bass classic',
  difficulty: 'easy',
  completed: false,
  progress: 0,
};

describe('HomeScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockChallengesReturn = { challenges: [], loading: false };
  });

  it('renders "Music Challenges" header', () => {
    render(<HomeScreen />);
    expect(screen.getByText('Music Challenges')).toBeOnTheScreen();
  });

  it('renders challenge titles after loading completes', () => {
    mockChallengesReturn = { challenges: [mockChallenge], loading: false };
    render(<HomeScreen />);
    expect(screen.getByText('All Night')).toBeOnTheScreen();
  });

  it('shows skeleton loading cards during loading', () => {
    mockChallengesReturn = { challenges: [], loading: true };
    render(<HomeScreen />);
    const skeletons = screen.getAllByLabelText('Loading challenge');
    expect(skeletons.length).toBe(3);
  });
});
