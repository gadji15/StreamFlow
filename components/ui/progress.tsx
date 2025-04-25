"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

// Linear progress bar
interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number
  max?: number
  color?: "default" | "primary" | "secondary" | "success" | "warning" | "danger"
  size?: "sm" | "md" | "lg"
}

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ className, value = 0, max = 100, color = "default", size = "md", ...props }, ref) => {
    const percentage = (value / max) * 100

    const sizeClasses = {
      sm: "h-1",
      md: "h-2",
      lg: "h-3"
    }

    const colorClasses = {
      default: "bg-primary",
      primary: "bg-blue-500",
      secondary: "bg-purple-500",
      success: "bg-green-500",
      warning: "bg-yellow-500",
      danger: "bg-red-500"
    }

    return (
      <div
        ref={ref}
        className={cn("w-full overflow-hidden rounded-full bg-gray-800", sizeClasses[size], className)}
        {...props}
      >
        <div
          className={cn("h-full transition-all", colorClasses[color])}
          style={{ width: `${percentage}%` }}
        />
      </div>
    )
  }
)
Progress.displayName = "Progress"

// Circular progress indicator
interface CircularProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "md" | "lg"
  color?: "default" | "primary" | "secondary" | "success" | "warning" | "danger"
}

const CircularProgress = React.forwardRef<HTMLDivElement, CircularProgressProps>(
  ({ className, size = "md", color = "default", ...props }, ref) => {
    const sizeClasses = {
      sm: "h-6 w-6 border-2",
      md: "h-10 w-10 border-3",
      lg: "h-16 w-16 border-4"
    }

    const colorClasses = {
      default: "border-primary",
      primary: "border-blue-500",
      secondary: "border-purple-500",
      success: "border-green-500",
      warning: "border-yellow-500",
      danger: "border-red-500"
    }

    return (
      <div
        ref={ref}
        className={cn(
          "inline-block animate-spin rounded-full border-solid border-current border-t-transparent",
          sizeClasses[size],
          colorClasses[color],
          className
        )}
        {...props}
      />
    )
  }
)
CircularProgress.displayName = "CircularProgress"

export { Progress, CircularProgress }