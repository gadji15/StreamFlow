// Supprimer la directive 'use client' de ce fichier,
// car nous voulons que les métadonnées soient traitées côté serveur

import Link from 'next/link';
import { Metadata } from 'next';
import AdminHeaderClient from '@/components/admin/admin-header-client';
import AdminSidebarClient from '@/components/admin/admin-sidebar-client';
import AdminAuthGuardClient from '@/components/admin/admin-auth-guard-client';

// Métadonnées pour le SEO (ceci fonctionne car c'est maintenant un composant serveur)
export const metadata: Metadata = {
  title: 'StreamFlow Admin',
  description: 'Interface d\'administration de StreamFlow',
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminAuthGuardClient>
      <div className="min-h-screen bg-gray-900">
        <AdminHeaderClient />
        <div className="flex">
          <AdminSidebarClient />
          <main className="flex-1 p-6 ml-0 md:ml-64 pt-24">
            {children}
          </main>
        </div>
      </div>
    </AdminAuthGuardClient>
  );
}