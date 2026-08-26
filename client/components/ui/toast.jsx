'use client';

import { useEffect, useState } from 'react';
import { X, Check, AlertCircle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

let toastId = 0;
const listeners = new Set();
let toasts = [];

export function toast(opts) {
  const id = ++toastId;
  const item = typeof opts === 'string' ? { id, message: opts, type: 'default' } : { id, ...opts };
  toasts = [...toasts, item];
  listeners.forEach((l) => l([...toasts]));
  setTimeout(() => dismissToast(id), item.duration || 3500);
}

toast.success = (msg) => toast({ message: msg, type: 'success' });
toast.error = (msg) => toast({ message: msg, type: 'error' });
toast.info = (msg) => toast({ message: msg, type: 'info' });

function dismissToast(id) {
  toasts = toasts.filter((t) => t.id !== id);
  listeners.forEach((l) => l([...toasts]));
}

export function ToastContainer() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    listeners.add(setItems);
    return () => listeners.delete(setItems);
  }, []);

  return (
    <div className="fixed bottom-5 right-5 z-[100] flex flex-col gap-2 pointer-events-none select-none max-w-sm w-auto">
      {items.map((item) => {
        const isSuccess = item.type === 'success';
        const isError = item.type === 'error';

        return (
          <div
            key={item.id}
            className={cn(
              'pointer-events-auto flex items-center gap-2.5 px-4 py-2.5 rounded-2xl border bg-card/95 backdrop-blur-xl shadow-xl text-xs font-medium text-foreground transition-all duration-200 animate-in slide-in-from-bottom-3 fade-in',
              'dark:bg-[#202020]/95 dark:border-white/10'
            )}
          >
            {/* Minimal Status Dot / Micro Icon */}
            <div
              className={cn(
                'w-5 h-5 rounded-full flex items-center justify-center shrink-0 border',
                isSuccess && 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
                isError && 'bg-rose-500/10 text-rose-500 border-rose-500/20',
                !isSuccess && !isError && 'bg-accent text-muted-foreground border-border'
              )}
            >
              {isSuccess ? (
                <Check className="w-3 h-3" />
              ) : isError ? (
                <AlertCircle className="w-3 h-3" />
              ) : (
                <Info className="w-3 h-3" />
              )}
            </div>

            <p className="flex-1 text-xs truncate leading-snug">{item.message}</p>

            <button
              onClick={() => dismissToast(item.id)}
              className="shrink-0 p-0.5 rounded-md text-muted-foreground hover:text-foreground opacity-60 hover:opacity-100 transition-opacity"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
