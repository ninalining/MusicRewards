import React, { useCallback, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { GlassCard } from '../ui/GlassCard';
import { THEME } from '../../constants/theme';
import { useTheme } from '../../hooks/useTheme';
import { calculateHitSlop } from '../../utils/accessibility';

// Defined at module scope to avoid recreation on each render.
const formatTime = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
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
      <GlassCard style={styles.progressCard}>
        <Text style={[styles.progressLabel, { color: colors.textPrimary }]}>
          Listening Progress
        </Text>

        <TouchableOpacity
          style={styles.progressTrack}
          accessibilityRole="button"
          accessibilityLabel="Seek playback position"
          accessibilityHint="Double tap to seek to this position"
          hitSlop={calculateHitSlop(THEME.spacing.sm)}
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
        </TouchableOpacity>

        <View style={styles.timeContainer}>
          <Text style={[styles.timeText, { color: colors.textSecondary }]}>
            {formatTime(currentPosition)}
          </Text>
          <Text style={[styles.timeText, { color: colors.textSecondary }]}>
            {formatTime(duration)}
          </Text>
        </View>

        <Text style={[styles.progressPercentage, { color: colors.brandAccent }]}>
          {Math.round(liveProgress)}% Complete
        </Text>
      </GlassCard>
    );
  },
);

PlayerProgress.displayName = 'PlayerProgress';

const styles = StyleSheet.create({
  progressCard: {},
  progressLabel: {
    fontSize: THEME.fonts.sizes.md,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: THEME.spacing.md,
  },
  progressTrack: {
    marginBottom: THEME.spacing.md,
  },
  progressBackground: {
    height: THEME.spacing.sm,
    borderRadius: THEME.spacing.xs,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: THEME.spacing.xs,
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: THEME.spacing.sm,
  },
  timeText: {
    fontSize: THEME.fonts.sizes.sm,
  },
  progressPercentage: {
    fontSize: THEME.fonts.sizes.lg,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
