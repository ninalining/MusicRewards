// Player modal - Full-screen audio player (Expo Router modal)
import React, { useCallback, useEffect, useRef } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GlassCard } from '../../components/ui/GlassCard';
import { GlassButton } from '../../components/ui/GlassButton';
import { PointsCounter } from '../../components/ui/PointsCounter';
import { PlayerProgress } from '../../components/challenge/PlayerProgress';
import { PlayerControls } from '../../components/challenge/PlayerControls';
import { ErrorBoundary } from '../../components/ui/ErrorBoundary';
import { useMusicPlayer } from '../../hooks/useMusicPlayer';
import { usePointsCounter } from '../../hooks/usePointsCounter';
import { useTheme } from '../../hooks/useTheme';
import { THEME } from '../../constants/theme';

export default function PlayerModal(): React.ReactElement {
  const { colors } = useTheme();
  const {
    currentTrack,
    isPlaying,
    currentPosition,
    duration,
    playbackRate,
    play,
    pause,
    resume,
    seekTo,
    setPlaybackRate,
    loading,
    error,
  } = useMusicPlayer();

  const {
    currentPoints,
    progress: liveProgress,
    startCounting,
    stopCounting,
    resumeCounting,
  } = usePointsCounter();

  // Start / stop counting based on playback state and track (T008)
  // Depend on primitives (id, points) to avoid restarting when store creates new object refs.
  const currentTrackId = currentTrack?.id;
  const currentTrackPoints = currentTrack?.points;

  // Track which challengeId is actively counting — distinguishes start vs resume.
  const activeSessionRef = useRef<string | null>(null);

  useEffect(() => {
    if (!currentTrackId || currentTrackPoints == null || !duration || duration <= 0) return;

    if (isPlaying) {
      // Only call startCounting (which resets progress) when the track changes.
      // On resume of the same track, call resumeCounting() which re-activates
      // without resetting accumulated progress.
      if (activeSessionRef.current !== currentTrackId) {
        activeSessionRef.current = currentTrackId;
        startCounting({
          totalPoints: currentTrackPoints,
          durationSeconds: duration,
          challengeId: currentTrackId,
        });
      } else {
        resumeCounting();
      }
    } else {
      stopCounting();
    }
  }, [
    isPlaying,
    currentTrackId,
    currentTrackPoints,
    duration,
    startCounting,
    stopCounting,
    resumeCounting,
  ]);

  // Refs capture latest callbacks so the unmount cleanup always calls the
  // current version — avoids stale closure and effect churn if identities change.
  const pauseRef = useRef(pause);
  pauseRef.current = pause;
  const stopCountingRef = useRef(stopCounting);
  stopCountingRef.current = stopCounting;

  // Pause playback and stop counting on unmount — prevents music playing
  // without earning points after the modal is dismissed.
  // Resources released: TrackPlayer paused (not reset — Constitution Rule #3 exception),
  // points counter deactivated (no more delta awards).
  useEffect(() => {
    return () => {
      pauseRef.current();
      stopCountingRef.current();
    };
  }, []);

  const handleSeek = useCallback(
    (percentage: number): void => {
      if (duration) {
        seekTo((percentage / 100) * duration);
      }
    },
    [duration, seekTo],
  );

  const handleRetry = useCallback(async (): Promise<void> => {
    if (!currentTrack) return;
    try {
      await play(currentTrack);
    } catch {
      // play() already sets error state internally; catch here to prevent
      // an unhandled promise rejection from the retry button.
    }
  }, [currentTrack, play]);

  if (!currentTrack) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.surfacePrimary }]}>
        <ErrorBoundary>
          <GlassCard style={styles.noTrackCard}>
            <Text style={[styles.noTrackText, { color: colors.textPrimary }]}>
              No track selected
            </Text>
            <Text style={[styles.noTrackSubtext, { color: colors.textSecondary }]}>
              Go back and select a challenge to start playing music
            </Text>
          </GlassCard>
        </ErrorBoundary>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.surfacePrimary }]}>
      <ErrorBoundary>
        <View style={styles.content}>
          {/* Track Info */}
          <GlassCard style={styles.trackInfoCard}>
            <Text style={[styles.trackTitle, { color: colors.textPrimary }]}>
              {currentTrack.title}
            </Text>
            <Text style={[styles.trackArtist, { color: colors.textSecondary }]}>
              {currentTrack.artist}
            </Text>
            <Text style={[styles.trackDescription, { color: colors.textTertiary }]}>
              {currentTrack.description}
            </Text>

            <View style={styles.pointsContainer}>
              <Text style={[styles.pointsLabel, { color: colors.textSecondary }]}>
                Points Earned
              </Text>
              <View style={styles.pointsRow}>
                <PointsCounter points={currentPoints} style={styles.pointsCounter} />
                <Text style={[styles.pointsTotal, { color: colors.textSecondary }]}>
                  {' '}
                  / {currentTrack.points} pts
                </Text>
              </View>
            </View>
          </GlassCard>

          {/* Error Banner */}
          {error && (
            <GlassCard style={styles.errorBanner}>
              <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
              <GlassButton
                title="Retry"
                onPress={handleRetry}
                variant="secondary"
                style={styles.retryButton}
                accessibilityHint="Double tap to retry playback"
              />
            </GlassCard>
          )}

          {/* Progress Section */}
          <PlayerProgress
            liveProgress={liveProgress}
            currentPosition={currentPosition}
            duration={duration}
            onSeek={handleSeek}
          />

          {/* Controls */}
          <PlayerControls
            isPlaying={isPlaying}
            loading={loading}
            hasTrack={true}
            error={null}
            currentPosition={currentPosition}
            duration={duration}
            playbackRate={playbackRate}
            onSeekTo={seekTo}
            onPause={pause}
            onResume={resume}
            onPlaybackRateChange={setPlaybackRate}
          />

          {/* Challenge Status */}
          <GlassCard style={styles.challengeCard}>
            <Text style={[styles.challengeLabel, { color: colors.textPrimary }]}>
              Challenge Status
            </Text>
            <View style={styles.challengeInfo}>
              <Text
                style={[
                  styles.challengeStatus,
                  { color: currentTrack.completed ? colors.brandSecondary : colors.brandAccent },
                ]}
              >
                {currentTrack.completed ? '✅ Completed' : '🎧 In Progress'}
              </Text>
              <Text style={[styles.challengeProgress, { color: colors.textSecondary }]}>
                {Math.round(liveProgress)}% of challenge complete
              </Text>
            </View>
          </GlassCard>
        </View>
      </ErrorBoundary>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: THEME.spacing.lg,
    justifyContent: 'space-between',
  },
  noTrackCard: {
    margin: THEME.spacing.xl,
    alignItems: 'center',
  },
  noTrackText: {
    fontSize: THEME.fonts.sizes.xl,
    fontWeight: 'bold',
    marginBottom: THEME.spacing.sm,
  },
  noTrackSubtext: {
    fontSize: THEME.fonts.sizes.md,
    textAlign: 'center',
  },
  trackInfoCard: {
    alignItems: 'center',
  },
  trackTitle: {
    fontSize: THEME.fonts.sizes.xxl,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: THEME.spacing.xs,
  },
  trackArtist: {
    fontSize: THEME.fonts.sizes.lg,
    marginBottom: THEME.spacing.md,
  },
  trackDescription: {
    fontSize: THEME.fonts.sizes.sm,
    textAlign: 'center',
    marginBottom: THEME.spacing.lg,
  },
  pointsContainer: {
    alignItems: 'center',
  },
  pointsLabel: {
    fontSize: THEME.fonts.sizes.sm,
  },
  pointsRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  pointsCounter: {
    // internal sizing handled by PointsCounter
  },
  pointsTotal: {
    fontSize: THEME.fonts.sizes.lg,
  },
  challengeCard: {
    // Card styling handled by GlassCard
  },
  challengeLabel: {
    fontSize: THEME.fonts.sizes.md,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: THEME.spacing.md,
  },
  challengeInfo: {
    alignItems: 'center',
  },
  challengeStatus: {
    fontSize: THEME.fonts.sizes.lg,
    fontWeight: 'bold',
    marginBottom: THEME.spacing.xs,
  },
  challengeProgress: {
    fontSize: THEME.fonts.sizes.sm,
  },
  errorBanner: {
    marginHorizontal: THEME.spacing.md,
    marginTop: THEME.spacing.sm,
    padding: THEME.spacing.md,
    alignItems: 'center',
  },
  errorText: {
    fontSize: THEME.fonts.sizes.sm,
    textAlign: 'center',
    marginBottom: THEME.spacing.sm,
  },
  retryButton: {
    minWidth: 120,
  },
});
