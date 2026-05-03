import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { PlayerControls } from '../../../src/components/challenge/PlayerControls';

jest.mock('../../../src/hooks/useTheme', () => ({
  useTheme: () => ({
    colors: {
      textPrimary: '#ffffff',
      textSecondary: '#aaaaaa',
      surfacePrimary: '#1a1a1a',
    },
  }),
}));

jest.mock('@expo/vector-icons', () => {
  /* eslint-disable @typescript-eslint/no-require-imports */
  const React = require('react');
  const { View } = require('react-native');
  /* eslint-enable @typescript-eslint/no-require-imports */
  return {
    Ionicons: ({ accessible }: { accessible?: boolean }) =>
      React.createElement(View, { accessible: accessible ?? true }),
  };
});

jest.mock('../../../src/utils/haptics', () => ({
  hapticLight: jest.fn(),
}));

const defaultProps = {
  isPlaying: false,
  loading: false,
  hasTrack: true,
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

  it('shows "Play" when not playing and not loading', () => {
    render(<PlayerControls {...defaultProps} isPlaying={false} loading={false} />);
    expect(screen.getByRole('button', { name: 'Play' })).toBeOnTheScreen();
  });

  it('shows "Pause" when playing', () => {
    render(<PlayerControls {...defaultProps} isPlaying={true} />);
    expect(screen.getByRole('button', { name: 'Pause' })).toBeOnTheScreen();
  });

  it('shows "..." when loading', () => {
    render(<PlayerControls {...defaultProps} loading={true} />);
    const playBtn = screen.getByRole('button', { name: 'Play' });
    expect(playBtn).toBeOnTheScreen();
    expect(screen.getByLabelText('Loading playback')).toBeOnTheScreen();
  });

  it('renders seek back and seek forward buttons', () => {
    render(<PlayerControls {...defaultProps} />);
    expect(screen.getByRole('button', { name: 'Seek back 10 seconds' })).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Seek forward 10 seconds' })).toBeOnTheScreen();
  });

  it('calls onResume when play button pressed and has track', () => {
    render(<PlayerControls {...defaultProps} isPlaying={false} hasTrack={true} />);
    fireEvent.press(screen.getByRole('button', { name: 'Play' }));
    expect(defaultProps.onResume).toHaveBeenCalledTimes(1);
    expect(defaultProps.onPause).not.toHaveBeenCalled();
  });

  it('calls onPause when pause button pressed', () => {
    render(<PlayerControls {...defaultProps} isPlaying={true} />);
    fireEvent.press(screen.getByRole('button', { name: 'Pause' }));
    expect(defaultProps.onPause).toHaveBeenCalledTimes(1);
    expect(defaultProps.onResume).not.toHaveBeenCalled();
  });

  it('does not call onResume when no track', () => {
    render(<PlayerControls {...defaultProps} isPlaying={false} hasTrack={false} />);
    fireEvent.press(screen.getByRole('button', { name: 'Play' }));
    expect(defaultProps.onResume).not.toHaveBeenCalled();
  });

  it('calls onSeekTo with position minus 10 seconds on seek back', () => {
    const onSeekTo = jest.fn();
    render(
      <PlayerControls {...defaultProps} onSeekTo={onSeekTo} currentPosition={100} duration={200} />,
    );
    fireEvent.press(screen.getByRole('button', { name: 'Seek back 10 seconds' }));
    expect(onSeekTo).toHaveBeenCalledTimes(1);
    expect(onSeekTo).toHaveBeenCalledWith(90);
  });

  it('calls onSeekTo with position plus 10 seconds on seek forward', () => {
    const onSeekTo = jest.fn();
    render(
      <PlayerControls {...defaultProps} onSeekTo={onSeekTo} currentPosition={100} duration={200} />,
    );
    fireEvent.press(screen.getByRole('button', { name: 'Seek forward 10 seconds' }));
    expect(onSeekTo).toHaveBeenCalledTimes(1);
    expect(onSeekTo).toHaveBeenCalledWith(110);
  });

  it('clamps seek back to 0 when near start', () => {
    const onSeekTo = jest.fn();
    render(
      <PlayerControls {...defaultProps} onSeekTo={onSeekTo} currentPosition={5} duration={200} />,
    );
    fireEvent.press(screen.getByRole('button', { name: 'Seek back 10 seconds' }));
    expect(onSeekTo).toHaveBeenCalledWith(0);
  });

  it('clamps seek forward to duration when near end', () => {
    const onSeekTo = jest.fn();
    render(
      <PlayerControls {...defaultProps} onSeekTo={onSeekTo} currentPosition={195} duration={200} />,
    );
    fireEvent.press(screen.getByRole('button', { name: 'Seek forward 10 seconds' }));
    expect(onSeekTo).toHaveBeenCalledWith(200);
  });

  it('does not call onSeekTo when duration is 0', () => {
    const onSeekTo = jest.fn();
    render(<PlayerControls {...defaultProps} onSeekTo={onSeekTo} duration={0} />);
    fireEvent.press(screen.getByRole('button', { name: 'Seek back 10 seconds' }));
    fireEvent.press(screen.getByRole('button', { name: 'Seek forward 10 seconds' }));
    expect(onSeekTo).not.toHaveBeenCalled();
  });

  it('renders speed button with current playback rate', () => {
    render(<PlayerControls {...defaultProps} playbackRate={1.5} />);
    expect(screen.getByText('1.5x')).toBeOnTheScreen();
  });

  it('calls onPlaybackRateChange with next rate when speed button pressed', () => {
    const onPlaybackRateChange = jest.fn();
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
