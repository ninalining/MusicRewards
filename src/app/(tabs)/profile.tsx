// Profile screen - User progress and stats
import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, Animated } from 'react-native';
import { GlassCard } from '../../components/ui/GlassCard';
import {
  useMusicStore,
  selectChallenges,
  selectTotalAvailablePoints,
} from '../../stores/musicStore';
import { useUserStore, selectTotalPoints, selectCompletedChallenges } from '../../stores/userStore';
import { THEME } from '../../constants/theme';

const AnimatedProgressBar = React.memo<{ progress: number }>(({ progress }) => {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(anim, {
      toValue: progress,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [progress, anim]);

  return (
    <View style={styles.progressBar}>
      <Animated.View
        style={[
          styles.progressFill,
          {
            width: anim.interpolate({
              inputRange: [0, 100],
              outputRange: ['0%', '100%'],
              extrapolate: 'clamp',
            }),
          },
        ]}
      />
    </View>
  );
});

AnimatedProgressBar.displayName = 'AnimatedProgressBar';

export default function ProfileScreen() {
  const challenges = useMusicStore(selectChallenges);
  const totalAvailablePoints = useMusicStore(selectTotalAvailablePoints);
  const totalPoints = useUserStore(selectTotalPoints);
  const completedChallenges = useUserStore(selectCompletedChallenges);

  const totalChallenges = challenges.length;
  const completionRate =
    totalChallenges > 0 ? (completedChallenges.length / totalChallenges) * 100 : 0;

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Your Progress</Text>

      {/* Stats Overview */}
      <GlassCard style={styles.statsCard}>
        <View style={styles.statsGrid}>
          <View
            style={styles.statItem}
            accessible
            accessibilityRole="text"
            accessibilityLabel={`${totalPoints} out of ${totalAvailablePoints} total points`}
          >
            <Text style={styles.statValue}>{totalPoints}</Text>
            <Text style={styles.statSubvalue}>/ {totalAvailablePoints}</Text>
            <Text style={styles.statLabel}>Total Points</Text>
          </View>
          <View
            style={styles.statItem}
            accessible
            accessibilityRole="text"
            accessibilityLabel={`${completedChallenges.length} ${completedChallenges.length === 1 ? 'challenge' : 'challenges'} completed`}
          >
            <Text style={styles.statValue}>{completedChallenges.length}</Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>
          <View
            style={styles.statItem}
            accessible
            accessibilityRole="text"
            accessibilityLabel={`${Math.round(completionRate)} percent success rate`}
          >
            <Text style={styles.statValue}>{Math.round(completionRate)}%</Text>
            <Text style={styles.statLabel}>Success Rate</Text>
          </View>
        </View>
      </GlassCard>

      {/* Challenge Progress */}
      <GlassCard style={styles.progressCard}>
        <Text style={styles.sectionTitle}>Challenge Progress</Text>
        {challenges.map((challenge) => {
          const isCompleted = completedChallenges.includes(challenge.id);
          return (
            <View key={challenge.id} style={styles.challengeItem}>
              <View style={styles.challengeHeader}>
                <Text style={styles.challengeTitle}>{challenge.title}</Text>
                <Text
                  style={
                    isCompleted ? styles.challengeStatusCompleted : styles.challengeStatusPending
                  }
                >
                  {isCompleted ? '✅' : '⏳'}
                </Text>
              </View>
              <AnimatedProgressBar progress={challenge.progress} />
              <Text style={styles.progressText}>
                {Math.round(challenge.progress)}% • {challenge.points} points
              </Text>
            </View>
          );
        })}
      </GlassCard>

      {/* Achievements */}
      <GlassCard style={styles.achievementsCard}>
        <Text style={styles.sectionTitle}>Achievements</Text>

        {totalPoints >= 100 && (
          <View style={styles.achievement}>
            <Text style={styles.achievementIcon}>🏆</Text>
            <Text style={styles.achievementText}>First 100 Points!</Text>
          </View>
        )}

        {completedChallenges.length >= 1 && (
          <View style={styles.achievement}>
            <Text style={styles.achievementIcon}>🎵</Text>
            <Text style={styles.achievementText}>Music Lover</Text>
          </View>
        )}

        {completionRate >= 100 && (
          <View style={styles.achievement}>
            <Text style={styles.achievementIcon}>🌟</Text>
            <Text style={styles.achievementText}>Perfect Score!</Text>
          </View>
        )}

        {totalPoints === 0 && completedChallenges.length === 0 && (
          <Text style={styles.noAchievements}>Complete challenges to unlock achievements!</Text>
        )}
      </GlassCard>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.colors.background,
    paddingHorizontal: THEME.spacing.md,
  },
  header: {
    fontSize: THEME.fonts.sizes.xxl,
    fontWeight: 'bold',
    color: THEME.colors.text.primary,
    marginVertical: THEME.spacing.lg,
    textAlign: 'center',
  },
  statsCard: {
    marginBottom: THEME.spacing.md,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: THEME.fonts.sizes.xl,
    fontWeight: 'bold',
    color: THEME.colors.accent,
    marginBottom: THEME.spacing.xs,
  },
  statLabel: {
    fontSize: THEME.fonts.sizes.sm,
    color: THEME.colors.text.secondary,
  },
  statSubvalue: {
    fontSize: THEME.fonts.sizes.sm,
    color: THEME.colors.text.secondary,
  },
  progressCard: {
    marginBottom: THEME.spacing.md,
  },
  sectionTitle: {
    fontSize: THEME.fonts.sizes.lg,
    fontWeight: 'bold',
    color: THEME.colors.text.primary,
    marginBottom: THEME.spacing.md,
  },
  challengeItem: {
    marginBottom: THEME.spacing.md,
  },
  challengeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: THEME.spacing.xs,
  },
  challengeTitle: {
    fontSize: THEME.fonts.sizes.md,
    color: THEME.colors.text.primary,
  },
  challengeStatusCompleted: {
    fontSize: THEME.fonts.sizes.lg,
    color: THEME.colors.secondary,
  },
  challengeStatusPending: {
    fontSize: THEME.fonts.sizes.lg,
    color: THEME.colors.text.secondary,
  },
  progressBar: {
    height: THEME.spacing.xs,
    backgroundColor: THEME.colors.glass,
    borderRadius: THEME.spacing.xs,
    overflow: 'hidden',
    marginBottom: THEME.spacing.xs,
  },
  progressFill: {
    height: '100%',
    backgroundColor: THEME.colors.accent,
    borderRadius: THEME.spacing.xs,
  },
  progressText: {
    fontSize: THEME.fonts.sizes.sm,
    color: THEME.colors.text.secondary,
  },
  achievementsCard: {
    marginBottom: THEME.spacing.xl,
  },
  achievement: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: THEME.spacing.sm,
  },
  achievementIcon: {
    fontSize: THEME.fonts.sizes.xl,
    marginRight: THEME.spacing.md,
  },
  achievementText: {
    fontSize: THEME.fonts.sizes.md,
    color: THEME.colors.text.primary,
  },
  noAchievements: {
    fontSize: THEME.fonts.sizes.sm,
    color: THEME.colors.text.tertiary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
