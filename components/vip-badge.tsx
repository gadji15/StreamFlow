import { cn } from "@/lib/utils"

interface VIPBadgeProps {
  className?: string
  size?: "sm" | "md" | "lg"
}

export function VIPBadge({ className, size = "md" }: VIPBadgeProps) {
  const sizeClasses = {
    sm: "text-xs px-1.5 py-0.5",
    md: "text-xs px-2 py-0.5",
    lg: "text-sm px-2.5 py-1",
  }

  return (
    <span
      className={cn(
        "bg-gradient-to-r from-amber-400 to-yellow-600 text-black rounded-full font-bold",
        sizeClasses[size],
        className,
      )}
    >
      VIP
    </span>
  )
}
