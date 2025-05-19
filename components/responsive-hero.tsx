"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const HeroSection = dynamic(() => import("./hero-section"), { ssr: false });
const MobileHero = dynamic(() => import("./mobile/mobile-hero"), { ssr: false });

/**
 * Affiche le hero adapté à la taille d'écran (desktop ou mobile).
 * Utilise un breakpoint Tailwind (md) pour basculer.
 */
export default function ResponsiveHero() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Fonction utilitaire pour détecter la taille d'écran
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Évite le rendu SSR incorrect
  if (typeof window === "undefined") return null;

  return isMobile ? <MobileHero /> : <HeroSection />;
}