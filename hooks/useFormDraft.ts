import { useEffect, useCallback } from "react";

/**
 * Hook pour persister l'état d'un formulaire (draft) dans le localStorage par utilisateur/admin.
 * @param keyBase Base de la clé de stockage (ex: "film-form-draft")
 * @param adminId Identifiant unique de l'admin (id, email, username...)
 * @param formState L'état actuel du formulaire
 * @param setFormState Setter pour réinitialiser l'état du formulaire
 * @param [itemId] Optionnel : identifiant du film (pour distinguer édition/ajout)
 */
export function useFormDraft<T>(
  keyBase: string,
  adminId: string,
  formState: T,
  setFormState: (val: T) => void,
  itemId?: string | number
) {
  // Génère une clé locale unique par admin et éventuellement par item
  const key = itemId
    ? `${keyBase}-${adminId}-${itemId}`
    : `${keyBase}-${adminId}`;

  // À l'ouverture, propose de restaurer un brouillon s'il existe
  useEffect(() => {
    const saved = localStorage.getItem(key);
    if (saved) {
      if (
        window.confirm(
          "Un brouillon non sauvegardé a été trouvé pour ce formulaire. Voulez-vous le restaurer ?"
        )
      ) {
        setFormState(JSON.parse(saved));
      } else {
        localStorage.removeItem(key);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  // Sauvegarde automatique du draft à chaque modification
  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(formState));
  }, [key, formState]);

  // Supprime le draft (à appeler lors de la sauvegarde effective)
  const clearDraft = useCallback(() => {
    localStorage.removeItem(key);
  }, [key]);

  return { clearDraft };
}