'use client';

import { useEffect, useState } from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

let toastId = 0;
const listeners = new Set();
let toasts = [];

export function toast(opts) {
  const id = ++toastId;
  const item = typeof opts === 'string' ? { id, message: opts, type: 'default' } : { id, ...opts };
  toasts = [...toasts, item];
  listeners.forEach((l) => l([...toasts]));
  setTimeout(() => dismissToast(id), item.duration || 4000);
}

toast.success = (msg) => toast({ message: msg, type: 'success' });
toast.error = (msg) => toast({ message: msg, type: 'error' });
toast.info = (msg) => toast({ message: msg, type: 'info' });

function dismissToast(id) {
  toasts = toasts.filter((t) => t.id !== id);
  listeners.forEach((l) => l([...toasts]));
}

const icons = {
  success: <CheckCircle className="h-4 w-4 text-emerald-500" />,
  error: <AlertCircle className="h-4 w-4 text-red-500" />,
  info: <Info className="h-4 w-4 text-blue-500" />,
  default: <Info className="h-4 w-4 text-primary" />,
};

export function ToastContainer() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    listeners.add(setItems);
    return () => listeners.delete(setItems);
  }, []);

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {items.map((item) => (
        <div
          key={item.id}
          className={cn(
            'pointer-events-auto flex items-start gap-3 rounded-xl border bg-background p-4 shadow-lg animate-in slide-in-from-bottom-5'
          )}
        >
          {icons[item.type] || icons.default}
          <p className="text-sm flex-1">{item.message}</p>
          <button onClick={() => dismissToast(item.id)} className="shrink-0 opacity-50 hover:opacity-100">
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
