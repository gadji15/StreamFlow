import React from "react";
import InlineEdit from "./InlineEdit";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabaseClient";
import { useToast } from "@/components/ui/use-toast";
import EpisodeList from "./EpisodeList";

export default function SeasonList({
  seasons, seriesId, fetchSeasonsForSeries, fetchEpisodesForSeason, seasonEpisodes, seasonEpisodesLoading, expandedSeason, setExpandedSeason
}) {
  const { toast } = useToast();

  return (
    <table className="w-full text-xs bg-gray-800 rounded" role="table" aria-label="Liste des saisons">
      <thead>
        <tr>
          <th className="py-2" scope="col">#</th>
          <th className="py-2" scope="col">Titre</th>
          <th className="py-2" scope="col">Date</th>
          <th className="py-2" scope="col">Épisodes</th>
          <th className="py-2" scope="col">Actions</th>
        </tr>
      </thead>
      <tbody>
        {seasons.map(season => (
          <React.Fragment key={season.id}>
            <tr className="hover:bg-gray-900 transition">
              <td className="py-2">
                <InlineEdit
                  value={season.season_number}
                  type="number"
                  min={1}
                  onSave={async (newValue) => {
                    if (newValue === season.season_number) return false;
                    const { error } = await supabase.from("seasons")
                      .update({ season_number: newValue })
                      .eq('id', season.id);
                    if (!error) {
                      toast({ title: "Numéro de saison mis à jour" });
                      fetchSeasonsForSeries(seriesId);
                    } else {
                      toast({ title: "Erreur", description: error.message, variant: "destructive" });
                      return false;
                    }
                  }}
                />
              </td>
              <td className="py-2">
                <InlineEdit
                  value={season.title || ""}
                  onSave={async (newValue) => {
                    if (newValue === (season.title || "")) return false;
                    const { error } = await supabase.from("seasons")
                      .update({ title: newValue })
                      .eq('id', season.id);
                    if (!error) {
                      toast({ title: "Titre de saison mis à jour" });
                      fetchSeasonsForSeries(seriesId);
                    } else {
                      toast({ title: "Erreur", description: error.message, variant: "destructive" });
                      return false;
                    }
                  }}
                />
              </td>
              <td className="py-2">{season.air_date}</td>
              <td className="py-2">
                <span className="bg-purple-600/20 text-purple-400 px-2 py-0.5 rounded-full text-xs font-semibold">
                  {season.episode_count ?? "-"}
                </span>
              </td>
              <td className="py-2 flex flex-wrap gap-1">
                <Button
                  size="xs"
                  variant={expandedSeason === season.id ? "success" : "outline"}
                  onClick={() => {
                    if (expandedSeason === season.id) {
                      setExpandedSeason(null);
                    } else {
                      setExpandedSeason(season.id);
                      fetchEpisodesForSeason(season.id);
                    }
                  }}
                >
                  Episodes
                </Button>
                {/* ...autres boutons (edit, destroy, import, etc.) */}
              </td>
            </tr>
            {/* Accordéon épisode */}
            {expandedSeason === season.id && (
              <tr>
                <td colSpan={5} className="bg-gray-950 border-t border-b border-gray-800 px-2 py-2">
                  {seasonEpisodesLoading[season.id] ? (
                    <div className="py-3 flex justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-indigo-500"></div>
                    </div>
                  ) : (
                    <EpisodeList
                      episodes={seasonEpisodes[season.id] || []}
                      seasonId={season.id}
                      fetchEpisodesForSeason={fetchEpisodesForSeason}
                    />
                  )}
                </td>
              </tr>
            )}
          </React.Fragment>
        ))}
        {seasons.length === 0 && (
          <tr>
            <td colSpan={5} className="text-gray-500 text-center py-2">Aucune saison enregistrée.</td>
          </tr>
        )}
      </tbody>
    </table>
  );
}