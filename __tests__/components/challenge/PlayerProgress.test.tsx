import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { PlayerProgress } from '../../../src/components/challenge/PlayerProgress';

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

const defaultProps = {
  liveProgress: 45,
  currentPosition: 90,
  duration: 200,
  onSeek: jest.fn(),
};

describe('PlayerProgress', () => {
  const originalConsoleError = console.error;

  beforeEach(() => {
    jest.clearAllMocks();
    // Suppress Animated.timing act() warnings — these fire from RN's internal
    // animation loop and cannot be wrapped in act() from test code.
    // Non-matching messages are forwarded to the original console.error.
    jest.spyOn(console, 'error').mockImplementation((...args: unknown[]) => {
      const [msg] = args;
      if (typeof msg === 'string' && msg.includes('not wrapped in act')) return;
      originalConsoleError(...args);
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders the seek button with correct accessibility label', () => {
    render(<PlayerProgress {...defaultProps} />);
    expect(screen.getByRole('button', { name: 'Seek playback position' })).toBeOnTheScreen();
  });

  it('displays formatted current position and remaining time', () => {
    render(<PlayerProgress {...defaultProps} currentPosition={90} duration={200} />);
    // 90s = 1:30 elapsed, remaining = 200-90 = 110s = -1:50
    expect(screen.getByText('1:30')).toBeOnTheScreen();
    expect(screen.getByText('-1:50')).toBeOnTheScreen();
  });

  it('formats zero seconds as 0:00 and remaining as -0:00', () => {
    render(<PlayerProgress {...defaultProps} currentPosition={0} duration={0} />);
    expect(screen.getByText('0:00')).toBeOnTheScreen();
    expect(screen.getByText('-0:00')).toBeOnTheScreen();
  });

  it('calls onSeek with percentage when progress bar is pressed after layout', () => {
    const onSeek = jest.fn();
    render(<PlayerProgress {...defaultProps} onSeek={onSeek} />);

    const seekButton = screen.getByRole('button', { name: 'Seek playback position' });

    // Simulate layout to set progressBarWidth
    fireEvent(seekButton, 'layout', {
      nativeEvent: { layout: { width: 300 } },
    });

    // Simulate press at x=150 (50% of 300px)
    fireEvent.press(seekButton, {
      nativeEvent: { locationX: 150 },
    });

    expect(onSeek).toHaveBeenCalledTimes(1);
    expect(onSeek).toHaveBeenCalledWith(50);
  });

  it('does not call onSeek when pressed before layout has fired', () => {
    const onSeek = jest.fn();
    render(<PlayerProgress {...defaultProps} onSeek={onSeek} />);

    const seekButton = screen.getByRole('button', { name: 'Seek playback position' });

    // Press without triggering layout first — progressBarWidth is still 0
    fireEvent.press(seekButton, {
      nativeEvent: { locationX: 150 },
    });

    expect(onSeek).not.toHaveBeenCalled();
  });
});
