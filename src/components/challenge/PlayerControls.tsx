// PlayerControls — play/pause and seek buttons for the player modal
import React, { useCallback } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { GlassCard } from '../ui/GlassCard';
import { GlassButton } from '../ui/GlassButton';
import { THEME } from '../../constants/theme';

interface PlayerControlsProps {
  isPlaying: boolean;
  loading: boolean;
  hasTrack: boolean;
  error: string | null;
  liveProgress: number;
  duration: number;
  onSeek: (percentage: number) => void;
  onPause: () => void;
  onResume: () => void;
}

export const PlayerControls = React.memo<PlayerControlsProps>(
  ({ isPlaying, loading, hasTrack, error, liveProgress, duration, onSeek, onPause, onResume }) => {
    const handlePlayPause = useCallback((): void => {
      if (isPlaying) {
        onPause();
      } else if (hasTrack) {
        onResume();
      }
    }, [isPlaying, hasTrack, onPause, onResume]);

    const handleSeekBack = useCallback((): void => {
      if (!duration || duration <= 0) return;
      onSeek(Math.max(0, liveProgress - (10 / duration) * 100));
    }, [onSeek, liveProgress, duration]);

    const handleSeekForward = useCallback((): void => {
      if (!duration || duration <= 0) return;
      onSeek(Math.min(100, liveProgress + (10 / duration) * 100));
    }, [onSeek, liveProgress, duration]);

    return (
      <GlassCard style={styles.controlsCard}>
        <View style={styles.controlsRow}>
          <GlassButton
            title="⏪ -10s"
            onPress={handleSeekBack}
            variant="secondary"
            style={styles.controlButton}
          />

          <GlassButton
            title={loading ? '...' : isPlaying ? '⏸️ Pause' : '▶️ Play'}
            onPress={handlePlayPause}
            variant="primary"
            style={styles.mainControlButton}
            loading={loading}
          />

          <GlassButton
            title="⏩ +10s"
            onPress={handleSeekForward}
            variant="secondary"
            style={styles.controlButton}
          />
        </View>

        {error && <Text style={styles.errorText}>{error}</Text>}
      </GlassCard>
    );
  },
);

PlayerControls.displayName = 'PlayerControls';

const styles = StyleSheet.create({
  controlsCard: {
    // Card styling handled by GlassCard
  },
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
  errorText: {
    color: THEME.colors.error,
    fontSize: THEME.fonts.sizes.sm,
    textAlign: 'center',
    marginTop: THEME.spacing.md,
  },
});
