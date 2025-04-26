'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home, 
  Film, 
  Tv, 
  Users, 
  Settings, 
  Menu, 
  X, 
  LogOut,
  BarChart3,
  MessageSquare,
  Eye
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import AdminAuthGuard from '@/components/admin/admin-auth-guard';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';

// Métadonnées pour le SEO
export const metadata = {
  title: 'StreamFlow Admin',
  description: 'Interface d\'administration de StreamFlow',
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminAuthGuard>
      <div className="min-h-screen bg-gray-900">
        <AdminHeader />
        <div className="flex">
          <AdminSidebar />
          <main className="flex-1 p-6 ml-0 md:ml-64 pt-24">
            {children}
          </main>
        </div>
      </div>
    </AdminAuthGuard>
  );
}

function AdminHeader() {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  
  const handleLogout = async () => {
    await logout();
    toast({
      title: "Déconnexion réussie",
      description: "Vous avez été déconnecté de l'interface d'administration.",
    });
  };
  
  return (
    <header className="fixed top-0 right-0 left-0 md:left-64 h-16 bg-gray-800 shadow-md z-30 flex items-center justify-between px-4">
      <div className="md:hidden">
        <Button variant="ghost" size="icon" className="p-2">
          <Menu className="h-6 w-6" />
        </Button>
      </div>
      
      <div className="flex-1 md:flex-auto">
        <h1 className="text-lg font-semibold md:pl-2">
          StreamFlow <span className="text-indigo-400">Admin</span>
        </h1>
      </div>
      
      <div className="flex items-center space-x-4">
        <Link 
          href="/" 
          target="_blank" 
          className="text-sm text-gray-300 hover:text-white flex items-center"
        >
          <Eye className="h-4 w-4 mr-1" />
          <span className="hidden md:inline">Voir le site</span>
        </Link>
        
        <button
          onClick={handleLogout}
          className="text-sm text-gray-300 hover:text-white hover:bg-gray-700 rounded px-3 py-2 flex items-center"
        >
          <LogOut className="h-4 w-4 mr-1" />
          <span className="hidden md:inline">Déconnexion</span>
        </button>
      </div>
    </header>
  );
}

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
  adminOnly?: boolean;
  superAdminOnly?: boolean;
}

function AdminSidebar() {
  const pathname = usePathname();
  const { userData } = useAuth();
  const isSuperAdmin = userData?.role === 'super_admin';
  
  const navItems: NavItem[] = [
    { href: '/admin/dashboard', label: 'Tableau de bord', icon: Home },
    { href: '/admin/films', label: 'Films', icon: Film },
    { href: '/admin/series', label: 'Séries', icon: Tv },
    { href: '/admin/users', label: 'Utilisateurs', icon: Users, adminOnly: true },
    { href: '/admin/stats', label: 'Statistiques', icon: BarChart3, adminOnly: true },
    { href: '/admin/comments', label: 'Commentaires', icon: MessageSquare },
    { href: '/admin/settings', label: 'Paramètres', icon: Settings, superAdminOnly: true },
  ];
  
  // Filtrer les éléments en fonction des rôles
  const filteredNavItems = navItems.filter(item => {
    if (item.superAdminOnly && !isSuperAdmin) return false;
    if (item.adminOnly && !isSuperAdmin && userData?.role !== 'admin') return false;
    return true;
  });
  
  return (
    <aside className="fixed left-0 top-0 bottom-0 w-64 bg-gray-800 shadow-lg hidden md:block z-40">
      <div className="h-16 flex items-center justify-center border-b border-gray-700">
        <h1 className="text-2xl font-bold">
          <Link href="/admin/dashboard">
            Stream<span className="text-indigo-400">Flow</span>
          </Link>
        </h1>
      </div>
      
      <nav className="p-4">
        <ul className="space-y-2">
          {filteredNavItems.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
                  pathname === item.href
                    ? 'bg-indigo-600 text-white'
                    : 'text-gray-300 hover:bg-gray-700'
                }`}
              >
                <item.icon className="h-5 w-5 mr-3" />
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      
      <div className="absolute bottom-0 left-0 right-0 p-4">
        <div className="border-t border-gray-700 pt-4">
          {userData && (
            <div className="flex items-start mb-4">
              <div className="h-8 w-8 rounded-full bg-indigo-500 flex items-center justify-center text-white mr-2">
                {userData.displayName?.[0] || userData.email?.[0] || 'A'}
              </div>
              <div>
                <p className="font-medium text-sm">{userData.displayName || 'Admin'}</p>
                <p className="text-xs text-gray-400 overflow-hidden text-ellipsis">
                  {userData.email}
                </p>
                <p className="text-xs text-indigo-400 mt-0.5 capitalize">
                  {userData.role === 'super_admin' ? 'Super Admin' : 'Admin'}
                </p>
              </div>
            </div>
          )}
          
          <Link
            href="/"
            className="flex items-center justify-center px-4 py-2 text-sm text-gray-300 hover:text-white rounded-lg border border-gray-700 hover:bg-gray-700 transition-colors"
          >
            <Eye className="h-4 w-4 mr-2" />
            Retour au site
          </Link>
        </div>
      </div>
    </aside>
  );
}