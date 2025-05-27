"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Film } from "lucide-react";
import { fetchTMDBSimilarMovies, getTMDBImageUrl } from "@/lib/tmdb";
import { supabase } from "@/lib/supabaseClient";

/**
 * Grille harmonisée pour les films similaires (croisement TMDB + Supabase)
 */
export default function SimilarFilmsGrid({
  currentMovieId,
  tmdbId,
}: {
  currentMovieId: string;
  tmdbId: string;
}) {
  const [similarLocal, setSimilarLocal] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSimilar() {
      setLoading(true);
      try {
        if (!tmdbId) {
          setSimilarLocal([]);
          return;
        }
        // 1. Get similar movies from TMDB
        const similarFromTMDB = await fetchTMDBSimilarMovies(tmdbId);
        const similarTMDBIds = similarFromTMDB.map((m) => m.id);

        // 2. Fetch all local films (except current)
        const { data: localFilms, error } = await supabase
          .from("films")
          .select("*")
          .neq("id", currentMovieId);

        if (error || !localFilms) {
          setSimilarLocal([]);
          return;
        }

        // 3. Cross-reference: local films whose tmdb_id is in similarTMDBIds
        const matching = localFilms.filter(
          (film: any) =>
            film.tmdb_id && similarTMDBIds.includes(Number(film.tmdb_id))
        );

        setSimilarLocal(matching);
      } catch (e) {
        setSimilarLocal([]);
      } finally {
        setLoading(false);
      }
    }
    fetchSimilar();
  }, [tmdbId, currentMovieId]);

  if (loading) {
    return (
      <div
        className="
          w-full
          [display:grid]
          gap-3
          [grid-template-columns:repeat(auto-fit,minmax(140px,1fr))]
        "
      >
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="bg-gray-800 rounded-md sm:rounded-lg md:rounded-xl animate-pulse flex flex-col items-center"
            style={{ height: "210px" }}
            aria-hidden="true"
          ></div>
        ))}
      </div>
    );
  }

  if (!similarLocal.length) {
    return (
      <div className="text-center py-10 text-gray-400">
        Aucun film similaire disponible dans la plateforme.
      </div>
    );
  }

  return (
    <div
      className="
        w-full
        [display:grid]
        gap-3
        [grid-template-columns:repeat(auto-fit,minmax(140px,1fr))]
      "
    >
      {similarLocal.map((film) => {
        const poster =
          film.poster ||
          film.poster_url ||
          film.posterUrl ||
          "/placeholder-poster.png";
        const title = film.title || "Sans titre";
        const year = film.year ?? film.release_year ?? "";
        const isVIP = film.is_vip ?? film.isVIP ?? false;

        return (
          <Link
            key={film.id}
            href={`/films/${film.id}`}
            className={`
              bg-gray-800 overflow-hidden transition-transform hover:scale-105 group
              flex flex-col items-center
              rounded-md
              sm:rounded-lg md:rounded-xl
              h-full
            `}
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
                src={poster}
                alt={title}
                className={`
                  w-full h-full object-cover transition-all duration-300
                  rounded-md
                  sm:rounded-lg
                  md:rounded-xl
                `}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "/placeholder-poster.png";
                }}
                loading="lazy"
              />
              {isVIP && (
                <div className="absolute top-2 right-2 bg-gradient-to-r from-amber-400 to-yellow-600 text-black px-1.5 py-0.5 rounded-full text-xs font-bold">
                  VIP
                </div>
              )}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Film className="w-7 h-7 text-white" />
              </div>
            </div>
            <div className="flex flex-col items-center w-full px-1 pb-1 pt-1">
              <h3
                className={`
                  truncate font-medium w-full text-center
                  text-xs
                  sm:text-sm
                  md:text-base
                `}
              >
                {title}
              </h3>
              <p className="text-[11px] text-gray-400 w-full text-center">{year}</p>
            </div>
          </Link>
        );
      })}
    </div>
  );
}