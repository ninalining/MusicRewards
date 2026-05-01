// Challenge detail modal — full challenge information with Play/Resume CTA
import React, { useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, Alert } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GlassCard } from '../../components/ui/GlassCard';
import { GlassButton } from '../../components/ui/GlassButton';
import { useMusicPlayer } from '../../hooks/useMusicPlayer';
import { useMusicStore } from '../../stores/musicStore';
import { THEME } from '../../constants/theme';
import { formatDuration, getDifficultyColor } from '../../utils/challenge';

export default function ChallengeDetailModal(): React.ReactElement {
  const { challengeId } = useLocalSearchParams<{ challengeId: string }>();
  const challenge = useMusicStore((s) => s.challenges.find((c) => c.id === challengeId) ?? null);
  const { currentTrack, play, resume, loading } = useMusicPlayer();

  const isCurrentTrack = currentTrack?.id === challengeId;

  const handlePlay = useCallback(async (): Promise<void> => {
    if (!challenge || loading) return;
    try {
      if (isCurrentTrack) {
        await resume();
      } else {
        await play(challenge);
      }
      router.replace('/(modals)/player');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to start playback';
      Alert.alert('Playback Error', message);
    }
  }, [challenge, isCurrentTrack, play, resume, loading]);

  if (!challenge) {
    return (
      <SafeAreaView style={styles.container}>
        <GlassCard style={styles.fallbackCard}>
          <Text style={styles.fallbackText} accessibilityRole="text">
            Challenge not found
          </Text>
        </GlassCard>
      </SafeAreaView>
    );
  }

  const buttonTitle = challenge.completed
    ? 'Completed ✓'
    : isCurrentTrack
      ? 'Resume'
      : 'Play Challenge';

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <GlassCard style={styles.headerCard}>
          <View style={styles.headerRow}>
            <View style={styles.titleSection}>
              <Text style={styles.title}>{challenge.title}</Text>
              <Text style={styles.artist}>{challenge.artist}</Text>
            </View>
            <View
              style={StyleSheet.flatten([
                styles.difficultyBadge,
                { backgroundColor: getDifficultyColor(challenge.difficulty) },
              ])}
            >
              <Text style={styles.difficultyText} accessibilityRole="text">
                {challenge.difficulty.toUpperCase()}
              </Text>
            </View>
          </View>
        </GlassCard>

        <Text style={styles.description}>{challenge.description}</Text>

        <GlassCard style={styles.statsCard}>
          <View style={styles.infoRow}>
            <View
              style={styles.infoItem}
              accessible
              accessibilityLabel={`Duration: ${formatDuration(challenge.duration)}`}
            >
              <Text style={styles.infoLabel}>Duration</Text>
              <Text style={styles.infoValue}>{formatDuration(challenge.duration)}</Text>
            </View>
            <View
              style={styles.infoItem}
              accessible
              accessibilityLabel={`Points: ${challenge.points}`}
            >
              <Text style={styles.infoLabel}>Points</Text>
              <Text style={[styles.infoValue, styles.pointsValue]}>{challenge.points}</Text>
            </View>
            <View
              style={styles.infoItem}
              accessible
              accessibilityLabel={`Progress: ${Math.round(challenge.progress)} percent`}
            >
              <Text style={styles.infoLabel}>Progress</Text>
              <Text style={styles.infoValue}>{Math.round(challenge.progress)}%</Text>
            </View>
          </View>
        </GlassCard>

        {challenge.progress > 0 && (
          <View style={styles.progressContainer}>
            <View style={styles.progressTrack}>
              <View
                style={[styles.progressFill, { width: `${Math.min(challenge.progress, 100)}%` }]}
              />
            </View>
          </View>
        )}

        {challenge.completed && (
          <Text style={styles.completedText} accessibilityRole="text">
            ✓ Challenge Completed
          </Text>
        )}

        <GlassButton
          title={buttonTitle}
          onPress={handlePlay}
          variant="primary"
          disabled={challenge.completed}
          loading={loading}
          style={styles.playButton}
          accessibilityHint={
            challenge.completed
              ? 'Challenge already completed'
              : 'Double tap to start playing this challenge'
          }
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.colors.background,
  },
  content: {
    padding: THEME.spacing.lg,
  },
  headerCard: {
    marginBottom: THEME.spacing.md,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  titleSection: {
    flex: 1,
    marginRight: THEME.spacing.sm,
  },
  title: {
    fontSize: THEME.fonts.sizes.xxl,
    fontWeight: 'bold',
    color: THEME.colors.text.primary,
    marginBottom: THEME.spacing.xs,
  },
  artist: {
    fontSize: THEME.fonts.sizes.md,
    color: THEME.colors.text.secondary,
  },
  difficultyBadge: {
    paddingHorizontal: THEME.spacing.sm,
    paddingVertical: THEME.spacing.xs,
    borderRadius: THEME.borderRadius.sm,
  },
  difficultyText: {
    fontSize: THEME.fonts.sizes.xs,
    fontWeight: 'bold',
    color: THEME.colors.background,
  },
  description: {
    fontSize: THEME.fonts.sizes.md,
    color: THEME.colors.text.tertiary,
    lineHeight: THEME.fonts.sizes.md * 1.4,
    marginBottom: THEME.spacing.lg,
  },
  statsCard: {
    marginBottom: THEME.spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  infoItem: {
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: THEME.fonts.sizes.xs,
    color: THEME.colors.text.tertiary,
    marginBottom: THEME.spacing.xs,
  },
  infoValue: {
    fontSize: THEME.fonts.sizes.lg,
    fontWeight: '600',
    color: THEME.colors.text.primary,
  },
  pointsValue: {
    color: THEME.colors.accent,
  },
  progressContainer: {
    marginBottom: THEME.spacing.md,
  },
  progressTrack: {
    height: THEME.spacing.xs,
    backgroundColor: THEME.colors.glass,
    borderRadius: THEME.spacing.xs,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: THEME.colors.accent,
    borderRadius: THEME.spacing.xs,
  },
  completedText: {
    fontSize: THEME.fonts.sizes.lg,
    fontWeight: 'bold',
    color: THEME.colors.secondary,
    textAlign: 'center',
    marginBottom: THEME.spacing.md,
  },
  playButton: {
    marginTop: THEME.spacing.lg,
  },
  fallbackCard: {
    margin: THEME.spacing.xl,
    alignItems: 'center',
  },
  fallbackText: {
    fontSize: THEME.fonts.sizes.lg,
    color: THEME.colors.text.secondary,
    textAlign: 'center',
  },
});
