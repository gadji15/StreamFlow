import React from "react";

/**
 * Affiche le backdrop en pleine largeur avec overlay dégradé.
 */
export default function FilmBackdrop({ src, alt }: { src: string; alt: string }) {
  return (
    <div className="absolute top-0 left-0 right-0 h-[45vh] md:h-[55vh] z-0">
      <img
        src={src}
        alt={alt}
        className="w-full h-full object-cover"
        loading="eager"
        aria-hidden="true"
        onError={(e) => { e.currentTarget.src = '/placeholder-backdrop.jpg'; }}
        style={{ transition: 'opacity 0.6s' }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/60 to-gray-900" />
    </div>
  );
}