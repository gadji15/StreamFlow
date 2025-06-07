import { useEffect, useCallback } from "react";

/**
 * Hook pour gérer la persistance d'un formulaire en tant que brouillon par utilisateur/admin.
 */
export function useFormDraft<T>(
  keyBase: string,
  adminId: string,
  formState: T,
  itemId?: string | number
) {
  const key = itemId
    ? `${keyBase}-${adminId}-${itemId}`
    : `${keyBase}-${adminId}`;

  // Sauvegarde automatique du draft à chaque modification
  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(formState));
  }, [key, formState]);

  // Récupérer le draft brut
  const getDraft = useCallback((): T | null => {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : null;
  }, [key]);

  // Savoir si un draft existe
  const hasDraft = useCallback((): boolean => {
    return !!localStorage.getItem(key);
  }, [key]);

  // Supprimer le draft
  const clearDraft = useCallback(() => {
    localStorage.removeItem(key);
  }, [key]);

  return { hasDraft, getDraft, clearDraft };
}