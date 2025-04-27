'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import LoadingScreen from '@/components/loading-screen';

export default function AdminAuthGuard({
  children,
  requiredRole = 'admin'
}: {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'super_admin';
}) {
  const { user, userData, loading, isAdmin } = useAuth();
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Vérifier l'authentification et les autorisations
    const checkAuth = async () => {
      // Attendre que le chargement de l'authentification soit terminé
      if (loading) return;

      // Si l'utilisateur n'est pas connecté, rediriger vers la page de connexion admin
      if (!user) {
        router.push('/admin/auth/login');
        return;
      }

      // Vérifier si l'utilisateur est admin
      if (!isAdmin || (requiredRole === 'super_admin' && userData?.role !== 'super_admin')) {
        // Rediriger vers une page d'erreur d'autorisation
        router.push('/admin/auth/unauthorized');
        return;
      }

      // Utilisateur autorisé
      setIsAuthorized(true);
      setIsChecking(false);
    };

    checkAuth();
  }, [user, userData, loading, isAdmin, requiredRole, router]);

  // Afficher un écran de chargement pendant la vérification
  if (isChecking || loading) {
    return <LoadingScreen />;
  }

  // Rendre les enfants seulement si l'utilisateur est autorisé
  return isAuthorized ? <>{children}</> : null;
}