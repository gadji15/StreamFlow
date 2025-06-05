'use client';

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";

type AdminAuthGuardProps = {
  children: React.ReactNode;
};

export default function AdminAuthGuard({ children }: AdminAuthGuardProps) {
  const router = useRouter();
  const { isAdmin, isLoading, userData, user } = useSupabaseAuth();
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [redirectPath, setRedirectPath] = useState<string | null>(null);

  useEffect(() => {
    if (isLoading) return;

    // Si l'utilisateur N'EST PAS CONNECTÉ (user === null)
    if (!user) {
      setShowSessionModal(true);
      setRedirectPath("/login");
      return;
    }

    // Si l'utilisateur est connecté mais PAS admin
    if (!isAdmin) {
      setShowSessionModal(true);
      setRedirectPath("/admin/access-denied");
      return;
    }
    // Sinon, il est admin : on laisse passer
  }, [isAdmin, isLoading, user]);

  // Modal d'avertissement session expirée
  if (showSessionModal && redirectPath) {
    return (
      <div style={{
        position: "fixed", left: 0, top: 0, width: "100vw", height: "100vh",
        background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 10000
      }}>
        <div style={{
          background: "#222", color: "#fff", borderRadius: 12, maxWidth: 420, minWidth: 320, padding: 32, boxShadow: "0 8px 32px #0008"
        }}>
          <h3 style={{marginBottom: 16}}>⚠️ Session expirée</h3>
          <p style={{marginBottom: 16}}>Votre session d'administration a expiré.<br/>Avant de vous reconnecter, pensez à sauvegarder votre travail (copiez les textes ou prenez des captures d'écran si besoin).</p>
          <button
            style={{
              background: "#7b3aed", color: "#fff", border: "none", borderRadius: 6, padding: "8px 16px", cursor: "pointer", fontWeight: 600
            }}
            onClick={() => router.replace(redirectPath)}
          >
            Se reconnecter
          </button>
        </div>
      </div>
    );
  }

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

  // Par sécurité, n'affiche rien si on redirige (modal s'affiche sinon)
  return null;
}