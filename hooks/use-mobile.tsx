"use client"

import { useState, useEffect } from "react"

export function useMobile() {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    // Fonction pour vérifier si l'écran est mobile
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768) // Considère mobile si largeur < 768px
    }

    // Vérifier au chargement
    checkIfMobile()

    // Ajouter un écouteur d'événement pour les changements de taille d'écran
    window.addEventListener("resize", checkIfMobile)

    // Nettoyage
    return () => window.removeEventListener("resize", checkIfMobile)
  }, [])

  return isMobile
}