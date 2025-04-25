"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { 
  BarChart3, 
  Film, 
  Tv, 
  Users, 
  Shield, 
  Settings, 
  Home, 
  Menu, 
  X, 
  MessageSquare,
  Clock,
  ChevronDown,
  ChevronRight
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"

export default function AdminSidebar() {
  const pathname = usePathname()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isContentOpen, setIsContentOpen] = useState(true)
  const [isUsersOpen, setIsUsersOpen] = useState(false)
  const [adminUser, setAdminUser] = useState<any>(null)
  const [isMobile, setIsMobile] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  
  useEffect(() => {
    // Get admin user data from localStorage
    const storedAdminUser = localStorage.getItem("adminUser")
    if (storedAdminUser) {
      setAdminUser(JSON.parse(storedAdminUser))
    }
    
    // Check if mobile view
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 1024)
      if (window.innerWidth < 1024) {
        setIsCollapsed(true)
      }
    }
    
    checkIfMobile()
    window.addEventListener("resize", checkIfMobile)
    
    return () => {
      window.removeEventListener("resize", checkIfMobile)
    }
  }, [])
  
  // Close mobile menu when navigating
  useEffect(() => {
    setIsMobileOpen(false)
  }, [pathname])
  
  const toggleSidebar = () => {
    if (isMobile) {
      setIsMobileOpen(!isMobileOpen)
    } else {
      setIsCollapsed(!isCollapsed)
    }
  }
  
  // Check permissions for menu items
  const canManageMovies = adminUser?.permissions?.canManageMovies !== false
  const canManageSeries = adminUser?.permissions?.canManageSeries !== false
  const canManageUsers = adminUser?.permissions?.canManageUsers !== false
  const canManageAdmins = adminUser?.permissions?.canManageAdmins !== false
  const canManageComments = adminUser?.permissions?.canManageComments !== false
  const canViewStats = adminUser?.permissions?.canViewStats !== false
  
  const isSuperAdmin = adminUser?.role === "super_admin"
  
  const NavLink = ({ href, icon, label, active = false }: { href: string; icon: React.ReactNode; label: string; active?: boolean }) => {
    const isActive = pathname === href || pathname?.startsWith(`${href}/`)
    
    return (
      <Link 
        href={href} 
        className={`flex items-center gap-3 px-3 py-2 rounded-md ${
          isActive 
            ? "bg-gray-800 text-white" 
            : "text-gray-400 hover:text-white hover:bg-gray-800/50"
        } transition-colors`}
      >
        {icon}
        {!isCollapsed && <span>{label}</span>}
      </Link>
    )
  }
  
  return (
    <>
      {/* Mobile overlay */}
      {isMobile && isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsMobileOpen(false)}
        ></div>
      )}
      
      {/* Mobile toggle button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-16 left-4 z-50 lg:hidden text-gray-400 hover:text-white"
        onClick={toggleSidebar}
      >
        <Menu className="h-6 w-6" />
      </Button>
      
      {/* Sidebar */}
      <aside 
        className={`fixed top-0 left-0 h-full bg-gray-900 border-r border-gray-800 z-50 transition-all duration-300 ${
          isMobile 
            ? isMobileOpen ? "translate-x-0" : "-translate-x-full"
            : isCollapsed ? "w-16" : "w-64"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="h-16 flex items-center justify-between border-b border-gray-800 px-4">
            <div className="flex items-center gap-2">
              {!isCollapsed && (
                <div className="text-xl font-bold bg-gradient-to-r from-purple-500 to-blue-500 text-transparent bg-clip-text">
                  StreamFlow
                </div>
              )}
              {isCollapsed && (
                <div className="text-2xl font-bold text-purple-500">S</div>
              )}
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleSidebar}
              className="text-gray-400 hover:text-white"
            >
              {isMobile ? (
                <X className="h-5 w-5" />
              ) : (
                isCollapsed ? (
                  <ChevronRight className="h-5 w-5" />
                ) : (
                  <ChevronLeft className="h-5 w-5" />
                )
              )}
            </Button>
          </div>
          
          {/* Navigation */}
          <div className="flex-1 py-4 overflow-y-auto">
            <div className="px-3 space-y-1">
              <NavLink 
                href="/admin" 
                icon={<Home className="h-5 w-5" />} 
                label="Accueil" 
              />
              
              {canViewStats && (
                <NavLink 
                  href="/admin/stats" 
                  icon={<BarChart3 className="h-5 w-5" />} 
                  label="Statistiques" 
                />
              )}
              
              {/* Content management */}
              {(canManageMovies || canManageSeries) && (
                <div className="mt-4">
                  {!isCollapsed && (
                    <Collapsible open={isContentOpen} onOpenChange={setIsContentOpen}>
                      <CollapsibleTrigger className="flex items-center justify-between w-full px-3 py-2 text-sm rounded-md text-gray-400 hover:text-white hover:bg-gray-800/50">
                        <div className="flex items-center gap-3">
                          <Film className="h-5 w-5" />
                          <span>Contenu</span>
                        </div>
                        {isContentOpen ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </CollapsibleTrigger>
                      <CollapsibleContent className="pl-10 space-y-1 mt-1">
                        {canManageMovies && (
                          <Link 
                            href="/admin/movies" 
                            className={`block py-1.5 text-sm rounded-md ${
                              pathname === "/admin/movies" || pathname?.startsWith("/admin/movies/")
                                ? "text-white" 
                                : "text-gray-400 hover:text-white"
                            }`}
                          >
                            Films
                          </Link>
                        )}
                        {canManageSeries && (
                          <Link 
                            href="/admin/series" 
                            className={`block py-1.5 text-sm rounded-md ${
                              pathname === "/admin/series" || pathname?.startsWith("/admin/series/")
                                ? "text-white" 
                                : "text-gray-400 hover:text-white"
                            }`}
                          >
                            Séries
                          </Link>
                        )}
                      </CollapsibleContent>
                    </Collapsible>
                  )}
                  
                  {isCollapsed && (
                    <>
                      {canManageMovies && (
                        <NavLink 
                          href="/admin/movies" 
                          icon={<Film className="h-5 w-5" />} 
                          label="Films" 
                        />
                      )}
                      {canManageSeries && (
                        <NavLink 
                          href="/admin/series" 
                          icon={<Tv className="h-5 w-5" />} 
                          label="Séries" 
                        />
                      )}
                    </>
                  )}
                </div>
              )}
              
              {/* User management */}
              {(canManageUsers || canManageAdmins) && (
                <div className="mt-4">
                  {!isCollapsed && (
                    <Collapsible open={isUsersOpen} onOpenChange={setIsUsersOpen}>
                      <CollapsibleTrigger className="flex items-center justify-between w-full px-3 py-2 text-sm rounded-md text-gray-400 hover:text-white hover:bg-gray-800/50">
                        <div className="flex items-center gap-3">
                          <Users className="h-5 w-5" />
                          <span>Utilisateurs</span>
                        </div>
                        {isUsersOpen ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </CollapsibleTrigger>
                      <CollapsibleContent className="pl-10 space-y-1 mt-1">
                        {canManageUsers && (
                          <Link 
                            href="/admin/users" 
                            className={`block py-1.5 text-sm rounded-md ${
                              pathname === "/admin/users" || pathname?.startsWith("/admin/users/")
                                ? "text-white" 
                                : "text-gray-400 hover:text-white"
                            }`}
                          >
                            Utilisateurs
                          </Link>
                        )}
                        {canManageAdmins && (
                          <Link 
                            href="/admin/admins" 
                            className={`block py-1.5 text-sm rounded-md ${
                              pathname === "/admin/admins" || pathname?.startsWith("/admin/admins/")
                                ? "text-white" 
                                : "text-gray-400 hover:text-white"
                            }`}
                          >
                            Administrateurs
                          </Link>
                        )}
                      </CollapsibleContent>
                    </Collapsible>
                  )}
                  
                  {isCollapsed && (
                    <>
                      {canManageUsers && (
                        <NavLink 
                          href="/admin/users" 
                          icon={<Users className="h-5 w-5" />} 
                          label="Utilisateurs" 
                        />
                      )}
                      {canManageAdmins && (
                        <NavLink 
                          href="/admin/admins" 
                          icon={<Shield className="h-5 w-5" />} 
                          label="Administrateurs" 
                        />
                      )}
                    </>
                  )}
                </div>
              )}
              
              {canManageComments && (
                <NavLink 
                  href="/admin/comments" 
                  icon={<MessageSquare className="h-5 w-5" />} 
                  label="Commentaires" 
                />
              )}
              
              <NavLink 
                href="/admin/activity-logs" 
                icon={<Clock className="h-5 w-5" />} 
                label="Logs d'activité" 
              />
              
              <NavLink 
                href="/admin/settings" 
                icon={<Settings className="h-5 w-5" />} 
                label="Paramètres" 
              />
            </div>
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
    </>
  )
}

function ChevronLeft(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m15 18-6-6 6-6" />
    </svg>
  )
}