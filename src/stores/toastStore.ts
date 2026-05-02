// Zustand store for toast notifications (transient — no persistence)
import { create } from 'zustand';
import type { ToastType, ToastStore } from '../types/toast';
import { hapticError } from '../utils/haptics';

/** Module-level timer ID for auto-dismiss — kept outside Zustand (not serializable state). */
let dismissTimer: ReturnType<typeof setTimeout> | null = null;
/** Inner timer for clearing toast data after exit animation. */
let clearDataTimer: ReturnType<typeof setTimeout> | null = null;

/** Default auto-dismiss duration in milliseconds. */
const AUTO_DISMISS_MS = 3000;
/** Duration to wait for exit animation before clearing toast data. */
const EXIT_ANIMATION_MS = 300;

export const useToastStore = create<ToastStore>((set) => ({
  toast: null,
  visible: false,

  showToast: (message: string, type: ToastType): void => {
    // Cancel any pending timers from a previous toast
    if (dismissTimer !== null) {
      clearTimeout(dismissTimer);
      dismissTimer = null;
    }
    if (clearDataTimer !== null) {
      clearTimeout(clearDataTimer);
      clearDataTimer = null;
    }

    // Trigger haptic feedback for error toasts
    if (type === 'error') {
      hapticError();
    }

    set({ toast: { message, type }, visible: true });

    // Schedule auto-dismiss
    dismissTimer = setTimeout(() => {
      set({ visible: false });
      // Clear toast data after allowing exit animation time
      clearDataTimer = setTimeout(() => {
        set({ toast: null });
        clearDataTimer = null;
      }, EXIT_ANIMATION_MS);
      dismissTimer = null;
    }, AUTO_DISMISS_MS);
  },

  hideToast: (): void => {
    if (dismissTimer !== null) {
      clearTimeout(dismissTimer);
      dismissTimer = null;
    }
    if (clearDataTimer !== null) {
      clearTimeout(clearDataTimer);
      clearDataTimer = null;
    }
    set({ visible: false });
    clearDataTimer = setTimeout(() => {
      set({ toast: null });
      clearDataTimer = null;
    }, EXIT_ANIMATION_MS);
  },
}));

// Selectors
export const selectToast = (state: ToastStore): ToastStore['toast'] => state.toast;
export const selectToastVisible = (state: ToastStore): boolean => state.visible;
