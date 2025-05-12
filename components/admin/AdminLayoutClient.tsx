'use client';

import { usePathname } from 'next/navigation';
import AdminHeader from '@/components/admin/admin-header';
import AdminSidebar from '@/components/admin/admin-sidebar';
import AdminAuthGuard from '@/components/admin/admin-auth-guard';

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

  // Layout admin : sidebar sticky/fixed, main stable, paddé, 100% height, pas de scrollbars inutiles
  const content = (
    <div className="min-h-screen h-screen bg-gray-900 flex flex-col">
      {/* Header admin (toujours en haut) */}
      <AdminHeader title={pageTitle} />
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar sticky/fixed à gauche (desktop) */}
        <aside
          className="hidden md:flex flex-col w-64 h-screen fixed left-0 top-0 z-30 border-r border-gray-800 bg-gray-900"
          style={{
            // Empêche le scroll de la sidebar, la sidebar occupe toujours tout l'écran
            boxShadow: '2px 0 8px 0 rgba(0,0,0,0.02)',
          }}
        >
          <AdminSidebar />
        </aside>
        {/* Décalage du main de la largeur de la sidebar sur desktop */}
        <div className="flex-1 ml-0 md:ml-64 flex flex-col min-h-0">
          {/* Pour que le main fasse bien 100% height et scrolle seulement sur son contenu */}
          <main className="flex-1 overflow-y-auto p-6 pt-24">
            {children}
          </main>
        </div>
      </div>
    </div>
  );

  return <AdminAuthGuard>{content}</AdminAuthGuard>;
}
        <div className="hidden md:block">
          <AdminSidebar />
        </div>
        {/* Main 100% height, padding, scroll interne si besoin, stable */}
        <main
          className="flex-1 relative h-full min-h-0 max-h-screen overflow-y-auto p-6 pt-24"
          style={{
            // espace réservé pour la sidebar (largeur 256px = w-64)
            marginLeft: '0',
            paddingLeft: '0',
          }}
        >
          {children}
        </main>
      </div>
    </div>
  );

  return <AdminAuthGuard>{content}</AdminAuthGuard>;
}
        <main
          className="flex-1 h-full min-h-0 overflow-auto p-6 md:ml-64 pt-24"
          style={{ maxHeight: 'calc(100vh - 4rem)' }} // 4rem ≈ header
        >
          {children}
        </main>
      </div>
    </div>
  );

  return <AdminAuthGuard>{content}</AdminAuthGuard>;
}
        <main
          className="
            flex-1
            ml-0 md:ml-64
            p-6
            pt-24
            min-h-screen
            h-full
            overflow-y-auto
            bg-gray-900
            relative
            "
          style={{ minHeight: '100vh' }}
        >
          {children}
        </main>
      </div>
    </div>
  );

  return <AdminAuthGuard>{content}</AdminAuthGuard>;
}