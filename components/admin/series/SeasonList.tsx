import React from "react";
import SeasonRow from "./SeasonRow";

export default function SeasonList({
  seasons,
  seriesId,
  fetchSeasonsForSeries,
  fetchEpisodesForSeason,
  seasonEpisodes,
  seasonEpisodesLoading,
  expandedSeason,
  setExpandedSeason,
  refreshSeasons, // nouveau prop reçu
}) {
  // ...
  return (
    <div>
      {/* ... */}
      <SeasonModal
        open={modalOpen}
        onClose={closeModal}
        onSubmit={handleSubmit}
        initial={editingSeason}
        seriesId={seriesId}
        refreshSeasons={refreshSeasons} // propagation ici
      />
      {/* ... */}
    </div>
  );
} className="text-gray-500 text-center py-2">Aucune saison enregistrée.</td>
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