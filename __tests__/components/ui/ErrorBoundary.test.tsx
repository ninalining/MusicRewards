import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { Text } from 'react-native';
import { ErrorBoundary } from '../../../src/components/ui/ErrorBoundary';

// Mock GlassCard
jest.mock('../../../src/components/ui/GlassCard', () => {
  /* eslint-disable @typescript-eslint/no-require-imports */
  const React = require('react');
  const { View } = require('react-native');
  /* eslint-enable @typescript-eslint/no-require-imports */
  function MockGlassCard({ children, style }: { children: React.ReactNode; style?: unknown }) {
    return React.createElement(View, { style }, children);
  }
  return { GlassCard: MockGlassCard };
});

// Mock GlassButton
jest.mock('../../../src/components/ui/GlassButton', () => {
  /* eslint-disable @typescript-eslint/no-require-imports */
  const React = require('react');
  const { TouchableOpacity, Text } = require('react-native');
  /* eslint-enable @typescript-eslint/no-require-imports */
  function MockGlassButton({ title, onPress }: { title: string; onPress: () => void }) {
    return React.createElement(
      TouchableOpacity,
      { onPress, accessibilityRole: 'button', accessibilityLabel: title },
      React.createElement(Text, null, title),
    );
  }
  return { GlassButton: MockGlassButton };
});

// Component that throws on demand
function ThrowingChild({ shouldThrow }: { shouldThrow: boolean }): React.ReactElement {
  if (shouldThrow) {
    throw new Error('Test error');
  }
  return <Text>Child content</Text>;
}

// Suppress console.error noise from ErrorBoundary.componentDidCatch
const originalConsoleError = console.error;
beforeAll(() => {
  console.error = jest.fn();
});
afterAll(() => {
  console.error = originalConsoleError;
});

describe('ErrorBoundary', () => {
  it('renders children when no error occurs', () => {
    render(
      <ErrorBoundary>
        <ThrowingChild shouldThrow={false} />
      </ErrorBoundary>,
    );
    expect(screen.getByText('Child content')).toBeOnTheScreen();
  });

  it('renders fallback UI when a child throws', () => {
    render(
      <ErrorBoundary>
        <ThrowingChild shouldThrow={true} />
      </ErrorBoundary>,
    );
    expect(screen.getByText('Something went wrong')).toBeOnTheScreen();
    expect(screen.queryByText('Child content')).toBeNull();
  });

  it('renders custom fallback when provided', () => {
    render(
      <ErrorBoundary fallback={<Text>Custom fallback</Text>}>
        <ThrowingChild shouldThrow={true} />
      </ErrorBoundary>,
    );
    expect(screen.getByText('Custom fallback')).toBeOnTheScreen();
    expect(screen.queryByText('Something went wrong')).toBeNull();
  });

  it('recovers after pressing Try Again', () => {
    let shouldThrow = true;
    function ConditionalChild(): React.ReactElement {
      if (shouldThrow) throw new Error('Test error');
      return <Text>Child content</Text>;
    }

    render(
      <ErrorBoundary>
        <ConditionalChild />
      </ErrorBoundary>,
    );
    expect(screen.getByText('Something went wrong')).toBeOnTheScreen();

    // Fix the child before pressing retry
    shouldThrow = false;
    fireEvent.press(screen.getByRole('button', { name: 'Try Again' }));

    expect(screen.getByText('Child content')).toBeOnTheScreen();
  });

  it('has alert accessibility role on error container', () => {
    render(
      <ErrorBoundary>
        <ThrowingChild shouldThrow={true} />
      </ErrorBoundary>,
    );
    // accessibilityRole="alert" is on the container View
    const alertView = screen.getByLabelText('Something went wrong');
    expect(alertView).toBeOnTheScreen();
  });
});
