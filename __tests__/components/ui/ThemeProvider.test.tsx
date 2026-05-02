// ThemeProvider tests
import React from 'react';
import { render } from '@testing-library/react-native';
import { Text } from 'react-native';
import { darkPalette, lightPalette } from '../../../src/constants/theme';
import { useThemeStore } from '../../../src/stores/themeStore';
import type { ThemeContextValue } from '../../../src/types/theme';

// Unmock useTheme for this file — we're testing the real provider
jest.unmock('../../../src/hooks/useTheme');
const { useTheme } = jest.requireActual('../../../src/hooks/useTheme') as {
  useTheme: () => ThemeContextValue;
};

// Mock useColorScheme
let mockColorScheme: 'light' | 'dark' = 'dark';
jest.mock('react-native/Libraries/Utilities/useColorScheme', () => ({
  __esModule: true,
  default: () => mockColorScheme,
}));

// Reimport ThemeProvider after mocks are set up
// Reimport ThemeProvider after mocks are set up
const { ThemeProvider } = jest.requireActual('../../../src/components/ui/ThemeProvider') as {
  ThemeProvider: React.FC<{ children: React.ReactNode }>;
};

function ThemeConsumer(): React.ReactElement {
  const { colors, resolvedTheme, preference } = useTheme();
  return (
    <>
      <Text testID="theme">{resolvedTheme}</Text>
      <Text testID="preference">{preference}</Text>
      <Text testID="surface">{colors.surfacePrimary}</Text>
    </>
  );
}

beforeEach(() => {
  useThemeStore.setState({ preference: 'system' });
  mockColorScheme = 'dark';
});

describe('ThemeProvider', () => {
  it('provides dark palette when system is dark and preference is system', () => {
    mockColorScheme = 'dark';
    const { getByTestId } = render(
      <ThemeProvider>
        <ThemeConsumer />
      </ThemeProvider>,
    );

    expect(getByTestId('theme').props.children).toBe('dark');
    expect(getByTestId('surface').props.children).toBe(darkPalette.surfacePrimary);
  });

  it('provides light palette when system is light and preference is system', () => {
    mockColorScheme = 'light';
    const { getByTestId } = render(
      <ThemeProvider>
        <ThemeConsumer />
      </ThemeProvider>,
    );

    expect(getByTestId('theme').props.children).toBe('light');
    expect(getByTestId('surface').props.children).toBe(lightPalette.surfacePrimary);
  });

  it('overrides system with explicit dark preference', () => {
    mockColorScheme = 'light';
    useThemeStore.setState({ preference: 'dark' });

    const { getByTestId } = render(
      <ThemeProvider>
        <ThemeConsumer />
      </ThemeProvider>,
    );

    expect(getByTestId('theme').props.children).toBe('dark');
    expect(getByTestId('preference').props.children).toBe('dark');
  });

  it('overrides system with explicit light preference', () => {
    mockColorScheme = 'dark';
    useThemeStore.setState({ preference: 'light' });

    const { getByTestId } = render(
      <ThemeProvider>
        <ThemeConsumer />
      </ThemeProvider>,
    );

    expect(getByTestId('theme').props.children).toBe('light');
    expect(getByTestId('surface').props.children).toBe(lightPalette.surfacePrimary);
  });
});
