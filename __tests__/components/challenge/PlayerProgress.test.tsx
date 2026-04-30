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

  it('renders the "Listening Progress" label', () => {
    render(<PlayerProgress {...defaultProps} />);
    expect(screen.getByText('Listening Progress')).toBeOnTheScreen();
  });

  it('displays formatted current position and duration', () => {
    render(<PlayerProgress {...defaultProps} currentPosition={90} duration={200} />);
    // 90s = 1:30, 200s = 3:20
    expect(screen.getByText('1:30')).toBeOnTheScreen();
    expect(screen.getByText('3:20')).toBeOnTheScreen();
  });

  it('formats zero seconds as 0:00', () => {
    render(<PlayerProgress {...defaultProps} currentPosition={0} duration={0} />);
    const zeros = screen.getAllByText('0:00');
    expect(zeros).toHaveLength(2);
  });

  it('displays rounded progress percentage', () => {
    render(<PlayerProgress {...defaultProps} liveProgress={45.7} />);
    expect(screen.getByText('46% Complete')).toBeOnTheScreen();
  });

  it('displays 0% Complete when liveProgress is 0', () => {
    render(<PlayerProgress {...defaultProps} liveProgress={0} />);
    expect(screen.getByText('0% Complete')).toBeOnTheScreen();
  });

  it('displays 100% Complete when liveProgress is 100', () => {
    render(<PlayerProgress {...defaultProps} liveProgress={100} />);
    expect(screen.getByText('100% Complete')).toBeOnTheScreen();
  });

  it('has a seek button with correct accessibility attributes', () => {
    render(<PlayerProgress {...defaultProps} />);
    const seekButton = screen.getByRole('button', { name: 'Seek playback position' });
    expect(seekButton).toBeOnTheScreen();
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
