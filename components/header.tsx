"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, X, Bell, User, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useMobile } from "@/hooks/use-mobile"
import { cn } from "@/lib/utils"
import { ModeToggle } from "@/components/mode-toggle"
import { VipBadge } from "./vip-badge"

function VipBadgeComponent() {
  return (
    <span className="ml-1 text-xs bg-gradient-to-r from-amber-400 to-yellow-600 text-black px-1.5 py-0.5 rounded-full font-bold">
      VIP
    </span>
  );
}

export default function Header() {
  const pathname = usePathname()
  const isMobile = useMobile()
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isUserVIP, setIsUserVIP] = useState(true) // Simuler un utilisateur VIP
  const [isSearchOpen, setIsSearchOpen] = useState(false)

  // Détecter le défilement pour changer l'apparence du header
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Fermer le menu mobile lors du changement de page
  useEffect(() => {
    setIsMenuOpen(false)
    setIsSearchOpen(false)
  }, [pathname])

  // Liens de navigation
  const navLinks = [
    { name: "Accueil", href: "/" },
    { name: "Films", href: "/films" },
    { name: "Séries", href: "/series" },
    { name: "Exclusif VIP", href: "/exclusif", vipOnly: true },
  ]

  return (
    <>
      <header
        className={cn(
          "fixed top-0 w-full z-30 transition-all duration-300",
          isScrolled ? "bg-black/90 backdrop-blur-sm" : "bg-gradient-to-b from-black/80 to-transparent",
        )}
      >
        <div className="container mx-auto px-4 py-3 md:py-4 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="text-xl sm:text-2xl font-bold text-white flex items-center">
              <span className="bg-gradient-to-r from-purple-500 to-blue-500 text-transparent bg-clip-text">StreamFlow</span>
              {isUserVIP && <VipBadgeComponent />}
            </Link>
          </div>

          {/* Navigation - Desktop */}
          {!isMobile && (
            <nav className="hidden md:flex items-center space-x-4 lg:space-x-6">
              {navLinks.map((link) => {
                // Si le lien est réservé aux VIP et que l'utilisateur n'est pas VIP, ne pas l'afficher
                if (link.vipOnly && !isUserVIP) return null

                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    className={cn(
                      "text-sm font-medium transition-colors hover:text-white/80",
                      pathname === link.href ? "text-white" : "text-white/70",
                      link.vipOnly && "flex items-center",
                    )}
                  >
                    {link.name}
                    {link.vipOnly && <VipBadgeComponent />}
                  </Link>
                )
              })}
            </nav>
          )}

          {/* Actions - Desktop */}
          {!isMobile && (
            <div className="hidden md:flex items-center space-x-2 lg:space-x-4">
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-white/70 hover:text-white"
                onClick={() => setIsSearchOpen(true)}
              >
                <Search className="h-5 w-5" />
              </Button>
              
              <Button variant="ghost" size="icon" className="text-white/70 hover:text-white">
                <Bell className="h-5 w-5" />
              </Button>

              <ModeToggle />

              {!isUserVIP && (
                <Link href="/abonnement">
                  <Button className="bg-gradient-to-r from-amber-400 to-yellow-600 text-black hover:from-amber-500 hover:to-yellow-700 text-xs md:text-sm px-2 md:px-3">
                    Devenir VIP
                  </Button>
                </Link>
              )}

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src="/placeholder.svg?height=32&width=32" alt="Avatar" />
                      <AvatarFallback>SF</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">Utilisateur</p>
                      <p className="text-xs leading-none text-muted-foreground">utilisateur@example.com</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <Link href="/compte" className="flex w-full">
                      Profil
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Link href="/compte/abonnement" className="flex w-full">
                      Mon abonnement
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Link href="/compte/parametres" className="flex w-full">
                      Paramètres
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <Link href="/login" className="flex w-full">
                      Déconnexion
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}

          {/* Menu mobile */}
          {isMobile && (
            <div className="flex items-center space-x-1">
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-white/70 hover:text-white"
                onClick={() => setIsSearchOpen(true)}
              >
                <Search className="h-5 w-5" />
              </Button>
              
              <Button
                variant="ghost"
                size="icon"
                className="text-white/70 hover:text-white"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          )}
        </div>

        {/* Menu mobile ouvert */}
        {isMobile && isMenuOpen && (
          <div className="bg-black/95 backdrop-blur-sm">
            <div className="container mx-auto px-4 py-4">
              <nav className="flex flex-col space-y-4">
                {navLinks.map((link) => {
                  // Si le lien est réservé aux VIP et que l'utilisateur n'est pas VIP, ne pas l'afficher
                  if (link.vipOnly && !isUserVIP) return null

                  return (
                    <Link
                      key={link.name}
                      href={link.href}
                      className={cn(
                        "text-lg font-medium transition-colors hover:text-white/80 py-2",
                        pathname === link.href ? "text-white" : "text-white/70",
                        link.vipOnly && "flex items-center",
                      )}
                    >
                      {link.name}
                      {link.vipOnly && <VipBadgeComponent />}
                    </Link>
                  )
                })}

                {!isUserVIP && (
                  <Link href="/abonnement">
                    <Button className="w-full bg-gradient-to-r from-amber-400 to-yellow-600 text-black hover:from-amber-500 hover:to-yellow-700">
                      Devenir VIP
                    </Button>
                  </Link>
                )}

                <div className="pt-2 border-t border-white/10">
                  <Link
                    href="/compte"
                    className="flex items-center text-lg font-medium text-white/70 hover:text-white py-2"
                  >
                    <User className="h-5 w-5 mr-2" />
                    Mon compte
                  </Link>
                </div>
                
                <div className="flex items-center justify-between pt-2 border-t border-white/10">
                  <span className="text-white/70">Thème</span>
                  <ModeToggle />
                </div>
              </nav>
            </div>
          </div>
        )}
      </header>
      
      {/* Barre de recherche plein écran */}
      {isSearchOpen && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-sm z-50 flex flex-col">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between mb-4">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Rechercher des films, séries..." 
                  className="w-full bg-gray-800/50 border border-gray-700 rounded-md py-2 pl-10 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-purple-500" 
                  autoFocus
                />
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                className="ml-2 text-white/70 hover:text-white"
                onClick={() => setIsSearchOpen(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            
            <div className="mt-8 text-center text-gray-400">
              <p>Commencez à taper pour rechercher</p>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

// Exportation nommée pour ceux qui préfèrent l'utiliser ainsi
export { Header }