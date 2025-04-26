"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { 
  Film, 
  Tv, 
  Users, 
  Settings, 
  BarChart,
  LogOut
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { auth } from "@/lib/firebase/config"

export default function AdminDashboard() {
  const router = useRouter()
  const [adminName, setAdminName] = useState("Administrateur")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Vérifier si l'utilisateur est connecté
    const isLoggedIn = localStorage.getItem("isAdminLoggedIn") === "true"
    const storedName = localStorage.getItem("adminName")
    
    if (!isLoggedIn) {
      router.push("/admin/auth/login")
      return
    }
    
    if (storedName) {
      setAdminName(storedName)
    }
    
    setIsLoading(false)
  }, [router])

  const handleLogout = async () => {
    try {
      // Déconnexion de Firebase
      await auth.signOut()
      
      // Nettoyer le localStorage
      localStorage.removeItem("adminId")
      localStorage.removeItem("adminEmail")
      localStorage.removeItem("adminName")
      localStorage.removeItem("adminRole")
      localStorage.removeItem("isAdminLoggedIn")
      
      // Rediriger vers la page de connexion
      router.push("/admin/auth/login")
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin w-10 h-10 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Admin Header */}
      <header className="bg-gray-800 border-b border-gray-700 fixed top-0 left-0 right-0 z-40">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center">
            <Link href="/admin/dashboard" className="text-xl font-bold bg-gradient-to-r from-purple-500 to-blue-500 text-transparent bg-clip-text">
              StreamFlow Admin
            </Link>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-300">
              Connecté en tant que <span className="font-semibold">{adminName}</span>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleLogout}
              className="text-gray-400 hover:text-white"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Déconnexion
            </Button>
          </div>
        </div>
      </header>
      
      {/* Admin Content */}
      <div className="pt-16 flex min-h-screen">
        {/* Sidebar */}
        <div className="w-64 bg-gray-800 border-r border-gray-700 fixed h-full pt-4">
          <div className="px-4 py-4">
            <nav className="space-y-1">
              <Link href="/admin/dashboard" className="flex items-center px-4 py-3 text-white bg-gray-700/50 rounded-md">
                <BarChart className="h-5 w-5 mr-3" />
                Tableau de bord
              </Link>
              <Link href="/admin/films" className="flex items-center px-4 py-3 text-gray-300 hover:bg-gray-700/30 rounded-md">
                <Film className="h-5 w-5 mr-3" />
                Films
              </Link>
              <Link href="/admin/series" className="flex items-center px-4 py-3 text-gray-300 hover:bg-gray-700/30 rounded-md">
                <Tv className="h-5 w-5 mr-3" />
                Séries
              </Link>
              <Link href="/admin/users" className="flex items-center px-4 py-3 text-gray-300 hover:bg-gray-700/30 rounded-md">
                <Users className="h-5 w-5 mr-3" />
                Utilisateurs
              </Link>
              <Link href="/admin/settings" className="flex items-center px-4 py-3 text-gray-300 hover:bg-gray-700/30 rounded-md">
                <Settings className="h-5 w-5 mr-3" />
                Paramètres
              </Link>
            </nav>
          </div>
          
          <div className="absolute bottom-0 w-full p-4 border-t border-gray-700">
            <Link href="/" className="text-gray-400 hover:text-white text-sm flex items-center">
              <span>← Retour au site</span>
            </Link>
          </div>
        </div>
        
        {/* Main Content */}
        <div className="ml-64 flex-1 p-8">
          <h1 className="text-2xl font-bold mb-6">Tableau de bord</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Total Films</p>
                  <h3 className="text-2xl font-bold">24</h3>
                </div>
                <div className="bg-blue-500/20 p-3 rounded-lg">
                  <Film className="h-6 w-6 text-blue-400" />
                </div>
              </div>
            </div>
            
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Total Séries</p>
                  <h3 className="text-2xl font-bold">12</h3>
                </div>
                <div className="bg-purple-500/20 p-3 rounded-lg">
                  <Tv className="h-6 w-6 text-purple-400" />
                </div>
              </div>
            </div>
            
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Utilisateurs</p>
                  <h3 className="text-2xl font-bold">857</h3>
                </div>
                <div className="bg-green-500/20 p-3 rounded-lg">
                  <Users className="h-6 w-6 text-green-400" />
                </div>
              </div>
            </div>
            
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Abonnés VIP</p>
                  <h3 className="text-2xl font-bold">126</h3>
                </div>
                <div className="bg-amber-500/20 p-3 rounded-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
              <h3 className="text-lg font-medium mb-4">Films récents</h3>
              <div className="space-y-4">
                {[
                  { title: "Inception 2", date: "2023-08-15", views: 2457 },
                  { title: "Le Roi Lion", date: "2023-08-10", views: 1843 },
                  { title: "Avengers: Endgame", date: "2023-08-05", views: 3012 },
                  { title: "Dune", date: "2023-07-28", views: 2754 }
                ].map((film, index) => (
                  <div key={index} className="flex items-center justify-between border-b border-gray-700 pb-3">
                    <div>
                      <p className="font-medium">{film.title}</p>
                      <p className="text-sm text-gray-400">Ajouté le {film.date}</p>
                    </div>
                    <div className="text-sm text-gray-400">
                      {film.views.toLocaleString()} vues
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
              <h3 className="text-lg font-medium mb-4">Activité récente</h3>
              <div className="space-y-4">
                {[
                  { action: "Film ajouté", item: "Inception 2", admin: "Admin", time: "Il y a 2 heures" },
                  { action: "Utilisateur créé", item: "jean.dupont@example.com", admin: "Admin", time: "Il y a 5 heures" },
                  { action: "Série mise à jour", item: "Breaking Bad", admin: "Admin", time: "Il y a 1 jour" },
                  { action: "Film supprimé", item: "Titanic", admin: "Admin", time: "Il y a 2 jours" }
                ].map((activity, index) => (
                  <div key={index} className="flex items-center justify-between border-b border-gray-700 pb-3">
                    <div>
                      <p className="font-medium">{activity.action}</p>
                      <p className="text-sm text-gray-400">{activity.item}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{activity.admin}</p>
                      <p className="text-xs text-gray-400">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}