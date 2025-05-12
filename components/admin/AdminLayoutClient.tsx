'use client';

import { usePathname } from 'next/navigation';
import AdminHeaderClient from '@/components/admin/admin-header-client';
import AdminSidebar from '@/components/admin/admin-sidebar';
import AdminAuthGuard from '@/components/admin/admin-auth-guard';

export default function AdminLayoutClient({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Ne protège pas et n'applique pas le layout aux pages d'accès refusé
  if (pathname === '/admin/access-denied') {
    return <>{children}</>;
  }

  const content = (
    <div className="min-h-screen bg-gray-900">
      <AdminHeaderClient />
      <div className="flex">
        <AdminSidebar />
        <main className="flex-1 p-6 md:ml-64 pt-24">
          {children}
        </main>
      </div>
    </div>
  );

  return <AdminAuthGuard>{content}</AdminAuthGuard>;
}