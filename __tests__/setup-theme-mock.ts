// Jest setup: auto-mock useTheme for all component tests
import React from 'react';

jest.mock('../src/hooks/useTheme', () => {
  const { darkPalette } = jest.requireActual('../src/constants/theme');
  return {
    useTheme: () => ({
      colors: darkPalette,
      resolvedTheme: 'dark',
      preference: 'system',
      setPreference: jest.fn(),
    }),
    ThemeContext: {
      Provider: ({ children }: { children: React.ReactNode }) => children,
      Consumer: ({ children }: { children: (value: unknown) => React.ReactNode }) =>
        children({
          colors: darkPalette,
          resolvedTheme: 'dark',
          preference: 'system',
          setPreference: jest.fn(),
        }),
    },
  };
});
