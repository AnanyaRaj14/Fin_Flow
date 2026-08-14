'use client';

import { useState, useCallback } from 'react';

let toastId = 0;

// Simple toast state manager (used with ToastContainer component)
const listeners = new Set();
let toasts = [];

export function addToast(toast) {
  const id = ++toastId;
  const item = { id, ...toast };
  toasts = [...toasts, item];
  listeners.forEach((l) => l(toasts));

  setTimeout(() => {
    removeToast(id);
  }, toast.duration || 4000);

  return id;
}

export function removeToast(id) {
  toasts = toasts.filter((t) => t.id !== id);
  listeners.forEach((l) => l(toasts));
}

export function useToasts() {
  const [items, setItems] = useState(toasts);

  useState(() => {
    listeners.add(setItems);
    return () => listeners.delete(setItems);
  });

  return items;
}

export function useToast() {
  const toast = useCallback((opts) => {
    if (typeof opts === 'string') return addToast({ message: opts, type: 'default' });
    return addToast(opts);
  }, []);

  toast.success = (message) => addToast({ message, type: 'success' });
  toast.error = (message) => addToast({ message, type: 'error' });
  toast.info = (message) => addToast({ message, type: 'info' });

  return toast;
}
