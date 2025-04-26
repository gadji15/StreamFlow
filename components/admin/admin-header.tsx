"use client"

import { useState, useEffect } from "react"
import { Search, Bell, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ModeToggle } from "@/components/mode-toggle"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export default function AdminHeader() {
  const [adminEmail, setAdminEmail] = useState<string | null>(null)

  useEffect(() => {
    // Récupérer les informations de l'administrateur du localStorage
    const email = localStorage.getItem("adminEmail")
    setAdminEmail(email)
  }, [])

  return (
    <header className="bg-gray-900 border-b border-gray-800 p-4 flex items-center justify-between z-40">
      {/* Recherche */}
      <div className="hidden md:flex relative max-w-xs w-full">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
        <Input
          type="text"
          placeholder="Rechercher..."
          className="pl-10 w-full bg-gray-800 border-gray-700 text-white"
        />
      </div>
      
      {/* Actions */}
      <div className="md:hidden">
        <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white">
          <Search className="h-5 w-5" />
        </Button>
      </div>
      
      {/* Actions de droite */}
      <div className="flex items-center space-x-3">
        <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white relative">
          <Bell className="h-5 w-5" />
          <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full" />
        </Button>
        
        <ModeToggle />
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
              <Avatar className="h-8 w-8">
                <AvatarImage src="/placeholder.svg?height=32&width=32" alt="Avatar" />
                <AvatarFallback>A</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">Admin</p>
                <p className="text-xs leading-none text-muted-foreground">{adminEmail || "admin@streamflow.com"}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              Profil
            </DropdownMenuItem>
            <DropdownMenuItem>
              Paramètres
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => {
              localStorage.removeItem("adminAuthenticated")
              localStorage.removeItem("adminEmail")
              localStorage.removeItem("adminRole")
              window.location.href = "/admin/auth/login"
            }}>
              Déconnexion
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}