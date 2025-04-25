import { cn } from "@/lib/utils"

interface LoadingScreenProps {
  message?: string
  className?: string
}

export default function LoadingScreen({ 
  message = "Chargement...", 
  className 
}: LoadingScreenProps) {
  return (
    <div className={cn("flex min-h-screen flex-col items-center justify-center bg-gray-950", className)}>
      <div className="space-y-4 text-center">
        <div className="inline-flex items-center justify-center h-16 w-16 relative">
          <div className="absolute h-12 w-12 border-4 border-primary rounded-full border-solid"></div>
          <div className="absolute h-12 w-12 border-4 border-transparent border-t-white rounded-full animate-spin"></div>
        </div>
        <div className="text-lg text-gray-400">{message}</div>
      </div>
    </div>
  )
}