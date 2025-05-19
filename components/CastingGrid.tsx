import React, { useEffect, useState } from "react";
import { fetchTMDBCredits, getTMDBImageUrl, TMDBCastMember } from "@/lib/tmdb";

/**
 * Grille responsive et animée pour le casting (via TMDB).
 */
export default function CastingGrid({
  tmdbId,
  fallbackCast,
}: {
  tmdbId: string;
  fallbackCast?: { name: string; role?: string; photoUrl?: string }[];
}) {
  const [cast, setCast] = useState<TMDBCastMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    fetchTMDBCredits(tmdbId)
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
  }, [tmdbId, fallbackCast]);

  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="h-28 bg-gray-800 rounded-xl animate-pulse"
          ></div>
        ))}
      </div>
    );
  }

  if (!cast.length) {
    return <div className="text-gray-400">Aucun membre du casting disponible.</div>;
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
      {cast.map((person) => (
        <div
          key={person.id}
          className="flex flex-col items-center bg-gray-800 rounded-xl p-4 shadow hover:scale-105 hover:shadow-lg transition-all duration-200"
        >
          <img
            src={getTMDBImageUrl(person.profile_path, "w185")}
            alt={person.name}
            className="w-16 h-16 rounded-full object-cover mb-2 border-2 border-gray-700"
            onError={(e) => {
              e.currentTarget.src = "/placeholder-avatar.png";
            }}
          />
          <span className="font-medium text-gray-100 text-sm text-center">
            {person.name}
          </span>
          {person.character && (
            <span className="text-xs text-gray-400 text-center">{person.character}</span>
          )}
        </div>
      ))}
    </div>
  );
}