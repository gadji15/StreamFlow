import React, { useState } from "react";
import EpisodeRow from "./EpisodeRow";
import { supabase } from "@/lib/supabaseClient";
import { useToast } from "@/components/ui/use-toast";

export default function EpisodeList({
  episodes,
  seasonId,
  fetchEpisodesForSeason,
  tmdbSeriesId,
  seasonNumber,
}) {
  // ...
  const refreshEpisodes = () => {
    fetchEpisodesForSeason(seasonId);
  };

  return (
    <div>
      {/* ... */}
      <EpisodeModal
        open={modalOpen}
        onClose={closeModal}
        onSubmit={handleSubmit}
        initial={editingEpisode}
        seasonId={seasonId}
        tmdbSeriesId={tmdbSeriesId}
        seasonNumber={seasonNumber}
        refreshEpisodes={refreshEpisodes}
      />
      {/* ... */}
    </div>
  );
}).eq('id', ep.id)
    ));
    fetchEpisodesForSeason();
    toast({ title: "Ordre des épisodes mis à jour" });
  };

  return (
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
  );
}
