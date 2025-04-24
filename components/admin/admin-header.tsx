"use client"

import { useState } from "react"
import { Bell, Search, User } from "lucide-react"
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface AdminHeaderProps {
  title: string
}

export default function AdminHeader({ title }: AdminHeaderProps) {
  const [searchQuery, setSearchQuery] = useState("")

  return (
    <header className="bg-gray-900 border-b border-gray-800 h-16 fixed top-0 right-0 left-64 z-20 flex items-center px-6">
      <div className="flex-1 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-white">{title}</h1>

        <div className="flex items-center space-x-4">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="text"
              placeholder="Rechercher..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-gray-800 border-gray-700 text-white focus:ring-purple-500"
            />
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative text-gray-400 hover:text-white">
                <Bell className="h-5 w-5" />
                <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500"></span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 bg-gray-900 border-gray-800 text-white">
              <DropdownMenuLabel>Notifications</DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-gray-800" />
              <div className="max-h-80 overflow-y-auto">
                <DropdownMenuItem className="py-3 cursor-pointer">
                  <div>
                    <p className="font-medium">Nouveau commentaire</p>
                    <p className="text-sm text-gray-400">Jean Dupont a commenté sur "Dune"</p>
                    <p className="text-xs text-gray-500 mt-1">Il y a 5 minutes</p>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem className="py-3 cursor-pointer">
                  <div>
                    <p className="font-medium">Nouvel utilisateur</p>
                    <p className="text-sm text-gray-400">Marie Martin vient de s'inscrire</p>
                    <p className="text-xs text-gray-500 mt-1">Il y a 1 heure</p>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem className="py-3 cursor-pointer">
                  <div>
                    <p className="font-medium">Mise à jour système</p>
                    <p className="text-sm text-gray-400">La mise à jour v1.2.3 est disponible</p>
                    <p className="text-xs text-gray-500 mt-1">Il y a 3 heures</p>
                  </div>
                </DropdownMenuItem>
              </div>
              <DropdownMenuSeparator className="bg-gray-800" />
              <DropdownMenuItem className="py-2 cursor-pointer justify-center">
                <span className="text-purple-400">Voir toutes les notifications</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="/placeholder.svg?height=32&width=32" alt="Admin" />
                  <AvatarFallback className="bg-purple-900 text-white">AD</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-gray-900 border-gray-800 text-white">
              <DropdownMenuLabel>Mon compte</DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-gray-800" />
              <DropdownMenuItem className="cursor-pointer">
                <User className="mr-2 h-4 w-4" />
                <span>Profil</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer">
                <Settings className="mr-2 h-4 w-4" />
                <span>Paramètres</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-gray-800" />
              <DropdownMenuItem className="cursor-pointer text-red-400 hover:text-red-300">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Déconnexion</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}

// Import the Settings and LogOut icons
import { Settings, LogOut } from "lucide-react"
