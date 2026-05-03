import React, { useCallback, useEffect, useRef } from 'react';
import { Animated, FlatList, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ChallengeCard } from './ChallengeCard';
import { GlassCard } from '../ui/GlassCard';
import { THEME } from '../../constants/theme';
import { useTheme } from '../../hooks/useTheme';
import type { MusicChallenge } from '../../types';

interface ChallengeListProps {
  challenges: MusicChallenge[];
  loading?: boolean;
  onPlay: (challenge: MusicChallenge) => void;
  onPressChallenge?: (challenge: MusicChallenge) => void;
  currentTrackId?: string;
  isPlaying?: boolean;
}

const SKELETON_COUNT = 3;

const keyExtractor = (item: MusicChallenge): string => item.id;

const SkeletonCard = React.memo((): React.ReactElement => {
  const { colors } = useTheme();
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.3, duration: 800, useNativeDriver: true }),
      ]),
    );
    animation.start();
    return () => animation.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[skeletonStyles.card, { opacity, backgroundColor: colors.surfaceGlass }]}
      accessibilityRole="progressbar"
      accessibilityLabel="Loading challenge"
    >
      <View style={[skeletonStyles.titleBar, { backgroundColor: colors.border }]} />
      <View style={[skeletonStyles.subtitleBar, { backgroundColor: colors.border }]} />
      <View style={skeletonStyles.bottomRow}>
        <View style={[skeletonStyles.chip, { backgroundColor: colors.border }]} />
        <View style={[skeletonStyles.chip, { backgroundColor: colors.border }]} />
      </View>
    </Animated.View>
  );
});

SkeletonCard.displayName = 'SkeletonCard';

export const ChallengeList = React.memo<ChallengeListProps>(
  ({
    challenges,
    loading = false,
    onPlay,
    onPressChallenge,
    currentTrackId,
    isPlaying = false,
  }): React.ReactElement => {
    const { colors } = useTheme();

    const renderItem = useCallback(
      ({ item }: { item: MusicChallenge }): React.ReactElement => (
        <ChallengeCard
          challenge={item}
          onPlay={onPlay}
          onPress={onPressChallenge}
          isCurrentTrack={currentTrackId === item.id}
          isPlaying={isPlaying}
        />
      ),
      [onPlay, onPressChallenge, currentTrackId, isPlaying],
    );

    if (loading) {
      return (
        <View style={styles.container}>
          {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
            <SkeletonCard key={`skeleton-${i}`} />
          ))}
        </View>
      );
    }

    if (challenges.length === 0) {
      return (
        <View style={styles.centered}>
          <GlassCard style={styles.emptyCard}>
            <Ionicons
              name="musical-notes-outline"
              size={THEME.fonts.sizes.xl}
              color={colors.textSecondary}
              accessible={false}
            />
            <Text
              style={[styles.emptyText, { color: colors.textSecondary }]}
              accessibilityRole="text"
            >
              No challenges available yet
            </Text>
          </GlassCard>
        </View>
      );
    }

    return (
      <FlatList
        data={challenges}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        initialNumToRender={5}
        maxToRenderPerBatch={10}
        windowSize={5}
      />
    );
  },
);

ChallengeList.displayName = 'ChallengeList';

const styles = StyleSheet.create({
  content: {
    paddingBottom: THEME.spacing.xxl + THEME.spacing.xl,
  },
  container: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyCard: {
    padding: THEME.spacing.lg,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: THEME.fonts.sizes.md,
    textAlign: 'center',
  },
});

const skeletonStyles = StyleSheet.create({
  card: {
    borderRadius: THEME.borderRadius.lg,
    padding: THEME.spacing.md,
    marginHorizontal: THEME.spacing.md,
    marginBottom: THEME.spacing.md,
    height: THEME.sizing.skeletonCardHeight,
    justifyContent: 'center',
  },
  titleBar: {
    width: '60%',
    height: THEME.sizing.skeletonTitleHeight,
    borderRadius: THEME.borderRadius.sm,
    marginBottom: THEME.spacing.sm,
  },
  subtitleBar: {
    width: '40%',
    height: THEME.sizing.skeletonSubtitleHeight,
    borderRadius: THEME.borderRadius.sm,
    marginBottom: THEME.spacing.md,
  },
  bottomRow: {
    flexDirection: 'row',
    gap: THEME.spacing.sm,
  },
  chip: {
    width: THEME.sizing.skeletonChipWidth,
    height: THEME.sizing.skeletonSubtitleHeight,
    borderRadius: THEME.borderRadius.sm,
  },
});
