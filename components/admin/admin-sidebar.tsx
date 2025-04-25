"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  LayoutDashboard,
  Film,
  Users,
  Settings,
  BarChart3,
  MessageSquare,
  Bell,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Home,
  ShieldAlert,
  FileText,
  Clock,
  UserPlus,
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export default function AdminSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [collapsed, setCollapsed] = useState(false)
  const [currentUser, setCurrentUser] = useState<any>(null)

  // Récupérer les informations de l'utilisateur connecté
  useEffect(() => {
    if (typeof window !== "undefined") {
      const userData = localStorage.getItem("adminUser")
      if (userData) {
        setCurrentUser(JSON.parse(userData))
      }
    }
  }, [])

  const navItems = [
    {
      title: "Tableau de bord",
      icon: <LayoutDashboard className="h-5 w-5" />,
      href: "/admin",
      role: "all",
    },
    {
      title: "Contenu",
      icon: <Film className="h-5 w-5" />,
      href: "/admin/content",
      role: "all",
    },
    {
      title: "Utilisateurs",
      icon: <Users className="h-5 w-5" />,
      href: "/admin/users",
      role: "all",
    },
    {
      title: "Statistiques",
      icon: <BarChart3 className="h-5 w-5" />,
      href: "/admin/stats",
      role: "all",
    },
    {
      title: "Commentaires",
      icon: <MessageSquare className="h-5 w-5" />,
      href: "/admin/comments",
      role: "all",
    },
    {
      title: "Notifications",
      icon: <Bell className="h-5 w-5" />,
      href: "/admin/notifications",
      role: "all",
    },
    {
      title: "Administrateurs",
      icon: <ShieldAlert className="h-5 w-5" />,
      href: "/admin/admins",
      role: "super_admin",
    },
    {
      title: "Logs d'activité",
      icon: <Clock className="h-5 w-5" />,
      href: "/admin/activity-logs",
      role: "super_admin",
    },
    {
      title: "Paramètres",
      icon: <Settings className="h-5 w-5" />,
      href: "/admin/settings",
      role: "all",
    },
  ]

  const handleLogout = () => {
    // Effacer les informations d'authentification
    localStorage.removeItem("adminAuthenticated")
    localStorage.removeItem("adminUser")
    
    // Rediriger vers la page de connexion
    router.push("/admin/auth/login")
  }

  const userRole = currentUser?.role || "content_manager"
  
  return (
    <div
      className={`bg-gray-900 border-r border-gray-800 h-screen transition-all duration-300 ${
        collapsed ? "w-16" : "w-64"
      } fixed left-0 top-0 z-30`}
    >
      <div className="flex flex-col h-full">
        <div className="p-4 border-b border-gray-800 flex items-center justify-between">
          {!collapsed && (
            <Link href="/admin" className="flex items-center">
              <span className="text-xl font-bold bg-gradient-to-r from-purple-500 to-blue-500 text-transparent bg-clip-text font-poppins">
                StreamFlow
              </span>
              <span className="text-white text-xs ml-1">Admin</span>
            </Link>
          )}
          {collapsed && (
            <Link href="/admin" className="mx-auto">
              <span className="text-xl font-bold bg-gradient-to-r from-purple-500 to-blue-500 text-transparent bg-clip-text font-poppins">
                SF
              </span>
            </Link>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCollapsed(!collapsed)}
            className="text-gray-400 hover:text-white"
          >
            {collapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
          </Button>
        </div>

        {!collapsed && currentUser && (
          <div className="p-4 border-b border-gray-800">
            <div className="flex items-center">
              <Avatar className="h-10 w-10">
                <AvatarImage src="/placeholder.svg?height=40&width=40" alt={currentUser.name} />
                <AvatarFallback>{currentUser.name?.substring(0, 2).toUpperCase() || "AD"}</AvatarFallback>
              </Avatar>
              <div className="ml-3">
                <p className="text-sm font-medium text-white">{currentUser.name || "Admin"}</p>
                <p className="text-xs text-gray-400">
                  {userRole === "super_admin" 
                    ? "Super Admin" 
                    : userRole === "content_manager" 
                      ? "Gestionnaire de contenu" 
                      : "Modérateur"}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="flex-1 py-6 overflow-y-auto scrollbar-hide">
          <nav className="px-2 space-y-1">
            {navItems
              .filter(item => item.role === "all" || item.role === userRole)
              .map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center px-3 py-2 rounded-md transition-colors duration-200 ${
                    pathname === item.href || pathname.startsWith(`${item.href}/`)
                      ? "bg-gray-800 text-white"
                      : "text-gray-400 hover:bg-gray-800 hover:text-white"
                  }`}
                >
                  <div className="flex items-center">
                    {item.icon}
                    {!collapsed && <span className="ml-3">{item.title}</span>}
                  </div>
                </Link>
              ))}
          </nav>
        </div>

        <div className="p-4 border-t border-gray-800">
          <div className="flex flex-col space-y-2">
            <Link
              href="/"
              className="flex items-center px-3 py-2 rounded-md text-gray-400 hover:bg-gray-800 hover:text-white transition-colors duration-200"
            >
              <Home className="h-5 w-5" />
              {!collapsed && <span className="ml-3">Retour au site</span>}
            </Link>
            <button 
              onClick={handleLogout}
              className="flex items-center px-3 py-2 rounded-md text-gray-400 hover:bg-gray-800 hover:text-white transition-colors duration-200"
            >
              <LogOut className="h-5 w-5" />
              {!collapsed && <span className="ml-3">Déconnexion</span>}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}