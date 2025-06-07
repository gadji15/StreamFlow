import { useCallback, useEffect, useRef, useState } from "react";

// Utilisation : const [form, setForm, clearAutosave] = useFormAutosave("film-add", initialState)
export function useFormAutosave<T>(
  storageKey: string,
  initialData: T,
  delay = 500 // ms
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

  useEffect(() => {
    window.clearTimeout(timeout.current);
    timeout.current = window.setTimeout(() => {
      localStorage.setItem(storageKey, JSON.stringify(formData));
    }, delay);
    return () => window.clearTimeout(timeout.current);
  }, [formData, storageKey, delay]);

  const clearAutosave = useCallback(() => {
    localStorage.removeItem(storageKey);
  }, [storageKey]);

  const setPartial = useCallback(
    (update: Partial<T>) => setFormData((prev) => ({ ...prev, ...update })),
    []
  );

  return [formData, setPartial, clearAutosave];
}