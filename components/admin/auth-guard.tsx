"use client"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { Loader2 } from "lucide-react"

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    // Vérifier si l'utilisateur est authentifié
    const checkAuth = () => {
      const isAuth = localStorage.getItem("adminAuthenticated") === "true"
      setIsAuthenticated(isAuth)
      setIsLoading(false)

      if (!isAuth && !pathname.includes("/admin/auth/")) {
        router.push("/admin/auth/login")
      }
    }

    checkAuth()
  }, [pathname, router])

  // Afficher un écran de chargement pendant la vérification
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-950">
        <Loader2 className="h-10 w-10 text-purple-500 animate-spin mb-4" />
        <p className="text-gray-400">Vérification de l'authentification...</p>
      </div>
    )
  }

  // Si l'utilisateur est sur une page d'authentification, ne pas appliquer de protection
  if (pathname.includes("/admin/auth/")) {
    return <>{children}</>
  }

  // Si l'utilisateur est authentifié, afficher le contenu
  if (isAuthenticated) {
    return <>{children}</>
  }

  // Par défaut, ne rien afficher (la redirection vers la page de connexion sera déclenchée)
  return null
}