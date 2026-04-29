// Home screen - Challenge list (Expo Router)
import React, { useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, Alert } from 'react-native';
import { router } from 'expo-router';
import { ChallengeCard } from '../../components/challenge/ChallengeCard';
import { useMusicPlayer } from '../../hooks/useMusicPlayer';
import { useMusicStore } from '../../stores/musicStore';
import { useShallow } from 'zustand/react/shallow';
import { THEME } from '../../constants/theme';
import type { MusicChallenge } from '../../types';

export default function HomeScreen() {
  const { challenges, currentTrack, isPlaying } = useMusicStore(
    useShallow((s) => ({
      challenges: s.challenges,
      currentTrack: s.currentTrack,
      isPlaying: s.isPlaying,
    }))
  );
  const { play } = useMusicPlayer();

  const handlePlayChallenge = useCallback(async (challenge: MusicChallenge) => {
    try {
      await play(challenge);
      // Navigate to player modal after starting playback
      router.push('/(modals)/player');
    } catch (error) {
      console.error('Failed to play challenge:', error);
      const message = error instanceof Error ? error.message : 'Failed to start playback';
      Alert.alert('Playback Error', message);
    }
  }, [play]);

  const renderChallenge = useCallback(({ item }: { item: MusicChallenge }) => (
    <ChallengeCard
      challenge={item}
      onPlay={handlePlayChallenge}
      isCurrentTrack={currentTrack?.id === item.id}
      isPlaying={isPlaying}
    />
  ), [handlePlayChallenge, currentTrack?.id, isPlaying]);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Music Challenges</Text>
      <Text style={styles.subtitle}>
        Complete listening challenges to earn points and unlock achievements
      </Text>
      <FlatList
        data={challenges}
        renderItem={renderChallenge}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
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
  listContainer: {
    paddingBottom: THEME.spacing.xl,
  },
});