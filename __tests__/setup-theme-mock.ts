// Jest setup: auto-mock useTheme for all component tests

jest.mock('../src/hooks/useTheme', () => {
  const { createContext, useContext } = jest.requireActual('react');
  const { darkPalette } = jest.requireActual('../src/constants/theme');

  const mockValue = {
    colors: darkPalette,
    resolvedTheme: 'dark',
    preference: 'system',
    setPreference: jest.fn(),
  };

  // Use a real React context so class components with static contextType work correctly
  const ThemeContext = createContext(mockValue);

  const useTheme = () => {
    const ctx = useContext(ThemeContext);
    return ctx ?? mockValue;
  };

  return { useTheme, ThemeContext };
});
