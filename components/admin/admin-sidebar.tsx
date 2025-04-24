"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
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
} from "lucide-react"

export default function AdminSidebar() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)

  const navItems = [
    {
      title: "Tableau de bord",
      icon: <LayoutDashboard className="h-5 w-5" />,
      href: "/admin",
    },
    {
      title: "Contenu",
      icon: <Film className="h-5 w-5" />,
      href: "/admin/content",
    },
    {
      title: "Utilisateurs",
      icon: <Users className="h-5 w-5" />,
      href: "/admin/users",
    },
    {
      title: "Statistiques",
      icon: <BarChart3 className="h-5 w-5" />,
      href: "/admin/stats",
    },
    {
      title: "Commentaires",
      icon: <MessageSquare className="h-5 w-5" />,
      href: "/admin/comments",
    },
    {
      title: "Notifications",
      icon: <Bell className="h-5 w-5" />,
      href: "/admin/notifications",
    },
    {
      title: "Paramètres",
      icon: <Settings className="h-5 w-5" />,
      href: "/admin/settings",
    },
  ]

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

        <div className="flex-1 py-6 overflow-y-auto scrollbar-hide">
          <nav className="px-2 space-y-1">
            {navItems.map((item) => (
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
            <button className="flex items-center px-3 py-2 rounded-md text-gray-400 hover:bg-gray-800 hover:text-white transition-colors duration-200">
              <LogOut className="h-5 w-5" />
              {!collapsed && <span className="ml-3">Déconnexion</span>}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
