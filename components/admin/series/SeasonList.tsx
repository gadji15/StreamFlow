import React from "react";
import SeasonRow from "./SeasonRow";
import { Film } from "lucide-react";

export default function SeasonList({
  seasons,
  seriesId,
  expandedSeason,
  setExpandedSeason,
  fetchEpisodesForSeason,
  seasonEpisodes,
  seasonEpisodesLoading,
  onAction
}) {
  return (
    <div className="rounded-xl bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border border-gray-700 shadow-lg mb-2 overflow-x-auto">
      <table className="min-w-full text-sm rounded-xl" role="table" aria-label="Liste des saisons">
        <thead>
          <tr className="text-indigo-300 border-b border-gray-700">
            <th className="py-3 px-2 text-left font-bold tracking-wide">#</th>
            <th className="py-3 px-2 text-left font-bold tracking-wide">Titre</th>
            <th className="py-3 px-2 text-left font-bold tracking-wide">Date</th>
            <th className="py-3 px-2 text-left font-bold tracking-wide">Épisodes</th>
            <th className="py-3 px-2 text-left font-bold tracking-wide">Actions</th>
          </tr>
        </thead>
        <tbody>
          {seasons.length === 0 && (
            <tr>
              <td colSpan={5} className="py-8 text-center text-indigo-200">
                <div className="flex flex-col items-center gap-2">
                  <Film className="h-8 w-8 text-indigo-400 mb-1" />
                  <span className="font-medium">Aucune saison enregistrée.</span>
                  <span className="text-xs text-gray-400">Ajoutez une saison pour cette série afin de mieux organiser le contenu.</span>
                </div>
              </td>
            </tr>
          )}
          {seasons.map(season => (
            <React.Fragment key={season.id}>
              <SeasonRow
                season={season}
                seriesId={seriesId}
                expanded={expandedSeason === season.id}
                onExpand={() => {
                  if (expandedSeason === season.id) setExpandedSeason(null);
                  else {
                    setExpandedSeason(season.id);
                    fetchEpisodesForSeason(season.id);
                  }
                }}
                seasonEpisodes={seasonEpisodes[season.id] || []}
                seasonEpisodesLoading={seasonEpisodesLoading[season.id]}
                onAction={onAction}
              />
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
}