// Glass Card component - Belong's signature UI
import React from 'react';
import { View, ViewStyle, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../hooks/useTheme';
import { THEME } from '../../constants/theme';

// Glass Card Component
interface GlassCardProps {
  children: React.ReactNode;
  blurIntensity?: number;
  borderRadius?: number;
  style?: ViewStyle;
  gradientColors?: readonly [string, string];
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  blurIntensity = THEME.glass.blurIntensity,
  borderRadius = THEME.borderRadius.md,
  gradientColors,
  style,
}) => {
  const { colors, resolvedTheme } = useTheme();
  const effectiveGradient = gradientColors ?? colors.glassCard;

  return (
    <View style={StyleSheet.flatten([{ borderRadius, overflow: 'hidden' }, style])}>
      <BlurView
        intensity={blurIntensity}
        style={StyleSheet.absoluteFillObject}
        tint={resolvedTheme === 'dark' ? 'dark' : 'light'}
      />

      {/* Cast required: LinearGradient expects mutable array; tuple length is guaranteed by prop type */}
      <LinearGradient
        colors={effectiveGradient as [string, string]}
        style={StyleSheet.absoluteFillObject}
      />

      <View style={[styles.borderOverlay, { borderRadius, borderColor: colors.border }]} />

      <View style={styles.contentContainer}>{children}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  contentContainer: {
    padding: THEME.spacing.md,
  },
  borderOverlay: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 1,
  },
});
