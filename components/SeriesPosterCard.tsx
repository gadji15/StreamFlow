import React from "react";

/**
 * Affiche le poster de la série avec effet flottant, ombre, bordure et coins arrondis.
 * Le fallback est harmonisé sur /placeholder-poster.jpg pour cohérence.
 */
export default function SeriesPosterCard({
  src,
  alt,
}: {
  src: string;
  alt: string;
}) {
  // Empêche le fallback de reboucler si le placeholder échoue
  const handleImgError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    if (!e.currentTarget.src.endsWith("/placeholder-poster.jpg")) {
      e.currentTarget.src = "/placeholder-poster.jpg";
    }
  };

  return (
    <div className="relative w-40 md:w-56 lg:w-64 mx-auto md:mx-0 z-10 drop-shadow-xl">
      <img
        src={src}
        alt={alt}
        className="w-full h-auto rounded-2xl border-4 border-gray-900 shadow-2xl bg-gray-800 object-cover"
        style={{ aspectRatio: '2/3', minHeight: 0 }}
        onError={handleImgError}
      />
    </div>
  );
}