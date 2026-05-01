import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import type { MusicChallenge } from '../../../src/types';

// Mock expo-router
const mockPush = jest.fn();
const mockReplace = jest.fn();
jest.mock('expo-router', () => ({
  useLocalSearchParams: () => ({ challengeId: 'challenge-1' }),
  router: {
    push: (...args: unknown[]) => mockPush(...args),
    replace: (...args: unknown[]) => mockReplace(...args),
  },
}));

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

  function MockGlassButton({ title, onPress, disabled }: { title: string; onPress: () => void; disabled?: boolean }) {
    return React.createElement(
      TouchableOpacity,
      { onPress, disabled, accessibilityRole: 'button', accessibilityLabel: title },
      React.createElement(Text, null, title),
    );
  }

  return { GlassButton: MockGlassButton };
});

// Mock useMusicPlayer
const mockPlay = jest.fn();
const mockResume = jest.fn();
jest.mock('../../../src/hooks/useMusicPlayer', () => ({
  useMusicPlayer: () => ({
    currentTrack: null,
    play: mockPlay,
    resume: mockResume,
    loading: false,
  }),
}));

// Mock musicStore
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
  progress: 45,
};

let mockStoreChallenges: MusicChallenge[] = [mockChallenge];

jest.mock('../../../src/stores/musicStore', () => ({
  useMusicStore: (selector: (s: { challenges: MusicChallenge[] }) => unknown) =>
    selector({ challenges: mockStoreChallenges }),
}));

// Import after all mocks
// eslint-disable-next-line import/first
import ChallengeDetailModal from '../../../src/app/(modals)/challenge-detail';

describe('ChallengeDetailModal', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockStoreChallenges = [mockChallenge];
  });

  it('renders challenge title and artist', () => {
    render(<ChallengeDetailModal />);
    expect(screen.getByText('All Night')).toBeOnTheScreen();
    expect(screen.getByText('Camo & Krooked')).toBeOnTheScreen();
  });

  it('renders difficulty badge', () => {
    render(<ChallengeDetailModal />);
    expect(screen.getByText('EASY')).toBeOnTheScreen();
  });

  it('renders challenge description', () => {
    render(<ChallengeDetailModal />);
    expect(screen.getByText('Listen to this drum & bass classic')).toBeOnTheScreen();
  });

  it('renders duration, points, and progress stats', () => {
    render(<ChallengeDetailModal />);
    expect(screen.getByText('3:39')).toBeOnTheScreen();
    expect(screen.getByText('150')).toBeOnTheScreen();
    expect(screen.getByText('45%')).toBeOnTheScreen();
  });

  it('shows fallback when challenge is not found', () => {
    mockStoreChallenges = [];
    render(<ChallengeDetailModal />);
    expect(screen.getByText('Challenge not found')).toBeOnTheScreen();
  });

  it('calls play and navigates to player modal on button press', async () => {
    mockPlay.mockResolvedValue(undefined);
    render(<ChallengeDetailModal />);

    fireEvent.press(screen.getByRole('button', { name: 'Play Challenge' }));

    await waitFor(() => {
      expect(mockPlay).toHaveBeenCalledWith(mockChallenge);
      expect(mockReplace).toHaveBeenCalledWith('/(modals)/player');
    });
  });

  it('shows Completed button when challenge is completed', () => {
    mockStoreChallenges = [{ ...mockChallenge, completed: true }];
    render(<ChallengeDetailModal />);

    expect(screen.getByText('Completed ✓')).toBeOnTheScreen();
    expect(screen.getByText('✓ Challenge Completed')).toBeOnTheScreen();
  });

  it('disables play button when challenge is completed', () => {
    mockStoreChallenges = [{ ...mockChallenge, completed: true }];
    render(<ChallengeDetailModal />);

    const button = screen.getByRole('button', { name: 'Completed ✓' });
    expect(button.props.accessibilityState?.disabled ?? button.props.disabled).toBeTruthy();
  });

  it('renders accessibility labels on stat items', () => {
    render(<ChallengeDetailModal />);
    expect(screen.getByLabelText('Duration: 3:39')).toBeOnTheScreen();
    expect(screen.getByLabelText('Points: 150')).toBeOnTheScreen();
    expect(screen.getByLabelText('Progress: 45 percent')).toBeOnTheScreen();
  });
});
