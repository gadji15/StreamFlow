import React, { useState, useEffect } from "react";
import SeasonList from "./SeasonList";

export default function SeriesHierarchyTree({
  series, seriesSeasons, fetchSeasonsForSeries, fetchEpisodesForSeason, seasonEpisodes, seasonEpisodesLoading
}) {
  const [expandedSeries, setExpandedSeries] = useState<string | null>(null);
  const [expandedSeason, setExpandedSeason] = useState<string | null>(null);

  // Quand expandedSeries change (ou après premier affichage), on charge les saisons si besoin
  useEffect(() => {
    if (expandedSeries && typeof fetchSeasonsForSeries === "function") {
      // Ne refetch que si non déjà fetché (pas obligatoire, mais évite appels inutiles)
      if (!seriesSeasons[expandedSeries] || seriesSeasons[expandedSeries].length === 0) {
        fetchSeasonsForSeries(expandedSeries);
      }
    }
  }, [expandedSeries, fetchSeasonsForSeries, seriesSeasons]);

  return (
    <div>
      {series.map(serie => (
        <div key={serie.id} className="mb-8 rounded border bg-gray-900 p-4">
          <div className="flex justify-between items-center">
            <div className="font-semibold text-lg">{serie.title}</div>
            <button
              className="btn-primary"
              onClick={() => {
                if (expandedSeries === serie.id) {
                  setExpandedSeries(null);
                } else {
                  setExpandedSeries(serie.id);
                  // fetchSeasonsForSeries sera appelé automatiquement par le useEffect
                }
              }}
            >
              {expandedSeries === serie.id ? "Fermer" : "Afficher saisons"}
            </button>
          </div>
          {expandedSeries === serie.id && (
            <div className="ml-3 mt-2">
              <SeasonList
                seasons={seriesSeasons[serie.id] || []}
                seriesId={serie.id}
                fetchSeasonsForSeries={fetchSeasonsForSeries}
                fetchEpisodesForSeason={fetchEpisodesForSeason}
                seasonEpisodes={seasonEpisodes}
                seasonEpisodesLoading={seasonEpisodesLoading}
                expandedSeason={expandedSeason}
                setExpandedSeason={setExpandedSeason}
                refreshSeasons={() => fetchSeasonsForSeries(serie.id)}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}