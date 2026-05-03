// themeStore tests
import { useThemeStore, migrateThemeStore } from '../../src/stores/themeStore';

beforeEach(() => {
  useThemeStore.setState({ preference: 'system' });
});

describe('useThemeStore', () => {
  it('defaults preference to system', () => {
    expect(useThemeStore.getState().preference).toBe('system');
  });

  it('sets preference to dark', () => {
    useThemeStore.getState().setPreference('dark');
    expect(useThemeStore.getState().preference).toBe('dark');
  });

  it('sets preference to light', () => {
    useThemeStore.getState().setPreference('light');
    expect(useThemeStore.getState().preference).toBe('light');
  });

  it('sets preference back to system', () => {
    useThemeStore.getState().setPreference('dark');
    useThemeStore.getState().setPreference('system');
    expect(useThemeStore.getState().preference).toBe('system');
  });
});

describe('migrateThemeStore', () => {
  it('migrates v0 with missing preference to system default', () => {
    const result = migrateThemeStore({}, 0);
    expect(result).toEqual({ preference: 'system' });
  });

  it('migrates v0 preserving existing preference', () => {
    const result = migrateThemeStore({ preference: 'dark' }, 0);
    expect(result).toEqual({ preference: 'dark' });
  });

  it('passes through state for unknown versions', () => {
    const state = { preference: 'light' as const };
    const result = migrateThemeStore(state, 1);
    expect(result).toEqual(state);
  });

  it('handles non-object persisted state gracefully', () => {
    const result = migrateThemeStore(null, 0);
    expect(result).toEqual({ preference: 'system' });
  });
});
