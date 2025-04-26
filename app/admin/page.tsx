"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function AdminRedirect() {
  const router = useRouter()

  useEffect(() => {
    // Rediriger vers le tableau de bord
    router.push("/admin/dashboard")
  }, [router])

  // Afficher un état de chargement pendant la redirection
  return (
    <div className="flex items-center justify-center h-screen">
      <div className="animate-spin w-10 h-10 border-4 border-primary border-t-transparent rounded-full"></div>
    </div>
  )
}