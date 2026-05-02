// Home screen - Challenge list (Expo Router)
import React, { useCallback } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { ChallengeList } from '../../components/challenge/ChallengeList';
import { ErrorBoundary } from '../../components/ui/ErrorBoundary';
import { useMusicPlayer } from '../../hooks/useMusicPlayer';
import { useChallenges } from '../../hooks/useChallenges';
import { useMusicStore } from '../../stores/musicStore';
import { useToastStore } from '../../stores/toastStore';
import { useShallow } from 'zustand/react/shallow';
import { useTheme } from '../../hooks/useTheme';
import { THEME } from '../../constants/theme';
import type { MusicChallenge } from '../../types';

export default function HomeScreen() {
  const { challenges, loading } = useChallenges();
  const { currentTrack, isPlaying } = useMusicStore(
    useShallow((s) => ({
      currentTrack: s.currentTrack,
      isPlaying: s.isPlaying,
    })),
  );
  const { play, resume } = useMusicPlayer();
  const { colors } = useTheme();
  const showToast = useToastStore((s) => s.showToast);

  const currentTrackId = currentTrack?.id;

  const handlePressChallenge = useCallback((challenge: MusicChallenge): void => {
    router.push(`/(modals)/challenge-detail?challengeId=${challenge.id}`);
  }, []);

  const handlePlayChallenge = useCallback(
    async (challenge: MusicChallenge): Promise<void> => {
      try {
        if (currentTrackId === challenge.id) {
          await resume();
        } else {
          await play(challenge);
        }
        router.push('/(modals)/player');
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to start playback';
        showToast(message, 'error');
      }
    },
    [play, resume, currentTrackId, showToast],
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.surfacePrimary }]}>
      <ErrorBoundary>
        <Text style={[styles.header, { color: colors.textPrimary }]}>Music Challenges</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Complete listening challenges to earn points and unlock achievements
        </Text>
        <ChallengeList
          challenges={challenges}
          loading={loading}
          onPlay={handlePlayChallenge}
          onPressChallenge={handlePressChallenge}
          currentTrackId={currentTrack?.id}
          isPlaying={isPlaying}
        />
      </ErrorBoundary>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: THEME.spacing.md,
    paddingTop: THEME.spacing.lg,
  },
  header: {
    fontSize: THEME.fonts.sizes.xxl,
    fontWeight: 'bold',
    marginBottom: THEME.spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: THEME.fonts.sizes.sm,
    textAlign: 'center',
    marginBottom: THEME.spacing.lg,
  },
});
