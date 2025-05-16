import React, { useState } from "react";
import EpisodeRow from "./EpisodeRow";
import EpisodeModal from "./EpisodeModal";
import { supabase } from "@/lib/supabaseClient";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";

// Types TypeScript pour la clarté
interface Episode {
  id: string;
  episode_number: number;
  title: string;
  // ... autres champs utiles
}

interface EpisodeListProps {
  episodes: Episode[] | null | undefined;
  seasonId: string;
  seriesId: string;
  fetchEpisodesForSeason: () => Promise<void>;
  episodesLoading?: boolean;
  error?: string | null;
  seriesTitle?: string;
  tmdbSeriesId?: string;
  seasonNumber?: number | string;
}

export default function EpisodeList({
  episodes,
  seasonId,
  seriesId,
  fetchEpisodesForSeason,
  episodesLoading = false,
  error = null,
  seriesTitle = "",
  tmdbSeriesId = "",
  seasonNumber = ""
}: EpisodeListProps) {
  // Défense : episodes toujours un tableau pour éviter les bugs d’affichage
  episodes = Array.isArray(episodes) ? episodes : [];

  const { toast } = useToast();
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [episodeModalOpen, setEpisodeModalOpen] = useState(false);
  const [editEpisode, setEditEpisode] = useState<Episode | null>(null);

  // Ajout d'un épisode
  async function handleAddEpisode(form: any) {
    const insertObj = {
      ...form,
      season_id: seasonId,
      series_id: seriesId,
      sort_order: episodes.length,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    const { error } = await supabase.from("episodes").insert([insertObj]);
    if (error) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
      return;
    }
    await fetchEpisodesForSeason?.();
    setEpisodeModalOpen(false);
    toast({ title: "Épisode ajouté !" });
  }

  // Edition d'un épisode
  async function handleEditEpisode(form: any) {
    const { id, ...updateObj } = form;
    const { error } = await supabase.from("episodes").update(updateObj).eq("id", id);
    if (error) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
      return;
    }
    await fetchEpisodesForSeason?.();
    setEditEpisode(null);
    toast({ title: "Épisode modifié !" });
  }

  // Suppression d'un épisode
  async function handleDeleteEpisode(id: string) {
    if (!window.confirm("Supprimer cet épisode ?")) return;
    const { error } = await supabase.from("episodes").delete().eq("id", id);
    if (error) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
      return;
    }
    await fetchEpisodesForSeason?.();
    toast({ title: "Épisode supprimé !" });
  }

  // Drag & drop reorder logic
  const moveEpisode = async (fromIdx: number, toIdx: number) => {
    if (fromIdx === toIdx) return;
    const reordered = [...episodes];
    const [removed] = reordered.splice(fromIdx, 1);
    reordered.splice(toIdx, 0, removed);
    await Promise.all(
      reordered.map((ep, idx) =>
        supabase.from("episodes").update({ sort_order: idx }).eq("id", ep.id)
      )
    );
    await fetchEpisodesForSeason?.();
    toast({ title: "Ordre des épisodes mis à jour" });
  };

  // Rendu principal
  return (
    <div>
      {/* Bouton Ajouter un épisode */}
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-semibold text-white/90 text-base">Épisodes</h3>
        <Button
          variant="success"
          onClick={() => {
            if (seasonNumber) setEpisodeModalOpen(true);
          }}
          className="text-xs px-3 py-1"
          aria-label="Ajouter un épisode"
          disabled={!seasonNumber}
          title={!seasonNumber ? "Veuillez sélectionner une saison avant d’ajouter un épisode." : ""}
        >
          + Ajouter un épisode
        </Button>
      </div>
      {/* Modal ajout */}
      <EpisodeModal
        open={episodeModalOpen && !!seasonNumber}
        onClose={() => setEpisodeModalOpen(false)}
        onSave={handleAddEpisode}
        seriesTitle={seriesTitle}
        tmdbSeriesId={tmdbSeriesId}
        parentSeasonNumber={seasonNumber}
      />
      {/* Modal édition */}
      <EpisodeModal
        open={!!editEpisode}
        onClose={() => setEditEpisode(null)}
        onSave={handleEditEpisode}
        initialData={editEpisode}
        seriesTitle={seriesTitle}
        tmdbSeriesId={tmdbSeriesId}
        parentSeasonNumber={seasonNumber}
      />
      {/* Gestion loading/erreur */}
      {episodesLoading ? (
        <div className="py-3 flex justify-center">
          <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      ) : error ? (
        <div className="text-red-400 text-center py-2">{error}</div>
      ) : (
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
            {episodes.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-gray-500 text-center py-2">
                  Aucun épisode enregistré.
                </td>
              </tr>
            ) : (
              episodes.map((episode, idx) => (
                <EpisodeRow
                  key={episode.id}
                  episode={episode}
                  seasonId={seasonId}
                  fetchEpisodesForSeason={fetchEpisodesForSeason}
                  onEdit={() => setEditEpisode(episode)}
                  onDelete={() => handleDeleteEpisode(episode.id)}
                  draggableProps={{
                    draggable: true,
                    onDragStart: () => setDraggedIndex(idx),
                    onDragOver: (e) => { e.preventDefault(); },
                    onDrop: () => {
                      if (draggedIndex !== null && draggedIndex !== idx) {
                        moveEpisode(draggedIndex, idx);
                      }
                      setDraggedIndex(null);
                    },
                    onDragEnd: () => setDraggedIndex(null),
                    style: {
                      cursor: "grab",
                      background: draggedIndex === idx ? "rgba(99,102,241,0.1)" : undefined
                    }
                  }}
                />
              ))
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}