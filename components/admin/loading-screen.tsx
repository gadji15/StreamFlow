"use client"

export default function LoadingScreen() {
  return (
    <div className="h-screen w-full flex items-center justify-center bg-gray-950">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full border-4 border-solid border-purple-500 border-t-transparent h-16 w-16"></div>
        <p className="text-gray-400 mt-4">Chargement du panneau d'administration...</p>
      </div>
    </div>
  )
}