// Glass Card component - Belong's signature UI
import React from 'react';
import { View, ViewStyle, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { THEME } from '../../constants/theme';

// Glass Card Component
interface GlassCardProps {
  children: React.ReactNode;
  blurIntensity?: number;
  borderRadius?: number;
  style?: ViewStyle;
  gradientColors?: readonly string[];
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  blurIntensity = THEME.glass.blurIntensity,
  borderRadius = THEME.borderRadius.md,
  gradientColors = THEME.glass.gradientColors.card,
  style,
}) => {
  return (
    <View style={StyleSheet.flatten([{ borderRadius, overflow: 'hidden' }, style])}>
      <BlurView intensity={blurIntensity} style={StyleSheet.absoluteFillObject} tint="dark" />

      <LinearGradient
        colors={gradientColors as [string, string]}
        style={StyleSheet.absoluteFillObject}
      />

      <View style={[styles.borderOverlay, { borderRadius }]} />

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
    borderColor: THEME.colors.border,
  },
});
