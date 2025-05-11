import { Metadata } from 'next';
import AdminHeaderClient from '@/components/admin/admin-header-client';
import AdminSidebarClient from '@/components/admin/admin-sidebar-client';
import AdminAuthGuard from '@/components/admin/admin-auth-guard';

// Métadonnées pour le SEO
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
    <AdminAuthGuard>
      <div className="min-h-screen bg-gray-900">
        <AdminHeaderClient />
        <div className="flex">
          <AdminSidebarClient />
          <main className="flex-1 p-6 ml-0 md:ml-64 pt-24">
            {children}
          </main>
        </div>
      </div>
    </AdminAuthGuard>
  );
}