'use client';

import { usePathname } from 'next/navigation';
import AdminHeader from '@/components/admin/admin-header';
import AdminSidebar from '@/components/admin/admin-sidebar';
import AdminAuthGuard from '@/components/admin/admin-auth-guard';
import { usePathname } from 'next/navigation';

export default function AdminLayoutClient({ children }: { children: React.ReactNode }) {
  const rawPathname = usePathname();
  const pathname = rawPathname ?? "";

  // Cas spécial : pas de layout/admin sur la page d'accès refusé
  if (pathname === '/admin/access-denied') {
    return <>{children}</>;
  }

  // Détermination dynamique du titre pour le header admin
  let pageTitle = "StreamFlow Admin";
  if (pathname.startsWith("/admin/films")) pageTitle = "Gestion des films";
  else if (pathname.startsWith("/admin/series")) pageTitle = "Gestion des séries";
  else if (pathname.startsWith("/admin/stats")) pageTitle = "Statistiques";
  else if (pathname.startsWith("/admin/activity-logs")) pageTitle = "Journaux d'activité";
  else if (pathname.startsWith("/admin/users")) pageTitle = "Utilisateurs";
  else if (pathname.startsWith("/admin/comments")) pageTitle = "Commentaires";
  else if (pathname.startsWith("/admin/settings")) pageTitle = "Paramètres";
  else if (pathname === "/admin") pageTitle = "Tableau de bord";

  const SIDEBAR_WIDTH = 256; // 64 * 4 (taille w-64 en px)

  const content = (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      <AdminHeader title={pageTitle} />
      <div className="flex flex-1 min-h-0">
        {/* Sidebar fixe à gauche */}
        <aside
          className="hidden md:block fixed z-40 left-0 top-0 h-screen w-64 bg-gray-900 border-r border-gray-800 overflow-y-auto"
          style={{ width: SIDEBAR_WIDTH, minWidth: SIDEBAR_WIDTH, maxWidth: SIDEBAR_WIDTH }}
        >
          <AdminSidebar />
        </aside>
        {/* Main content décalé */}
        <main
          className="flex-1 min-h-0 ml-0 md:ml-64 p-6 pt-24"
          style={{ marginLeft: SIDEBAR_WIDTH }}
        >
          {children}
        </main>
      </div>
    </div>
  );

  return <AdminAuthGuard>{content}</AdminAuthGuard>;
}