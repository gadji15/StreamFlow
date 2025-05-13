'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Film,
  Tv,
  Users,
  Settings,
  Activity,
  ChevronDown,
  PlusSquare,
  ListChecks,
  ExternalLink,
  HelpCircle,
  Bell,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavItemProps {
  href: string;
  icon: React.ReactNode;
  title: string;
  isActive: boolean;
  hasDropdown?: boolean;
  isOpen?: boolean;
  onClick?: () => void;
}

function NavItem({ href, icon, title, isActive, hasDropdown, isOpen, onClick }: NavItemProps) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        "flex items-center py-2 px-3 rounded-md mb-1 transition-colors",
        isActive
          ? "bg-primary/10 text-primary"
          : "text-gray-400 hover:text-white hover:bg-gray-800"
      )}
    >
      {icon}
      <span className="ml-3 flex-1">{title}</span>
      {hasDropdown && (
        <ChevronDown className={cn(
          "h-4 w-4 transition-transform",
          isOpen ? "transform rotate-180" : ""
        )} />
      )}
    </Link>
  );
}

interface AdminSidebarProps {
  /**
   * Fonction appelée pour fermer la sidebar en mode mobile (overlay).
   * Si non renseignée, la sidebar s'affiche en sticky/fixed desktop.
   */
  onCloseMobile?: () => void;
}

export default function AdminSidebar({ onCloseMobile }: AdminSidebarProps) {
  const pathname = usePathname();
  const [filmsOpen, setFilmsOpen] = useState(pathname?.startsWith('/admin/films'));
  const [seriesOpen, setSeriesOpen] = useState(pathname?.startsWith('/admin/series'));

  // Sidebar mobile : transparente et dynamique (slide-in)
  const sidebarClass = onCloseMobile
    ? "w-64 bg-gray-900/90 border-r border-gray-800 flex-shrink-0 h-full fixed z-50 top-0 left-0 flex flex-col shadow-2xl transition-all duration-300 ease-out translate-x-0"
    : "w-64 bg-gray-900 border-r border-gray-800 flex-shrink-0 h-screen sticky top-0 overflow-y-auto flex flex-col";

  // Sur mobile, la nav doit être scrollable, donc flex-1 min-h-0 overflow-y-auto
  const navScrollableClass = onCloseMobile
    ? "flex-1 min-h-0 overflow-y-auto px-3 py-2"
    : "flex-1 px-3 py-2";

  // Animation dynamique (slide-in) : initialisé hors-écran à gauche si invisible, translate-x-0 si visible
  // Ici, le parent contrôle l'affichage avec un overlay et la présence du composant, donc translate-x-0 suffit

  return (
    <div
      className={sidebarClass}
      style={onCloseMobile ? { transform: 'translateX(0)', transition: 'all 0.3s' } : undefined}
      tabIndex={-1}
      aria-modal={onCloseMobile ? "true" : undefined}
      role={onCloseMobile ? "dialog" : undefined}
    >
      <div className="p-6 flex items-center justify-between flex-shrink-0">
        <Link href="/admin" className="flex items-center">
          <h1 className="text-xl font-bold">StreamFlow Admin</h1>
        </Link>
        {onCloseMobile && (
          <button
            className="text-gray-400 hover:text-white ml-2"
            onClick={onCloseMobile}
            aria-label="Fermer la navigation"
          >
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
      <nav className={navScrollableClass}>
        <div className="mb-6">
          <p className="text-xs uppercase text-gray-500 font-semibold mb-2 px-3">General</p>
          <NavItem
            href="/admin"
            icon={<LayoutDashboard className="h-5 w-5" />}
            title="Tableau de bord"
            isActive={pathname === '/admin'}
          />
          <NavItem
            href="/admin/activity-logs"
            icon={<Activity className="h-5 w-5" />}
            title="Journaux d'activité"
            isActive={pathname === '/admin/activity-logs'}
          />
          <NavItem
            href="/admin/users"
            icon={<Users className="h-5 w-5" />}
            title="Utilisateurs"
            isActive={pathname === '/admin/users'}
          />
        </div>
        <div className="mb-6">
          <p className="text-xs uppercase text-gray-500 font-semibold mb-2 px-3">Contenu</p>
          <NavItem
            href="#"
            icon={<Film className="h-5 w-5" />}
            title="Films"
            isActive={pathname?.startsWith('/admin/films')}
            hasDropdown={true}
            isOpen={filmsOpen}
            onClick={() => setFilmsOpen(!filmsOpen)}
          />
          {filmsOpen && (
            <div className="ml-4 pl-2 border-l border-gray-800">
              <NavItem
                href="/admin/films"
                icon={<ListChecks className="h-4 w-4" />}
                title="Liste des films"
                isActive={pathname === '/admin/films'}
              />
              <NavItem
                href="/admin/films/add"
                icon={<PlusSquare className="h-4 w-4" />}
                title="Ajouter un film"
                isActive={pathname === '/admin/films/add'}
              />
            </div>
          )}
          <NavItem
            href="#"
            icon={<Tv className="h-5 w-5" />}
            title="Séries"
            isActive={pathname?.startsWith('/admin/series')}
            hasDropdown={true}
            isOpen={seriesOpen}
            onClick={() => setSeriesOpen(!seriesOpen)}
          />
          {seriesOpen && (
            <div className="ml-4 pl-2 border-l border-gray-800">
              <NavItem
                href="/admin/series"
                icon={<ListChecks className="h-4 w-4" />}
                title="Liste des séries"
                isActive={pathname === '/admin/series'}
              />
              <NavItem
                href="/admin/series/add"
                icon={<PlusSquare className="h-4 w-4" />}
                title="Ajouter une série"
                isActive={pathname === '/admin/series/add'}
              />
              <NavItem
                href="/admin/series/saisons"
                icon={<ListChecks className="h-4 w-4" />}
                title="Gestion des saisons"
                isActive={pathname === '/admin/series/saisons'}
              />
            </div>
          )}
        </div>
        <div className="mb-6">
          <p className="text-xs uppercase text-gray-500 font-semibold mb-2 px-3">Système</p>
          <NavItem
            href="/admin/settings"
            icon={<Settings className="h-5 w-5" />}
            title="Paramètres"
            isActive={pathname === '/admin/settings'}
          />
          <NavItem
            href="/admin/notifications"
            icon={<Bell className="h-5 w-5" />}
            title="Notifications"
            isActive={pathname === '/admin/notifications'}
          />
          <NavItem
            href="/admin/help"
            icon={<HelpCircle className="h-5 w-5" />}
            title="Aide & Support"
            isActive={pathname === '/admin/help'}
          />
        </div>
        <div className="mt-8 px-3">
          <Link
            href="/"
            className="flex items-center text-sm text-gray-400 hover:text-white"
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Voir le site
          </Link>
        </div>
      </nav>
    </div>
  );
}