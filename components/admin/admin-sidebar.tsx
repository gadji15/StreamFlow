"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { 
  LayoutDashboard, 
  Film, 
  Users, 
  Settings, 
  Home, 
  ChevronLeft,
  ChevronRight
} from "lucide-react"

export default function AdminSidebar() {
  const pathname = usePathname()
  const [isCollapsed, setIsCollapsed] = useState(false)
  
  return (
    <aside 
      className={`fixed top-0 left-0 h-screen bg-gray-900 border-r border-gray-800 z-50 transition-all duration-300 ${
        isCollapsed ? "w-16" : "w-64"
      }`}
    >
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="h-16 flex items-center justify-between border-b border-gray-800 px-4">
          {!isCollapsed && (
            <div className="text-xl font-bold bg-gradient-to-r from-purple-500 to-blue-500 text-transparent bg-clip-text">
              StreamFlow
            </div>
          )}
          {isCollapsed && (
            <div className="w-full text-center text-xl font-bold text-purple-500">S</div>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="text-gray-400 hover:text-white p-1"
          >
            {isCollapsed ? (
              <ChevronRight className="h-5 w-5" />
            ) : (
              <ChevronLeft className="h-5 w-5" />
            )}
          </button>
        </div>
        
        {/* Navigation */}
        <div className="flex-1 py-4 overflow-y-auto">
          <nav className="px-2 space-y-1">
            <NavLink 
              href="/admin" 
              icon={<LayoutDashboard className="h-5 w-5" />} 
              label="Tableau de bord" 
              active={pathname === "/admin"}
              collapsed={isCollapsed}
            />
            
            <NavLink 
              href="/admin/movies" 
              icon={<Film className="h-5 w-5" />} 
              label="Films" 
              active={pathname === "/admin/movies"}
              collapsed={isCollapsed}
            />
            
            <NavLink 
              href="/admin/users" 
              icon={<Users className="h-5 w-5" />} 
              label="Utilisateurs" 
              active={pathname === "/admin/users"}
              collapsed={isCollapsed}
            />
            
            <NavLink 
              href="/admin/settings" 
              icon={<Settings className="h-5 w-5" />} 
              label="Paramètres" 
              active={pathname === "/admin/settings"}
              collapsed={isCollapsed}
            />
          </nav>
        </div>
        
        {/* Footer */}
        <div className="p-4 border-t border-gray-800">
          <Link 
            href="/" 
            className="flex items-center gap-2 px-3 py-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-800/50"
          >
            <Home className="h-5 w-5" />
            {!isCollapsed && <span>Retour au site</span>}
          </Link>
        </div>
      </div>
    </aside>
  )
}

function NavLink({ href, icon, label, active = false, collapsed = false }) {
  return (
    <Link 
      href={href} 
      className={`flex items-center gap-3 px-3 py-2 rounded-md ${
        active 
          ? "bg-gray-800 text-white" 
          : "text-gray-400 hover:text-white hover:bg-gray-800/50"
      } transition-colors`}
    >
      {icon}
      {!collapsed && <span>{label}</span>}
    </Link>
  )
}