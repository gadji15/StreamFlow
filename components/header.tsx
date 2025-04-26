// Note: Ce fichier n'est pas complet car je ne connais pas le reste de votre Header
// Je montre uniquement la partie à modifier pour intégrer le logo SVG

"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Download, Film, Home, Search, User } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isUserVIP, setIsUserVIP] = useState(false);
  
  // Effet pour détecter le défilement
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  // Simule la vérification VIP (à remplacer par votre logique d'authentification)
  useEffect(() => {
    // Simuler un utilisateur VIP (remplacer par votre propre logique)
    const checkVIPStatus = () => {
      // Exemple: vérifier dans localStorage ou une API
      setIsUserVIP(localStorage.getItem('isVIP') === 'true');
    };
    
    checkVIPStatus();
  }, []);
  
  return (
    <header className={`fixed top-0 left-0 right-0 z-30 transition-colors duration-300 ${
      isScrolled ? 'bg-gray-900/95 backdrop-blur-sm border-b border-gray-800' : 'bg-transparent'
    }`}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-24">
          {/* Logo avec SVG animé */}
          <Link href="/" className="flex items-center">
            <div className="w-10 h-10 mr-2">
              <svg width="40" height="40" viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="headerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#7C3AED" />
                    <stop offset="100%" stopColor="#3B82F6" />
                  </linearGradient>
                </defs>
                
                {/* S stylisé simplifié */}
                <path d="
                  M 165 80
                  C 145 80, 105 80, 95 100
                  C 85 120, 95 135, 115 140
                  L 145 150
                  C 165 155, 175 170, 165 190
                  C 155 210, 115 210, 95 210
                  M 95 210
                  C 115 210, 155 210, 165 190
                  C 175 170, 165 155, 145 150
                  L 115 140
                  C 95 135, 85 120, 95 100
                  C 105 80, 145 80, 165 80
                  " 
                  stroke="url(#headerGradient)" strokeWidth="16" strokeLinecap="round" fill="none">
                </path>
                
                {/* Vague avec animation */}
                <path d="
                  M 65 170
                  Q 90 155, 115 170
                  Q 140 185, 165 170
                  Q 190 155, 215 170
                  " 
                  stroke="url(#headerGradient)" strokeWidth="6" fill="none" opacity="0.6" strokeLinecap="round">
                  <animate attributeName="d" 
                    values="
                      M 65 170 Q 90 155, 115 170 Q 140 185, 165 170 Q 190 155, 215 170;
                      M 65 170 Q 90 185, 115 170 Q 140 155, 165 170 Q 190 185, 215 170;
                      M 65 170 Q 90 155, 115 170 Q 140 185, 165 170 Q 190 155, 215 170
                    "
                    dur="3s" repeatCount="indefinite"/>
                </path>
              </svg>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-purple-500 to-blue-500 text-transparent bg-clip-text">
              StreamFlow
            </span>
          </Link>
          
          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link href="/" className="text-sm font-medium text-gray-300 hover:text-white">
              Accueil
            </Link>
            <Link href="/films" className="text-sm font-medium text-gray-300 hover:text-white">
              Films
            </Link>
            <Link href="/series" className="text-sm font-medium text-gray-300 hover:text-white">
              Séries
            </Link>
            {isUserVIP && (
              <Link href="/exclusif" className="text-sm font-medium text-gray-300 hover:text-white flex items-center">
                <span>Exclusif</span>
                <span className="ml-1 text-xs bg-gradient-to-r from-amber-400 to-yellow-600 text-black px-1.5 py-0.5 rounded-full font-bold">
                  VIP
                </span>
              </Link>
            )}
            <Link href="/categories" className="text-sm font-medium text-gray-300 hover:text-white">
              Catégories
            </Link>
            
            {/* Installation app */}
            <Link href="/mobile" className="flex items-center text-sm font-medium px-3 py-2 rounded-md text-gray-300 hover:text-white hover:bg-gray-700">
              <Download className="h-4 w-4 mr-1.5" />
              <span>Installer</span>
            </Link>
          </nav>
          
          {/* Actions utilisateur */}
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon" className="text-gray-300">
              <Search className="h-5 w-5" />
            </Button>
            
            {/* Menu utilisateur */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <User className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href="/compte">Mon compte</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/ma-liste">Ma liste</Link>
                </DropdownMenuItem>
                {/* Lien d'installation */}
                <DropdownMenuItem asChild>
                  <Link href="/mobile" className="flex items-center">
                    <Download className="h-4 w-4 mr-2" />
                    <span>Installer l'application</span>
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;