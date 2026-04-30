import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { ChallengeList } from '../../../src/components/challenge/ChallengeList';
import type { MusicChallenge } from '../../../src/types';

jest.mock('../../../src/components/challenge/ChallengeCard', () => ({
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  ChallengeCard: (props: { challenge: { id: string; title: string }; onPlay: (c: unknown) => void }) =>
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    require('react').createElement(
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      require('react-native').TouchableOpacity,
      {
        testID: `card-${props.challenge.id}`,
        accessibilityRole: 'button',
        accessibilityLabel: props.challenge.title,
        onPress: () => props.onPlay(props.challenge),
      },
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      require('react').createElement(
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        require('react-native').Text,
        null,
        props.challenge.title,
      ),
    ),
}));

jest.mock('../../../src/components/ui/GlassCard', () => ({
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  GlassCard: (props: { children: unknown }) =>
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    require('react').createElement(
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      require('react-native').View,
      null,
      props.children,
    ),
}));

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

    // Verify the loading indicator is rendered with correct accessibility attributes
    const indicator = screen.getByLabelText('Loading challenges');
    expect(indicator).toBeOnTheScreen();
    expect(indicator.props.accessibilityRole).toBe('progressbar');
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
