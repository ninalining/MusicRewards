// GlassButton component - Glass-styled button with loading state
import React, { useCallback } from 'react';
import {
  Text,
  TouchableOpacity,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  StyleSheet,
} from 'react-native';
import { GlassCard } from './GlassCard';
import { useTheme } from '../../hooks/useTheme';
import { THEME } from '../../constants/theme';
import { hapticLight } from '../../utils/haptics';

interface GlassButtonProps {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  variant?: 'primary' | 'secondary';
  accessibilityHint?: string;
}

export const GlassButton: React.FC<GlassButtonProps> = ({
  title,
  onPress,
  loading = false,
  disabled = false,
  style,
  textStyle,
  variant = 'primary',
  accessibilityHint,
}) => {
  const { colors } = useTheme();
  const gradientColors = variant === 'primary' ? colors.glassPrimary : colors.glassSecondary;

  const handlePress = useCallback((): void => {
    hapticLight();
    onPress();
  }, [onPress]);

  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={disabled || loading}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityHint={accessibilityHint ?? 'Double tap to activate'}
      style={StyleSheet.flatten([styles.touchable, style])}
    >
      <GlassCard gradientColors={gradientColors} style={styles.button}>
        {loading ? (
          <ActivityIndicator
            color={colors.textPrimary}
            size="small"
            accessibilityRole="progressbar"
            accessibilityLabel={`Loading ${title}`}
          />
        ) : (
          <Text style={[styles.buttonText, { color: colors.textPrimary }, textStyle]}>{title}</Text>
        )}
      </GlassCard>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  touchable: {
    minHeight: THEME.sizing.buttonHeight,
  },
  button: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    fontSize: THEME.fonts.sizes.md,
    fontWeight: '600',
  },
});
