// Profile screen - User progress and stats
import React, { useCallback, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, Animated, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { GlassCard } from '../../components/ui/GlassCard';
import {
  useMusicStore,
  selectChallenges,
  selectTotalAvailablePoints,
} from '../../stores/musicStore';
import { useUserStore, selectTotalPoints, selectCompletedChallenges } from '../../stores/userStore';
import { useTheme } from '../../hooks/useTheme';
import { THEME } from '../../constants/theme';
import { hapticLight } from '../../utils/haptics';
import type { ColorPalette, ThemePreference } from '../../types/theme';

const AnimatedProgressBar = React.memo<{ progress: number; colors: ColorPalette }>(
  ({ progress, colors }) => {
    const anim = useRef(new Animated.Value(0)).current;
    useEffect(() => {
      Animated.timing(anim, {
        toValue: progress,
        duration: 300,
        useNativeDriver: false,
      }).start();
    }, [progress, anim]);

    return (
      <View style={[styles.progressBar, { backgroundColor: colors.surfaceGlass }]}>
        <Animated.View
          style={[
            styles.progressFill,
            { backgroundColor: colors.brandAccent },
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
  },
);

AnimatedProgressBar.displayName = 'AnimatedProgressBar';

export default function ProfileScreen() {
  const challenges = useMusicStore(selectChallenges);
  const totalAvailablePoints = useMusicStore(selectTotalAvailablePoints);
  const totalPoints = useUserStore(selectTotalPoints);
  const completedChallenges = useUserStore(selectCompletedChallenges);
  const { colors, preference, setPreference } = useTheme();

  const totalChallenges = challenges.length;
  const completionRate =
    totalChallenges > 0 ? (completedChallenges.length / totalChallenges) * 100 : 0;

  const handleThemeChange = useCallback(
    (newPreference: ThemePreference): void => {
      hapticLight();
      setPreference(newPreference);
    },
    [setPreference],
  );

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.surfacePrimary }]}>
      <Text style={[styles.header, { color: colors.textPrimary }]}>Your Progress</Text>

      {/* Theme Toggle */}
      <GlassCard style={styles.themeCard}>
        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Appearance</Text>
        <View style={styles.themeOptions}>
          {(['system', 'light', 'dark'] as const).map((option) => (
            <TouchableOpacity
              key={option}
              style={[
                styles.themeOption,
                { borderColor: colors.border },
                preference === option && {
                  borderColor: colors.brandPrimary,
                  backgroundColor: colors.surfaceGlass,
                },
              ]}
              onPress={() => handleThemeChange(option)}
              accessibilityRole="button"
              accessibilityLabel={`Set theme to ${option}${preference === option ? ', currently selected' : ''}`}
              accessibilityState={{ selected: preference === option }}
            >
              <Ionicons
                name={
                  option === 'system'
                    ? 'settings-outline'
                    : option === 'light'
                      ? 'sunny-outline'
                      : 'moon-outline'
                }
                size={THEME.fonts.sizes.xl}
                color={preference === option ? colors.brandPrimary : colors.textPrimary}
                accessible={false}
              />
              <Text
                style={[
                  styles.themeOptionLabel,
                  { color: preference === option ? colors.brandPrimary : colors.textSecondary },
                ]}
              >
                {option === 'system' ? 'System' : option === 'light' ? 'Light' : 'Dark'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </GlassCard>

      {/* Stats Overview */}
      <GlassCard style={styles.statsCard}>
        <View style={styles.statsGrid}>
          <View
            style={styles.statItem}
            accessible
            accessibilityRole="text"
            accessibilityLabel={`${totalPoints} out of ${totalAvailablePoints} total points`}
          >
            <Text style={[styles.statValue, { color: colors.brandAccent }]}>{totalPoints}</Text>
            <Text style={[styles.statSubvalue, { color: colors.textSecondary }]}>
              / {totalAvailablePoints}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Total Points</Text>
          </View>
          <View
            style={styles.statItem}
            accessible
            accessibilityRole="text"
            accessibilityLabel={`${completedChallenges.length} ${completedChallenges.length === 1 ? 'challenge' : 'challenges'} completed`}
          >
            <Text style={[styles.statValue, { color: colors.brandAccent }]}>
              {completedChallenges.length}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Completed</Text>
          </View>
          <View
            style={styles.statItem}
            accessible
            accessibilityRole="text"
            accessibilityLabel={`${Math.round(completionRate)} percent success rate`}
          >
            <Text style={[styles.statValue, { color: colors.brandAccent }]}>
              {Math.round(completionRate)}%
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Success Rate</Text>
          </View>
        </View>
      </GlassCard>

      {/* Challenge Progress */}
      <GlassCard style={styles.progressCard}>
        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Challenge Progress</Text>
        {challenges.map((challenge) => {
          const isCompleted = completedChallenges.includes(challenge.id);
          return (
            <View key={challenge.id} style={styles.challengeItem}>
              <View style={styles.challengeHeader}>
                <Text style={[styles.challengeTitle, { color: colors.textPrimary }]}>
                  {challenge.title}
                </Text>
                <Ionicons
                  name={isCompleted ? 'checkmark-circle' : 'time-outline'}
                  size={THEME.fonts.sizes.lg}
                  color={isCompleted ? colors.brandSecondary : colors.textSecondary}
                  accessible={false}
                />
              </View>
              <AnimatedProgressBar progress={challenge.progress} colors={colors} />
              <Text style={[styles.progressText, { color: colors.textSecondary }]}>
                {Math.round(challenge.progress)}% • {challenge.points} points
              </Text>
            </View>
          );
        })}
      </GlassCard>

      {/* Achievements */}
      <GlassCard style={styles.achievementsCard}>
        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Achievements</Text>

        {totalPoints >= 100 && (
          <View style={styles.achievement}>
            <Ionicons
              name="trophy"
              size={THEME.fonts.sizes.xl}
              color={colors.brandAccent}
              accessible={false}
            />
            <Text style={[styles.achievementText, { color: colors.textPrimary }]}>
              First 100 Points!
            </Text>
          </View>
        )}

        {completedChallenges.length >= 1 && (
          <View style={styles.achievement}>
            <Ionicons
              name="musical-notes"
              size={THEME.fonts.sizes.xl}
              color={colors.brandAccent}
              accessible={false}
            />
            <Text style={[styles.achievementText, { color: colors.textPrimary }]}>Music Lover</Text>
          </View>
        )}

        {completionRate >= 100 && (
          <View style={styles.achievement}>
            <Ionicons
              name="star"
              size={THEME.fonts.sizes.xl}
              color={colors.brandAccent}
              accessible={false}
            />
            <Text style={[styles.achievementText, { color: colors.textPrimary }]}>
              Perfect Score!
            </Text>
          </View>
        )}

        {totalPoints === 0 && completedChallenges.length === 0 && (
          <Text style={[styles.noAchievements, { color: colors.textTertiary }]}>
            Complete challenges to unlock achievements!
          </Text>
        )}
      </GlassCard>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: THEME.spacing.md,
  },
  header: {
    fontSize: THEME.fonts.sizes.xxl,
    fontWeight: 'bold',
    marginVertical: THEME.spacing.lg,
    textAlign: 'center',
  },
  themeCard: {
    marginBottom: THEME.spacing.md,
  },
  themeOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: THEME.spacing.sm,
  },
  themeOption: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: THEME.spacing.md,
    borderRadius: THEME.borderRadius.sm,
    borderWidth: StyleSheet.hairlineWidth * 2,
  },
  themeOptionLabel: {
    fontSize: THEME.fonts.sizes.sm,
    fontWeight: '600',
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
    marginBottom: THEME.spacing.xs,
  },
  statLabel: {
    fontSize: THEME.fonts.sizes.sm,
  },
  statSubvalue: {
    fontSize: THEME.fonts.sizes.sm,
  },
  progressCard: {
    marginBottom: THEME.spacing.md,
  },
  sectionTitle: {
    fontSize: THEME.fonts.sizes.lg,
    fontWeight: 'bold',
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
  },
  challengeStatusCompleted: {
    fontSize: THEME.fonts.sizes.lg,
  },
  challengeStatusPending: {
    fontSize: THEME.fonts.sizes.lg,
  },
  progressBar: {
    height: THEME.spacing.xs,
    borderRadius: THEME.spacing.xs,
    overflow: 'hidden',
    marginBottom: THEME.spacing.xs,
  },
  progressFill: {
    height: '100%',
    borderRadius: THEME.spacing.xs,
  },
  progressText: {
    fontSize: THEME.fonts.sizes.sm,
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
  },
  noAchievements: {
    fontSize: THEME.fonts.sizes.sm,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
