'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, User, Film, Tv, Search, Bell, Sparkles, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
// import { ModeToggle } from '@/components/mode-toggle';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import SearchModal from '@/components/SearchModal';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AnimatePresence, motion } from "framer-motion";

export default function Header() {
  const [navOpen, setNavOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const { isLoggedIn, isLoading, userData, isVIP, logout, isAdmin } = useSupabaseAuth();

  const mobileMenuRef = useRef<HTMLDivElement | null>(null);
  const firstMenuLinkRef = useRef<HTMLAnchorElement | null>(null);

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

  // Focus automatique + focus trap + fermeture sur click dehors/Escape
  useEffect(() => {
    if (!navOpen) return;

    // Focus sur le premier lien du menu mobile à l'ouverture
    firstMenuLinkRef.current?.focus();

    // Fonction pour trapper le focus dans le menu mobile
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setNavOpen(false);
      }
      if (e.key === "Tab" && mobileMenuRef.current) {
        const focusableEls = mobileMenuRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );
        const focusable = Array.from(focusableEls).filter(el => el.offsetParent !== null);
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      }
    };

    // Fermeture sur click en dehors
    const handleClickOutside = (e: MouseEvent) => {
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(e.target as Node)) {
        setNavOpen(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [navOpen]);
  
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
    <>
      <header className={`fixed w-full top-0 z-50 transition-colors duration-300 ${
        scrolled ? 'bg-black/90 backdrop-blur-sm' : 'bg-gradient-to-b from-black/80 to-transparent'
      }`}>
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo dynamique */}
            <Link href="/" className="flex items-center group select-none">
              <Home className="w-7 h-7 mr-2 text-fuchsia-400 group-hover:animate-bounce group-hover:text-blue-400 transition-colors" />
              <span className="text-2xl font-extrabold bg-gradient-to-r from-fuchsia-500 via-blue-500 to-purple-600 text-transparent bg-clip-text group-hover:scale-105 transition-transform">
                StreamFlow
              </span>
            </Link>

            {/* Navigation principale - Desktop */}
            <nav className="hidden md:flex space-x-2">
              <Link
                href="/"
                className={`group flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-base transition-all duration-200
                  ${
                    pathname === '/' 
                      ? 'bg-gradient-to-r from-fuchsia-500 to-blue-500 text-white shadow-lg'
                      : 'text-gray-300 hover:bg-gradient-to-r hover:from-fuchsia-500 hover:to-blue-500 hover:text-white hover:shadow'
                  }`}
              >
                <Home className={`w-5 h-5 transition-transform duration-200 group-hover:scale-110 ${pathname === '/' ? 'text-white drop-shadow' : 'text-fuchsia-300 group-hover:text-white'}`} />
                Accueil
              </Link>
              <Link
                href="/films"
                className={`group flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-base transition-all duration-200
                  ${
                    pathname === '/films'
                      ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg'
                      : 'text-gray-300 hover:bg-gradient-to-r hover:from-indigo-500 hover:to-purple-600 hover:text-white hover:shadow'
                  }`}
              >
                <Film className={`w-5 h-5 transition-transform duration-200 group-hover:scale-110 ${pathname === '/films' ? 'text-white drop-shadow' : 'text-indigo-300 group-hover:text-white'}`} />
                Films
              </Link>
              <Link
                href="/series"
                className={`group flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-base transition-all duration-200
                  ${
                    pathname === '/series'
                      ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-lg'
                      : 'text-gray-300 hover:bg-gradient-to-r hover:from-pink-500 hover:to-purple-500 hover:text-white hover:shadow'
                  }`}
              >
                <Tv className={`w-5 h-5 transition-transform duration-200 group-hover:scale-110 ${pathname === '/series' ? 'text-white drop-shadow' : 'text-pink-300 group-hover:text-white'}`} />
                Séries
              </Link>
              <Link
                href="/suggestions"
                className={`group flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-base transition-all duration-200
                  ${
                    pathname === '/suggestions'
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-400 text-white shadow-lg'
                      : 'text-gray-300 hover:bg-gradient-to-r hover:from-emerald-500 hover:to-teal-400 hover:text-white hover:shadow'
                  }`}
              >
                <Sparkles className={`w-5 h-5 transition-transform duration-200 group-hover:scale-110 ${pathname === '/suggestions' ? 'text-white drop-shadow' : 'text-emerald-200 group-hover:text-white'}`} />
                Suggestions
              </Link>
              <Link
                href="/nouveautes"
                className={`group flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-base transition-all duration-200
                  ${
                    pathname === '/nouveautes'
                      ? 'bg-gradient-to-r from-yellow-500 to-orange-400 text-white shadow-lg'
                      : 'text-gray-300 hover:bg-gradient-to-r hover:from-yellow-500 hover:to-orange-400 hover:text-white hover:shadow'
                  }`}
              >
                <Bell className={`w-5 h-5 transition-transform duration-200 group-hover:scale-110 ${pathname === '/nouveautes' ? 'text-white drop-shadow' : 'text-yellow-300 group-hover:text-white'}`} />
                Nouveautés
              </Link>
              {isVIP && (
                <Link
                  href="/exclusif"
                  className="group flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-base shadow bg-gradient-to-r from-amber-400 to-yellow-300 text-black border border-yellow-200 hover:from-yellow-200 hover:to-yellow-400 hover:text-amber-700 transition-all"
                >
                  <Sparkles className="w-5 h-5 mr-1 text-amber-600 group-hover:scale-110 transition-transform duration-200" />
                  Exclusif
                </Link>
              )}
            </nav>

            {/* Actions - Desktop */}
            <div className="hidden md:flex items-center space-x-4">
              <SearchModal />
              
              {isLoggedIn ? (
                <>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        className="relative rounded-full h-8 w-8 p-0 hover:ring-2 hover:ring-fuchsia-400 transition"
                      >
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={userData?.photoURL || ''} alt={userData?.displayName || ''} />
                          <AvatarFallback className="bg-gray-900 hover:bg-gray-800 hover:text-fuchsia-400 transition">
                            {userData?.displayName?.charAt(0) || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        {isVIP && (
                          <span className="absolute -top-1 -right-1 bg-amber-400 rounded-full w-3 h-3 border-2 border-background"></span>
                        )}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-gray-900">
                      <DropdownMenuLabel>
                        {userData?.displayName || 'Utilisateur'}
                        {isVIP && <span className="ml-1 text-amber-400">(VIP)</span>}
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild className="hover:bg-gray-800 transition">
                        <Link href="/mon-compte">Mon compte</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild className="hover:bg-gray-800 transition">
                        <Link href="/mon-compte/historique">Historique</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild className="hover:bg-gray-800 transition">
                        <Link href="/favoris">Favoris</Link>
                      </DropdownMenuItem>
                      {!isVIP && (
                        <DropdownMenuItem asChild className="hover:bg-gray-800 transition">
                          <Link href="/vip" className="text-amber-400">Devenir VIP</Link>
                        </DropdownMenuItem>
                      )}
                      {isAdmin && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem asChild className="hover:bg-gray-800 transition">
                            <Link href="/admin">Administration</Link>
                          </DropdownMenuItem>
                        </>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleLogout} className="hover:bg-gray-800 transition">
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
              {/* ModeToggle supprimé */}
            </div>

            {/* Menu mobile - bouton */}
            <div className="flex items-center md:hidden">
              <SearchModal />
              
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setNavOpen(!navOpen)}
                aria-label={navOpen ? "Fermer le menu" : "Ouvrir le menu"}
                aria-haspopup="menu"
                aria-expanded={navOpen}
              >
                {navOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Menu mobile - contenu (modale EN DEHORS du header) */}
      <AnimatePresence>
        {navOpen && (
          <motion.div
            ref={mobileMenuRef}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            role="dialog"
            aria-modal="true"
            onClick={e => {
              // Ferme si on clique sur l'overlay (pas sur la carte)
              if (e.target === mobileMenuRef.current) setNavOpen(false);
            }}
          >
            <motion.div
              className="w-[95vw] max-w-sm max-h-[90vh] mx-auto rounded-2xl bg-gray-900/90 shadow-xl border border-gray-700 relative px-4 py-6 flex flex-col"
              initial={{ scale: 0.96, y: 40, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.96, y: 40, opacity: 0 }}
              transition={{ type: "spring", stiffness: 340, damping: 26, duration: 0.25 }}
              onClick={e => e.stopPropagation()}
            >
              {/* Bouton fermer */}
              <button
                type="button"
                aria-label="Fermer le menu"
                className="absolute top-3 right-3 p-2 rounded-full hover:bg-gray-700 transition"
                onClick={() => setNavOpen(false)}
              >
                <X className="w-6 h-6 text-gray-400" />
              </button>
              <div className="mb-5">
                <h2 className="text-2xl font-bold text-center text-white mb-2 flex items-center gap-2 justify-center">
                  <Menu className="w-6 h-6 text-primary" /> Menu
                </h2>
                <p className="text-center text-gray-400">
                  Accédez rapidement aux différentes rubriques du site.
                </p>
              </div>
              <nav className="space-y-4 overflow-y-auto pr-2 flex-1">
                <Link
                  href="/"
                  className="block py-2 hover:text-white"
                  onClick={() => setNavOpen(false)}
                >
                  <div className="flex items-center">
                    <Home className={`mr-2 h-5 w-5 ${pathname === '/' ? 'text-white' : 'text-fuchsia-300'}`} />
                    Accueil
                  </div>
                </Link>
                <Link
                  href="/films"
                  className="block py-2 hover:text-white"
                  onClick={() => setNavOpen(false)}
                  ref={firstMenuLinkRef}
                >
                  <div className="flex items-center">
                    <Film className={`mr-2 h-5 w-5 ${pathname === '/films' ? 'text-white' : 'text-indigo-300'}`} />
                    Films
                  </div>
                </Link>
                <Link
                  href="/series"
                  className="block py-2 hover:text-white"
                  onClick={() => setNavOpen(false)}
                >
                  <div className="flex items-center">
                    <Tv className={`mr-2 h-5 w-5 ${pathname === '/series' ? 'text-white' : 'text-pink-300'}`} />
                    Séries
                  </div>
                </Link>
                <Link
                  href="/suggestions"
                  className="block py-2 hover:text-white"
                  onClick={() => setNavOpen(false)}
                >
                  <div className="flex items-center">
                    <Sparkles className={`mr-2 h-5 w-5 ${pathname === '/suggestions' ? 'text-white' : 'text-emerald-200'}`} />
                    Suggestions
                  </div>
                </Link>
                <Link
                  href="/nouveautes"
                  className="block py-2 hover:text-white"
                  onClick={() => setNavOpen(false)}
                >
                  <div className="flex items-center">
                    <Bell className={`mr-2 h-5 w-5 ${pathname === '/nouveautes' ? 'text-white' : 'text-yellow-300'}`} />
                    Nouveautés
                  </div>
                </Link>
                {isVIP && (
                  <Link
                    href="/exclusif"
                    className="block py-2 text-amber-400 hover:text-amber-300"
                    onClick={() => setNavOpen(false)}
                  >
                    <div className="flex items-center">
                      <Sparkles className="mr-2 h-5 w-5 text-amber-600" />
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
                        href="/favoris"
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
                  
                  {/* ModeToggle supprimé */}
                </div>
              </nav>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}