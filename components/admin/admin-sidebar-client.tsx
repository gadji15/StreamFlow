'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home, 
  Film, 
  Tv, 
  Users, 
  Settings, 
  BarChart3,
  MessageSquare,
  Eye
} from 'lucide-react';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
  adminOnly?: boolean;
  superAdminOnly?: boolean;
}

export default function AdminSidebarClient() {
  const pathname = usePathname();
  // On utilise le hook qui expose les rôles sous forme de tableau
  const { userData } = useSupabaseAuth();
  const roles = userData?.roles ?? [];

  const isAdmin = roles.includes('admin') || roles.includes('super_admin');
  const isSuperAdmin = roles.includes('super_admin');
  
  const navItems: NavItem[] = [
    { href: '/admin/dashboard', label: 'Tableau de bord', icon: Home },
    { href: '/admin/films', label: 'Films', icon: Film },
    { href: '/admin/series', label: 'Séries', icon: Tv },
    { href: '/admin/users', label: 'Utilisateurs', icon: Users, adminOnly: true },
    { href: '/admin/stats', label: 'Statistiques', icon: BarChart3, adminOnly: true },
    { href: '/admin/comments', label: 'Commentaires', icon: MessageSquare },
    { href: '/admin/settings', label: 'Paramètres', icon: Settings, superAdminOnly: true },
  ];
  
  // Filtrer les éléments en fonction des rôles (supporte plusieurs rôles)
  const filteredNavItems = navItems.filter(item => {
    if (item.superAdminOnly && !isSuperAdmin) return false;
    if (item.adminOnly && !isAdmin) return false;
    return true;
  });

  // Avatar fallback
  const initials =
    userData?.displayName?.[0]?.toUpperCase()
    || userData?.email?.[0]?.toUpperCase()
    || '?';

  // Rôle visuel
  const roleLabel =
    isSuperAdmin ? 'Super Admin'
    : isAdmin ? 'Admin'
    : 'Utilisateur';

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-64 bg-gray-900 shadow-lg hidden md:flex flex-col z-40">
      <div className="h-16 flex items-center justify-center border-b border-gray-800">
        <h1 className="text-2xl font-bold tracking-tight text-white">
          <Link href="/admin/dashboard">
            Stream<span className="text-indigo-400">Flow</span>
          </Link>
        </h1>
      </div>
      
      <nav className="flex-1 p-4 overflow-y-auto">
        <ul className="space-y-1">
          {filteredNavItems.map((item) => {
            const active = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center px-4 py-3 rounded-lg font-medium transition-colors gap-3 text-base group ${
                    active
                      ? 'bg-indigo-600 text-white shadow'
                      : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                  }`}
                >
                  <item.icon className="h-5 w-5 flex-shrink-0" />
                  <span className="truncate">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      
      <div className="border-t border-gray-800 p-4">
        {userData && (
          <div className="flex items-start mb-4">
            <div className="h-9 w-9 rounded-full bg-indigo-500 flex items-center justify-center text-lg font-bold text-white mr-3 shadow-md">
              {initials}
            </div>
            <div className="min-w-0">
              <p className="font-medium text-sm text-white truncate">{userData.displayName || userData.email || 'Compte'}</p>
              <p className="text-xs text-gray-400 truncate">{userData.email}</p>
              <p className={`text-xs mt-0.5 font-semibold ${isSuperAdmin ? 'text-pink-400' : isAdmin ? 'text-indigo-400' : 'text-gray-400'}`}>
                {roleLabel}
              </p>
            </div>
          </div>
        )}
        <Link
          href="/"
          className="flex items-center justify-center px-4 py-2 text-sm text-gray-300 hover:text-white rounded-lg border border-gray-700 hover:bg-gray-800 transition-colors"
        >
          <Eye className="h-4 w-4 mr-2" />
          Retour au site
        </Link>
      </div>
    </aside>
  );
}