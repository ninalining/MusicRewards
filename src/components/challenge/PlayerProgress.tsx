import React, { useCallback, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { THEME } from '../../constants/theme';
import { useTheme } from '../../hooks/useTheme';
import { calculateHitSlop } from '../../utils/accessibility';

const formatTime = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
};

const formatRemaining = (remaining: number): string => {
  if (!Number.isFinite(remaining)) return '-0:00';
  const r = Math.max(0, remaining);
  const minutes = Math.floor(r / 60);
  const secs = Math.floor(r % 60);
  return `-${minutes}:${secs.toString().padStart(2, '0')}`;
};

interface PlayerProgressProps {
  liveProgress: number;
  currentPosition: number;
  duration: number;
  onSeek: (percentage: number) => void;
}

export const PlayerProgress = React.memo<PlayerProgressProps>(
  ({ liveProgress, currentPosition, duration, onSeek }) => {
    const { colors } = useTheme();
    const progressBarWidth = useRef<number>(0);
    const progressAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
      progressAnim.stopAnimation();
      Animated.timing(progressAnim, {
        toValue: liveProgress,
        duration: 250,
        useNativeDriver: false,
      }).start();
    }, [liveProgress, progressAnim]);

    const handleProgressBarPress = useCallback(
      (event: { nativeEvent: { locationX: number } }): void => {
        if (progressBarWidth.current === 0) return;
        const rawPercentage = (event.nativeEvent.locationX / progressBarWidth.current) * 100;
        const percentage = Math.max(0, Math.min(100, rawPercentage));
        onSeek(percentage);
      },
      [onSeek],
    );

    const handleLayout = useCallback((e: { nativeEvent: { layout: { width: number } } }): void => {
      progressBarWidth.current = e.nativeEvent.layout.width;
    }, []);

    return (
      <View style={styles.container}>
        <TouchableOpacity
          style={styles.progressTrack}
          accessibilityRole="button"
          accessibilityLabel="Seek playback position"
          accessibilityHint="Double tap to seek to this position"
          hitSlop={calculateHitSlop(THEME.spacing.md)}
          onLayout={handleLayout}
          onPress={handleProgressBarPress}
        >
          <View style={[styles.progressBackground, { backgroundColor: colors.surfaceGlass }]}>
            <Animated.View
              style={[
                styles.progressFill,
                { backgroundColor: colors.brandAccent },
                {
                  width: progressAnim.interpolate({
                    inputRange: [0, 100],
                    outputRange: ['0%', '100%'],
                    extrapolate: 'clamp',
                  }),
                },
              ]}
            />
          </View>

          <Animated.View
            style={[
              styles.thumb,
              { backgroundColor: colors.brandAccent },
              {
                left: progressAnim.interpolate({
                  inputRange: [0, 100],
                  outputRange: ['0%', '100%'],
                  extrapolate: 'clamp',
                }),
              },
            ]}
            accessible={false}
          />
        </TouchableOpacity>

        <View style={styles.timeContainer}>
          <Text style={[styles.timeText, { color: colors.textSecondary }]}>
            {formatTime(currentPosition)}
          </Text>
          <Text style={[styles.timeText, { color: colors.textSecondary }]}>
            {formatRemaining(duration - currentPosition)}
          </Text>
        </View>
      </View>
    );
  },
);

PlayerProgress.displayName = 'PlayerProgress';

const THUMB_SIZE = THEME.sizing.progressThumb;

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: THEME.spacing.lg,
  },
  progressTrack: {
    marginBottom: THEME.spacing.sm,
    paddingVertical: THUMB_SIZE / 2,
    justifyContent: 'center',
  },
  progressBackground: {
    height: THEME.sizing.progressTrackHeight,
    borderRadius: THEME.sizing.progressTrackRadius,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: THEME.sizing.progressTrackRadius,
  },
  thumb: {
    position: 'absolute',
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: THUMB_SIZE / 2,
    marginTop: -THUMB_SIZE / 2 + 2,
    marginLeft: -THUMB_SIZE / 2,
    // Shadow values are intentional visual constants — no spacing token maps to depth/blur.
    shadowColor: THEME.shadow.color,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.25,
    shadowRadius: 2,
    elevation: 3,
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  timeText: {
    fontSize: THEME.fonts.sizes.sm,
  },
});
