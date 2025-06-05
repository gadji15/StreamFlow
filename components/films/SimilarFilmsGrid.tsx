"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Film } from "lucide-react";
import { fetchTMDBSimilarMovies, getTMDBImageUrl } from "@/lib/tmdb";
import { supabase } from "@/lib/supabaseClient";
import FilmCard from "../FilmCard";

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
      {similarLocal.map((film) => (
        <FilmCard
          key={film.id}
          movie={{
            id: String(film.id),
            title: film.title || "Sans titre",
            poster:
              film.poster ||
              film.poster_url ||
              film.posterUrl ||
              "/placeholder-poster.png",
            year: film.year ?? film.release_year ?? "",
            isVIP: film.is_vip ?? film.isVIP ?? false,
          }}
        />
      ))}
    </div>
  );
}