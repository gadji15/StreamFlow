import React from "react";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";

/**
 * EpisodeRow: Affiche une ligne d'épisode dans le tableau de EpisodeList
 * Props :
 * - episode : objet épisode (conforme à la table Supabase)
 * - seasonId : string (UUID saison)
 * - fetchEpisodesForSeason : fonction de rafraîchissement
 * - onEdit : callback pour éditer l'épisode
 * - onDelete : callback pour supprimer l'épisode
 * - draggableProps : props pour le drag and drop
 * - actionLoading : booléen pour désactiver boutons si action en cours
 */
export default function EpisodeRow({
  episode,
  seasonId,
  fetchEpisodesForSeason,
  onEdit,
  onDelete,
  draggableProps,
  actionLoading,
}: {
  episode: any;
  seasonId: string;
  fetchEpisodesForSeason: () => Promise<void>;
  onEdit: () => void;
  onDelete: () => void;
  draggableProps: any;
  actionLoading: boolean;
}) {
  return (
    <tr {...(draggableProps || {})} className="hover:bg-gray-900 transition">
      <td className="py-2 text-center font-bold">{episode.episode_number}</td>
      <td className="py-2">{episode.title || <span className="text-gray-500 italic">Sans titre</span>}</td>
      <td className="py-2 text-center">{episode.runtime ? `${episode.runtime} min` : "-"}</td>
      <td className="py-2 text-center">
        {episode.published ? (
          <span className="bg-green-700/30 text-green-400 px-2 py-0.5 rounded text-xs font-semibold">Publié</span>
        ) : (
          <span className="bg-yellow-900/30 text-yellow-400 px-2 py-0.5 rounded text-xs font-semibold">Brouillon</span>
        )}
      </td>
      <td className="py-2 text-center">
        {episode.isvip ? (
          <span className="bg-amber-700/30 text-amber-300 px-2 py-0.5 rounded text-xs font-semibold">VIP</span>
        ) : (
          <span className="bg-gray-600/30 text-gray-300 px-2 py-0.5 rounded text-xs font-semibold">-</span>
        )}
      </td>
      <td className="py-2 flex gap-2 justify-center">
        <Button
          type="button"
          size="icon"
          variant="outline"
          aria-label="Modifier"
          title="Modifier"
          onClick={onEdit}
          disabled={actionLoading}
        >
          <Edit className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          size="icon"
          variant="destructive"
          aria-label="Supprimer"
          title="Supprimer"
          onClick={onDelete}
          disabled={actionLoading}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </td>
    </tr>
  );
}
