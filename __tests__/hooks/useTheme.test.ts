// useTheme hook tests
import React from 'react';
import { renderHook } from '@testing-library/react-native';
import { ThemeContext } from '../../src/hooks/useTheme';
import { darkPalette } from '../../src/constants/theme';
import type { ThemeContextValue } from '../../src/types/theme';

// Unmock useTheme for this file — we're testing the real implementation
jest.unmock('../../src/hooks/useTheme');
const { useTheme } = jest.requireActual('../../src/hooks/useTheme') as {
  useTheme: () => ThemeContextValue;
};

const mockContextValue: ThemeContextValue = {
  colors: darkPalette,
  resolvedTheme: 'dark',
  preference: 'system',
  setPreference: jest.fn(),
};

function createWrapper(value: ThemeContextValue | undefined) {
  return function Wrapper({ children }: { children: React.ReactNode }): React.ReactElement {
    return React.createElement(ThemeContext.Provider, { value }, children);
  };
}

describe('useTheme', () => {
  it('returns context value when inside ThemeProvider', () => {
    const { result } = renderHook(() => useTheme(), {
      wrapper: createWrapper(mockContextValue),
    });

    expect(result.current.colors).toBe(darkPalette);
    expect(result.current.resolvedTheme).toBe('dark');
    expect(result.current.preference).toBe('system');
    expect(result.current.setPreference).toBeDefined();
  });

  it('throws when used outside ThemeProvider', () => {
    expect(() => {
      renderHook(() => useTheme(), {
        wrapper: createWrapper(undefined),
      });
    }).toThrow('useTheme must be used within a ThemeProvider');
  });
});
