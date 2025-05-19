"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const HeroSection = dynamic(() => import("./hero-section"), { ssr: false });
const MobileHero = dynamic(() => import("./mobile/mobile-hero"), { ssr: false });

/**
 * Affiche le hero adapté à la taille d'écran (desktop ou mobile).
 * Utilise un breakpoint Tailwind (md) pour basculer.
 * Corrige les problèmes d'hydratation Next.js en rendant null tant que le composant n'est pas monté.
 */
export default function ResponsiveHero() {
  const [isMobile, setIsMobile] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Fonction utilitaire pour détecter la taille d'écran
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Empêche tout rendu côté serveur pour éviter les erreurs d'hydratation
  if (!mounted) return null;

  return isMobile ? <MobileHero /> : <HeroSection />;
}