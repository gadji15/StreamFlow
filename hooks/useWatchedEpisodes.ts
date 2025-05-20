import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";

/**
 * Hook React pour gérer la progression de visionnage des épisodes d'une série.
 * - Récupère la liste des épisodes vus pour un utilisateur donné.
 * - Permet de marquer ou démarcher un épisode comme vu (persisté côté Supabase).
 * - Fournit isWatched(episodeId) pour lier chaque épisode à la progression.
 *
 * @param seriesId - ID de la série concernée
 * @param userId - ID utilisateur (nullable si déconnecté)
 * @returns {
 *   watchedIds: Set<string>, loading: boolean,
 *   markWatched, unmarkWatched, isWatched
 * }
 */
export function useWatchedEpisodes(seriesId: string, userId?: string | null) {
  const [watchedIds, setWatchedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!seriesId || !userId) {
      setWatchedIds(new Set());
      return;
    }
    setLoading(true);
    supabase
      .from("watched_episodes")
      .select("episode_id")
      .eq("user_id", userId)
      .eq("series_id", seriesId)
      .then(({ data, error }) => {
        if (!error && Array.isArray(data)) {
          setWatchedIds(new Set(data.map((row) => row.episode_id)));
        }
      })
      .finally(() => setLoading(false));
  }, [seriesId, userId]);

  const markWatched = useCallback(
    async (episodeId: string) => {
      if (!seriesId || !userId || !episodeId) return;
      setLoading(true);
      const { error } = await supabase
        .from("watched_episodes")
        .insert([{ user_id: userId, series_id: seriesId, episode_id: episodeId }]);
      if (!error) setWatchedIds((prev) => new Set(prev).add(episodeId));
      setLoading(false);
    },
    [seriesId, userId]
  );

  const unmarkWatched = useCallback(
    async (episodeId: string) => {
      if (!seriesId || !userId || !episodeId) return;
      setLoading(true);
      const { error } = await supabase
        .from("watched_episodes")
        .delete()
        .eq("user_id", userId)
        .eq("series_id", seriesId)
        .eq("episode_id", episodeId);
      if (!error)
        setWatchedIds((prev) => {
          const next = new Set(prev);
          next.delete(episodeId);
          return next;
        });
      setLoading(false);
    },
    [seriesId, userId]
  );

  return {
    watchedIds,
    loading,
    markWatched,
    unmarkWatched,
    isWatched: (episodeId: string) => watchedIds.has(episodeId),
  };
}