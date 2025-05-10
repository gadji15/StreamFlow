'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';

export default function AdminAuthGuardClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isLoading, isAdmin } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthChecked, setIsAuthChecked] = useState(false);
  
  useEffect(() => {
    // Ignore auth check for login page
    if (pathname === '/admin/auth/login' || pathname === '/admin/auth/unauthorized') {
      setIsAuthChecked(true);
      return;
    }
    
    if (!isLoading) {
      if (!isAdmin) {
        // Rediriger vers la page d'authentification si l'utilisateur n'est pas un admin
        router.push('/admin/auth/unauthorized');
      } else {
        setIsAuthChecked(true);
      }
    }
  }, [isLoading, isAdmin, router, pathname]);
  
  // Afficher un écran de chargement pendant la vérification
  if (isLoading || !isAuthChecked) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }
  
  // Si l'utilisateur est sur la page de login ou unauthorized, on affiche le contenu sans protection
  if (pathname === '/admin/auth/login' || pathname === '/admin/auth/unauthorized') {
    return <>{children}</>;
  }
  
  // Si l'utilisateur est authentifié en tant qu'admin, afficher le contenu protégé
  if (isAdmin) {
    return <>{children}</>;
  }
  
  // Ce cas ne devrait pas se produire car on redirige avant
  return null;
}