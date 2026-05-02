// Toast notification type definitions

/** Visual type variants for toast notifications. */
export type ToastType = 'success' | 'error' | 'info';

/** Data payload for a single toast notification. */
export interface ToastData {
  message: string;
  type: ToastType;
}

/** Zustand store state for toast notifications. */
export type ToastState = {
  toast: ToastData | null;
  visible: boolean;
};

/** Zustand store state + actions for toast notifications. */
export type ToastStore = ToastState & {
  showToast: (message: string, type: ToastType) => void;
  hideToast: () => void;
};
