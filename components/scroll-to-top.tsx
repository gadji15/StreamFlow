"use client";

import { useState, useEffect } from "react";
import { ChevronUp } from "lucide-react";

export default function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Fonction pour vérifier si l'utilisateur a scrollé suffisamment
    const toggleVisibility = () => {
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    // Ajouter l'écouteur d'événement
    window.addEventListener("scroll", toggleVisibility);

    // Nettoyage de l'écouteur d'événement
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  // Fonction pour scrolle vers le haut
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <>
      {isVisible && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 z-50 p-2 rounded-full bg-indigo-600 text-white shadow-lg hover:bg-indigo-700 transition-colors"
          aria-label="Retour en haut"
        >
          <ChevronUp size={24} />
        </button>
      )}
    </>
  );
}