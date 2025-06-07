'use client';

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";

type AdminAuthGuardProps = {
  children: React.ReactNode;
};

export default function AdminAuthGuard({ children }: AdminAuthGuardProps) {
  const router = useRouter();
  const { isAdmin, isLoading, userData, user } = useSupabaseAuth();

  useEffect(() => {
    // Tant que le chargement n'est pas fini, ne rien faire
    if (isLoading) return;

    // Si l'utilisateur N'EST PAS CONNECTÉ (user === null)
    if (!user) {
      router.replace("/login");
      return;
    }

    // Si l'utilisateur est connecté mais PAS admin
    if (!isAdmin) {
      router.replace("/admin/access-denied");
      return;
    }
    // Sinon, il est admin : on laisse passer
  }, [isAdmin, isLoading, user, router]);

  // Afficher un écran de chargement tant que l'état d'auth n'est pas déterminé
  // Bloquer strictement le rendu des enfants tant que le profil/roles ne sont pas prêts
  if (isLoading || (user && userData === null)) {
    // Utilise le composant global pour l'UX
    return (
      <div style={{ minHeight: 200, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <span>Chargement...</span>
      </div>
      // Ou mieux :
      // <LoadingScreen message="Vérification des droits admin..." />
    );
  }

  // Si pas admin ou pas connecté, on ne rend JAMAIS les enfants
  if (!user || !isAdmin) {
    // Ne rien rendre, la redirection se fait dans l'effet
    return null;
  }

  // Seulement si tout est ok on rend les enfants
  return <>{children}</>;
}