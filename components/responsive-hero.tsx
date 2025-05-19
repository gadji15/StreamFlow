"use client";

import dynamic from "next/dynamic";

// Lazy loading (pas obligatoire mais recommandé pour éviter de charger le desktop sur mobile et inversement)
const HeroSection = dynamic(() => import("./hero-section"), { ssr: false });
const MobileHero = dynamic(() => import("./mobile/mobile-hero"), { ssr: false });

/**
 * Affiche le hero adapté à la taille d'écran (desktop ou mobile).
 * Utilise Tailwind pour afficher/cacher chaque version de façon fiable et instantanée.
 */
export default function ResponsiveHero() {
  return (
    <>
      <div className="hidden md:block w-full">
        <HeroSection />
      </div>
      <div className="block md:hidden w-full">
        <MobileHero />
      </div>
    </>
  );
}