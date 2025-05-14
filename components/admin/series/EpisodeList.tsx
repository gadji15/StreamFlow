import React, { useState } from "react";
import InlineEdit from "./InlineEdit";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabaseClient";
import { useToast } from "@/components/ui/use-toast";

// Drag & drop: gère le reorder et la persistance
export default function EpisodeList({ episodes, seasonId, fetchEpisodesForSeason }) {
  const { toast } = useToast();
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const moveEpisode = async (fromIdx: number, toIdx: number) => {
    if (fromIdx === toIdx) return;
    const reordered = [...episodes];
    const [removed] = reordered.splice(fromIdx, 1);
    reordered.splice(toIdx, 0, removed);
    // Update order field in DB (assume field: "order")
    await Promise.all(reordered.map((ep, idx) =>
      supabase.from("episodes").update({ order: idx }).eq('id', ep.id)
    ));
    fetchEpisodesForSeason(seasonId);
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
          <tr
            key={episode.id}
            className={`hover:bg-gray-900 ${draggedIndex === idx ? "bg-indigo-900/20" : ""}`}
            draggable
            onDragStart={() => setDraggedIndex(idx)}
            onDragOver={e => { e.preventDefault(); }}
            onDrop={() => {
              if (draggedIndex !== null && draggedIndex !== idx) {
                moveEpisode(draggedIndex, idx);
              }
              setDraggedIndex(null);
            }}
            onDragEnd={() => setDraggedIndex(null)}
            style={{ cursor: "grab" }}
          >
            <td className="py-1">
              <InlineEdit
                value={episode.episode_number}
                type="number"
                min={1}
                onSave={async (newValue) => {
                  if (newValue === episode.episode_number) return false;
                  const { error } = await supabase.from("episodes")
                    .update({ episode_number: newValue })
                    .eq('id', episode.id);
                  if (!error) {
                    toast({ title: "Numéro d'épisode mis à jour" });
                    fetchEpisodesForSeason(seasonId);
                  } else {
                    toast({ title: "Erreur", description: error.message, variant: "destructive" });
                    return false;
                  }
                }}
              />
            </td>
            <td className="py-1">
              <InlineEdit
                value={episode.title || ""}
                onSave={async (newValue) => {
                  if (newValue === (episode.title || "")) return false;
                  const { error } = await supabase.from("episodes")
                    .update({ title: newValue })
                    .eq('id', episode.id);
                  if (!error) {
                    toast({ title: "Titre d'épisode mis à jour" });
                    fetchEpisodesForSeason(seasonId);
                  } else {
                    toast({ title: "Erreur", description: error.message, variant: "destructive" });
                    return false;
                  }
                }}
              />
            </td>
            <td className="py-1">
              <InlineEdit
                value={episode.duration ?? ""}
                type="number"
                min={0}
                onSave={async (newValue) => {
                  if (newValue === episode.duration) return false;
                  const { error } = await supabase.from("episodes")
                    .update({ duration: newValue })
                    .eq('id', episode.id);
                  if (!error) {
                    toast({ title: "Durée mise à jour" });
                    fetchEpisodesForSeason(seasonId);
                  } else {
                    toast({ title: "Erreur", description: error.message, variant: "destructive" });
                    return false;
                  }
                }}
              />
              {episode.duration ? " min" : ""}
            </td>
            <td className="py-1">
              {/* Toggle inline pour le statut publié */}
              <button
                aria-label={episode.published ? "Dépublier" : "Publier"}
                className={`px-2 py-0.5 rounded-full text-xs font-semibold focus:outline-none focus:ring-2 ${episode.published ? "bg-green-500/20 text-green-500" : "bg-gray-500/20 text-gray-400"}`}
                onClick={async () => {
                  const { error } = await supabase.from("episodes")
                    .update({ published: !episode.published })
                    .eq('id', episode.id);
                  if (!error) {
                    toast({ title: episode.published ? "Épisode dépublié" : "Épisode publié" });
                    fetchEpisodesForSeason(seasonId);
                  } else {
                    toast({ title: "Erreur", description: error.message, variant: "destructive" });
                  }
                }}
                tabIndex={0}
                style={{ minWidth: 70 }}
              >
                {episode.published ? "Publié" : "Brouillon"}
              </button>
            </td>
            <td className="py-1">
              {/* Toggle inline pour VIP */}
              <button
                aria-label={episode.is_vip ? "Retirer VIP" : "Activer VIP"}
                className={`px-2 py-0.5 rounded-full text-xs font-semibold focus:outline-none focus:ring-2 ${episode.is_vip ? "bg-amber-500/20 text-amber-500" : "bg-gray-500/20 text-gray-400"}`}
                onClick={async () => {
                  const { error } = await supabase.from("episodes")
                    .update({ is_vip: !episode.is_vip })
                    .eq('id', episode.id);
                  if (!error) {
                    toast({ title: episode.is_vip ? "Épisode retiré du VIP" : "Épisode VIP activé" });
                    fetchEpisodesForSeason(seasonId);
                  } else {
                    toast({ title: "Erreur", description: error.message, variant: "destructive" });
                  }
                }}
                tabIndex={0}
                style={{ minWidth: 50 }}
              >
                {episode.is_vip ? "VIP" : "Non"}
              </button>
            </td>
            <td className="py-1">
              <Button
                size="xs"
                variant="outline"
                onClick={() => window.dispatchEvent(new CustomEvent("edit-episode", { detail: episode }))}
              >
                Modifier
              </Button>
              <Button
                size="xs"
                variant="destructive"
                className="ml-1"
                onClick={async () => {
                  if (window.confirm("Supprimer définitivement cet épisode ?")) {
                    await supabase.from('episodes').delete().eq('id', episode.id);
                    fetchEpisodesForSeason(seasonId);
                    toast({title: "Épisode supprimé"});
                  }
                }}
              >
                Supprimer
              </Button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}