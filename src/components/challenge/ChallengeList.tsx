// ChallengeList — FlatList wrapper with loading and empty states
// Pure presentational component; all data passed via props.
import React, { useCallback, useEffect, useRef } from 'react';
import { Animated, FlatList, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ChallengeCard } from './ChallengeCard';
import { GlassCard } from '../ui/GlassCard';
import { THEME } from '../../constants/theme';
import { useTheme } from '../../hooks/useTheme';
import type { MusicChallenge } from '../../types';

interface ChallengeListProps {
  /** Array of challenge items to render. */
  challenges: MusicChallenge[];
  /** When true, shows ActivityIndicator and hides list. Default: false. */
  loading?: boolean;
  /** Invoked with the full challenge when play is tapped. */
  onPlay: (challenge: MusicChallenge) => void;
  /** Invoked with the full challenge when the card body is tapped. */
  onPressChallenge?: (challenge: MusicChallenge) => void;
  /** ID of the currently active track — used for ChallengeCard visual state. */
  currentTrackId?: string;
  /** Whether the active track is currently playing. */
  isPlaying?: boolean;
}

const keyExtractor = (item: MusicChallenge): string => item.id;

const SKELETON_COUNT = 3;

/** Pulsing placeholder card shown while challenges load. */
const SkeletonCard = React.memo((): React.ReactElement => {
  const { colors } = useTheme();
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
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
        <View style={styles.listContainer}>
          {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
            <SkeletonCard key={`skeleton-${i}`} />
          ))}
        </View>
      );
    }

    if (challenges.length === 0) {
      return (
        <View style={styles.centeredContainer}>
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
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        // getItemLayout omitted — ChallengeCard height varies due to conditional
        // progress bar rendering. List size (≤5 items) makes the cost negligible.
      />
    );
  },
);

ChallengeList.displayName = 'ChallengeList';

const styles = StyleSheet.create({
  centeredContainer: {
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
  listContainer: {
    paddingBottom: THEME.spacing.xxl + THEME.spacing.xl,
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
