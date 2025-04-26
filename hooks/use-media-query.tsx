"use client";

import { useState, useEffect } from "react";

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);
  
  useEffect(() => {
    if (typeof window !== "undefined") {
      const media = window.matchMedia(query);
      
      // Définir l'état initial
      setMatches(media.matches);
      
      // Définir un callback pour suivre les changements
      const listener = () => setMatches(media.matches);
      
      // Attacher l'écouteur pour les changements de media query
      media.addEventListener("change", listener);
      
      // Nettoyage à la suppression du composant
      return () => media.removeEventListener("change", listener);
    }
    
    // Par défaut (SSR), on retourne false
    return () => {};
  }, [query]);
  
  return matches;
}