// ChallengeCard component - Individual challenge display
import React, { useCallback, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity } from 'react-native';
import { GlassCard } from '../ui/GlassCard';
import { GlassButton } from '../ui/GlassButton';
import { THEME } from '../../constants/theme';
import { formatDuration, getDifficultyColor } from '../../utils/challenge';
import type { MusicChallenge } from '../../types';

interface ChallengeCardProps {
  challenge: MusicChallenge;
  onPlay: (challenge: MusicChallenge) => void;
  onPress?: (challenge: MusicChallenge) => void;
  isCurrentTrack?: boolean;
  isPlaying?: boolean;
}

export const ChallengeCard = React.memo<ChallengeCardProps>(({
  challenge,
  onPlay,
  onPress,
  isCurrentTrack = false,
  isPlaying = false,
}) => {
  const progressAnim = useRef(new Animated.Value(challenge.progress)).current;

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: challenge.progress,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [challenge.progress, progressAnim]);

  const getButtonTitle = () => {
    if (challenge.completed) return 'Completed ✓';
    if (isCurrentTrack && isPlaying) return 'Playing...';
    if (isCurrentTrack && !isPlaying) return 'Resume';
    return 'Play Challenge';
  };

  const challengeId = challenge.id;

  // eslint-disable-next-line react-hooks/exhaustive-deps -- use challengeId as stable proxy for challenge object
  const handleCardPress = useCallback((): void => {
    onPress?.(challenge);
  }, [onPress, challengeId]);

  // eslint-disable-next-line react-hooks/exhaustive-deps -- use challengeId as stable proxy for challenge object
  const handlePlay = useCallback((): void => {
    onPlay(challenge);
  }, [onPlay, challengeId]);

  return (
    <GlassCard
      style={StyleSheet.flatten([
        styles.card,
        isCurrentTrack && styles.currentTrackCard
      ])}
      gradientColors={
        isCurrentTrack
          ? THEME.glass.gradientColors.primary
          : THEME.glass.gradientColors.card
      }
    >
      <TouchableOpacity
        onPress={handleCardPress}
        disabled={!onPress}
        activeOpacity={onPress ? 0.7 : 1}
        accessibilityRole="button"
        accessibilityLabel={`View details for ${challenge.title}`}
      >
        <View style={styles.header}>
        <View style={styles.titleSection}>
          <Text style={styles.title}>{challenge.title}</Text>
          <Text style={styles.artist}>{challenge.artist}</Text>
        </View>
        <View style={StyleSheet.flatten([
          styles.difficultyBadge,
          { backgroundColor: getDifficultyColor(challenge.difficulty) }
        ])}>
          <Text style={styles.difficultyText}>
            {challenge.difficulty.toUpperCase()}
          </Text>
        </View>
      </View>

      <Text style={styles.description} numberOfLines={2}>
        {challenge.description}
      </Text>

      <View style={styles.infoRow}>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Duration</Text>
          <Text style={styles.infoValue}>{formatDuration(challenge.duration)}</Text>
        </View>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Points</Text>
          <Text style={[styles.infoValue, { color: THEME.colors.accent }]}> 
            {challenge.points}
          </Text>
        </View>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Progress</Text>
          <Text style={styles.infoValue}>{Math.round(challenge.progress)}%</Text>
        </View>
      </View>

      {challenge.progress > 0 && (
        <View style={styles.progressContainer}>
          <View style={styles.progressTrack}>
            <Animated.View
              style={[
                styles.progressFill,
                { width: progressAnim.interpolate({
                  inputRange: [0, 100],
                  outputRange: ['0%', '100%'],
                  extrapolate: 'clamp',
                }) },
              ]}
            />
          </View>
        </View>
      )}
      </TouchableOpacity>

      <GlassButton
        title={getButtonTitle()}
        onPress={handlePlay}
        variant={isCurrentTrack ? 'primary' : 'secondary'}
        disabled={challenge.completed}
        style={styles.playButton}
      />
    </GlassCard>
  );
});

ChallengeCard.displayName = 'ChallengeCard';

const styles = StyleSheet.create({
  card: {
    marginBottom: THEME.spacing.md,
  },
  currentTrackCard: {
    borderWidth: 2,
    borderColor: THEME.colors.primary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: THEME.spacing.sm,
  },
  titleSection: {
    flex: 1,
    marginRight: THEME.spacing.sm,
  },
  title: {
    fontSize: THEME.fonts.sizes.lg,
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
    fontSize: THEME.fonts.sizes.sm,
    color: THEME.colors.text.tertiary,
    lineHeight: THEME.fonts.sizes.sm * 1.4,
    marginBottom: THEME.spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: THEME.spacing.md,
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
    fontSize: THEME.fonts.sizes.sm,
    fontWeight: '600',
    color: THEME.colors.text.primary,
  },
  progressContainer: {
    marginBottom: THEME.spacing.md,
  },
  progressTrack: {
    height: THEME.spacing.xs,
    backgroundColor: THEME.colors.glass,
    borderRadius: THEME.spacing.xs / 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: THEME.colors.accent,
    borderRadius: THEME.spacing.xs / 2,
  },
  playButton: {
    marginTop: THEME.spacing.sm,
  },
});