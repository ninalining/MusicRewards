// Class component required: React's componentDidCatch API is class-only.
// Sole class component in the project (documented exception).
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { GlassCard } from './GlassCard';
import { GlassButton } from './GlassButton';
import { THEME } from '../../constants/theme';
import { ThemeContext } from '../../hooks/useTheme';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  errorMessage: string;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  static contextType = ThemeContext;

  private get themeColors() {
    // contextType typing doesn't narrow this.context — React/TS limitation.
    const ctx = this.context as React.ContextType<typeof ThemeContext>;
    return ctx?.colors;
  }

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, errorMessage: '' };
  }

  private static getUserFacingMessage(error: unknown): string {
    if (__DEV__) {
      return error instanceof Error ? error.message : String(error);
    }
    return 'Something went wrong. Please try again.';
  }

  static getDerivedStateFromError(error: unknown): ErrorBoundaryState {
    return { hasError: true, errorMessage: ErrorBoundary.getUserFacingMessage(error) };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo): void {
    if (__DEV__) {
      console.error('ErrorBoundary caught:', error, info.componentStack);
    }
  }

  private handleRetry = (): void => {
    this.setState({ hasError: false, errorMessage: '' });
  };

  render(): React.ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <View
          style={styles.container}
          accessibilityRole="alert"
          accessibilityLabel="Something went wrong"
        >
          <GlassCard style={styles.card}>
            <Text style={styles.icon} accessible={false}>
              ⚠️
            </Text>
            <Text
              style={[styles.title, this.themeColors && { color: this.themeColors.textPrimary }]}
            >
              Something went wrong
            </Text>
            <Text
              style={[
                styles.message,
                this.themeColors && { color: this.themeColors.textSecondary },
              ]}
              numberOfLines={3}
            >
              {this.state.errorMessage}
            </Text>
            <GlassButton
              title="Try Again"
              onPress={this.handleRetry}
              accessibilityHint="Double tap to retry"
            />
          </GlassCard>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: THEME.spacing.lg,
  },
  card: {
    alignItems: 'center',
  },
  icon: {
    fontSize: THEME.fonts.sizes.xxl,
    textAlign: 'center',
    marginBottom: THEME.spacing.md,
  },
  title: {
    fontSize: THEME.fonts.sizes.lg,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: THEME.spacing.sm,
  },
  message: {
    fontSize: THEME.fonts.sizes.sm,
    textAlign: 'center',
    marginBottom: THEME.spacing.lg,
  },
});
