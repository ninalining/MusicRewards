// Convenience hook for showing toast notifications
import { useCallback } from 'react';
import { useToastStore } from '../stores/toastStore';
import type { ToastType } from '../types/toast';

interface UseToastReturn {
  showToast: (message: string, type: ToastType) => void;
  hideToast: () => void;
}

/** Convenience hook wrapping the toast store actions. */
export const useToast = (): UseToastReturn => {
  const showToast = useToastStore((state) => state.showToast);
  const hideToast = useToastStore((state) => state.hideToast);

  return {
    showToast: useCallback(
      (message: string, type: ToastType) => showToast(message, type),
      [showToast],
    ),
    hideToast,
  };
};
