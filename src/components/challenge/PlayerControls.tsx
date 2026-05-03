import React, { useCallback, useRef } from 'react';
import { View, StyleSheet } from 'react-native';
import { GlassCard } from '../ui/GlassCard';
import { GlassButton } from '../ui/GlassButton';
import { THEME } from '../../constants/theme';

interface PlayerControlsProps {
  isPlaying: boolean;
  loading: boolean;
  hasTrack: boolean;
  currentPosition: number;
  duration: number;
  playbackRate: number;
  onSeekTo: (seconds: number) => void;
  onPause: () => void;
  onResume: () => void;
  onPlaybackRateChange: (rate: number) => void;
}

const PLAYBACK_RATES = [1, 1.25, 1.5, 2, 0.5] as const;

const getNextRate = (current: number): number => {
  const index = PLAYBACK_RATES.findIndex((r) => r === current);
  return PLAYBACK_RATES[(index + 1) % PLAYBACK_RATES.length];
};

export const PlayerControls = React.memo<PlayerControlsProps>(
  ({
    isPlaying,
    loading,
    hasTrack,
    currentPosition,
    duration,
    playbackRate,
    onSeekTo,
    onPause,
    onResume,
    onPlaybackRateChange,
  }) => {
    // Ref avoids recreating seek callbacks every 250ms as position updates.
    const positionRef = useRef(currentPosition);
    positionRef.current = currentPosition;

    const handlePlayPause = useCallback((): void => {
      if (isPlaying) {
        onPause();
      } else if (hasTrack) {
        onResume();
      }
    }, [isPlaying, hasTrack, onPause, onResume]);

    const handleSeekBack = useCallback((): void => {
      if (!duration || duration <= 0) return;
      onSeekTo(Math.max(0, positionRef.current - 10));
    }, [onSeekTo, duration]);

    const handleSeekForward = useCallback((): void => {
      if (!duration || duration <= 0) return;
      onSeekTo(Math.min(duration, positionRef.current + 10));
    }, [onSeekTo, duration]);

    const handleSpeedChange = useCallback((): void => {
      onPlaybackRateChange(getNextRate(playbackRate));
    }, [onPlaybackRateChange, playbackRate]);

    return (
      <GlassCard style={styles.controlsCard}>
        <View style={styles.controlsRow}>
          <GlassButton
            title="-10s"
            onPress={handleSeekBack}
            variant="secondary"
            style={styles.controlButton}
            accessibilityHint="Double tap to seek back 10 seconds"
          />

          <GlassButton
            title={loading ? '...' : isPlaying ? 'Pause' : 'Play'}
            onPress={handlePlayPause}
            variant="primary"
            style={styles.mainControlButton}
            loading={loading}
            accessibilityHint={isPlaying ? 'Double tap to pause' : 'Double tap to play'}
          />

          <GlassButton
            title="+10s"
            onPress={handleSeekForward}
            variant="secondary"
            style={styles.controlButton}
            accessibilityHint="Double tap to seek forward 10 seconds"
          />
        </View>

        <View style={styles.speedRow}>
          <GlassButton
            title={`${playbackRate}x`}
            onPress={handleSpeedChange}
            disabled={loading || !hasTrack}
            variant="secondary"
            style={styles.speedButton}
            accessibilityHint={`Current speed ${playbackRate}x. Double tap to change playback speed`}
          />
        </View>
      </GlassCard>
    );
  },
);

PlayerControls.displayName = 'PlayerControls';

const styles = StyleSheet.create({
  controlsCard: {},
  controlsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  controlButton: {
    flex: 0.25,
    marginHorizontal: THEME.spacing.xs,
  },
  mainControlButton: {
    flex: 0.4,
    marginHorizontal: THEME.spacing.xs,
  },
  speedRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: THEME.spacing.sm,
  },
  speedButton: {
    minWidth: THEME.spacing.xxl * 2,
  },
});
