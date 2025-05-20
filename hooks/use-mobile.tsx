"use client"

import { useState, useEffect } from "react";

/**
 * Hook universel pour détecter si l'utilisateur est sur mobile (SSR-safe, breakpoint configurable, debounce).
 * @param breakpoint - largeur max (en px) pour considérer "mobile" (par défaut : 768)
 * @param debounceMs - délai (en ms) pour le debounce du resize (par défaut : 150)
 * @returns boolean - true si mobile, false sinon
 */
export function useMobile(breakpoint = 768, debounceMs = 150) {
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === "undefined") return false; // SSR-safe
    return window.innerWidth < breakpoint;
  });

  useEffect(() => {
    if (typeof window === "undefined") return; // SSR-safe

    let timeout: NodeJS.Timeout | null = null;

    const checkIfMobile = () => {
      if (timeout) clearTimeout(timeout);
      timeout = setTimeout(() => {
        setIsMobile(window.innerWidth < breakpoint);
      }, debounceMs);
    };

    window.addEventListener("resize", checkIfMobile);
    // Vérifier à l'initialisation (utile si resize avant mount)
    checkIfMobile();

    return () => {
      window.removeEventListener("resize", checkIfMobile);
      if (timeout) clearTimeout(timeout);
    };
  }, [breakpoint, debounceMs]);

  return isMobile;
}