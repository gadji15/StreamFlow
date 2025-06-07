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

  // Sauvegarde automatique du draft à chaque modification,
  // sauf lors de la restauration (contrôlée par un flag optionnel)
  useEffect(() => {
    // On sauvegarde uniquement si on n'est pas en train de restaurer
    // (le parent doit passer un flag 'skipSave' ou équivalent si besoin)
    if ((window as any).__skipNextDraftSave) {
      (window as any).__skipNextDraftSave = false;
      return;
    }
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