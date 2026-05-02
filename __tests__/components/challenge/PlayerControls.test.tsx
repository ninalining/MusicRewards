import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { PlayerControls } from '../../../src/components/challenge/PlayerControls';

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

jest.mock('../../../src/components/ui/GlassButton', () => {
  // require() is necessary inside jest.mock factories — they are hoisted before ES imports.
  /* eslint-disable @typescript-eslint/no-require-imports */
  const React = require('react');
  const { TouchableOpacity, Text } = require('react-native');
  /* eslint-enable @typescript-eslint/no-require-imports */

  function MockGlassButton({ title, onPress }: { title: string; onPress: () => void }) {
    return React.createElement(
      TouchableOpacity,
      {
        onPress,
        accessibilityRole: 'button',
        accessibilityLabel: title,
      },
      React.createElement(Text, null, title),
    );
  }

  return { GlassButton: MockGlassButton };
});

const defaultProps = {
  isPlaying: false,
  loading: false,
  hasTrack: true,
  error: null,
  currentPosition: 100,
  duration: 200,
  playbackRate: 1,
  onSeekTo: jest.fn(),
  onPause: jest.fn(),
  onResume: jest.fn(),
  onPlaybackRateChange: jest.fn(),
};

describe('PlayerControls', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // --- Button label rendering ---

  it('shows "▶️ Play" when not playing and not loading', () => {
    render(<PlayerControls {...defaultProps} isPlaying={false} loading={false} />);
    expect(screen.getByText('▶️ Play')).toBeOnTheScreen();
  });

  it('shows "⏸️ Pause" when playing', () => {
    render(<PlayerControls {...defaultProps} isPlaying={true} />);
    expect(screen.getByText('⏸️ Pause')).toBeOnTheScreen();
  });

  it('shows "..." when loading', () => {
    render(<PlayerControls {...defaultProps} loading={true} />);
    expect(screen.getByText('...')).toBeOnTheScreen();
  });

  it('renders seek back and seek forward buttons', () => {
    render(<PlayerControls {...defaultProps} />);
    expect(screen.getByText('⏪ -10s')).toBeOnTheScreen();
    expect(screen.getByText('⏩ +10s')).toBeOnTheScreen();
  });

  // --- Play/Pause callbacks ---

  it('calls onResume when play button pressed and has track', () => {
    render(<PlayerControls {...defaultProps} isPlaying={false} hasTrack={true} />);
    fireEvent.press(screen.getByText('▶️ Play'));
    expect(defaultProps.onResume).toHaveBeenCalledTimes(1);
    expect(defaultProps.onPause).not.toHaveBeenCalled();
  });

  it('calls onPause when pause button pressed', () => {
    render(<PlayerControls {...defaultProps} isPlaying={true} />);
    fireEvent.press(screen.getByText('⏸️ Pause'));
    expect(defaultProps.onPause).toHaveBeenCalledTimes(1);
    expect(defaultProps.onResume).not.toHaveBeenCalled();
  });

  it('does not call onResume when no track', () => {
    render(<PlayerControls {...defaultProps} isPlaying={false} hasTrack={false} />);
    fireEvent.press(screen.getByText('▶️ Play'));
    expect(defaultProps.onResume).not.toHaveBeenCalled();
  });

  // --- Seek callbacks ---

  it('calls onSeekTo with position minus 10 seconds on seek back', () => {
    const onSeekTo = jest.fn();
    // currentPosition=100, duration=200 → seek back = max(0, 100-10) = 90
    render(<PlayerControls {...defaultProps} onSeekTo={onSeekTo} currentPosition={100} duration={200} />);
    fireEvent.press(screen.getByText('⏪ -10s'));
    expect(onSeekTo).toHaveBeenCalledTimes(1);
    expect(onSeekTo).toHaveBeenCalledWith(90);
  });

  it('calls onSeekTo with position plus 10 seconds on seek forward', () => {
    const onSeekTo = jest.fn();
    // currentPosition=100, duration=200 → seek forward = min(200, 100+10) = 110
    render(<PlayerControls {...defaultProps} onSeekTo={onSeekTo} currentPosition={100} duration={200} />);
    fireEvent.press(screen.getByText('⏩ +10s'));
    expect(onSeekTo).toHaveBeenCalledTimes(1);
    expect(onSeekTo).toHaveBeenCalledWith(110);
  });

  it('clamps seek back to 0 when near start', () => {
    const onSeekTo = jest.fn();
    // currentPosition=5, duration=200 → max(0, 5-10) = 0
    render(<PlayerControls {...defaultProps} onSeekTo={onSeekTo} currentPosition={5} duration={200} />);
    fireEvent.press(screen.getByText('⏪ -10s'));
    expect(onSeekTo).toHaveBeenCalledWith(0);
  });

  it('clamps seek forward to duration when near end', () => {
    const onSeekTo = jest.fn();
    // currentPosition=195, duration=200 → min(200, 195+10) = 200
    render(<PlayerControls {...defaultProps} onSeekTo={onSeekTo} currentPosition={195} duration={200} />);
    fireEvent.press(screen.getByText('⏩ +10s'));
    expect(onSeekTo).toHaveBeenCalledWith(200);
  });

  // --- Division-by-zero guard ---

  it('does not call onSeekTo when duration is 0', () => {
    const onSeekTo = jest.fn();
    render(<PlayerControls {...defaultProps} onSeekTo={onSeekTo} duration={0} />);
    fireEvent.press(screen.getByText('⏪ -10s'));
    fireEvent.press(screen.getByText('⏩ +10s'));
    expect(onSeekTo).not.toHaveBeenCalled();
  });

  // --- Error display ---

  it('displays error message when error is provided', () => {
    render(<PlayerControls {...defaultProps} error="Something went wrong" />);
    expect(screen.getByText('Something went wrong')).toBeOnTheScreen();
  });

  it('does not display error text when error is null', () => {
    render(<PlayerControls {...defaultProps} error={null} />);
    expect(screen.queryByText('Something went wrong')).toBeNull();
  });

  // --- Playback speed ---

  it('renders speed button with current playback rate', () => {
    render(<PlayerControls {...defaultProps} playbackRate={1.5} />);
    expect(screen.getByText('1.5x')).toBeOnTheScreen();
  });

  it('calls onPlaybackRateChange with next rate when speed button pressed', () => {
    const onPlaybackRateChange = jest.fn();
    // Current rate is 1, next in cycle [1, 1.25, 1.5, 2, 0.5] is 1.25
    render(
      <PlayerControls
        {...defaultProps}
        playbackRate={1}
        onPlaybackRateChange={onPlaybackRateChange}
      />,
    );
    fireEvent.press(screen.getByText('1x'));
    expect(onPlaybackRateChange).toHaveBeenCalledWith(1.25);
  });

  it('wraps around to first rate after reaching the last', () => {
    const onPlaybackRateChange = jest.fn();
    // Current rate is 0.5 (last in cycle), next should be 1 (first)
    render(
      <PlayerControls
        {...defaultProps}
        playbackRate={0.5}
        onPlaybackRateChange={onPlaybackRateChange}
      />,
    );
    fireEvent.press(screen.getByText('0.5x'));
    expect(onPlaybackRateChange).toHaveBeenCalledWith(1);
  });
});
