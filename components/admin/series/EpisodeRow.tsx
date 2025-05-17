import React from "react";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";

const POSTER_SIZE = 40; // px, for compact display

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
  // Use thumbnail, poster, or fallback
  const posterUrl =
    episode.thumbnail_url ||
    episode.poster ||
    (episode.tmdb_id
      ? `https://image.tmdb.org/t/p/w300${episode.still_path || episode.poster_path || ""}`
      : null) ||
    "/placeholder-backdrop.jpg";

  return (
    <tr
      {...(draggableProps || {})}
      className="group hover:bg-gradient-to-l hover:from-indigo-900/30 hover:to-gray-900 transition-all duration-150 border-b border-gray-900 last:border-b-0"
      style={{ verticalAlign: "middle" }}
    >
      {/* Poster thumbnail */}
      <td className="py-1 px-2 text-center">
        <div
          className="rounded-lg shadow overflow-hidden border border-gray-800 mx-auto bg-gray-950 flex items-center justify-center"
          style={{ width: POSTER_SIZE, height: POSTER_SIZE, minWidth: POSTER_SIZE, minHeight: POSTER_SIZE }}
        >
          <img
            src={posterUrl}
            alt={episode.title || `Épisode ${episode.episode_number}`}
            className="object-cover w-full h-full transition-transform duration-200 group-hover:scale-105"
            decoding="async"
            loading="lazy"
            style={{ width: POSTER_SIZE, height: POSTER_SIZE, display: "block" }}
          />
        </div>
      </td>
      {/* Numéro */}
      <td className="py-2 text-center font-bold text-base text-indigo-300 drop-shadow-sm w-2">{episode.episode_number}</td>
      {/* Titre */}
      <td className="py-2 w-1/3 max-w-[160px] truncate">
        <span
          className="block font-semibold text-white/90 truncate"
          title={episode.title || "Sans titre"}
        >
          {episode.title || <span className="text-gray-500 italic">Sans titre</span>}
        </span>
        {/* Date de diffusion */}
        <span className="block text-xs text-gray-500 mt-0.5">{episode.air_date ? new Date(episode.air_date).toLocaleDateString() : ""}</span>
      </td>
      {/* Durée */}
      <td className="py-2 text-center text-gray-200">{episode.runtime ? `${episode.runtime} min` : <span className="text-gray-500">-</span>}</td>
      {/* Statut */}
      <td className="py-2 text-center">
        {episode.published ? (
          <span className="bg-emerald-700/25 text-emerald-400 px-2 py-0.5 rounded-full text-xs font-semibold animate-pulse group-hover:animate-none transition">
            Publié
          </span>
        ) : (
          <span className="bg-orange-900/30 text-orange-400 px-2 py-0.5 rounded-full text-xs font-semibold transition">
            Brouillon
          </span>
        )}
      </td>
      {/* VIP */}
      <td className="py-2 text-center">
        {episode.isvip ? (
          <span className="bg-amber-700/30 text-amber-300 px-2 py-0.5 rounded-full text-xs font-semibold animate-bounce group-hover:animate-none">
            VIP
          </span>
        ) : (
          <span className="bg-gray-700/30 text-gray-400 px-2 py-0.5 rounded-full text-xs font-semibold">-</span>
        )}
      </td>
      {/* Actions */}
      <td className="py-2 flex gap-2 justify-center items-center">
        <Button
          type="button"
          size="icon"
          variant="outline"
          aria-label="Modifier"
          title="Modifier"
          onClick={onEdit}
          disabled={actionLoading}
          className="hover:border-indigo-400 hover:text-indigo-300 transition"
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
          className="hover:border-red-400 hover:text-red-300 transition"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </td>
    </tr>
  );
}
