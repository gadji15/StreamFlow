import React from "react";
import InlineEdit from "./InlineEdit";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabaseClient";
import { useToast } from "@/components/ui/use-toast";
import { Edit, Trash2 } from "lucide-react";

export default function EpisodeRow({
  episode,
  seasonId,
  fetchEpisodesForSeason,
  draggableProps
}) {
  const { toast } = useToast();

  // Inline edit
  const handleUpdateField = async (field, value) => {
    if (episode[field] === value) return false;
    const patch = {}; patch[field] = value;
    const { error } = await supabase.from("episodes").update(patch).eq('id', episode.id);
    if (!error) {
      toast({ title: "Épisode mis à jour" });
      fetchEpisodesForSeason();
      return true;
    } else {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
      return false;
    }
  };

  // Suppression
  const handleDelete = async () => {
    if (!window.confirm("Supprimer définitivement cet épisode ?")) return;
    const { error } = await supabase.from('episodes').delete().eq('id', episode.id);
    if (!error) {
      toast({ title: "Épisode supprimé" });
      fetchEpisodesForSeason();
    } else {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    }
  };

  return (
    <tr className="hover:bg-gray-900" {...draggableProps}>
      <td className="py-1">
        <InlineEdit
          value={episode.episode_number}
          type="number"
          min={1}
          onSave={newValue => handleUpdateField("episode_number", newValue)}
        />
      </td>
      <td className="py-1">
        <InlineEdit
          value={episode.title || ""}
          onSave={newValue => handleUpdateField("title", newValue)}
        />
      </td>
      <td className="py-1">
        <InlineEdit
          value={episode.duration ?? ""}
          type="number"
          min={0}
          onSave={newValue => handleUpdateField("duration", newValue)}
        />
        {episode.duration ? " min" : ""}
      </td>
      <td className="py-1">
        <button
          aria-label={episode.published ? "Dépublier" : "Publier"}
          className={`px-2 py-0.5 rounded-full text-xs font-semibold focus:outline-none focus:ring-2 ${episode.published ? "bg-green-500/20 text-green-500" : "bg-gray-500/20 text-gray-400"}`}
          onClick={async () => {
            const { error } = await supabase.from("episodes").update({ published: !episode.published }).eq('id', episode.id);
            if (!error) {
              toast({ title: episode.published ? "Épisode dépublié" : "Épisode publié" });
              fetchEpisodesForSeason();
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
        <button
          aria-label={episode.is_vip ? "Retirer VIP" : "Activer VIP"}
          className={`px-2 py-0.5 rounded-full text-xs font-semibold focus:outline-none focus:ring-2 ${episode.is_vip ? "bg-amber-500/20 text-amber-500" : "bg-gray-500/20 text-gray-400"}`}
          onClick={async () => {
            const { error } = await supabase.from("episodes").update({ is_vip: !episode.is_vip }).eq('id', episode.id);
            if (!error) {
              toast({ title: episode.is_vip ? "Épisode retiré du VIP" : "Épisode VIP activé" });
              fetchEpisodesForSeason();
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
          <Edit className="h-4 w-4" /> Modifier
        </Button>
        <Button
          size="xs"
          variant="destructive"
          className="ml-1"
          onClick={handleDelete}
        >
          <Trash2 className="h-4 w-4" /> Supprimer
        </Button>
      </td>
    </tr>
  );
}