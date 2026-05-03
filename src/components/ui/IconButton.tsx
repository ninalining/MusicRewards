import React, { useCallback } from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { THEME } from '../../constants/theme';
import { hapticLight } from '../../utils/haptics';

export interface IconButtonProps {
  onPress: () => void;
  accessibilityLabel: string;
  accessibilityHint?: string;
  disabled?: boolean;
  children: React.ReactNode;
}

export const IconButton = React.memo<IconButtonProps>(function IconButton({
  onPress,
  accessibilityLabel,
  accessibilityHint,
  disabled = false,
  children,
}) {
  const handlePress = useCallback((): void => {
    hapticLight();
    onPress();
  }, [onPress]);

  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={disabled}
      activeOpacity={0.6}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      style={styles.button}
    >
      {children}
    </TouchableOpacity>
  );
});

IconButton.displayName = 'IconButton';

const styles = StyleSheet.create({
  button: {
    width: THEME.sizing.iconButton,
    height: THEME.sizing.iconButton,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
