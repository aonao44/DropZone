import { useState } from "react";

interface ToastOptions {
  title: string;
  description?: string;
  duration?: number;
  id?: string;
}

export function useToast() {
  const [toasts, setToasts] = useState<ToastOptions[]>([]);

  const toast = (options: ToastOptions) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast = { ...options, id };

    setToasts((currentToasts) => [...currentToasts, newToast]);

    // 自動で消える
    if (options.duration !== Infinity) {
      setTimeout(() => {
        setToasts((currentToasts) => currentToasts.filter((toast) => toast.id !== id));
      }, options.duration || 3000);
    }

    return id;
  };

  return { toast, toasts };
}
