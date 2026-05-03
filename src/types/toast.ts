export type ToastType = 'success' | 'error' | 'info';

export interface ToastData {
  message: string;
  type: ToastType;
}

export type ToastState = {
  toast: ToastData | null;
  visible: boolean;
};

export type ToastStore = ToastState & {
  showToast: (message: string, type: ToastType) => void;
  hideToast: () => void;
};
