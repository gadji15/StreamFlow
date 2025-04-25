"use client"

import { useEffect, useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import AdminSidebar from "@/components/admin/admin-sidebar"
import AdminHeader from "@/components/admin/admin-header"
import LoadingScreen from "@/components/admin/loading-screen"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)

  // Vérifier l'authentification au chargement
  useEffect(() => {
    const checkAuth = () => {
      const adminAuth = localStorage.getItem("adminAuthenticated")
      if (!adminAuth || adminAuth !== "true") {
        // Rediriger vers la page de connexion si non authentifié
        if (!pathname.includes("/admin/auth/")) {
          router.push("/admin/auth/login")
        }
        setIsAuthenticated(false)
      } else {
        setIsAuthenticated(true)
      }
    }

    checkAuth()
  }, [pathname, router])

  // Afficher un écran de chargement pendant que l'on vérifie l'authentification
  if (isAuthenticated === null) {
    return <LoadingScreen />
  }

  // Si nous sommes sur la page de connexion, afficher directement le contenu
  if (pathname.includes("/admin/auth/")) {
    return <>{children}</>
  }

  // Si non authentifié, ne rien afficher (la redirection aura lieu)
  if (!isAuthenticated) {
    return <LoadingScreen />
  }

  // Si authentifié, afficher l'interface admin
  return (
    <div className="flex h-screen bg-gray-950">
      <AdminSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-900 p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}