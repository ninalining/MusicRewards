// PointsCounter — animated live-points display
// Pure presentational component; no store access.
import React, { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, Text } from 'react-native';
import type { ViewStyle } from 'react-native';
import { THEME } from '../../constants/theme';

interface PointsCounterProps {
  /** Live-earned points to display. Animates on increase, snaps on decrease. */
  points: number;
  /** Optional label shown below the number (e.g., "pts earned"). */
  label?: string;
  /** When false, number updates immediately without count-up animation. Default: true. */
  animated?: boolean;
  /** Pass-through style for the outer container. */
  style?: ViewStyle;
}

export const PointsCounter = React.memo<PointsCounterProps>(({
  points,
  label,
  animated = true,
  style,
}): React.ReactElement => {
  const safePoints = Number.isFinite(points) ? Math.round(points) : 0;
  const [displayValue, setDisplayValue] = useState(safePoints);
  const displayRef = useRef(safePoints);
  const rafRef = useRef<number | null>(null);
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Cancel any in-progress animation
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }

    const target = Number.isFinite(points) ? Math.round(points) : 0;

    // Snap immediately when animation disabled or points decrease
    if (!animated || target <= displayRef.current) {
      displayRef.current = target;
      setDisplayValue(target);
      return;
    }

    // Scale pulse on increase — runs on UI thread
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1.15,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();

    // Count-up loop via requestAnimationFrame
    const start = displayRef.current;
    const end = target;
    const startTime = Date.now();
    const duration = 300;

    const tick = (): void => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const current = Math.round(start + (end - start) * progress);
      displayRef.current = current;
      setDisplayValue(current);
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        rafRef.current = null;
      }
    };
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [points, animated, scaleAnim]);

  return (
    <Animated.View
      style={[styles.container, { transform: [{ scale: scaleAnim }] }, style]}
    >
      <Text
        style={styles.value}
        accessibilityRole="text"
        accessibilityLabel={`${displayValue} ${label?.trim() || 'points'}`}
      >
        {displayValue}
      </Text>
      {label !== undefined && label !== '' ? (
        <Text style={styles.label} importantForAccessibility="no" accessible={false}>
          {label}
        </Text>
      ) : null}
    </Animated.View>
  );
});

PointsCounter.displayName = 'PointsCounter';

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  value: {
    fontSize: THEME.fonts.sizes.xxl,
    fontWeight: 'bold',
    color: THEME.colors.accent,
  },
  label: {
    fontSize: THEME.fonts.sizes.sm,
    color: THEME.colors.text.secondary,
    marginTop: THEME.spacing.xs,
  },
});
