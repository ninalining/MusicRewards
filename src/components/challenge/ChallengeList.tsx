// ChallengeList — FlatList wrapper with loading and empty states
// Pure presentational component; all data passed via props.
import React, { useCallback } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { ChallengeCard } from './ChallengeCard';
import { GlassCard } from '../ui/GlassCard';
import { THEME } from '../../constants/theme';
import type { MusicChallenge } from '../../types';

interface ChallengeListProps {
  /** Array of challenge items to render. */
  challenges: MusicChallenge[];
  /** When true, shows ActivityIndicator and hides list. Default: false. */
  loading?: boolean;
  /** Invoked with the full challenge when play is tapped. */
  onPlay: (challenge: MusicChallenge) => void;
  /** ID of the currently active track — used for ChallengeCard visual state. */
  currentTrackId?: string;
  /** Whether the active track is currently playing. */
  isPlaying?: boolean;
}

const keyExtractor = (item: MusicChallenge): string => item.id;

export const ChallengeList = React.memo<ChallengeListProps>(({
  challenges,
  loading = false,
  onPlay,
  currentTrackId,
  isPlaying = false,
}): React.ReactElement => {
  const renderItem = useCallback(
    ({ item }: { item: MusicChallenge }): React.ReactElement => (
      <ChallengeCard
        challenge={item}
        onPlay={onPlay}
        isCurrentTrack={currentTrackId === item.id}
        isPlaying={isPlaying}
      />
    ),
    [onPlay, currentTrackId, isPlaying],
  );

  if (loading) {
    return (
      <View style={styles.centeredContainer}>
        <ActivityIndicator
          size="large"
          color={THEME.colors.accent}
          accessibilityRole="progressbar"
          accessibilityLabel="Loading challenges"
        />
      </View>
    );
  }

  if (challenges.length === 0) {
    return (
      <View style={styles.centeredContainer}>
        <GlassCard style={styles.emptyCard}>
          <Text style={styles.emptyText} accessibilityRole="text">
            🎵 No challenges available yet
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
});

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
    color: THEME.colors.text.secondary,
    textAlign: 'center',
  },
  listContainer: {
    paddingBottom: THEME.spacing.xl,
  },
});
