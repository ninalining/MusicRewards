import { create } from 'zustand';
import type { ToastType, ToastStore } from '../types/toast';
import { hapticError } from '../utils/haptics';

/** Kept outside Zustand — timer IDs are not serializable state. */
let dismissTimer: ReturnType<typeof setTimeout> | null = null;
let clearDataTimer: ReturnType<typeof setTimeout> | null = null;

const AUTO_DISMISS_MS = 3000;
const EXIT_ANIMATION_MS = 300;

export const useToastStore = create<ToastStore>((set) => ({
  toast: null,
  visible: false,

  showToast: (message: string, type: ToastType): void => {
    if (dismissTimer !== null) {
      clearTimeout(dismissTimer);
      dismissTimer = null;
    }
    if (clearDataTimer !== null) {
      clearTimeout(clearDataTimer);
      clearDataTimer = null;
    }

    if (type === 'error') {
      hapticError();
    }

    set({ toast: { message, type }, visible: true });

    dismissTimer = setTimeout(() => {
      set({ visible: false });
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

export const selectToast = (state: ToastStore): ToastStore['toast'] => state.toast;
export const selectToastVisible = (state: ToastStore): boolean => state.visible;
