// Tests for Toast component
import React from 'react';
import { render } from '@testing-library/react-native';
import { Toast } from '../../../src/components/ui/Toast';
import { useToastStore } from '../../../src/stores/toastStore';

// Mock safe area
jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 44, bottom: 34, left: 0, right: 0 }),
}));

// Mock theme
jest.mock('../../../src/hooks/useTheme', () => ({
  useTheme: () => ({
    colors: {
      surfaceSecondary: '#1a1a2e',
      textPrimary: '#ffffff',
      brandPrimary: '#00ff88',
      brandAccent: '#8b5cf6',
      error: '#ff4444',
    },
    resolvedTheme: 'dark',
  }),
}));

// Suppress Animated native driver warning in tests
jest.mock(
  'react-native/Libraries/Animated/NativeAnimatedHelper',
  () => ({
    default: {
      addListener: jest.fn(),
      removeListeners: jest.fn(),
    },
  }),
  { virtual: true },
);

beforeEach(() => {
  useToastStore.setState({ toast: null, visible: false });
});

describe('Toast', () => {
  it('renders nothing when no toast is active', () => {
    const { toJSON } = render(<Toast />);
    expect(toJSON()).toBeNull();
  });

  it('renders the toast message when visible', () => {
    useToastStore.setState({
      toast: { message: 'Something went wrong', type: 'error' },
      visible: true,
    });

    const { getByText } = render(<Toast />);
    expect(getByText('Something went wrong')).toBeTruthy();
  });

  it('has accessibility role alert', () => {
    useToastStore.setState({
      toast: { message: 'Test alert', type: 'info' },
      visible: true,
    });

    const { getByRole } = render(<Toast />);
    expect(getByRole('alert')).toBeTruthy();
  });

  it('sets accessibilityLabel to the message', () => {
    useToastStore.setState({
      toast: { message: 'Check this', type: 'success' },
      visible: true,
    });

    const { getByLabelText } = render(<Toast />);
    expect(getByLabelText('Check this')).toBeTruthy();
  });
});
