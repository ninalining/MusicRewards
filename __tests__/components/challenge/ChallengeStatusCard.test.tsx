import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { ChallengeStatusCard } from '../../../src/components/challenge/ChallengeStatusCard';

jest.mock('../../../src/hooks/useTheme', () => ({
  useTheme: () => ({
    colors: {
      textPrimary: '#ffffff',
      textSecondary: '#aaaaaa',
      brandSecondary: '#00ff88',
      brandAccent: '#8b5cf6',
    },
    resolvedTheme: 'dark',
  }),
}));

jest.mock('@expo/vector-icons', () => {
  /* eslint-disable @typescript-eslint/no-require-imports */
  const React = require('react');
  const { View } = require('react-native');
  /* eslint-enable @typescript-eslint/no-require-imports */

  function MockIonicons() {
    return React.createElement(View, null);
  }

  return { Ionicons: MockIonicons };
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

describe('ChallengeStatusCard', () => {
  it('renders in-progress state with correct percentage', () => {
    render(<ChallengeStatusCard completed={false} progressPercent={45.7} />);

    expect(screen.getByText('In Progress')).toBeOnTheScreen();
    expect(screen.getByText('46% of challenge complete')).toBeOnTheScreen();
  });

  it('renders completed state', () => {
    render(<ChallengeStatusCard completed={true} progressPercent={100} />);

    expect(screen.getByText('Completed')).toBeOnTheScreen();
    expect(screen.getByText('100% of challenge complete')).toBeOnTheScreen();
  });

  it('provides accessibility label without emoji for screen readers', () => {
    render(<ChallengeStatusCard completed={false} progressPercent={50} />);

    expect(screen.getByLabelText('In Progress')).toBeOnTheScreen();
  });

  it('provides completed accessibility label for screen readers', () => {
    render(<ChallengeStatusCard completed={true} progressPercent={100} />);

    expect(screen.getByLabelText('Completed')).toBeOnTheScreen();
  });
});
