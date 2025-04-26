"use client";

import { useState, createContext, useContext, useEffect } from "react";
import { X } from "lucide-react";

interface Toast {
  id: string;
  title: string;
  description?: string;
  variant?: "default" | "destructive";
  duration?: number;
}

interface ToastContextType {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, "id">) => void;
  dismissToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType>({
  toasts: [],
  addToast: () => {},
  dismissToast: () => {},
});

export function ToastProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (toast: Omit<Toast, "id">) => {
    const id = Date.now().toString();
    const newToast = { ...toast, id };
    setToasts((currentToasts) => [...currentToasts, newToast]);

    // Auto-dismiss after duration
    if (toast.duration !== Infinity) {
      setTimeout(() => {
        dismissToast(id);
      }, toast.duration || 5000);
    }
  };

  const dismissToast = (id: string) => {
    setToasts((currentToasts) =>
      currentToasts.filter((toast) => toast.id !== id)
    );
  };

  return (
    <ToastContext.Provider value={{ toasts, addToast, dismissToast }}>
      {children}
      <div className="fixed bottom-0 right-0 z-50 p-4 flex flex-col gap-2 max-w-sm">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`p-4 pr-8 rounded shadow-lg ${
              toast.variant === "destructive"
                ? "bg-red-500 text-white"
                : "bg-gray-800 text-white"
            } relative animate-in slide-in-from-bottom-5`}
          >
            <button
              onClick={() => dismissToast(toast.id)}
              className="absolute top-2 right-2 text-gray-300 hover:text-white"
            >
              <X size={16} />
            </button>
            <div className="font-medium">{toast.title}</div>
            {toast.description && (
              <div className="text-sm opacity-90 mt-1">{toast.description}</div>
            )}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};