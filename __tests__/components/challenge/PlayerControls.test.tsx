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
  liveProgress: 50,
  duration: 200,
  playbackRate: 1,
  onSeek: jest.fn(),
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

  it('calls onSeek with decreased percentage on seek back', () => {
    const onSeek = jest.fn();
    // duration=200, liveProgress=50 → seek back = 50 - (10/200)*100 = 45
    render(<PlayerControls {...defaultProps} onSeek={onSeek} liveProgress={50} duration={200} />);
    fireEvent.press(screen.getByText('⏪ -10s'));
    expect(onSeek).toHaveBeenCalledTimes(1);
    expect(onSeek).toHaveBeenCalledWith(45);
  });

  it('calls onSeek with increased percentage on seek forward', () => {
    const onSeek = jest.fn();
    // duration=200, liveProgress=50 → seek forward = 50 + (10/200)*100 = 55
    render(<PlayerControls {...defaultProps} onSeek={onSeek} liveProgress={50} duration={200} />);
    fireEvent.press(screen.getByText('⏩ +10s'));
    expect(onSeek).toHaveBeenCalledTimes(1);
    expect(onSeek).toHaveBeenCalledWith(55);
  });

  it('clamps seek back to 0 when near start', () => {
    const onSeek = jest.fn();
    // duration=200, liveProgress=2 → 2 - 5 = -3 → clamped to 0
    render(<PlayerControls {...defaultProps} onSeek={onSeek} liveProgress={2} duration={200} />);
    fireEvent.press(screen.getByText('⏪ -10s'));
    expect(onSeek).toHaveBeenCalledWith(0);
  });

  it('clamps seek forward to 100 when near end', () => {
    const onSeek = jest.fn();
    // duration=200, liveProgress=98 → 98 + 5 = 103 → clamped to 100
    render(<PlayerControls {...defaultProps} onSeek={onSeek} liveProgress={98} duration={200} />);
    fireEvent.press(screen.getByText('⏩ +10s'));
    expect(onSeek).toHaveBeenCalledWith(100);
  });

  // --- Division-by-zero guard ---

  it('does not call onSeek when duration is 0', () => {
    const onSeek = jest.fn();
    render(<PlayerControls {...defaultProps} onSeek={onSeek} duration={0} />);
    fireEvent.press(screen.getByText('⏪ -10s'));
    fireEvent.press(screen.getByText('⏩ +10s'));
    expect(onSeek).not.toHaveBeenCalled();
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
