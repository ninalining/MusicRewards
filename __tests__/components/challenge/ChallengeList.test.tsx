import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { ChallengeList } from '../../../src/components/challenge/ChallengeList';
import type { MusicChallenge } from '../../../src/types';

jest.mock('../../../src/components/challenge/ChallengeCard', () => {
  // require() is necessary inside jest.mock factories — they are hoisted before ES imports.
  /* eslint-disable @typescript-eslint/no-require-imports */
  const React = require('react');
  const { TouchableOpacity, Text } = require('react-native');
  /* eslint-enable @typescript-eslint/no-require-imports */

  function MockChallengeCard({ challenge, onPlay }: { challenge: { id: string; title: string }; onPlay: (c: unknown) => void }) {
    return React.createElement(
      TouchableOpacity,
      {
        testID: `card-${challenge.id}`,
        accessibilityRole: 'button',
        accessibilityLabel: challenge.title,
        onPress: () => onPlay(challenge),
      },
      React.createElement(Text, null, challenge.title),
    );
  }

  return { ChallengeCard: MockChallengeCard };
});

jest.mock('../../../src/components/ui/GlassCard', () => {
  // require() is necessary inside jest.mock factories — they are hoisted before ES imports.
  /* eslint-disable @typescript-eslint/no-require-imports */
  const React = require('react');
  const { View } = require('react-native');
  /* eslint-enable @typescript-eslint/no-require-imports */

  function MockGlassCard({ children }: { children: React.ReactNode }) {
    return React.createElement(View, null, children);
  }

  return { GlassCard: MockGlassCard };
});

const mockChallenge: MusicChallenge = {
  id: 'challenge-1',
  title: 'Chill Vibes',
  artist: 'Artist One',
  duration: 180,
  points: 50,
  audioUrl: 'https://example.com/track1.mp3',
  description: 'A chill track',
  difficulty: 'easy',
  completed: false,
  progress: 0,
};

const mockOnPlay = jest.fn();

describe('ChallengeList', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows ActivityIndicator when loading, hidden list and empty state', () => {
    render(
      <ChallengeList
        challenges={[]}
        loading={true}
        onPlay={mockOnPlay}
      />,
    );

    // Verify skeleton loading cards are rendered with correct accessibility attributes
    const skeletons = screen.getAllByLabelText('Loading challenge');
    expect(skeletons.length).toBe(3);
    expect(skeletons[0].props.accessibilityRole).toBe('progressbar');
    expect(screen.queryByText('🎵 No challenges available yet')).toBeNull();
  });

  it('shows empty state when challenges array is empty and not loading', () => {
    render(
      <ChallengeList
        challenges={[]}
        loading={false}
        onPlay={mockOnPlay}
      />,
    );

    expect(screen.getByText('🎵 No challenges available yet')).toBeOnTheScreen();
  });

  it('renders challenge titles when challenges are provided', () => {
    render(
      <ChallengeList
        challenges={[mockChallenge]}
        loading={false}
        onPlay={mockOnPlay}
      />,
    );

    expect(screen.getByText('Chill Vibes')).toBeOnTheScreen();
  });

  it('does not show loading indicator or empty state when challenges are present', () => {
    render(
      <ChallengeList
        challenges={[mockChallenge]}
        loading={false}
        onPlay={mockOnPlay}
      />,
    );

    expect(screen.queryByRole('progressbar')).toBeNull();
    expect(screen.queryByText('🎵 No challenges available yet')).toBeNull();
  });

  it('calls onPlay with the challenge when a card is pressed', () => {
    render(
      <ChallengeList
        challenges={[mockChallenge]}
        loading={false}
        onPlay={mockOnPlay}
      />,
    );

    fireEvent.press(screen.getByRole('button', { name: 'Chill Vibes' }));
    expect(mockOnPlay).toHaveBeenCalledTimes(1);
    expect(mockOnPlay).toHaveBeenCalledWith(mockChallenge);
  });
});
