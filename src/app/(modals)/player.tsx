// Player modal - Full-screen audio player (Expo Router modal)
import React, { useCallback, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GlassCard } from '../../components/ui/GlassCard';
import { PointsCounter } from '../../components/ui/PointsCounter';
import { PlayerProgress } from '../../components/challenge/PlayerProgress';
import { PlayerControls } from '../../components/challenge/PlayerControls';
import { useMusicPlayer } from '../../hooks/useMusicPlayer';
import { usePointsCounter } from '../../hooks/usePointsCounter';
import { THEME } from '../../constants/theme';

export default function PlayerModal() {
  const { 
    currentTrack, 
    isPlaying, 
    currentPosition, 
    duration, 
    pause, 
    resume, 
    seekTo,
    loading,
    error 
  } = useMusicPlayer();

  const {
    pointsEarned,
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
      // On resume, just re-activate via startCounting with the same config —
      // usePointsCounter now skips reset when challengeId hasn't changed.
      if (activeSessionRef.current !== currentTrackId) {
        activeSessionRef.current = currentTrackId;
        startCounting({ totalPoints: currentTrackPoints, durationSeconds: duration, challengeId: currentTrackId });
      } else {
        resumeCounting();
      }
    } else {
      stopCounting();
    }
  }, [isPlaying, currentTrackId, currentTrackPoints, duration, startCounting, stopCounting, resumeCounting]);

  // Refs capture latest callbacks so the unmount cleanup always calls the
  // current version — avoids stale closure and effect churn if identities change.
  const pauseRef = useRef(pause);
  pauseRef.current = pause;
  const stopCountingRef = useRef(stopCounting);
  stopCountingRef.current = stopCounting;

  // Pause playback and stop counting on unmount — prevents music playing
  // without earning points after the modal is dismissed.
  useEffect(() => {
    return () => {
      pauseRef.current();
      stopCountingRef.current();
    };
  }, []);

  const handleSeek = useCallback((percentage: number): void => {
    if (duration) {
      seekTo((percentage / 100) * duration);
    }
  }, [duration, seekTo]);

  if (!currentTrack) {
    return (
      <SafeAreaView style={styles.container}>
        <GlassCard style={styles.noTrackCard}>
          <Text style={styles.noTrackText}>No track selected</Text>
          <Text style={styles.noTrackSubtext}>
            Go back and select a challenge to start playing music
          </Text>
        </GlassCard>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Track Info */}
        <GlassCard style={styles.trackInfoCard}>
          <Text style={styles.trackTitle}>{currentTrack.title}</Text>
          <Text style={styles.trackArtist}>{currentTrack.artist}</Text>
          <Text style={styles.trackDescription}>{currentTrack.description}</Text>
          
          <View style={styles.pointsContainer}>
            <Text style={styles.pointsLabel}>Points Earned</Text>
            <View style={styles.pointsRow}>
              <PointsCounter points={pointsEarned} style={styles.pointsCounter} />
              <Text style={styles.pointsTotal}> / {currentTrack.points} pts</Text>
            </View>
          </View>
        </GlassCard>

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
          error={error}
          liveProgress={liveProgress}
          duration={duration}
          onSeek={handleSeek}
          onPause={pause}
          onResume={resume}
        />

        {/* Challenge Status */}
        <GlassCard style={styles.challengeCard}>
          <Text style={styles.challengeLabel}>Challenge Status</Text>
          <View style={styles.challengeInfo}>
            <Text style={[
              styles.challengeStatus,
              { color: currentTrack.completed ? THEME.colors.secondary : THEME.colors.accent }
            ]}>
              {currentTrack.completed ? '✅ Completed' : '🎧 In Progress'}
            </Text>
            <Text style={styles.challengeProgress}>
              {Math.round(liveProgress)}% of challenge complete
            </Text>
          </View>
        </GlassCard>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.colors.background,
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
    color: THEME.colors.text.primary,
    marginBottom: THEME.spacing.sm,
  },
  noTrackSubtext: {
    fontSize: THEME.fonts.sizes.md,
    color: THEME.colors.text.secondary,
    textAlign: 'center',
  },
  trackInfoCard: {
    alignItems: 'center',
  },
  trackTitle: {
    fontSize: THEME.fonts.sizes.xxl,
    fontWeight: 'bold',
    color: THEME.colors.text.primary,
    textAlign: 'center',
    marginBottom: THEME.spacing.xs,
  },
  trackArtist: {
    fontSize: THEME.fonts.sizes.lg,
    color: THEME.colors.text.secondary,
    marginBottom: THEME.spacing.md,
  },
  trackDescription: {
    fontSize: THEME.fonts.sizes.sm,
    color: THEME.colors.text.tertiary,
    textAlign: 'center',
    marginBottom: THEME.spacing.lg,
  },
  pointsContainer: {
    alignItems: 'center',
  },
  pointsLabel: {
    fontSize: THEME.fonts.sizes.sm,
    color: THEME.colors.text.secondary,
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
    color: THEME.colors.text.secondary,
  },
  challengeCard: {
    // Card styling handled by GlassCard
  },
  challengeLabel: {
    fontSize: THEME.fonts.sizes.md,
    fontWeight: '600',
    color: THEME.colors.text.primary,
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
    color: THEME.colors.text.secondary,
  },
});