// ErrorBoundary — catches render-time errors and displays recovery UI.
// Class component required: React's componentDidCatch API is class-only.
// This is the sole class component in the project (documented exception).
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { GlassCard } from './GlassCard';
import { GlassButton } from './GlassButton';
import { THEME } from '../../constants/theme';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  errorMessage: string;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
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
    // Always log for diagnostics; console.error is stripped in production builds.
    console.error('ErrorBoundary caught:', error, info.componentStack);
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
            <Text style={styles.title}>Something went wrong</Text>
            <Text style={styles.message} numberOfLines={3}>
              {this.state.errorMessage}
            </Text>
            <GlassButton title="Try Again" onPress={this.handleRetry} />
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
    color: THEME.colors.text.primary,
    textAlign: 'center',
    marginBottom: THEME.spacing.sm,
  },
  message: {
    fontSize: THEME.fonts.sizes.sm,
    color: THEME.colors.text.secondary,
    textAlign: 'center',
    marginBottom: THEME.spacing.lg,
  },
});
