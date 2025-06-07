import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Hook universel d'autosauvegarde/restauration de formulaire React.
 * @param storageKey Clé locale unique (ex : autosave-film-add-<adminId>)
 * @param initialData Valeur initiale du formulaire
 * @param delay Délai (ms) avant sauvegarde (debounce)
 */
export function useFormAutosave<T>(
  storageKey: string,
  initialData: T,
  delay = 500
): [T, (data: Partial<T>) => void, () => void] {
  const [formData, setFormData] = useState<T>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      return saved ? { ...initialData, ...JSON.parse(saved) } : initialData;
    } catch {
      return initialData;
    }
  });
  const timeout = useRef<number>();

  // Sauvegarde debounced à chaque modif
  useEffect(() => {
    window.clearTimeout(timeout.current);
    timeout.current = window.setTimeout(() => {
      localStorage.setItem(storageKey, JSON.stringify(formData));
    }, delay);
    return () => window.clearTimeout(timeout.current);
  }, [formData, storageKey, delay]);

  // Fonction pour clear la sauvegarde (après submit réussi)
  const clearAutosave = useCallback(() => {
    localStorage.removeItem(storageKey);
  }, [storageKey]);

  // Setter qui merge et déclenche la sauvegarde
  const setPartial = useCallback(
    (update: Partial<T>) => setFormData((prev) => ({ ...prev, ...update })),
    []
  );

  return [formData, setPartial, clearAutosave];
}