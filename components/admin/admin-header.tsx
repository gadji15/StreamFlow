"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Bell, LogOut, Search, User, Moon, Sun, Settings } from "lucide-react"
import { signOut } from "@/lib/firebase/auth"
import { logActivity } from "@/lib/firebase/firestore/activity-logs"

interface AdminHeaderProps {
  title?: string
}

export default function AdminHeader({ title = "Tableau de bord" }: AdminHeaderProps) {
  const router = useRouter()
  const [adminUser, setAdminUser] = useState<any>(null)
  const [isDarkMode, setIsDarkMode] = useState(true)
  const [isMounted, setIsMounted] = useState(false)
  
  useEffect(() => {
    setIsMounted(true)
    
    // Get admin user data from localStorage
    const storedAdminUser = localStorage.getItem("adminUser")
    if (storedAdminUser) {
      setAdminUser(JSON.parse(storedAdminUser))
    }
    
    // Check system preference for dark mode
    if (typeof window !== "undefined") {
      setIsDarkMode(window.matchMedia("(prefers-color-scheme: dark)").matches)
    }
  }, [])
  
  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode)
    // In a real app, you would update the theme in localStorage and apply it
  }
  
  const handleSignOut = async () => {
    try {
      // Log the activity
      if (adminUser) {
        await logActivity({
          adminId: adminUser.id,
          adminName: adminUser.name,
          action: "LOGOUT",
          entityType: "ADMIN",
          entityId: adminUser.id,
          entityName: adminUser.name,
          timestamp: new Date(),
          details: {}
        })
      }
      
      // Sign out from Firebase
      await signOut()
      
      // Clear local storage
      localStorage.removeItem("adminAuthenticated")
      localStorage.removeItem("adminUser")
      
      // Redirect to login
      router.push("/admin/auth/login")
    } catch (error) {
      console.error("Error signing out:", error)
    }
  }
  
  // Prevent hydration errors
  if (!isMounted) return null
  
  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-gray-900 border-b border-gray-800 shadow-md z-40 px-4 flex items-center justify-between">
      <div className="flex items-center">
        <div className="text-xl font-bold text-white mr-4">{title}</div>
      </div>
      
      <div className="flex items-center space-x-2">
        {/* Quick Search */}
        <Button variant="outline" size="sm" className="hidden md:flex items-center gap-2 border-gray-700 bg-gray-800 text-gray-300 hover:bg-gray-700">
          <Search className="h-4 w-4" />
          <span className="text-sm">Recherche rapide</span>
          <kbd className="pointer-events-none hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border border-gray-700 bg-gray-900 px-1.5 font-mono text-[10px] font-medium text-gray-400">
            <span className="text-xs">⌘</span>K
          </kbd>
        </Button>
        
        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative text-gray-400 hover:text-white">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80 bg-gray-900 border border-gray-800 text-white">
            <div className="flex items-center justify-between p-4 border-b border-gray-800">
              <h2 className="font-semibold">Notifications</h2>
              <Button variant="ghost" size="sm" className="text-xs text-gray-400 hover:text-white">
                Tout marquer comme lu
              </Button>
            </div>
            <div className="py-2 px-4 border-b border-gray-800">
              <div className="space-y-4 max-h-[300px] overflow-y-auto">
                <div className="flex gap-4 items-start py-2">
                  <div className="w-2 h-2 mt-2 bg-blue-500 rounded-full"></div>
                  <div>
                    <p className="text-sm text-white">Nouveau film ajouté: <span className="font-medium">The Matrix</span></p>
                    <p className="text-xs text-gray-400">Il y a 5 minutes</p>
                  </div>
                </div>
                <div className="flex gap-4 items-start py-2">
                  <div className="w-2 h-2 mt-2 bg-green-500 rounded-full"></div>
                  <div>
                    <p className="text-sm text-white">10 nouveaux utilisateurs inscrits aujourd'hui</p>
                    <p className="text-xs text-gray-400">Il y a 30 minutes</p>
                  </div>
                </div>
                <div className="flex gap-4 items-start py-2">
                  <div className="w-2 h-2 mt-2 bg-red-500 rounded-full"></div>
                  <div>
                    <p className="text-sm text-white">Contenu signalé: <span className="font-medium">Commentaire inapproprié</span></p>
                    <p className="text-xs text-gray-400">Il y a 2 heures</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="p-2">
              <Button asChild variant="ghost" size="sm" className="w-full justify-center text-sm">
                <Link href="/admin/notifications">Voir toutes les notifications</Link>
              </Button>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
        
        {/* Dark/Light Mode Toggle */}
        <Button 
          variant="ghost" 
          size="icon" 
          className="text-gray-400 hover:text-white"
          onClick={toggleDarkMode}
        >
          {isDarkMode ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
        </Button>
        
        {/* Settings */}
        <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white">
          <Settings className="h-5 w-5" />
        </Button>
        
        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="relative flex items-center gap-2 text-gray-300 hover:text-white">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-700 text-white">
                {adminUser?.avatar ? (
                  <img 
                    src={adminUser.avatar} 
                    alt={adminUser.name} 
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <User className="h-4 w-4" />
                )}
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium">{adminUser?.name || "Admin"}</p>
                <p className="text-xs text-gray-400">{adminUser?.role || "administrateur"}</p>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 bg-gray-900 border border-gray-800 text-white">
            <div className="flex items-center gap-3 p-3 border-b border-gray-800">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-700 text-white">
                {adminUser?.avatar ? (
                  <img 
                    src={adminUser.avatar} 
                    alt={adminUser.name} 
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <User className="h-5 w-5" />
                )}
              </div>
              <div>
                <p className="font-medium">{adminUser?.name || "Admin"}</p>
                <p className="text-xs text-gray-400">{adminUser?.email || ""}</p>
              </div>
            </div>
            <DropdownMenuItem asChild className="cursor-pointer">
              <Link href="/admin/profile">Mon profil</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild className="cursor-pointer">
              <Link href="/admin/settings">Paramètres</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-gray-800" />
            <DropdownMenuItem 
              onClick={handleSignOut}
              className="text-red-400 hover:text-red-300 cursor-pointer"
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>Se déconnecter</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}