import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { TrackInfoCard } from '../../../src/components/challenge/TrackInfoCard';
import type { MusicChallenge } from '../../../src/types';

jest.mock('../../../src/hooks/useTheme', () => ({
  useTheme: () => ({
    colors: {
      textPrimary: '#ffffff',
      textSecondary: '#aaaaaa',
      textTertiary: '#666666',
    },
    resolvedTheme: 'dark',
  }),
}));

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

jest.mock('../../../src/components/ui/PointsCounter', () => {
  /* eslint-disable @typescript-eslint/no-require-imports */
  const React = require('react');
  const { Text } = require('react-native');
  /* eslint-enable @typescript-eslint/no-require-imports */

  function MockPointsCounter({ points }: { points: number }) {
    return React.createElement(Text, { testID: 'points-counter' }, String(points));
  }

  return { PointsCounter: MockPointsCounter };
});

const mockTrack: MusicChallenge = {
  id: 'track-1',
  title: 'Test Song',
  artist: 'Test Artist',
  duration: 180,
  points: 100,
  audioUrl: 'https://example.com/audio.mp3',
  description: 'A test track for unit tests',
  difficulty: 'medium',
  completed: false,
  progress: 0,
};

describe('TrackInfoCard', () => {
  it('renders the track title, artist, and description', () => {
    render(<TrackInfoCard track={mockTrack} currentPoints={0} />);

    expect(screen.getByText('Test Song')).toBeOnTheScreen();
    expect(screen.getByText('Test Artist')).toBeOnTheScreen();
    expect(screen.getByText('A test track for unit tests')).toBeOnTheScreen();
  });

  it('renders the current points and total points', () => {
    render(<TrackInfoCard track={mockTrack} currentPoints={42} />);

    expect(screen.getByTestId('points-counter')).toHaveTextContent('42');
    expect(screen.getByText(/\/ 100 pts/)).toBeOnTheScreen();
  });

  it('provides an accessibility label for the points section', () => {
    render(<TrackInfoCard track={mockTrack} currentPoints={75} />);

    expect(screen.getByLabelText('75 of 100 points earned')).toBeOnTheScreen();
  });
});
