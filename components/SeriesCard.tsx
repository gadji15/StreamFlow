"use client";
import { useState } from "react";
import SupaImage from './SupaImage'
import { supabase } from "@/lib/supabaseClient";
import { useCurrentUser } from "@/hooks/useCurrentUser";

/**
 * Fiche série avec gestion favoris : ajout/suppression via series_id (jamais content_id).
 */
export default function SeriesCard({
  id,
  title,
  description,
  imageUrl,
  isFavorite: initialIsFavorite = false,
  onFavoriteChange,
}: {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  isFavorite?: boolean;
  onFavoriteChange?: (fav: boolean) => void;
}) {
  const { user } = useCurrentUser();
  const [isFavorite, setIsFavorite] = useState<boolean>(initialIsFavorite);
  const [loading, setLoading] = useState(false);

  const handleToggleFavorite = async () => {
    if (!user) return;
    setLoading(true);
    if (!isFavorite) {
      // Ajout aux favoris
      await supabase.from("favorites").insert([{
        user_id: user.id,
        series_id: id,
        created_at: new Date().toISOString()
      }]);
      setIsFavorite(true);
      onFavoriteChange?.(true);
    } else {
      // Suppression des favoris
      await supabase.from("favorites")
        .delete()
        .eq("user_id", user.id)
        .eq("series_id", id);
      setIsFavorite(false);
      onFavoriteChange?.(false);
    }
    setLoading(false);
  };

  return (
    <div style={{ border: '1px solid #eee', borderRadius: 8, padding: 16, position: 'relative' }}>
      <SupaImage url={imageUrl} alt={title} />
      <h3>{title}</h3>
      <p>{description}</p>
      {user && (
        <button
          onClick={handleToggleFavorite}
          disabled={loading}
          style={{
            position: 'absolute',
            top: 12,
            right: 12,
            background: isFavorite ? '#FF4081' : '#e0e0e0',
            color: isFavorite ? '#fff' : '#333',
            border: 'none',
            borderRadius: '50%',
            width: 36,
            height: 36,
            fontWeight: 'bold',
            cursor: 'pointer',
            boxShadow: '0 2px 6px #0002',
            transition: 'background 0.2s'
          }}
          aria-label={isFavorite ? "Retirer des favoris" : "Ajouter aux favoris"}
        >
          {isFavorite ? "★" : "☆"}
        </button>
      )}
    </div>
  );
}