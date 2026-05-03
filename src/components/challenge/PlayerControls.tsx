import React, { useCallback, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import { THEME } from '../../constants/theme';
import { IconButton } from '../ui/IconButton';

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
    const { colors } = useTheme();
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
      <View style={styles.container}>
        <View style={styles.controlsRow}>
          <IconButton
            onPress={handleSpeedChange}
            accessibilityLabel={`${playbackRate}x`}
            accessibilityHint={`Current speed ${playbackRate}x. Double tap to change playback speed`}
            disabled={loading || !hasTrack}
          >
            <Text style={[styles.speedText, { color: colors.textSecondary }]}>{playbackRate}x</Text>
          </IconButton>

          <IconButton
            onPress={handleSeekBack}
            accessibilityLabel="Seek back 10 seconds"
            accessibilityHint="Double tap to seek back 10 seconds"
          >
            <View style={[styles.seekButtonInner, styles.seekBackMirror]}>
              <Ionicons
                name="refresh-outline"
                size={44}
                color={colors.textPrimary}
                accessible={false}
              />
              <Text
                style={[styles.seekLabel, styles.seekLabelMirror, { color: colors.textPrimary }]}
              >
                10
              </Text>
            </View>
          </IconButton>

          <TouchableOpacity
            onPress={handlePlayPause}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel={isPlaying ? 'Pause' : 'Play'}
            accessibilityHint={isPlaying ? 'Double tap to pause' : 'Double tap to play'}
            style={[styles.playButton, { backgroundColor: colors.textPrimary }]}
          >
            {loading ? (
              <ActivityIndicator
                color={colors.surfacePrimary}
                size="small"
                accessibilityRole="progressbar"
                accessibilityLabel="Loading playback"
              />
            ) : (
              <Ionicons
                name={isPlaying ? 'pause' : 'play'}
                size={32}
                color={colors.surfacePrimary}
                accessible={false}
              />
            )}
          </TouchableOpacity>

          <IconButton
            onPress={handleSeekForward}
            accessibilityLabel="Seek forward 10 seconds"
            accessibilityHint="Double tap to seek forward 10 seconds"
          >
            <View style={styles.seekButtonInner}>
              <Ionicons
                name="refresh-outline"
                size={44}
                color={colors.textPrimary}
                accessible={false}
              />
              <Text style={[styles.seekLabel, { color: colors.textPrimary }]}>10</Text>
            </View>
          </IconButton>

          <View style={styles.controlsSpacer} accessible={false} />
        </View>
      </View>
    );
  },
);

PlayerControls.displayName = 'PlayerControls';

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: THEME.spacing.lg,
  },
  controlsRow: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
  },
  playButton: {
    width: THEME.sizing.playButton,
    height: THEME.sizing.playButton,
    borderRadius: THEME.sizing.playButton / 2,
    justifyContent: 'center',
    alignItems: 'center',
    // Shadow values are intentional visual constants — no spacing token maps to depth/blur.
    shadowColor: THEME.shadow.color,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  controlsSpacer: {
    width: THEME.sizing.iconButton,
    height: THEME.sizing.iconButton,
  },
  seekButtonInner: {
    width: THEME.sizing.iconButton,
    height: THEME.sizing.iconButton,
    alignItems: 'center',
    justifyContent: 'center',
  },
  seekBackMirror: {
    transform: [{ scaleX: -1 }],
  },
  seekLabel: {
    position: 'absolute',
    fontSize: THEME.fonts.sizes.xs,
    fontWeight: '700',
    top: THEME.sizing.seekLabelOffset,
  },
  seekLabelMirror: {
    transform: [{ scaleX: -1 }],
  },
  speedText: {
    fontSize: THEME.fonts.sizes.lg,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});
