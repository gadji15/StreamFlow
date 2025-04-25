"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { SearchBar } from "./search-bar";
import { useSession } from "next/auth";
import { 
  Bell, 
  ChevronDown, 
  Menu, 
  X,
  User,
  LogOut,
  Settings,
  Crown,
  Heart,
  PlayCircle,
  History
} from "lucide-react";
import { ModeToggle } from "./mode-toggle";
import { VipBadge } from "./vip-badge";

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isVip, setIsVip] = useState(false); // Would come from your auth system
  const pathname = usePathname();
  
  // Hide header on admin routes
  if (pathname?.startsWith("/admin")) {
    return null;
  }

  // Check scroll position
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);
  
  // Simulate fetching VIP status
  useEffect(() => {
    // This would be replaced by your actual auth check
    const checkVipStatus = async () => {
      // Simulate API call
      setTimeout(() => {
        setIsVip(true); // Just for demonstration
      }, 1000);
    };
    
    checkVipStatus();
  }, []);
  
  const mainLinks = [
    { href: "/", label: "Accueil" },
    { href: "/movies", label: "Films" },
    { href: "/series", label: "Séries" },
    { href: "/categories", label: "Catégories" },
    { href: "/livetv", label: "Chaînes TV" },
  ];
  
  const vipLinks = [
    { href: "/premieres", label: "Avant-premières" },
    { href: "/exclusives", label: "Exclusivités" },
  ];
  
  const notifications = [
    { id: 1, title: "Nouveau film disponible", content: "Découvrez Captain America: Brave New World", time: "il y a 2h" },
    { id: 2, title: "Continuez votre visionnage", content: "Vous avez arrêté La Cité de Dieu à 45 minutes", time: "il y a 5h" },
    { id: 3, title: "Recommandé pour vous", content: "5 nouveaux films d'action", time: "il y a 1j" },
  ];

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-30 transition-all duration-300 ${
        isScrolled ? "bg-background/95 backdrop-blur-md py-2 shadow-md" : "bg-transparent py-4"
      }`}
    >
      <div className="container mx-auto px-4 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex-shrink-0 relative z-10">
          <div className="w-40 h-10 relative">
            <Image 
              src="/logo.png" 
              alt="StreamFlow" 
              fill
              priority
              className="object-contain"
            />
          </div>
        </Link>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          {mainLinks.map((link) => (
            <Link 
              key={link.href} 
              href={link.href}
              className={`text-sm font-medium transition-colors hover:text-primary ${
                pathname === link.href ? "text-primary" : "text-gray-200"
              }`}
            >
              {link.label}
            </Link>
          ))}
          
          {isVip && (
            <>
              <div className="h-4 border-l border-gray-700"></div>
              {vipLinks.map((link) => (
                <Link 
                  key={link.href} 
                  href={link.href}
                  className="text-sm font-medium transition-colors hover:text-primary flex items-center"
                >
                  <VipBadge className="mr-1.5" />
                  {link.label}
                </Link>
              ))}
            </>
          )}
        </nav>
        
        {/* Right Actions */}
        <div className="flex items-center space-x-4">
          {/* Search Bar */}
          <SearchBar />
          
          {/* Notifications */}
          <div className="relative">
            <button 
              className="relative text-gray-300 hover:text-white transition-colors"
              onClick={() => setShowNotifications(!showNotifications)}
            >
              <Bell size={20} />
              <span className="absolute -top-1 -right-1 bg-secondary text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                3
              </span>
            </button>
            
            <AnimatePresence>
              {showNotifications && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute right-0 mt-2 w-80 bg-surface border border-gray-800 rounded-lg shadow-xl z-30"
                >
                  <div className="p-3 border-b border-gray-800">
                    <h3 className="font-semibold">Notifications</h3>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.map((notification) => (
                      <div 
                        key={notification.id}
                        className="p-3 border-b border-gray-800 hover:bg-surface-light transition-colors"
                      >
                        <h4 className="font-medium text-sm">{notification.title}</h4>
                        <p className="text-xs text-gray-400 mt-1">{notification.content}</p>
                        <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                      </div>
                    ))}
                  </div>
                  <div className="p-3">
                    <Link 
                      href="/notifications"
                      className="text-xs text-primary hover:underline block text-center"
                    >
                      Voir toutes les notifications
                    </Link>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          {/* User Menu */}
          <div className="relative">
            <button 
              className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors"
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            >
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                <User size={18} />
              </div>
              <ChevronDown size={16} />
            </button>
            
            <AnimatePresence>
              {isUserMenuOpen && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute right-0 mt-2 w-56 bg-surface border border-gray-800 rounded-lg shadow-xl z-30"
                >
                  <div className="p-3 border-b border-gray-800">
                    <div className="font-semibold">John Doe</div>
                    <div className="text-xs text-gray-400">john.doe@example.com</div>
                    {isVip && (
                      <div className="mt-1">
                        <VipBadge />
                      </div>
                    )}
                  </div>
                  <div className="p-1">
                    <Link 
                      href="/profile"
                      className="flex items-center space-x-2 p-2 rounded-md hover:bg-surface-light transition-colors"
                    >
                      <User size={16} />
                      <span className="text-sm">Profil</span>
                    </Link>
                    <Link 
                      href="/favorites"
                      className="flex items-center space-x-2 p-2 rounded-md hover:bg-surface-light transition-colors"
                    >
                      <Heart size={16} />
                      <span className="text-sm">Favoris</span>
                    </Link>
                    <Link 
                      href="/watchlist"
                      className="flex items-center space-x-2 p-2 rounded-md hover:bg-surface-light transition-colors"
                    >
                      <PlayCircle size={16} />
                      <span className="text-sm">À voir</span>
                    </Link>
                    <Link 
                      href="/history"
                      className="flex items-center space-x-2 p-2 rounded-md hover:bg-surface-light transition-colors"
                    >
                      <History size={16} />
                      <span className="text-sm">Historique</span>
                    </Link>
                    {!isVip && (
                      <Link 
                        href="/vip"
                        className="flex items-center space-x-2 p-2 rounded-md hover:bg-surface-light transition-colors"
                      >
                        <Crown size={16} className="text-yellow-500" />
                        <span className="text-sm">Devenir VIP</span>
                      </Link>
                    )}
                    <Link 
                      href="/settings"
                      className="flex items-center space-x-2 p-2 rounded-md hover:bg-surface-light transition-colors"
                    >
                      <Settings size={16} />
                      <span className="text-sm">Paramètres</span>
                    </Link>
                    <div className="border-t border-gray-800 my-1"></div>
                    <button 
                      className="w-full flex items-center space-x-2 p-2 rounded-md hover:bg-surface-light transition-colors text-left"
                      onClick={() => console.log("Logout")}
                    >
                      <LogOut size={16} />
                      <span className="text-sm">Déconnexion</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          {/* Theme Toggle */}
          <ModeToggle />
          
          {/* Mobile Menu Toggle */}
          <button 
            className="md:hidden text-gray-300 hover:text-white transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>
      
      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-surface border-t border-gray-800 overflow-hidden"
          >
            <div className="container mx-auto px-4 py-4">
              <nav className="flex flex-col space-y-4">
                {mainLinks.map((link) => (
                  <Link 
                    key={link.href} 
                    href={link.href}
                    className={`text-base font-medium transition-colors hover:text-primary ${
                      pathname === link.href ? "text-primary" : "text-gray-200"
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                ))}
                
                {isVip && (
                  <>
                    <div className="border-t border-gray-800 pt-4">
                      <h3 className="text-sm text-gray-400 mb-2 flex items-center">
                        <VipBadge className="mr-1.5" /> Contenu VIP
                      </h3>
                    </div>
                    {vipLinks.map((link) => (
                      <Link 
                        key={link.href} 
                        href={link.href}
                        className="text-base font-medium transition-colors hover:text-primary pl-2"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        {link.label}
                      </Link>
                    ))}
                  </>
                )}
              </nav>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}