'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import LoadingScreen from '@/components/loading-screen';

type AuthGuardProps = {
  children: React.ReactNode;
  requiredRole?: 'user' | 'vip' | 'admin' | 'super_admin';
  loginPath?: string;
  redirectIfAuthenticated?: boolean;
  redirectPath?: string;
};

export default function AuthGuard({
  children,
  requiredRole = 'user',
  loginPath = '/login',
  redirectIfAuthenticated = false,
  redirectPath = '/'
}: AuthGuardProps) {
  const { user, loading, isAdmin, isVIP, userData } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [authorized, setAuthorized] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    // Fonction pour vérifier l'autorisation
    const checkAuth = () => {
      if (loading) return;

      // Si la redirection est activée et que l'utilisateur est connecté
      if (redirectIfAuthenticated && user) {
        router.push(redirectPath);
        return;
      }

      // Si l'accès requiert l'authentification et que l'utilisateur n'est pas connecté
      if (!redirectIfAuthenticated && !user) {
        // Rediriger vers la page de connexion avec un retour à la page actuelle
        router.push(`${loginPath}?returnUrl=${encodeURIComponent(pathname)}`);
        return;
      }

      // Vérifier le rôle requis
      if (!redirectIfAuthenticated && user) {
        if (requiredRole === 'super_admin' && userData?.role !== 'super_admin') {
          router.push('/403');
          return;
        }
        
        if (requiredRole === 'admin' && !isAdmin) {
          router.push('/403');
          return;
        }
        
        if (requiredRole === 'vip' && !isVIP && !isAdmin) {
          router.push('/vip');
          return;
        }
      }

      // Tout est OK, autorisé
      setAuthorized(true);
      setChecking(false);
    };

    checkAuth();
  }, [
    user, 
    loading, 
    isAdmin, 
    isVIP, 
    userData, 
    requiredRole, 
    redirectIfAuthenticated,
    router, 
    pathname, 
    loginPath, 
    redirectPath
  ]);

  // Afficher un écran de chargement pendant la vérification
  if (checking || loading) {
    return <LoadingScreen />;
  }

  // Rendre les enfants seulement si l'accès est autorisé
  return authorized ? <>{children}</> : null;
}