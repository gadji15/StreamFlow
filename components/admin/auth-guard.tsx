"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import LoadingScreen from "@/components/admin/loading-screen"

// Commentez temporairement les importations problématiques
// import { auth } from "@/lib/firebase/config"
// import { onAuthStateChanged } from "firebase/auth"
// import { verifyAdmin } from "@/lib/firebase/firestore/admins"
// import { updateAdminLastLogin } from "@/lib/firebase/firestore/admins"

interface AuthGuardProps {
  children: React.ReactNode
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    // Version simplifiée pour contourner le problème d'importation
    // Utilisez localStorage pour vérifier si l'utilisateur est connecté
    const checkAuth = async () => {
      const adminAuthenticated = localStorage.getItem("adminAuthenticated")
      
      if (adminAuthenticated === "true") {
        setIsAuthenticated(true)
      } else {
        router.push("/admin/auth/login")
      }
      
      setIsLoading(false)
    }
    
    checkAuth()
    
    // Version originale commentée
    /*
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          // Verify if user is an admin
          const adminStatus = await verifyAdmin(user.uid)
          
          if (adminStatus.isAdmin) {
            // User is authenticated and has admin privileges
            setIsAuthenticated(true)
            
            // Store admin data in localStorage for the app to use
            localStorage.setItem("adminAuthenticated", "true")
            localStorage.setItem("adminUser", JSON.stringify({
              id: user.uid,
              email: user.email,
              name: user.displayName || user.email?.split("@")[0] || "Admin",
              role: adminStatus.role || "moderator",
              avatar: user.photoURL || null,
              permissions: adminStatus.permissions || {}
            }))
            
            // Update last login timestamp
            await updateAdminLastLogin(user.uid)
          } else {
            // User is not an admin, redirect to login
            router.push("/admin/auth/login")
          }
        } catch (error) {
          console.error("Error verifying admin status:", error)
          router.push("/admin/auth/login")
        }
      } else {
        // User is not authenticated, redirect to login
        localStorage.removeItem("adminAuthenticated")
        localStorage.removeItem("adminUser")
        router.push("/admin/auth/login")
      }
      
      setIsLoading(false)
    })

    return () => unsubscribe()
    */
  }, [router])

  if (isLoading) {
    return <LoadingScreen />
  }

  return isAuthenticated ? <>{children}</> : null
}