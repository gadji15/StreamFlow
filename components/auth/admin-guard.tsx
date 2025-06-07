import React from 'react';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import LoadingScreen from '@/components/loading-screen'; // un composant de loader générique, à adapter si besoin

/**
 * Protégez vos pages/admins avec ce composant.
 * - Affiche un loader tant que la session ou le profil sont en chargement.
 * - Redirige ou bloque si l'utilisateur n'est pas admin.
 */
export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const { isLoading, isAdmin, isLoggedIn } = useSupabaseAuth();

  // 1. Loading complet tant qu'on n'a pas l'info
  if (isLoading) {
    return <LoadingScreen message="Vérification de la session admin..." />;
  }

  // 2. Non connecté ou non admin
  if (!isLoggedIn || !isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-center">
        <h2 className="text-xl font-bold mb-2 text-red-500">Accès refusé</h2>
        <p className="mb-4">Vous devez être administrateur pour accéder à cette page.</p>
        <a href="/" className="underline text-blue-600">Retour à l’accueil</a>
      </div>
    );
  }

  // 3. Tout est ok
  return <>{children}</>;
}