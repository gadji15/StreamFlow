'use client';

import { usePathname } from 'next/navigation';
import AdminHeader from '@/components/admin/admin-header';
import AdminSidebar from '@/components/admin/admin-sidebar';
import AdminAuthGuard from '@/components/admin/admin-auth-guard';

import { useState } from 'react';

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

  // État pour la sidebar mobile
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const content = (
    <div className="min-h-screen flex bg-gray-900">
      {/* Sidebar desktop */}
      <div className="hidden md:block">
        <AdminSidebar />
      </div>

      {/* Sidebar mobile */}
      <div
        className={`fixed inset-0 z-50 transition-opacity duration-200 ${
          sidebarOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        } md:hidden`}
        aria-hidden={!sidebarOpen}
      >
        {/* Overlay */}
        <div
          className="absolute inset-0 bg-black/60"
          onClick={() => setSidebarOpen(false)}
        />
        {/* Sidebar */}
        <div className="absolute left-0 top-0 h-full w-64 bg-gray-900 border-r border-gray-800 shadow-xl">
          <AdminSidebar onCloseMobile={() => setSidebarOpen(false)} />
        </div>
      </div>

      {/* Main layout (header + main) */}
      <div className="flex-1 flex flex-col min-h-screen relative">
        {/* Header (sticky, z-30 pour passer devant sidebar mobile) */}
        <AdminHeader
          title={pageTitle}
          onMenuToggle={() => setSidebarOpen((o) => !o)}
        />
        <main className="flex-1 p-4 md:p-8 bg-gray-900 min-h-[calc(100vh-4rem)] overflow-auto transition-all duration-200">
          {children}
        </main>
      </div>
    </div>
  );

  return <AdminAuthGuard>{content}</AdminAuthGuard>;
}