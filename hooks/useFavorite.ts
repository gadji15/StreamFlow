import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useCurrentUser } from "@/hooks/useCurrentUser";

/**
 * Hook universel pour gérer l'état favori (ajout, suppression, état) pour tout type de contenu.
 * N'utilise que user_id, content_id et type.
 */
export function useFavorite(
  contentId: string,
  type: "film" | "serie" | "episode"
) {
  const { user } = useCurrentUser();
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(false);

  // Vérifie si le contenu est déjà favori (universel)
  const checkFavorite = useCallback(async () => {
    if (!user || !contentId) {
      setIsFavorite(false);
      return;
    }
    setLoading(true);
    const { data, error } = await supabase
      .from("favorites")
      .select("id")
      .eq("user_id", user.id)
      .eq("content_id", contentId)
      .eq("type", type)
      .maybeSingle();
    setIsFavorite(!!data && !error);
    setLoading(false);
  }, [user, contentId, type]);

  useEffect(() => {
    checkFavorite();
  }, [checkFavorite]);

  // Ajoute en favori
  const addFavorite = async () => {
    if (!user || !contentId) return false;
    setLoading(true);
    const { error } = await supabase.from("favorites").insert([
      {
        user_id: user.id,
        content_id: contentId,
        type,
      },
    ]);
    if (!error) setIsFavorite(true);
    setLoading(false);
    return !error;
  };

  // Supprime des favoris
  const removeFavorite = async () => {
    if (!user || !contentId) return false;
    setLoading(true);
    const { error } = await supabase
      .from("favorites")
      .delete()
      .eq("user_id", user.id)
      .eq("content_id", contentId)
      .eq("type", type);
    if (!error) setIsFavorite(false);
    setLoading(false);
    return !error;
  };

  // Toggle universel
  const toggleFavorite = async () => {
    if (isFavorite) {
      return await removeFavorite();
    } else {
      return await addFavorite();
    }
  };

  return {
    isFavorite,
    loading,
    toggleFavorite,
    addFavorite,
    removeFavorite,
    checkFavorite,
  };
}