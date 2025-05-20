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
  const [error, setError] = useState<string | null>(null);

  const handleToggleFavorite = async () => {
    setError(null);
    if (!user) {
      setError("Vous devez être connecté.");
      return;
    }
    setLoading(true);
    try {
      if (!isFavorite) {
        // Ajout aux favoris
        const { error: insertError } = await supabase.from("favorites").insert([{
          user_id: user.id,
          series_id: id,
          created_at: new Date().toISOString()
        }]);
        if (insertError) throw insertError;
        setIsFavorite(true);
        onFavoriteChange?.(true);
      } else {
        // Suppression des favoris
        const { error: deleteError } = await supabase.from("favorites")
          .delete()
          .eq("user_id", user.id)
          .eq("series_id", id);
        if (deleteError) throw deleteError;
        setIsFavorite(false);
        onFavoriteChange?.(false);
      }
    } catch (e: any) {
      setError(e.message || "Erreur lors de la mise à jour du favori.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ border: '1px solid #eee', borderRadius: 8, padding: 16, position: 'relative' }}>
      <SupaImage url={imageUrl} alt={title} />
      <h3>{title}</h3>
      <p>{description}</p>
      <button
        onClick={handleToggleFavorite}
        disabled={loading || !user}
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
          cursor: user ? 'pointer' : 'not-allowed',
          boxShadow: '0 2px 6px #0002',
          transition: 'background 0.2s'
        }}
        aria-label={isFavorite ? "Retirer des favoris" : "Ajouter aux favoris"}
      >
        {isFavorite ? "★" : "☆"}
      </button>
      {error && (
        <div style={{ color: "red", fontSize: 12, marginTop: 8 }}>{error}</div>
      )}
    </div>
  );
}