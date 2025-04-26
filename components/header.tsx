"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { useMediaQuery } from "@/hooks/use-media-query";

// Fonction utilitaire
const isLoggedIn = () => {
  // Simuler la vérification de connexion (remplacer par la votre)
  const user = localStorage.getItem("user");
  return !!user; // Retourne vrai si l'utilisateur est connecté
}

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const isVIP = true; // Exemple : à remplacer par votre logique de vérification VIP
  const isMobile = useMediaQuery("(max-width: 1024px)");

  // État de connexion (à remplacer par votre logique)
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Simuler la vérification de connexion après un délai
    const timer = setTimeout(() => {
      setIsConnected(isLoggedIn());
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  // Effet de défilement pour changer la couleur de l'en-tête
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY >= 25);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header className={`fixed top-0 left-0 right-0 z-30 transition-colors duration-300 backdrop-blur-lg ${isScrolled ? 'bg-gray-900/90' : 'bg-transparent'}`}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-24">
          {/* Logo */}
          <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-purple-500 to-blue-500 text-transparent bg-clip-text transform hover:scale-105 transition-transform duration-200">
            StreamFlow
          </Link>

          {/* Liens de navigation cachés sur mobile */}
          {!isMobile && (
            <nav className="hidden lg:flex items-center font-medium">
              <Link href="/" className="px-4 py-0 hover: underline decoration-indigo-200">Accueil</Link>
              <Link href="/films" className="px-4 py-0 hover: underline decoration-indigo-200">Films</Link>
              <Link href="/series" className="px-4 py-0 hover: underline decoration-indigo-200">Séries</Link>
              <Link href="/categories" className="px-4 py-0 hover: underline decoration-indigo-200">Catégories</Link>
              <Link href="/exclusif" className="text-secondary-500 px-4 py-0">
                Exclusif VIP
              </Link>
            </nav>
          )}

          {/* Actions utilisateur */}
          <div className="flex items-center">
            {isConnected ? (
              <>
                <Button className="px-6 py-2 rounded-3xl hover:bg-gray-700 hover:text-white">
                  <span className="flex items-center">
                    <Download className="mr-2 h-4 w-4" />
                    <span>Installer</span>
                  </span>
                </Button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button className="ml-6 relative h-9 w-9 hover:shadow rounded-full hover:-rotate-3 hover:bg-indigo-600 hover:text-white transition ease-out duration-200">
                      <User className="m-1.5 h-5 w-5" />
                      <div className="relative z-40 cursor-pointer rounded-full bg-white h-4 w-4 flex items-center justify-center -top-1 -left-2">
                        <Bell className="text-black h-2.5 w-2.5" />
                      </div>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent sideOffset={8} className="z-40">
                    <DropdownMenuGroup className="divide-y divide-gray-300/10">
                      <DropdownMenuItem onSelect={() => {/* Votre logique */ }}>
                        <User className="mr-2 h-4 w-4" />
                        Mon Profil
                      </DropdownMenuItem>
                      <DropdownMenuItem onSelect={() => {/* Votre logique */ }}>
                        <LogOut className="mr-2 h-4 w-4" />
                        Déconnexion
                      </DropdownMenuItem>
                    </DropdownMenuGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <Link href="/login" className="ml-6 px-6 py-2 rounded-3xl bg-indigo-700 text-white hover:bg-gray-700 hover:text-white">
                Connexion
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}