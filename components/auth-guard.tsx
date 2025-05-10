'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';

interface AuthGuardProps {
  children: React.ReactNode;
  requireVIP?: boolean;
}

export default function AuthGuard({ children, requireVIP = false }: AuthGuardProps) {
  const { isLoading, isLoggedIn, isVIP } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthChecked, setIsAuthChecked] = useState(false);
  
  useEffect(() => {
    if (!isLoading) {
      if (!isLoggedIn) {
        // Mémoriser la page que l'utilisateur essayait d'atteindre
        sessionStorage.setItem('redirectAfterLogin', pathname);
        router.push('/login?redirect=' + encodeURIComponent(pathname));
      } else if (requireVIP && !isVIP) {
        // Rediriger vers la page d'abonnement VIP si l'accès VIP est requis
        router.push('/vip?from=' + encodeURIComponent(pathname));
      } else {
        setIsAuthChecked(true);
      }
    }
  }, [isLoading, isLoggedIn, isVIP, requireVIP, router, pathname]);
  
  // Afficher un écran de chargement pendant la vérification
  if (isLoading || !isAuthChecked) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  // Si l'authentification est vérifiée et valide, afficher le contenu
  return <>{children}</>;
}