"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, User, Bell, Download } from "lucide-react";
import { useTheme } from "@/components/theme-provider";
import { useMediaQuery } from "@/hooks/use-media-query";

// Simuler un état connecté (à remplacer par votre système d'authentification)
const isLoggedIn = false;
const isUserVIP = false;

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const isMobile = useMediaQuery("(max-width: 768px)");
  
  // Effet de défilement pour changer l'apparence de l'en-tête
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Définir les liens de navigation
  const navLinks = [
    { href: "/", label: "Accueil" },
    { href: "/films", label: "Films" },
    { href: "/series", label: "Séries" },
    { href: "/categories", label: "Catégories" },
    { href: "/mobile", label: "Application Mobile", icon: Download },
    { href: "/exclusif", label: "VIP", isVIPLink: true }
  ];

  return (
    <header className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
      isScrolled ? "bg-gray-900/95 backdrop-blur shadow-md" : "bg-transparent"
    }`}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="text-2xl font-bold">
            <span className="bg-gradient-to-r from-purple-500 to-blue-500 bg-clip-text text-transparent">
              StreamFlow
            </span>
          </Link>
          
          {/* Navigation sur desktop */}
          <nav className="hidden md:flex items-center space-x-6">
            {navLinks.map((link) => (
              !link.isVIPLink || (link.isVIPLink && isUserVIP) ? (
                <Link 
                  key={link.href}
                  href={link.href} 
                  className={`transition-colors ${
                    pathname === link.href 
                      ? "text-white font-medium" 
                      : "text-gray-300 hover:text-white"
                  } ${link.isVIPLink ? "text-amber-400" : ""}`}
                >
                  {link.icon && <link.icon className="inline mr-1 h-4 w-4" />}
                  {link.label}
                </Link>
              ) : null
            ))}
          </nav>
          
          {/* Actions utilisateur */}
          <div className="flex items-center space-x-4">
            {/* Bouton thème */}
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="p-2 rounded-full hover:bg-gray-800"
              aria-label="Changer de thème"
            >
              {theme === "dark" ? (
                <span>🌙</span>
              ) : (
                <span>☀️</span>
              )}
            </button>
            
            {/* Login/Profil */}
            {isLoggedIn ? (
              <div className="flex items-center space-x-3">
                <button 
                  className="p-2 rounded-full hover:bg-gray-800"
                  aria-label="Notifications"
                >
                  <Bell size={20} />
                </button>
                <button 
                  className="p-2 rounded-full hover:bg-gray-800"
                  aria-label="Profil"
                >
                  <User size={20} />
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md transition-colors"
              >
                Connexion
              </Link>
            )}
            
            {/* Menu mobile */}
            <button
              className="md:hidden p-2 hover:bg-gray-800 rounded-md"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Menu"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>
      
      {/* Navigation mobile */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-gray-900 border-t border-gray-800">
          <div className="container mx-auto px-4 py-2">
            <nav className="flex flex-col space-y-3 py-4">
              {navLinks.map((link) => (
                !link.isVIPLink || (link.isVIPLink && isUserVIP) ? (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`px-4 py-2 rounded hover:bg-gray-800 ${
                      pathname === link.href ? "bg-gray-800" : ""
                    } ${link.isVIPLink ? "text-amber-400" : ""}`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {link.icon && <link.icon className="inline mr-2 h-4 w-4" />}
                    {link.label}
                  </Link>
                ) : null
              ))}
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}