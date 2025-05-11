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
  const { userData } = useSupabaseAuth();
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
    if (item.adminOnly && !(userData?.role === 'admin' || userData?.role === 'super_admin')) return false;
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
                  pathname === item.href || pathname.startsWith(item.href + '/')
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