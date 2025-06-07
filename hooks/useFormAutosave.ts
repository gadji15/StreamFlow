import { useCallback, useEffect, useRef, useState } from "react";

// Utilisation : const [form, setForm, clearAutosave] = useFormAutosave("film-add", initialState)
export function useFormAutosave&lt;T&gt;(
  storageKey: string,
  initialData: T,
  delay = 500 // ms
): [T, (data: Partial&lt;T&gt;) =&gt; void, () =&gt; void] {
  const [formData, setFormData] = useState&lt;T&gt;(() =&gt; {
    try {
      const saved = localStorage.getItem(storageKey);
      return saved ? { ...initialData, ...JSON.parse(saved) } : initialData;
    } catch {
      return initialData;
    }
  });
  const timeout = useRef&lt;number&gt;();

  useEffect(() =&gt; {
    window.clearTimeout(timeout.current);
    timeout.current = window.setTimeout(() =&gt; {
      localStorage.setItem(storageKey, JSON.stringify(formData));
    }, delay);
    return () =&gt; window.clearTimeout(timeout.current);
  }, [formData, storageKey, delay]);

  const clearAutosave = useCallback(() =&gt; {
    localStorage.removeItem(storageKey);
  }, [storageKey]);

  const setPartial = useCallback(
    (update: Partial&lt;T&gt;) =&gt; setFormData((prev) =&gt; ({ ...prev, ...update })),
    []
  );

  return [formData, setPartial, clearAutosave];
}