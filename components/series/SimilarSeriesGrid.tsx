"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Tv } from "lucide-react";
import { fetchTMDBSimilarSeries } from "@/lib/tmdb";
import { supabase } from "@/lib/supabaseClient";

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
      {similarLocal.map((serie) => {
        // Gestion des données pour harmoniser l'affichage
        const poster =
          serie.poster ||
          serie.poster_url ||
          serie.posterUrl ||
          "/placeholder-poster.png";
        const title = serie.title || "Sans titre";
        const startYear = serie.start_year ?? serie.startYear ?? "";
        const endYear = serie.end_year ?? serie.endYear ?? "";
        const isVIP = serie.is_vip ?? serie.isVIP ?? false;

        return (
          <Link
            key={serie.id}
            href={`/series/${serie.id}`}
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
                <Tv className="w-7 h-7 text-white" />
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
              <p className="text-[11px] text-gray-400 w-full text-center">
                {startYear}
                {endYear ? ` - ${endYear}` : ""}
              </p>
            </div>
          </Link>
        );
      })}
    </div>
  );
}