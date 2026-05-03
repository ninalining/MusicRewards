import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { GlassCard } from '../ui/GlassCard';
import { PointsCounter } from '../ui/PointsCounter';
import { useTheme } from '../../hooks/useTheme';
import { THEME } from '../../constants/theme';
import type { MusicChallenge } from '../../types';

interface TrackInfoCardProps {
  track: MusicChallenge;
  currentPoints: number;
}

export const TrackInfoCard = React.memo<TrackInfoCardProps>(function TrackInfoCard({
  track,
  currentPoints,
}) {
  const { colors } = useTheme();

  return (
    <GlassCard style={styles.card}>
      <Text style={[styles.title, { color: colors.textPrimary }]}>{track.title}</Text>
      <Text style={[styles.artist, { color: colors.textSecondary }]}>{track.artist}</Text>
      <Text style={[styles.description, { color: colors.textTertiary }]}>{track.description}</Text>

      <View
        style={styles.pointsContainer}
        accessibilityRole="text"
        accessibilityLabel={`${currentPoints} of ${track.points} points earned`}
        importantForAccessibility="yes"
      >
        <Text style={[styles.pointsLabel, { color: colors.textSecondary }]} accessible={false}>
          Points Earned
        </Text>
        <View style={styles.pointsRow} importantForAccessibility="no-hide-descendants">
          <PointsCounter points={currentPoints} />
          <Text style={[styles.pointsTotal, { color: colors.textSecondary }]}>
            {' '}
            / {track.points} pts
          </Text>
        </View>
      </View>
    </GlassCard>
  );
});

const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
  },
  title: {
    fontSize: THEME.fonts.sizes.xxl,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: THEME.spacing.xs,
  },
  artist: {
    fontSize: THEME.fonts.sizes.lg,
    marginBottom: THEME.spacing.md,
  },
  description: {
    fontSize: THEME.fonts.sizes.sm,
    textAlign: 'center',
    marginBottom: THEME.spacing.lg,
  },
  pointsContainer: {
    alignItems: 'center',
  },
  pointsLabel: {
    fontSize: THEME.fonts.sizes.sm,
  },
  pointsRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  pointsTotal: {
    fontSize: THEME.fonts.sizes.lg,
  },
});
