"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, X, Bell, User } from "lucide-react"
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
import SearchBar from "@/components/search-bar"

export default function Header() {
  const pathname = usePathname()
  const isMobile = useMobile()
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isUserVIP, setIsUserVIP] = useState(true) // Simuler un utilisateur VIP

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
  }, [pathname])

  // Liens de navigation
  const navLinks = [
    { name: "Accueil", href: "/" },
    { name: "Films", href: "/films" },
    { name: "Séries", href: "/series" },
    { name: "Exclusif VIP", href: "/exclusif", vipOnly: true },
  ]

  return (
    <header
      className={cn(
        "fixed top-0 w-full z-50 transition-all duration-300",
        isScrolled ? "bg-black/90 backdrop-blur-sm" : "bg-gradient-to-b from-black/80 to-transparent",
      )}
    >
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center">
          <Link href="/" className="text-2xl font-bold text-white flex items-center">
            <span className="bg-gradient-to-r from-purple-500 to-blue-500 text-transparent bg-clip-text">StreamFlow</span>
            {isUserVIP && (
              <span className="ml-2 text-xs bg-gradient-to-r from-amber-400 to-yellow-600 text-black px-2 py-0.5 rounded-full font-bold">
                VIP
              </span>
            )}
          </Link>
        </div>

        {/* Navigation - Desktop */}
        {!isMobile && (
          <nav className="hidden md:flex items-center space-x-6">
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
                  {link.vipOnly && (
                    <span className="ml-1 text-xs bg-gradient-to-r from-amber-400 to-yellow-600 text-black px-1.5 py-0.5 rounded-full font-bold">
                      VIP
                    </span>
                  )}
                </Link>
              )
            })}
          </nav>
        )}

        {/* Actions - Desktop */}
        {!isMobile && (
          <div className="hidden md:flex items-center space-x-4">
            <SearchBar />
            <Button variant="ghost" size="icon" className="text-white/70 hover:text-white">
              <Bell className="h-5 w-5" />
            </Button>

            <ModeToggle />

            {!isUserVIP && (
              <Link href="/abonnement">
                <Button className="bg-gradient-to-r from-amber-400 to-yellow-600 text-black hover:from-amber-500 hover:to-yellow-700">
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
          <div className="flex items-center">
            <SearchBar />
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
                    {link.vipOnly && (
                      <span className="ml-2 text-xs bg-gradient-to-r from-amber-400 to-yellow-600 text-black px-1.5 py-0.5 rounded-full font-bold">
                        VIP
                      </span>
                    )}
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
  )
}