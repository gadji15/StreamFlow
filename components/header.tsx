'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, User, Film, Tv, Search, Bell, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ModeToggle } from '@/components/mode-toggle';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Header() {
  const [navOpen, setNavOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const { isLoggedIn, isLoading, userData, isVIP, logout, isAdmin } = useSupabaseAuth();

  // Gérer le scroll pour changer l'apparence du header
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fermer le menu lorsqu'on navigue
  useEffect(() => {
    setNavOpen(false);
  }, [pathname]);
  
  // Gérer la déconnexion
  const handleLogout = async () => {
    try {
      await logout();
      // La redirection est gérée dans useAuth
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  };

  return (
    <header className={`fixed w-full top-0 z-50 transition-colors duration-300 ${
      scrolled ? 'bg-black/90 backdrop-blur-sm' : 'bg-gradient-to-b from-black/80 to-transparent'
    }`}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <span className="text-xl font-bold">StreamFlow</span>
          </Link>

          {/* Navigation principale - Desktop */}
          <nav className="hidden md:flex space-x-6">
            <Link
              href="/films"
              className={`hover:text-white ${pathname === '/films' ? 'text-white' : 'text-gray-300'}`}
            >
              Films
            </Link>
            <Link
              href="/series"
              className={`hover:text-white ${pathname === '/series' ? 'text-white' : 'text-gray-300'}`}
            >
              Séries
            </Link>
            <Link
              href="/categories"
              className={`hover:text-white ${pathname === '/categories' ? 'text-white' : 'text-gray-300'}`}
            >
              Catégories
            </Link>
            <Link
              href="/nouveates"
              className={`hover:text-white ${pathname === '/nouveates' ? 'text-white' : 'text-gray-300'}`}
            >
              Nouveautés
            </Link>
            {isVIP && (
              <Link
                href="/exclusif"
                className="text-amber-400 hover:text-amber-300 flex items-center"
              >
                <Sparkles className="w-4 h-4 mr-1" />
                Exclusif
              </Link>
            )}
          </nav>

          {/* Actions - Desktop */}
          <div className="hidden md:flex items-center space-x-4">
            <Link href="/search">
              <Button variant="ghost" size="icon">
                <Search className="h-5 w-5" />
              </Button>
            </Link>
            
            {isLoggedIn ? (
              <>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative rounded-full h-8 w-8 p-0">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={userData?.photoURL || ''} alt={userData?.displayName || ''} />
                        <AvatarFallback>
                          {userData?.displayName?.charAt(0) || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      {isVIP && (
                        <span className="absolute -top-1 -right-1 bg-amber-400 rounded-full w-3 h-3 border-2 border-background"></span>
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>
                      {userData?.displayName || 'Utilisateur'}
                      {isVIP && <span className="ml-1 text-amber-400">(VIP)</span>}
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/mon-compte">Mon compte</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/mon-compte/historique">Historique</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/mon-compte/favoris">Favoris</Link>
                    </DropdownMenuItem>
                    {!isVIP && (
                      <DropdownMenuItem asChild>
                        <Link href="/vip" className="text-amber-400">Devenir VIP</Link>
                      </DropdownMenuItem>
                    )}
                    {isAdmin && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                          <Link href="/admin">Administration</Link>
                        </DropdownMenuItem>
                      </>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout}>
                      Se déconnecter
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost">Connexion</Button>
                </Link>
                <Link href="/inscription">
                  <Button>S'inscrire</Button>
                </Link>
              </>
            )}
            
            <ModeToggle />
          </div>

          {/* Menu mobile - bouton */}
          <div className="flex items-center md:hidden">
            <Link href="/search" className="mr-2">
              <Button variant="ghost" size="icon">
                <Search className="h-5 w-5" />
              </Button>
            </Link>
            
            <Button variant="ghost" size="icon" onClick={() => setNavOpen(!navOpen)}>
              {navOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Menu mobile - contenu */}
      {navOpen && (
        <div className="md:hidden bg-background border-t border-gray-800">
          <div className="container mx-auto px-4 py-4">
            <nav className="space-y-4">
              <Link
                href="/films"
                className="block py-2 hover:text-white"
                onClick={() => setNavOpen(false)}
              >
                <div className="flex items-center">
                  <Film className="mr-2 h-5 w-5" />
                  Films
                </div>
              </Link>
              <Link
                href="/series"
                className="block py-2 hover:text-white"
                onClick={() => setNavOpen(false)}
              >
                <div className="flex items-center">
                  <Tv className="mr-2 h-5 w-5" />
                  Séries
                </div>
              </Link>
              <Link
                href="/categories"
                className="block py-2 hover:text-white"
                onClick={() => setNavOpen(false)}
              >
                Catégories
              </Link>
              <Link
                href="/nouveates"
                className="block py-2 hover:text-white"
                onClick={() => setNavOpen(false)}
              >
                Nouveautés
              </Link>
              {isVIP && (
                <Link
                  href="/exclusif"
                  className="block py-2 text-amber-400 hover:text-amber-300"
                  onClick={() => setNavOpen(false)}
                >
                  <div className="flex items-center">
                    <Sparkles className="mr-2 h-5 w-5" />
                    Contenu exclusif
                  </div>
                </Link>
              )}
              
              <div className="border-t border-gray-800 pt-4 mt-4">
                {isLoggedIn ? (
                  <>
                    <Link
                      href="/mon-compte"
                      className="block py-2 hover:text-white"
                      onClick={() => setNavOpen(false)}
                    >
                      <div className="flex items-center">
                        <User className="mr-2 h-5 w-5" />
                        Mon compte {isVIP && <span className="ml-1 text-amber-400">(VIP)</span>}
                      </div>
                    </Link>
                    <Link
                      href="/mon-compte/historique"
                      className="block py-2 hover:text-white"
                      onClick={() => setNavOpen(false)}
                    >
                      Historique
                    </Link>
                    <Link
                      href="/mon-compte/favoris"
                      className="block py-2 hover:text-white"
                      onClick={() => setNavOpen(false)}
                    >
                      Favoris
                    </Link>
                    {!isVIP && (
                      <Link
                        href="/vip"
                        className="block py-2 text-amber-400 hover:text-amber-300"
                        onClick={() => setNavOpen(false)}
                      >
                        Devenir VIP
                      </Link>
                    )}
                    {isAdmin && (
                      <Link
                        href="/admin"
                        className="block py-2 hover:text-white"
                        onClick={() => setNavOpen(false)}
                      >
                        Administration
                      </Link>
                    )}
                    <button
                      onClick={() => {
                        handleLogout();
                        setNavOpen(false);
                      }}
                      className="block w-full text-left py-2 hover:text-white"
                    >
                      Se déconnecter
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/login"
                      className="block py-2 hover:text-white"
                      onClick={() => setNavOpen(false)}
                    >
                      Connexion
                    </Link>
                    <Link
                      href="/inscription"
                      className="block py-2 hover:text-white"
                      onClick={() => setNavOpen(false)}
                    >
                      S'inscrire
                    </Link>
                  </>
                )}
                
                <div className="flex items-center justify-between mt-4">
                  <span>Thème</span>
                  <ModeToggle />
                </div>
              </div>
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}