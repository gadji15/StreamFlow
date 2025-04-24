"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Home, Film, Tv, Search, User, Menu, X, Download } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

export default function MobileNavigation() {
  const pathname = usePathname()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const navLinks = [
    { href: "/mobile", label: "Accueil", icon: <Home className="w-5 h-5" /> },
    { href: "/mobile/films", label: "Films", icon: <Film className="w-5 h-5" /> },
    { href: "/mobile/series", label: "Séries", icon: <Tv className="w-5 h-5" /> },
    { href: "/mobile/downloads", label: "Téléchargements", icon: <Download className="w-5 h-5" /> },
    { href: "/mobile/search", label: "Recherche", icon: <Search className="w-5 h-5" /> },
    { href: "/mobile/profile", label: "Profil", icon: <User className="w-5 h-5" /> },
  ]

  return (
    <>
      {/* Top Navigation */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled ? "bg-gray-900/90 backdrop-blur-md shadow-md" : "bg-transparent"
        }`}
      >
        <div className="px-4 flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/mobile" className="flex items-center">
            <span
              className="text-xl font-bold bg-gradient-to-r from-purple-500 to-blue-500 text-transparent bg-clip-text"
              style={{ fontFamily: "var(--font-poppins)" }}
            >
              StreamFlow
            </span>
          </Link>

          {/* Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleMenu}
            className="text-gray-300 hover:text-white"
            aria-label="Menu"
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>
      </header>

      {/* Slide-in Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.3 }}
            className="fixed inset-0 z-40 bg-gray-900/95 backdrop-blur-md pt-16"
          >
            <div className="flex flex-col p-6 h-full">
              <nav className="flex-1">
                <ul className="space-y-6">
                  {navLinks.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className={`flex items-center text-lg py-2 ${
                          pathname === link.href
                            ? "text-white font-medium"
                            : "text-gray-400 hover:text-white transition-colors"
                        }`}
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <span className="mr-3">{link.icon}</span>
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>

              <div className="mt-auto pt-6 border-t border-gray-800">
                <Link
                  href="/login"
                  className="block w-full py-3 text-center bg-gradient-to-r from-purple-600 to-blue-500 text-white font-medium rounded-md"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Se connecter
                </Link>
                <div className="mt-6 flex justify-center space-x-4">
                  <Link href="/mentions-legales" className="text-sm text-gray-400 hover:text-white">
                    Mentions légales
                  </Link>
                  <Link href="/confidentialite" className="text-sm text-gray-400 hover:text-white">
                    Confidentialité
                  </Link>
                  <Link href="/contact" className="text-sm text-gray-400 hover:text-white">
                    Contact
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom Tab Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-gray-900/90 backdrop-blur-md border-t border-gray-800 z-30">
        <div className="flex justify-around items-center h-16">
          {navLinks.slice(0, 5).map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`flex flex-col items-center justify-center w-full h-full ${
                pathname === link.href ? "text-purple-500" : "text-gray-400 hover:text-white"
              }`}
            >
              {link.icon}
              <span className="text-xs mt-1">{link.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </>
  )
}
