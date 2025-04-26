"use client"

import { useToast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toast"

export function ToastProvider() {
  const { toasts, dismiss } = useToast()

  return <Toaster toasts={toasts} onDismiss={dismiss} />
}