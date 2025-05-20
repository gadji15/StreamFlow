import React, { useState } from "react";

/**
 * Affiche le poster premium d'une série (avec fallback, style card).
 */
export default function SeriesPosterCard({ src, alt }: { src: string; alt: string }) {
  const [loaded, setLoaded] = useState(false);

  // Génère l'URL TMDB si besoin
  const getPosterUrl = (url?: string) => {
    if (!url) return "/placeholder-poster.png";
    if (url.startsWith("/")) return `https://image.tmdb.org/t/p/w500${url}`;
    return url;
  };

  return (
    <div className="w-32 h-48 md:w-48 md:h-72 rounded-xl overflow-hidden shadow-xl bg-gray-900/30 flex items-center justify-center">
      <img
        src={getPosterUrl(src)}
        alt={alt}
        className={`w-full h-full object-cover transition-opacity duration-700 ${loaded ? "opacity-100" : "opacity-0"}`}
        onLoad={() => setLoaded(true)}
        onError={(e) => {
          e.currentTarget.src = "/placeholder-poster.png";
        }}
        draggable={false}
      />
      {!loaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-800/40">
          <svg className="animate-spin h-8 w-8 text-gray-500" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
          </svg>
        </div>
      )}
    </div>
  );
}