import React from 'react';
import { View, Text, Image, StyleSheet, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
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
  const { width: screenWidth } = useWindowDimensions();
  const artworkSize = screenWidth * 0.8;

  return (
    <View style={styles.container}>
      {track.imageUrl ? (
        <Image
          source={{ uri: track.imageUrl }}
          resizeMode="cover"
          style={[
            styles.artwork,
            { width: artworkSize, height: artworkSize, backgroundColor: colors.surfaceGlass },
          ]}
          accessibilityLabel={`Album artwork for ${track.title}`}
        />
      ) : (
        <View
          style={[
            styles.artwork,
            styles.artworkPlaceholder,
            { width: artworkSize, height: artworkSize, backgroundColor: colors.surfaceGlass },
          ]}
          accessibilityRole="image"
          accessibilityLabel="No album artwork"
        >
          <Ionicons name="musical-notes" size={72} color={colors.brandAccent} accessible={false} />
        </View>
      )}

      <View style={[styles.infoRow, { width: artworkSize }]}>
        <View style={styles.infoText}>
          <Text
            style={[styles.title, { color: colors.textPrimary }]}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {track.title}
          </Text>
          <Text style={[styles.artist, { color: colors.textSecondary }]} numberOfLines={1}>
            {track.artist}
          </Text>
        </View>

        <View
          style={styles.pointsBadge}
          accessible={true}
          accessibilityRole="text"
          accessibilityLabel={`${currentPoints} of ${track.points} points earned`}
          importantForAccessibility="yes"
        >
          <PointsCounter points={currentPoints} />
          <Text
            style={[styles.pointsTotal, { color: colors.textSecondary }]}
            accessible={false}
            importantForAccessibility="no"
          >
            / {track.points} pts
          </Text>
        </View>
      </View>
    </View>
  );
});

TrackInfoCard.displayName = 'TrackInfoCard';

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingHorizontal: THEME.spacing.lg,
  },
  artwork: {
    borderRadius: THEME.borderRadius.lg,
    marginBottom: THEME.spacing.lg,
    // Shadow values are intentional visual constants — no spacing token maps to depth/blur.
    shadowColor: THEME.shadow.color,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 12,
  },
  artworkPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  infoText: {
    flex: 1,
    marginRight: THEME.spacing.md,
  },
  title: {
    fontSize: THEME.fonts.sizes.xl,
    fontWeight: 'bold',
    marginBottom: THEME.spacing.xs,
  },
  artist: {
    fontSize: THEME.fonts.sizes.md,
  },
  pointsBadge: {
    alignItems: 'center',
  },
  pointsTotal: {
    fontSize: THEME.fonts.sizes.xs,
    marginTop: THEME.spacing.xs,
  },
});
