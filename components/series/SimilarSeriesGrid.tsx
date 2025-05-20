"use client";
import { useEffect, useState } from "react";
import { fetchTMDBSimilarSeries } from "@/lib/tmdb";
import { supabase } from "@/lib/supabaseClient";
import SeriesCard from "@/components/SeriesCard";

/**
 * Grille premium pour les séries similaires (croisement TMDB + Supabase)
 */
export default function SimilarSeriesGrid({ currentSeriesId, tmdbId }: { currentSeriesId: string; tmdbId: string }) {
  const [similarLocal, setSimilarLocal] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
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

        // 2. Fetch all local series
        const { data: localSeries, error } = await supabase
          .from("series")
          .select("*")
          .neq("id", currentSeriesId); // don't include current series

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
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="h-64 bg-gray-800 rounded-xl animate-pulse"
            aria-hidden="true"
          ></div>
        ))}
      </div>
    );
  }

  if (!similarLocal.length) {
    return (
      <div className="text-center p-8 text-gray-400">
        Aucune série similaire disponible dans la plateforme.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
      {similarLocal.map((serie) => (
        <SeriesCard
          key={serie.id}
          id={serie.id}
          title={serie.title}
          description={serie.description}
          imageUrl={serie.poster_url || "/placeholder-poster.png"}
          isFavorite={false}
        />
      ))}
    </div>
  );
}