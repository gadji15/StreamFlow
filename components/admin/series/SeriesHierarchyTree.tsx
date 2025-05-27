import React, { useState, useEffect } from "react";
import SeasonList from "./SeasonList";

type Serie = {
  id: string;
  title?: string;
  // Add other properties if needed
};

interface SeriesHierarchyTreeProps {
  series: Serie[];
  seriesSeasons?: Record<string, any[]>;
  fetchSeasonsForSeries: (seriesId: string) => void;
  fetchEpisodesForSeason: (seasonId: string) => void;
  seasonEpisodes?: Record<string, any[]>;
  seasonEpisodesLoading?: Record<string, boolean>;
  setModal: (modalState: any) => void;
}

export default function SeriesHierarchyTree({
  series, 
  seriesSeasons = {}, 
  fetchSeasonsForSeries, 
  fetchEpisodesForSeason, 
  seasonEpisodes = {}, 
  seasonEpisodesLoading = {},
  setModal
}: SeriesHierarchyTreeProps) {
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
        <div
          key={serie.id}
          className="mb-8 rounded-2xl border border-indigo-600/30 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 shadow-xl transition-transform hover:scale-[1.015] group"
        >
          <div className="flex justify-between items-center px-5 py-4 border-b border-indigo-700/20">
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center justify-center rounded-full bg-indigo-500/10 border border-indigo-400/60 w-8 h-8 text-indigo-300 font-bold text-lg mr-2">
                {serie.title?.slice(0, 1)?.toUpperCase() || "?"}
              </span>
              <span className="font-extrabold text-lg text-indigo-200 group-hover:text-indigo-400 transition">
                {serie.title}
              </span>
            </div>
            <button
              className={`rounded-full px-4 py-1 font-semibold shadow bg-gradient-to-r ${
                expandedSeries === serie.id
                  ? "from-indigo-700 to-purple-800 text-white"
                  : "from-indigo-400 to-purple-500 text-white opacity-80 hover:opacity-100"
              } transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-600`}
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
            <div className="ml-0 md:ml-3 mt-2 px-3 py-2 animate-fade-in">
              <SeasonList
                seasons={seriesSeasons[serie.id] || []}
                seriesId={serie.id}
                fetchEpisodesForSeason={fetchEpisodesForSeason}
                seasonEpisodes={seasonEpisodes}
                seasonEpisodesLoading={seasonEpisodesLoading}
                expandedSeason={expandedSeason}
                setExpandedSeason={setExpandedSeason}
                onAction={setModal}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}