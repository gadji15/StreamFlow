import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";

/**
 * Hook pour gérer l'état de favori d'une série pour un utilisateur via Supabase.
 */
export function useFavoriteSeries(seriesId: string, userId?: string | null) {
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(false);

  // Vérifier si la série est dans les favoris au montage
  useEffect(() => {
    if (!seriesId || !userId) {
      setIsFavorite(false);
      return;
    }
    setLoading(true);
    supabase
      .from("favorites_series")
      .select("id")
      .eq("user_id", userId)
      .eq("series_id", seriesId)
      .maybeSingle()
      .then(({ data, error }) => {
        setIsFavorite(!!data && !error);
      })
      .finally(() => setLoading(false));
  }, [seriesId, userId]);

  // Ajouter aux favoris
  const addFavorite = useCallback(async () => {
    if (!seriesId || !userId) return false;
    setLoading(true);
    const { error } = await supabase.from("favorites_series").insert([
      {
        user_id: userId,
        series_id: seriesId,
        created_at: new Date().toISOString(),
      },
    ]);
    setIsFavorite(!error);
    setLoading(false);
    return !error;
  }, [seriesId, userId]);

  // Retirer des favoris
  const removeFavorite = useCallback(async () => {
    if (!seriesId || !userId) return false;
    setLoading(true);
    const { error } = await supabase
      .from("favorites_series")
      .delete()
      .eq("user_id", userId)
      .eq("series_id", seriesId);
    setIsFavorite(!!error ? true : false);
    setLoading(false);
    return !error;
  }, [seriesId, userId]);

  // Toggle favori
  const toggleFavorite = useCallback(async () => {
    if (isFavorite) {
      return await removeFavorite();
    } else {
      return await addFavorite();
    }
  }, [isFavorite, addFavorite, removeFavorite]);

  return { isFavorite, loading, addFavorite, removeFavorite, toggleFavorite };
}