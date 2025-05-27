import React, { useEffect, useState } from "react";
import { fetchTMDBSimilarMovies, getTMDBImageUrl, TMDBMovie } from "@/lib/tmdb";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";

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
        <Link
          key={item.id}
          href={`/films/${item.id}`}
          className={`
            bg-gray-800 overflow-hidden transition-transform hover:scale-105 group
            flex flex-col items-center
            rounded-md
            sm:rounded-lg md:rounded-xl
            h-full
          `}
          style={{
            opacity: 0,
            animation: `fadeInUp 0.54s cubic-bezier(.23,1.02,.25,1) forwards`,
            animationDelay: `${idx * 0.06}s`
          }}
        >
          <div
            className={`
              relative aspect-[2/3]
              w-full
              h-full
              flex flex-col items-center
            `}
          >
            <img
              src={item.poster || "/placeholder-poster.png"}
              alt={item.title}
              className={`
                w-full h-full object-cover transition-all duration-300
                rounded-md
                sm:rounded-lg
                md:rounded-xl
              `}
              onError={e => {
                (e.target as HTMLImageElement).src = '/placeholder-poster.png';
              }}
              loading="lazy"
            />
            {item.is_vip && (
              <div className="absolute top-2 right-2 bg-gradient-to-r from-amber-400 to-yellow-600 text-black px-1.5 py-0.5 rounded-full text-xs font-bold">
                VIP
              </div>
            )}
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v16h16V4H4zm4 4h8v8H8V8z"></path></svg>
            </div>
          </div>
          <div className="flex flex-col items-center w-full px-1 pb-1 pt-1">
            <h3 className={`
              truncate font-medium w-full text-center
              text-xs
              sm:text-sm
              md:text-base
            `}>{item.title}</h3>
            <p className="text-[11px] text-gray-400 w-full text-center">
              {item.year}
            </p>
          </div>
        </Link>
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