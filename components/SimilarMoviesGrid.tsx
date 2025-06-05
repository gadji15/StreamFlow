import React, { useEffect, useState } from "react";
import { fetchTMDBSimilarMovies, getTMDBImageUrl, TMDBMovie } from "@/lib/tmdb";
import { supabase } from "@/lib/supabaseClient";
import MediaPosterCard from "./MediaPosterCard";

/**
 * Affiche les films similaires disponibles dans la base interne,
 * en utilisant le style et la logique de navigation de la homepage.
 */
type InternalMovie = {
  id: string;
  title: string;
  year?: number;
  is_vip?: boolean;
  poster?: string;
  tmdb_id?: string;
};

export default function SimilarMoviesGrid({ tmdbId }: { tmdbId: string }) {
  const [internalMovies, setInternalMovies] = useState<InternalMovie[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function fetchAndMatch() {
      setLoading(true);

      try {
        // 1. Fetch similar movies from TMDB
        const tmdbSimilar: TMDBMovie[] = await fetchTMDBSimilarMovies(tmdbId);
        // 2. Extract TMDB IDs to match with internal DB
        const ids = tmdbSimilar.map((m) => m.id);

        // 3. Query internal DB for films with matching tmdb_id
        const { data: films, error } = await supabase
          .from("films")
          .select("id, title, year, is_vip, poster, tmdb_id")
          .in("tmdb_id", ids)
          .limit(12);

        if (error) {
          if (isMounted) setInternalMovies([]);
        } else {
          // Order internal films according to TMDB similar order
          const filmMap = new Map((films || []).map((f) => [String(f.tmdb_id), f]));
          const ordered = ids
            .map((tid) => filmMap.get(String(tid)))
            .filter(Boolean) as InternalMovie[];
          if (isMounted) setInternalMovies(ordered);
        }
      } catch {
        if (isMounted) setInternalMovies([]);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    if (tmdbId) fetchAndMatch();
    return () => {
      isMounted = false;
    };
  }, [tmdbId]);

  if (loading) {
    return (
      <div
        className={`
          w-full
          [display:grid]
          gap-3
          [grid-template-columns:repeat(auto-fit,minmax(140px,1fr))]
        `}
      >
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="bg-gray-800 rounded-md sm:rounded-lg md:rounded-xl animate-pulse flex flex-col items-center"
            style={{
              height: '210px'
            }}
          ></div>
        ))}
      </div>
    );
  }

  if (!internalMovies.length) {
    return (
      <div className="text-center p-8 text-gray-400">
        Aucun film similaire trouvé dans notre catalogue.
      </div>
    );
  }

  return (
    <div
      className={`
        w-full
        [display:grid]
        gap-3
        [grid-template-columns:repeat(auto-fit,minmax(140px,1fr))]
      `}
    >
      {internalMovies.map((item, idx) => (
        <MediaPosterCard
          key={item.id}
          href={`/films/${item.id}`}
          poster={item.poster}
          title={item.title}
          year={item.year}
          isVIP={item.is_vip}
          isMovie={true}
          animationDelay={`${idx * 0.06}s`}
        />
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