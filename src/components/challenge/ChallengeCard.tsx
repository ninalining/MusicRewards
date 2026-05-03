import React, { useCallback, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity } from 'react-native';
import { GlassCard } from '../ui/GlassCard';
import { GlassButton } from '../ui/GlassButton';
import { THEME } from '../../constants/theme';
import { useTheme } from '../../hooks/useTheme';
import { formatDuration, getDifficultyColor } from '../../utils/challenge';
import type { MusicChallenge } from '../../types';

interface ChallengeCardProps {
  challenge: MusicChallenge;
  onPlay: (challenge: MusicChallenge) => void;
  onPress?: (challenge: MusicChallenge) => void;
  isCurrentTrack?: boolean;
  isPlaying?: boolean;
}

export const ChallengeCard = React.memo<ChallengeCardProps>(
  ({ challenge, onPlay, onPress, isCurrentTrack = false, isPlaying = false }) => {
    const { colors } = useTheme();
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

    const handleCardPress = useCallback((): void => {
      onPress?.(challenge);
    }, [onPress, challenge]);

    const handlePlay = useCallback((): void => {
      onPlay(challenge);
    }, [onPlay, challenge]);

    return (
      <GlassCard
        style={StyleSheet.flatten([
          styles.card,
          isCurrentTrack && styles.currentTrackCard,
          isCurrentTrack && { borderColor: colors.brandPrimary },
        ])}
        gradientColors={isCurrentTrack ? colors.glassPrimary : undefined}
      >
        <TouchableOpacity
          onPress={handleCardPress}
          disabled={!onPress}
          activeOpacity={onPress ? 0.7 : 1}
          accessibilityRole={onPress ? 'button' : undefined}
          accessibilityLabel={onPress ? `View details for ${challenge.title}` : undefined}
          accessibilityHint={onPress ? 'Double tap to view challenge details' : undefined}
        >
          <View style={styles.header}>
            <View style={styles.titleSection}>
              <Text style={[styles.title, { color: colors.textPrimary }]}>{challenge.title}</Text>
              <Text style={[styles.artist, { color: colors.textSecondary }]}>
                {challenge.artist}
              </Text>
            </View>
            <View
              style={StyleSheet.flatten([
                styles.difficultyBadge,
                { backgroundColor: getDifficultyColor(challenge.difficulty) },
              ])}
            >
              <Text style={[styles.difficultyText, { color: colors.textOnBrand }]}>
                {challenge.difficulty.toUpperCase()}
              </Text>
            </View>
          </View>

          <Text style={[styles.description, { color: colors.textTertiary }]} numberOfLines={2}>
            {challenge.description}
          </Text>

          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <Text style={[styles.infoLabel, { color: colors.textTertiary }]}>Duration</Text>
              <Text style={[styles.infoValue, { color: colors.textPrimary }]}>
                {formatDuration(challenge.duration)}
              </Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={[styles.infoLabel, { color: colors.textTertiary }]}>Points</Text>
              <Text style={[styles.infoValue, { color: colors.brandAccent }]}>
                {challenge.points}
              </Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={[styles.infoLabel, { color: colors.textTertiary }]}>Progress</Text>
              <Text style={[styles.infoValue, { color: colors.textPrimary }]}>
                {Math.round(challenge.progress)}%
              </Text>
            </View>
          </View>

          {challenge.progress > 0 && (
            <View style={styles.progressContainer}>
              <View style={[styles.progressTrack, { backgroundColor: colors.surfaceGlass }]}>
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
            </View>
          )}
        </TouchableOpacity>

        <GlassButton
          title={getButtonTitle()}
          onPress={handlePlay}
          variant={isCurrentTrack ? 'primary' : 'secondary'}
          disabled={challenge.completed}
          style={styles.playButton}
          accessibilityHint={
            challenge.completed
              ? 'Challenge already completed'
              : `Double tap to play ${challenge.title}`
          }
        />
      </GlassCard>
    );
  },
);

ChallengeCard.displayName = 'ChallengeCard';

const styles = StyleSheet.create({
  card: {
    marginBottom: THEME.spacing.md,
  },
  currentTrackCard: {
    borderWidth: 2,
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
    marginBottom: THEME.spacing.xs,
  },
  artist: {
    fontSize: THEME.fonts.sizes.md,
  },
  difficultyBadge: {
    paddingHorizontal: THEME.spacing.sm,
    paddingVertical: THEME.spacing.xs,
    borderRadius: THEME.borderRadius.sm,
  },
  difficultyText: {
    fontSize: THEME.fonts.sizes.xs,
    fontWeight: 'bold',
  },
  description: {
    fontSize: THEME.fonts.sizes.sm,
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
    marginBottom: THEME.spacing.xs,
  },
  infoValue: {
    fontSize: THEME.fonts.sizes.sm,
    fontWeight: '600',
  },
  progressContainer: {
    marginBottom: THEME.spacing.md,
  },
  progressTrack: {
    height: THEME.spacing.xs,
    borderRadius: THEME.spacing.xs / 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: THEME.spacing.xs / 2,
  },
  playButton: {
    marginTop: THEME.spacing.sm,
  },
});
