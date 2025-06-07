"use client";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";

/**
 * Retourne true si l'utilisateur ne doit voir aucune pub
 * (VIP, admin, super_admin, ou tout rôle que tu ajoutes à la liste)
 */
export function useHideAds() {
  const { userData } = useSupabaseAuth();

  // Version dynamique : supporte booléens et tableau de rôles
  const roles = userData?.roles || [];
  const isVIP = userData?.isVIP;
  const isAdmin = userData?.isAdmin;
  const isSuperAdmin = userData?.isSuperAdmin;

  // Ajoute ici d'autres rôles premium si besoin :
  return (
    isVIP === true ||
    isAdmin === true ||
    isSuperAdmin === true ||
    roles.includes("vip") ||
    roles.includes("admin") ||
    roles.includes("super_admin")
  );
}