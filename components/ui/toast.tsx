"use client"

import { forwardRef } from "react"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Toast, ToastVariant } from "./use-toast"

interface ToastProps extends React.HTMLAttributes<HTMLDivElement> {
  toast: Toast
  onDismiss: () => void
}

export const ToastItem = forwardRef<HTMLDivElement, ToastProps>(
  ({ toast, onDismiss, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "relative flex w-full max-w-md items-center justify-between space-x-4 overflow-hidden rounded-md border p-4 shadow-lg transition-all",
          toast.variant === "destructive"
            ? "border-red-500 bg-red-800/20 text-red-300"
            : "border-gray-700 bg-gray-800 text-white",
          className
        )}
        {...props}
      >
        <div className="flex flex-col gap-1">
          {toast.title && <p className="font-semibold">{toast.title}</p>}
          {toast.description && <p className="text-sm opacity-90">{toast.description}</p>}
        </div>

        <button
          onClick={onDismiss}
          className={cn(
            "absolute top-2 right-2 rounded-md p-1",
            toast.variant === "destructive"
              ? "text-red-300 hover:text-red-100"
              : "text-gray-400 hover:text-white"
          )}
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    )
  }
)
ToastItem.displayName = "Toast"

export interface ToasterProps {
  toasts: Toast[]
  onDismiss: (id: string) => void
}

export function Toaster({ toasts, onDismiss }: ToasterProps) {
  return (
    <div className="fixed bottom-0 right-0 z-50 flex flex-col gap-2 p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:min-w-[400px]">
      {toasts.map((toast) => (
        <ToastItem
          key={toast.id}
          toast={toast}
          onDismiss={() => onDismiss(toast.id)}
        />
      ))}
    </div>
  )
}