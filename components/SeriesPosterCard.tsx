import React from "react";

/**
 * Affiche le poster de la série avec effet flottant, ombre, bordure et coins arrondis.
 */
export default function SeriesPosterCard({
  src,
  alt,
}: {
  src: string;
  alt: string;
}) {
  return (
    <div className="relative -mt-24 md:mt-0 w-40 md:w-56 lg:w-64 mx-auto md:mx-0 z-10 drop-shadow-xl">
      <img
        src={src}
        alt={alt}
        className="w-full h-auto rounded-2xl border-4 border-gray-900 shadow-2xl bg-gray-800 object-cover"
        style={{ aspectRatio: '2/3', minHeight: 0 }}
        onError={(e) => { e.currentTarget.src = '/placeholder-poster.png'; }}
      />
    </div>
  );
}