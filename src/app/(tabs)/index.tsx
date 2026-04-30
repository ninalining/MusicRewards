// Home screen - Challenge list (Expo Router)
import React, { useCallback } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { router } from 'expo-router';
import { ChallengeList } from '../../components/challenge/ChallengeList';
import { useMusicPlayer } from '../../hooks/useMusicPlayer';
import { useChallenges } from '../../hooks/useChallenges';
import { useMusicStore } from '../../stores/musicStore';
import { useShallow } from 'zustand/react/shallow';
import { THEME } from '../../constants/theme';
import type { MusicChallenge } from '../../types';

export default function HomeScreen() {
  const { challenges, loading } = useChallenges();
  const { currentTrack, isPlaying } = useMusicStore(
    useShallow((s) => ({
      currentTrack: s.currentTrack,
      isPlaying: s.isPlaying,
    }))
  );
  const { play, resume } = useMusicPlayer();

  const currentTrackId = currentTrack?.id;

  const handlePlayChallenge = useCallback(async (challenge: MusicChallenge) => {
    try {
      if (currentTrackId === challenge.id) {
        await resume();
      } else {
        await play(challenge);
      }
      router.push('/(modals)/player');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to start playback';
      Alert.alert('Playback Error', message);
    }
  }, [play, resume, currentTrackId]);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Music Challenges</Text>
      <Text style={styles.subtitle}>
        Complete listening challenges to earn points and unlock achievements
      </Text>
      <ChallengeList
        challenges={challenges}
        loading={loading}
        onPlay={handlePlayChallenge}
        currentTrackId={currentTrack?.id}
        isPlaying={isPlaying}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.colors.background,
    paddingHorizontal: THEME.spacing.md,
    paddingTop: THEME.spacing.lg,
  },
  header: {
    fontSize: THEME.fonts.sizes.xxl,
    fontWeight: 'bold',
    color: THEME.colors.text.primary,
    marginBottom: THEME.spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: THEME.fonts.sizes.sm,
    color: THEME.colors.text.secondary,
    textAlign: 'center',
    marginBottom: THEME.spacing.lg,
  },
});