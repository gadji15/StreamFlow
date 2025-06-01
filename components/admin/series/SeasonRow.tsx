import React, { useState } from "react";
import InlineEdit from "./InlineEdit";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabaseClient";
import { useToast } from "@/components/ui/use-toast";
import EpisodeList from "./EpisodeList";
import { Edit, Trash2, Plus, Download } from "lucide-react";

type Season = {
  id: string | number;
  season_number: number;
  title?: string;
  air_date?: string;
  episode_count?: number;
  tmdb_series_id?: string | number;
  [key: string]: any;
};

interface SeasonRowProps {
  season: Season;
  seriesId: string | number;
  expanded: boolean;
  onExpand: () => void;
  seasonEpisodes: any[];
  seasonEpisodesLoading: boolean;
  onAction?: (action: string, payload: any) => void;
}

export default function SeasonRow({
  season,
  seriesId,
  expanded,
  onExpand,
  seasonEpisodes,
  seasonEpisodesLoading,
  onAction,
}: SeasonRowProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  // Inline edit handlers
  const handleUpdateField = async (field: string, value: any) => {
    if (season[field] === value) return false;
    setLoading(true);
    const patch: { [key: string]: any } = {};
    patch[field] = value;
    const { error } = await supabase.from("seasons").update(patch).eq('id', season.id);
    setLoading(false);
    if (!error) {
      toast({ title: "Saison mise à jour" });
      return true;
    } else {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
      return false;
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Supprimer définitivement cette saison ?")) return;
    setLoading(true);
    const { error } = await supabase.from('seasons').delete().eq('id', season.id);
    setLoading(false);
    if (!error) {
      toast({ title: "Saison supprimée" });
      if (onAction) onAction("refresh", { seriesId });
    } else {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    }
  };

  const handleImportTMDB = async () => {
    if (!season.tmdb_series_id || !season.season_number) {
      toast({ title: "ID TMDB manquant" });
      return;
    }
    setLoading(true);
    const res = await fetch(
      `/api/tmdb/season/${encodeURIComponent(season.tmdb_series_id)}/${encodeURIComponent(season.season_number)}`
    );
    setLoading(false);
    if (!res.ok) {
      toast({ title: "Erreur TMDB", description: "Impossible de récupérer les épisodes.", variant: "destructive" });
      return;
    }
    const data = await res.json();
    if (!data.episodes || !Array.isArray(data.episodes)) {
      toast({ title: "Erreur TMDB", description: "Aucun épisode trouvé pour cette saison.", variant: "destructive" });
      return;
    }
    toast({ title: "Succès", description: `${data.episodes.length} épisodes récupérés.` });
    // Optionnel: insérer les épisodes dans Supabase ici
  };

  return (
    <>
      <tr className="hover:bg-gray-900 transition">
        <td className="py-2">
          <InlineEdit
            value={season.season_number}
            type="number"
            min={1}
            onSave={newValue => handleUpdateField("season_number", newValue)}
          />
        </td>
        <td className="py-2">
          <InlineEdit
            value={season.title || ""}
            onSave={newValue => handleUpdateField("title", newValue)}
          />
        </td>
        <td className="py-2">{season.air_date ?? "-"}</td>
        <td className="py-2">
          <span className="bg-purple-600/20 text-purple-400 px-2 py-0.5 rounded-full text-xs font-semibold">
            {season.episode_count ?? "-"}
          </span>
        </td>
        <td className="py-2 flex flex-wrap gap-1">
          <Button
            size="sm"
            variant={expanded ? "default" : "outline"}
            onClick={onExpand}
            disabled={loading}
          >
            Episodes
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="ml-1"
            onClick={() => onAction && onAction("edit", { season, seriesId })}
            disabled={loading}
          >
            <Edit className="h-4 w-4" /> Modifier
          </Button>
          <Button
            size="sm"
            variant="destructive"
            className="ml-1"
            onClick={handleDelete}
            disabled={loading}
          >
            <Trash2 className="h-4 w-4" /> Supprimer
          </Button>
          {/* Le bouton + Épisode est supprimé ici, EpisodeList le gère contextuellement */}
          {(season.tmdb_series_id && season.season_number) && (
            <Button
              size="sm"
              variant="default"
              className="ml-1"
              onClick={handleImportTMDB}
              disabled={loading}
            >
              <Download className="h-4 w-4 mr-1" /> Import TMDB
            </Button>
          )}
        </td>
      </tr>
      {/* Accordéon épisode */}
      {expanded && (
        <tr>
          <td colSpan={5} className="bg-gray-950 border-t border-b border-gray-800 px-2 py-2">
            {seasonEpisodesLoading ? (
              <div className="py-3 flex justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-indigo-500"></div>
              </div>
            ) : (
              <EpisodeList
                episodes={seasonEpisodes}
                seasonId={String(season.id)}
                seriesId={String(seriesId)}
                seasonNumber={season.season_number}
                fetchEpisodesForSeason={async () => {
                  if (onAction) {
                    await onAction("refresh-episodes", { seasonId: season.id });
                  }
                }}
              />
            )}
          </td>
        </tr>
      )}
    </>
  );
}
