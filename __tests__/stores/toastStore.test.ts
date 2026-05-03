// Tests for toastStore
import { hapticError } from '../../src/utils/haptics';
import { useToastStore } from '../../src/stores/toastStore';

// Mock haptics
jest.mock('../../src/utils/haptics', () => ({
  hapticError: jest.fn(),
}));

beforeEach(() => {
  jest.useFakeTimers();
  // Reset store between tests
  useToastStore.setState({ toast: null, visible: false });
  jest.clearAllMocks();
});

afterEach(() => {
  jest.useRealTimers();
});

describe('toastStore', () => {
  it('shows a toast with message and type', () => {
    const { showToast } = useToastStore.getState();
    showToast('Hello', 'info');

    const state = useToastStore.getState();
    expect(state.toast).toEqual({ message: 'Hello', type: 'info' });
    expect(state.visible).toBe(true);
  });

  it('auto-dismisses after 3 seconds', () => {
    const { showToast } = useToastStore.getState();
    showToast('Goodbye', 'success');

    jest.advanceTimersByTime(3000);
    expect(useToastStore.getState().visible).toBe(false);

    // Toast data cleared after exit animation delay
    jest.advanceTimersByTime(300);
    expect(useToastStore.getState().toast).toBeNull();
  });

  it('hides toast immediately when hideToast is called', () => {
    const { showToast, hideToast } = useToastStore.getState();
    showToast('Test', 'info');
    hideToast();

    expect(useToastStore.getState().visible).toBe(false);
    jest.advanceTimersByTime(300);
    expect(useToastStore.getState().toast).toBeNull();
  });

  it('cancels previous timer when a new toast is shown', () => {
    const { showToast } = useToastStore.getState();
    showToast('First', 'info');

    // Advance 2 seconds (not enough to dismiss first)
    jest.advanceTimersByTime(2000);
    expect(useToastStore.getState().visible).toBe(true);

    // Show new toast — should reset timer
    showToast('Second', 'error');
    expect(useToastStore.getState().toast?.message).toBe('Second');

    // Advance 2 seconds — old timer would have fired at 3s total, but was cancelled
    jest.advanceTimersByTime(2000);
    expect(useToastStore.getState().visible).toBe(true);

    // Advance remaining 1 second — new timer fires at 3s from "Second"
    jest.advanceTimersByTime(1000);
    expect(useToastStore.getState().visible).toBe(false);
  });

  it('triggers hapticError for error toasts', () => {
    const { showToast } = useToastStore.getState();
    showToast('Oops', 'error');

    expect(hapticError).toHaveBeenCalledTimes(1);
  });

  it('does not trigger haptic for non-error toasts', () => {
    const { showToast } = useToastStore.getState();
    showToast('Nice', 'success');
    showToast('FYI', 'info');

    expect(hapticError).not.toHaveBeenCalled();
  });
});
