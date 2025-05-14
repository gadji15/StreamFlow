import React from "react";
import SeasonRow from "./SeasonRow";

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
        {seasons.length === 0 && (
          <tr>
            <td colSpan={5} className="text-gray-500 text-center py-2">Aucune saison enregistrée.</td>
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
  );
}