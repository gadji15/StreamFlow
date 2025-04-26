// Adapted from shadcn-ui
import { useState, useEffect, useCallback } from "react"

export type ToastVariant = "default" | "destructive"

export interface Toast {
  id: string
  title?: string
  description?: string
  variant?: ToastVariant
  duration?: number
  action?: React.ReactNode
}

const TOAST_DURATION = 5000

export interface UseToastReturn {
  toast: (data: Omit<Toast, "id">) => void
  dismiss: (id: string) => void
  toasts: Toast[]
}

export function useToast(): UseToastReturn {
  const [toasts, setToasts] = useState<Toast[]>([])

  const dismiss = useCallback((id: string) => {
    setToasts((prevToasts) => prevToasts.filter(toast => toast.id !== id))
  }, [])

  const toast = useCallback(
    (data: Omit<Toast, "id">) => {
      const newToast = {
        id: Date.now().toString(),
        ...data,
        duration: data.duration ?? TOAST_DURATION,
      }

      setToasts((prevToasts) => [...prevToasts, newToast])

      return newToast.id
    },
    []
  )

  // Handle toast duration and auto-dismiss
  useEffect(() => {
    const interval = setInterval(() => {
      setToasts((prevToasts) => {
        const now = Date.now()
        
        return prevToasts.filter((toast) => {
          const toastTime = parseInt(toast.id)
          const toastDuration = toast.duration ?? TOAST_DURATION
          
          return now - toastTime < toastDuration
        })
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  return {
    toast,
    dismiss,
    toasts,
  }
}