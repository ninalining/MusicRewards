// Toast notification component — animated, theme-aware, accessible
import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useToastStore } from '../../stores/toastStore';
import { useTheme } from '../../hooks/useTheme';
import { THEME } from '../../constants/theme';
import type { ToastType } from '../../types/toast';

const ANIMATION_DURATION_IN = 300;
const ANIMATION_DURATION_OUT = 250;
const SLIDE_OFFSET = -100;

function getAccentColor(type: ToastType, colors: ReturnType<typeof useTheme>['colors']): string {
  switch (type) {
    case 'success':
      return colors.brandPrimary;
    case 'error':
      return colors.error;
    case 'info':
      return colors.brandAccent;
  }
}

export const Toast = React.memo(function Toast(): React.ReactElement | null {
  const toast = useToastStore((s) => s.toast);
  const visible = useToastStore((s) => s.visible);
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  const translateY = useRef(new Animated.Value(SLIDE_OFFSET)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible && toast) {
      // Slide in
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 0,
          duration: ANIMATION_DURATION_IN,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: ANIMATION_DURATION_IN,
          useNativeDriver: true,
        }),
      ]).start();
    } else if (!visible && toast) {
      // Slide out
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: SLIDE_OFFSET,
          duration: ANIMATION_DURATION_OUT,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: ANIMATION_DURATION_OUT,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, toast, translateY, opacity]);

  if (!toast) return null;

  const accent = getAccentColor(toast.type, colors);

  return (
    <Animated.View
      style={[
        styles.container,
        {
          top: insets.top + THEME.spacing.sm,
          backgroundColor: colors.surfaceSecondary,
          borderLeftColor: accent,
          transform: [{ translateY }],
          opacity,
        },
      ]}
      accessibilityRole="alert"
      accessibilityLabel={toast.message}
      accessible
    >
      <View style={styles.content}>
        <Text
          style={[styles.message, { color: colors.textPrimary }]}
          numberOfLines={2}
          accessible={false}
        >
          {toast.message}
        </Text>
      </View>
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: THEME.spacing.md,
    right: THEME.spacing.md,
    borderRadius: THEME.borderRadius.sm,
    borderLeftWidth: 4,
    paddingHorizontal: THEME.spacing.md,
    paddingVertical: THEME.spacing.sm + THEME.spacing.xs,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: THEME.spacing.sm,
    zIndex: 9999,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  message: {
    flex: 1,
    fontSize: THEME.fonts.sizes.sm,
    lineHeight: 20,
    fontWeight: '500',
  },
});
