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
  if (isLoading || (user && userData === null)) {
    return (
      <div style={{ minHeight: 200, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <span>Chargement...</span>
      </div>
    );
  }

  // Si admin, afficher la zone admin
  if (isAdmin) {
    return <>{children}</>;
  }

  // Par sécurité, n'affiche rien si on redirige (les redirects s'activent via useEffect)
  return null;
}