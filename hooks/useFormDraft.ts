import { useEffect, useRef, useCallback } from "react";

/**
 * Hook pour gérer la persistance d'un formulaire en tant que brouillon par utilisateur/admin.
 * Sauvegarde automatique UNIQUEMENT après modification effective du formulaire (touched).
 * Empêche l'écrasement du brouillon existant par un formulaire vide à l'ouverture du modal.
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

  // Nouvelle logique : ne sauvegarder qu'après la première modification (touched)
  const isFirstRender = useRef(true);
  const isTouched = useRef(false);
  const lastSnapshot = useRef<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Ne rien faire au tout premier render
    if (isFirstRender.current) {
      isFirstRender.current = false;
      lastSnapshot.current = JSON.stringify(formState);
      return;
    }

    // Si le formulaire a changé par rapport au snapshot précédent : on le considère comme "touched"
    const nextSnapshot = JSON.stringify(formState);
    if (lastSnapshot.current !== nextSnapshot) {
      isTouched.current = true;
    }
    lastSnapshot.current = nextSnapshot;

    // On ne sauvegarde que si l'utilisateur a vraiment modifié le formulaire
    if (isTouched.current) {
      localStorage.setItem(key, nextSnapshot);
    }
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

  // Supprimer le draft (et reset isTouched)
  const clearDraft = useCallback(() => {
    localStorage.removeItem(key);
    isTouched.current = false;
    lastSnapshot.current = null;
  }, [key]);

  return { hasDraft, getDraft, clearDraft };
}