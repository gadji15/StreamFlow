"use client"

import { CircularProgress } from "@/components/ui/progress"

export default function LoadingScreen() {
  return (
    <div className="h-screen w-full flex items-center justify-center bg-gray-950">
      <div className="text-center">
        <CircularProgress size="lg" />
        <p className="text-gray-400 mt-4">Chargement du panneau d'administration...</p>
      </div>
    </div>
  )
}