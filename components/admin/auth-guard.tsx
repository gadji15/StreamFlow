"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import LoadingScreen from "@/components/admin/loading-screen"
import { auth } from "@/lib/firebase/config"
import { onAuthStateChanged } from "firebase/auth"
import { verifyAdmin } from "@/lib/firebase/firestore/admins"
import { updateAdminLastLogin } from "@/lib/firebase/auth"

interface AuthGuardProps {
  children: React.ReactNode
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          // Vérifier si l'utilisateur est un administrateur
          const adminStatus = await verifyAdmin(user.uid)
          
          if (adminStatus.isAdmin) {
            // L'utilisateur est authentifié et a les privilèges admin
            setIsAuthenticated(true)
            
            // Optionnel: Stocker les données admin dans localStorage
            if(adminStatus.adminData) {
              localStorage.setItem("adminId", user.uid)
              localStorage.setItem("adminEmail", user.email || "")
              localStorage.setItem("adminName", adminStatus.adminData.name || "")
              localStorage.setItem("adminRole", adminStatus.adminData.role || "")
              localStorage.setItem("isAdminLoggedIn", "true") // Indicateur simple
            }
            
            // Mettre à jour la dernière connexion
            await updateAdminLastLogin(user.uid)
          } else {
            // L'utilisateur n'est pas un admin, déconnecter et rediriger
            await auth.signOut(); // Déconnecter
            localStorage.removeItem("isAdminLoggedIn"); // Nettoyer localStorage
            router.push("/admin/auth/login")
          }
        } catch (error) {
          console.error("Erreur lors de la vérification du statut admin:", error)
          await auth.signOut(); // Déconnecter en cas d'erreur
          localStorage.removeItem("isAdminLoggedIn");
          router.push("/admin/auth/login")
        }
      } else {
        // L'utilisateur n'est pas authentifié, rediriger vers login
        localStorage.removeItem("isAdminLoggedIn");
        router.push("/admin/auth/login")
      }
      
      setIsLoading(false)
    })

    // Nettoyer l'écouteur lors du démontage du composant
    return () => unsubscribe()
  }, [router])

  if (isLoading) {
    return <LoadingScreen />
  }

  // Rendre le contenu enfant seulement si l'utilisateur est authentifié et admin
  return isAuthenticated ? <>{children}</> : null
}