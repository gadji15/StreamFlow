import React, { useEffect, useState } from "react";
import { fetchTMDBCredits, getTMDBImageUrl, TMDBCastMember } from "@/lib/tmdb";

/**
 * Grille responsive et animée pour le casting (via TMDB).
 */
export default function CastingGrid({
  tmdbId,
  type = 'movie',
  fallbackCast,
}: {
  tmdbId: string;
  type?: 'movie' | 'tv';
  fallbackCast?: { name: string; role?: string; photoUrl?: string }[];
}) {
  const [cast, setCast] = useState<TMDBCastMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    fetchTMDBCredits(tmdbId, type)
      .then((castData) => {
        if (isMounted) setCast(castData.slice(0, 12)); // Limite à 12 membres
      })
      .catch(() => {
        if (isMounted && fallbackCast) {
          // fallback: cast statique si fetch échoue
          setCast(
            fallbackCast.map((p, i) => ({
              id: i,
              name: p.name,
              character: p.role || "",
              profile_path: null,
            }))
          );
        }
      })
      .finally(() => setLoading(false));
    return () => {
      isMounted = false;
    };
  }, [tmdbId, type, fallbackCast]);

  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="h-28 bg-gray-800 rounded-xl animate-pulse"
            aria-hidden="true"
          ></div>
        ))}
      </div>
    );
  }

  // DEBUG: log cast array and tmdbId/type
  if (typeof window !== "undefined") {
    console.log("[CastingGrid DEBUG] tmdbId:", tmdbId, "type:", type, "cast:", cast);
  }

  if (!cast.length) {
    return (
      <div className="flex justify-center items-center h-36">
        <div className="flex flex-col items-center bg-gray-900/70 rounded-xl px-7 py-6 shadow-inner border border-gray-800 max-w-xs mx-auto">
          <img
            src="/placeholder-avatar.jpg"
            alt="Aucun membre du casting"
            className="w-16 h-16 rounded-full object-cover mb-2 border-2 border-gray-700 opacity-60"
            aria-hidden="true"
          />
          <span className="font-semibold text-gray-300 text-base mb-0.5">Casting indisponible</span>
          <span className="text-xs text-gray-400 text-center">Aucun membre du casting n’a été trouvé pour cette œuvre.</span>
        </div>
      </div>
    );
  }

  return (
    <div
      className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4"
      aria-label="Grille du casting"
    >
      {cast.map((person, idx) => (
        <div
          key={person.id}
          className="flex flex-col items-center bg-gray-800 rounded-xl p-4 shadow transition-transform duration-300 hover:scale-[1.045] hover:shadow-xl"
          style={{
            opacity: 0,
            animation: `fadeInUp 0.58s cubic-bezier(.23,1.02,.25,1) forwards`,
            animationDelay: `${idx * 0.06}s`
          }}
        >
          <img
            src={getTMDBImageUrl(person.profile_path, "w185")}
            alt={person.name}
            className="w-16 h-16 rounded-full object-cover mb-2 border-2 border-gray-700 transition-transform duration-200 hover:scale-110"
            onError={(e) => {
              // Empêche le fallback de reboucler
              if (!e.currentTarget.src.endsWith("/placeholder-avatar.jpg")) {
                e.currentTarget.src = "/placeholder-avatar.jpg";
              }
            }}
            style={{
              boxShadow: '0 2px 8px rgba(0,0,0,0.18)'
            }}
          />
          <span className="font-medium text-gray-100 text-sm text-center">
            {person.name}
          </span>
          {/* Affiche le rôle/personnage même en fallback local */}
          {person.character && (
            <span className="text-xs text-gray-400 text-center">
              {person.character}
            </span>
          )}
        </div>
      ))}
      <style>{`
        @keyframes fadeInUp {
          0% {
            opacity: 0;
            transform: translateY(24px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}