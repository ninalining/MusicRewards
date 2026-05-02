// Tests for useToast hook
import { renderHook } from '@testing-library/react-native';
import { useToast } from '../../src/hooks/useToast';
import { useToastStore } from '../../src/stores/toastStore';

jest.mock('../../src/utils/haptics', () => ({
  hapticError: jest.fn(),
}));

beforeEach(() => {
  useToastStore.setState({ toast: null, visible: false });
});

describe('useToast', () => {
  it('returns showToast and hideToast functions', () => {
    const { result } = renderHook(() => useToast());
    expect(typeof result.current.showToast).toBe('function');
    expect(typeof result.current.hideToast).toBe('function');
  });

  it('showToast updates the store', () => {
    const { result } = renderHook(() => useToast());
    result.current.showToast('Test message', 'info');

    const state = useToastStore.getState();
    expect(state.toast?.message).toBe('Test message');
    expect(state.toast?.type).toBe('info');
    expect(state.visible).toBe(true);
  });
});
