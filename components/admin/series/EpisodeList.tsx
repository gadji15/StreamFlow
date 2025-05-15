import React, { useState } from "react";
import EpisodeRow from "./EpisodeRow";
import EpisodeModal from "./EpisodeModal";
import { supabase } from "@/lib/supabaseClient";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";

export default function EpisodeList({ episodes, seasonId, fetchEpisodesForSeason, seriesTitle = "", tmdbSeriesId = "", seasonNumber = "" }) {
  const { toast } = useToast();
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  // Modal state
  const [episodeModalOpen, setEpisodeModalOpen] = useState(false);

  // Ajout robuste d'un épisode à la saison
  async function handleAddEpisode(form) {
    // form contient title, episode_number, air_date, thumbnail_url, tmdb_id, description, published, isvip
    // On complète avec la relation de saison
    const insertObj = {
      ...form,
      season_id: seasonId,
      order: episodes.length, // place à la fin
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    const { error } = await supabase.from("episodes").insert([insertObj]);
    if (error) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
      throw new Error(error.message);
    }
    toast({ title: "Épisode ajouté !" });
    fetchEpisodesForSeason();
  }

  // Drag & drop reorder logic
  const moveEpisode = async (fromIdx: number, toIdx: number) => {
    if (fromIdx === toIdx) return;
    const reordered = [...episodes];
    const [removed] = reordered.splice(fromIdx, 1);
    reordered.splice(toIdx, 0, removed);
    // Update order field in DB (assume field: "order")
    await Promise.all(reordered.map((ep, idx) =>
      supabase.from("episodes").update({ order: idx }).eq('id', ep.id)
    ));
    fetchEpisodesForSeason();
    toast({ title: "Ordre des épisodes mis à jour" });
  };

  return (
    <div>
      {/* Bouton Ajouter un épisode */}
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-semibold text-white/90 text-base">Épisodes</h3>
        <Button
          variant="success"
          onClick={() => setEpisodeModalOpen(true)}
          className="text-xs px-3 py-1"
          aria-label="Ajouter un épisode"
        >
          + Ajouter un épisode
        </Button>
      </div>
      <EpisodeModal
        open={episodeModalOpen}
        onClose={() => setEpisodeModalOpen(false)}
        onSave={handleAddEpisode}
        seriesTitle={seriesTitle}
        tmdbSeriesId={tmdbSeriesId}
        parentSeasonNumber={seasonNumber}
      />
      <table className="w-full text-xs bg-gray-950 rounded"
        role="table"
        aria-label="Liste des épisodes"
      >
        <thead>
          <tr>
            <th className="py-1" scope="col">Numéro</th>
            <th className="py-1" scope="col">Titre</th>
            <th className="py-1" scope="col">Durée</th>
            <th className="py-1" scope="col">Statut</th>
            <th className="py-1" scope="col">VIP</th>
            <th className="py-1" scope="col">Actions</th>
          </tr>
        </thead>
        <tbody>
          {episodes.map((episode, idx) => (
            <EpisodeRow
              key={episode.id}
              episode={episode}
              seasonId={seasonId}
              fetchEpisodesForSeason={fetchEpisodesForSeason}
              draggableProps={{
                draggable: true,
                onDragStart: () => setDraggedIndex(idx),
                onDragOver: e => { e.preventDefault(); },
                onDrop: () => {
                  if (draggedIndex !== null && draggedIndex !== idx) {
                    moveEpisode(draggedIndex, idx);
                  }
                  setDraggedIndex(null);
                },
                onDragEnd: () => setDraggedIndex(null),
                style: { cursor: "grab", background: draggedIndex === idx ? "rgba(99,102,241,0.1)" : undefined }
              }}
            />
          ))}
          {episodes.length === 0 && (
            <tr>
              <td colSpan={6} className="text-gray-500 text-center py-2">Aucun épisode enregistré.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
