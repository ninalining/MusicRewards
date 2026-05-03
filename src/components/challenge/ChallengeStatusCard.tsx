import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { GlassCard } from '../ui/GlassCard';
import { useTheme } from '../../hooks/useTheme';
import { THEME } from '../../constants/theme';

interface ChallengeStatusCardProps {
  completed: boolean;
  progressPercent: number;
}

export const ChallengeStatusCard = React.memo<ChallengeStatusCardProps>(
  function ChallengeStatusCard({ completed, progressPercent }) {
    const { colors } = useTheme();

    return (
      <GlassCard>
        <Text style={[styles.label, { color: colors.textPrimary }]}>Challenge Status</Text>
        <View style={styles.info}>
          <View style={styles.statusRow}>
            <Ionicons
              name={completed ? 'checkmark-circle' : 'headset'}
              size={THEME.fonts.sizes.lg}
              color={completed ? colors.brandSecondary : colors.brandAccent}
              accessible={false}
            />
            <Text
              style={[
                styles.status,
                { color: completed ? colors.brandSecondary : colors.brandAccent },
              ]}
              accessibilityLabel={completed ? 'Completed' : 'In Progress'}
              accessibilityRole="text"
            >
              {completed ? 'Completed' : 'In Progress'}
            </Text>
          </View>
          <Text style={[styles.progress, { color: colors.textSecondary }]}>
            {Math.round(progressPercent)}% of challenge complete
          </Text>
        </View>
      </GlassCard>
    );
  },
);

const styles = StyleSheet.create({
  label: {
    fontSize: THEME.fonts.sizes.md,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: THEME.spacing.md,
  },
  info: {
    alignItems: 'center',
  },
  status: {
    fontSize: THEME.fonts.sizes.lg,
    fontWeight: 'bold',
    marginBottom: THEME.spacing.xs,
    marginLeft: THEME.spacing.xs,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: THEME.spacing.xs,
  },
  progress: {
    fontSize: THEME.fonts.sizes.sm,
  },
});
