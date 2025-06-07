import { useEffect, useRef, useCallback } from "react";

/**
 * Hook pour gérer la persistance d'un formulaire en tant que brouillon par utilisateur/admin.
 * Sauvegarde automatique UNIQUEMENT après modification effective du formulaire (dirty check).
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

  // Dirty check : ne sauvegarder le draft qu'après modification utilisateur réelle
  const isTouched = useRef(false);
  const lastSnapshot = useRef<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const nextSnapshot = JSON.stringify(formState);

    // Si c'est la première exécution, on ne fait rien (pas de sauvegarde)
    if (lastSnapshot.current === null) {
      lastSnapshot.current = nextSnapshot;
      return;
    }

    // Si le formulaire a changé par rapport au snapshot précédent, on passe isTouched à true
    if (lastSnapshot.current !== nextSnapshot) {
      if (isTouched.current) {
        // Déjà touché => on sauvegarde
        localStorage.setItem(key, nextSnapshot);
      } else {
        // Première vraie modif utilisateur => on ne sauvegarde pas encore (attend la prochaine modif)
        isTouched.current = true;
      }
      lastSnapshot.current = nextSnapshot;
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