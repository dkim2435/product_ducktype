import { useState, useCallback, useRef } from 'react';
import type { ToastNotification } from '../types/gamification';

const TOAST_DURATION = 4000; // 4 seconds

export function useToast() {
  const [toasts, setToasts] = useState<ToastNotification[]>([]);
  const timersRef = useRef<Map<string, number>>(new Map());

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
    const timer = timersRef.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timersRef.current.delete(id);
    }
  }, []);

  const addToast = useCallback((toast: Omit<ToastNotification, 'id'>) => {
    const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
    const notification: ToastNotification = { ...toast, id };

    setToasts(prev => [...prev, notification]);

    const timer = window.setTimeout(() => {
      removeToast(id);
    }, TOAST_DURATION);
    timersRef.current.set(id, timer);

    return id;
  }, [removeToast]);

  return { toasts, addToast, removeToast };
}
