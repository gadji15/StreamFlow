"use client";
import { useEffect, useState } from "react";
import MediaPosterCard from "./MediaPosterCard";
import { fetchTMDBSimilarSeries } from "@/lib/tmdb";
import { supabase } from "@/lib/supabaseClient";
import FilmCard from "./MediaPosterCard";

/**
 * Grille premium pour les séries similaires (croisement TMDB + Supabase)
 * Affichage harmonisé avec la grille de la page d'accueil.
 */
export default function SimilarSeriesGrid({
  currentSeriesId,
  tmdbId,
}: {
  currentSeriesId: string;
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
        // 1. Get similar series from TMDB
        const similarFromTMDB = await fetchTMDBSimilarSeries(tmdbId);
        const similarTMDBIds = similarFromTMDB.map((s) => s.id);

        // 2. Fetch all local series except the current one
        const { data: localSeries, error } = await supabase
          .from("series")
          .select("*")
          .neq("id", currentSeriesId);

        if (error || !localSeries) {
          setSimilarLocal([]);
          return;
        }

        // 3. Cross-reference: local series whose tmdb_id is in similarTMDBIds
        const matching = localSeries.filter(
          (serie: any) =>
            serie.tmdb_id && similarTMDBIds.includes(Number(serie.tmdb_id))
        );

        setSimilarLocal(matching);
      } catch (e) {
        setSimilarLocal([]);
      } finally {
        setLoading(false);
      }
    }
    fetchSimilar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tmdbId, currentSeriesId]);

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
        Aucune série similaire disponible dans la plateforme.
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
      {similarLocal.map((movie) => (
        <FilmCard
          key={movie.id}
          href={`/series/${movie.id}`}
          title={movie.title || "Sans titre"}
          poster={movie.poster || movie.poster_url || movie.posterUrl || "/placeholder-poster.png"}
          year={movie.year}
          isVIP={movie.is_vip ?? movie.isVIP}
        />
      ))}
    </div>
  );
}