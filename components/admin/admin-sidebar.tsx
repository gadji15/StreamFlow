"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { 
  Home, 
  Film, 
  Tv, 
  Users, 
  Settings, 
  LogOut, 
  ChevronLeft,
  ChevronRight
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export default function AdminSidebar() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)
  const [adminRole, setAdminRole] = useState<string | null>(null)

  useEffect(() => {
    // Récupérer le rôle d'administrateur depuis le localStorage
    const role = localStorage.getItem("adminRole")
    setAdminRole(role)
  }, [])

  const navItems = [
    {
      title: "Tableau de bord",
      href: "/admin",
      icon: <Home size={20} />,
      roles: ["admin", "super_admin", "content_manager"]
    },
    {
      title: "Films",
      href: "/admin/films",
      icon: <Film size={20} />,
      roles: ["admin", "super_admin", "content_manager"]
    },
    {
      title: "Séries",
      href: "/admin/series",
      icon: <Tv size={20} />,
      roles: ["admin", "super_admin", "content_manager"]
    },
    {
      title: "Utilisateurs",
      href: "/admin/users",
      icon: <Users size={20} />,
      roles: ["admin", "super_admin"]
    },
    {
      title: "Paramètres",
      href: "/admin/settings",
      icon: <Settings size={20} />,
      roles: ["super_admin"]
    }
  ]

  const handleLogout = () => {
    localStorage.removeItem("adminAuthenticated")
    localStorage.removeItem("adminEmail")
    localStorage.removeItem("adminRole")
    window.location.href = "/admin/auth/login"
  }

  return (
    <div 
      className={cn(
        "bg-gray-950 border-r border-gray-800 transition-all duration-300 flex flex-col z-50",
        collapsed ? "w-16" : "w-60"
      )}
    >
      {/* En-tête du Sidebar */}
      <div className="p-4 border-b border-gray-800 flex items-center justify-between">
        {!collapsed && (
          <Link href="/admin" className="font-bold text-lg bg-gradient-to-r from-purple-500 to-blue-500 text-transparent bg-clip-text">
            StreamFlow
          </Link>
        )}
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => setCollapsed(!collapsed)}
          className="text-gray-400 hover:text-white"
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </Button>
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 py-4 overflow-y-auto">
        <ul className="space-y-1 px-2">
          {navItems.map((item) => {
            // Vérifier si l'utilisateur a le rôle requis pour voir cet élément
            if (!adminRole || !item.roles.includes(adminRole)) {
              return null
            }
            
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center px-3 py-2 rounded-md transition-colors",
                    pathname === item.href
                      ? "bg-primary/20 text-primary"
                      : "text-gray-400 hover:text-white hover:bg-gray-800",
                    collapsed && "justify-center"
                  )}
                >
                  <span className="mr-3">{item.icon}</span>
                  {!collapsed && <span>{item.title}</span>}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>
      
      {/* Pied du Sidebar */}
      <div className="p-4 border-t border-gray-800">
        <button
          onClick={handleLogout}
          className={cn(
            "flex items-center px-3 py-2 w-full rounded-md text-gray-400 hover:text-white hover:bg-gray-800 transition-colors",
            collapsed && "justify-center"
          )}
        >
          <LogOut size={20} className="mr-3" />
          {!collapsed && <span>Déconnexion</span>}
        </button>
      </div>
    </div>
  )
}