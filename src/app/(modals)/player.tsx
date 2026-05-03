import React, { useCallback, useEffect, useRef } from 'react';
import { Text, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GlassCard } from '../../components/ui/GlassCard';
import { GlassButton } from '../../components/ui/GlassButton';
import { PlayerProgress } from '../../components/challenge/PlayerProgress';
import { PlayerControls } from '../../components/challenge/PlayerControls';
import { TrackInfoCard } from '../../components/challenge/TrackInfoCard';
import { ChallengeStatusCard } from '../../components/challenge/ChallengeStatusCard';
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

  const currentTrackId = currentTrack?.id;
  const currentTrackPoints = currentTrack?.points;

  const activeSessionRef = useRef<string | null>(null);

  useEffect(() => {
    if (!currentTrackId || currentTrackPoints == null || !duration || duration <= 0) return;

    if (isPlaying) {
      // startCounting resets progress — only call when the track changes.
      // resumeCounting re-activates without resetting.
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

  const pauseRef = useRef(pause);
  pauseRef.current = pause;
  const stopCountingRef = useRef(stopCounting);
  stopCountingRef.current = stopCounting;

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
      // play() sets error state internally; catch prevents unhandled rejection.
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
          <TrackInfoCard track={currentTrack} currentPoints={currentPoints} />

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

          <View style={styles.bottomSection}>
            {/* Progress — use max(liveProgress, positionBased) so seek while paused is instant */}
            <PlayerProgress
              liveProgress={
                duration > 0
                  ? Math.max(liveProgress, (currentPosition / duration) * 100)
                  : liveProgress
              }
              currentPosition={currentPosition}
              duration={duration}
              onSeek={handleSeek}
            />

            <PlayerControls
              isPlaying={isPlaying}
              loading={loading}
              hasTrack={true}
              currentPosition={currentPosition}
              duration={duration}
              playbackRate={playbackRate}
              onSeekTo={seekTo}
              onPause={pause}
              onResume={resume}
              onPlaybackRateChange={setPlaybackRate}
            />

            <ChallengeStatusCard
              completed={currentTrack.completed}
              progressPercent={liveProgress}
            />
          </View>
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
    paddingTop: THEME.spacing.md,
    justifyContent: 'space-between',
  },
  bottomSection: {
    gap: THEME.spacing.md,
    paddingHorizontal: 0,
    paddingBottom: THEME.spacing.lg,
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
