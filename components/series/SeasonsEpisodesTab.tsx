"use client";
import React, { useEffect, useId, useState } from "react";
import { Layers, Play } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import EpisodeCard from "./EpisodeCard";
import MiniEpisodePoster from "./MiniEpisodePoster";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useWatchedEpisodes } from "@/hooks/useWatchedEpisodes";

export default function SeasonsEpisodesTab({
  seasons,
  episodes,
  id,
  isVIP,
  isMobile,
  selectedSeasonId,
  setSelectedSeasonId,
}) {
  const router = useRouter();
  const { user } = useCurrentUser();
  const {
    watchedIds,
    loading: loadingWatched,
    markWatched,
    unmarkWatched,
    isWatched,
  } = useWatchedEpisodes(id, user?.id);

  // UX: aucun saison/épisode
  const noSeasons = !seasons || seasons.length === 0;
  const seasonEpisodes = episodes.filter(
    (ep) => ep.season_id === selectedSeasonId
  );
  const noEpisodes = !seasonEpisodes || seasonEpisodes.length === 0;

  // Pour l'annonce ARIA lors du changement de saison
  const ariaSeasonMessageId = useId();
  const [seasonAriaMessage, setSeasonAriaMessage] = useState("");
  useEffect(() => {
    if (selectedSeasonId) {
      const season = seasons.find((s) => s.id === selectedSeasonId);
      if (season) setSeasonAriaMessage(`Saison ${season.season_number} affichée`);
    }
  }, [selectedSeasonId, seasons]);

  // Expansion dynamique de la description d'un épisode
  const [expandedEpisodeId, setExpandedEpisodeId] = useState<string | null>(null);

  // Responsive columns pour la grid des saisons
  const seasonGridCols = isMobile ? "grid-cols-2" : "grid-cols-3 md:grid-cols-4 lg:grid-cols-5";

  return (
    <div
      className={cn(
        "flex",
        isMobile ? "flex-col gap-6" : "flex-row gap-x-12"
      )}
    >
      {/* Saisons en cards */}
      <div
        className={cn(
          isMobile
            ? "w-full mb-4"
            : "flex-shrink-0 w-[18rem] min-w-[15rem] max-w-[20rem] pr-2"
        )}
        role="navigation"
        aria-label="Navigation des saisons"
      >
        <h2
          className="text-xl font-bold mb-3 text-gray-100 flex items-center gap-2"
          id="saisons-heading"
        >
          <Layers className="inline w-6 h-6 text-primary" />
          Saisons
        </h2>
        <div
          aria-live="polite"
          aria-atomic="true"
          className="sr-only"
          id={ariaSeasonMessageId}
        >
          {seasonAriaMessage}
        </div>
        {!noSeasons ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-y-6 gap-x-8">
            {seasons.map((season) => (
              <button
                key={season.id}
                onClick={() => setSelectedSeasonId(season.id)}
                className={cn(
                  "group flex flex-col items-center bg-gray-900/80 rounded-lg px-4 py-2 transition-all outline-none cursor-pointer focus-visible:ring-2 focus-visible:ring-primary hover:bg-gray-800",
                  season.id === selectedSeasonId
                    ? "ring-2 ring-primary"
                    : ""
                )}
                aria-current={season.id === selectedSeasonId}
                aria-label={`Saison ${season.season_number}${season.title ? " - " + season.title : ""}`}
                style={{ minWidth: "110px", maxWidth: "120px" }}
              >
                {/* Poster saison */}
                <div className="w-[90px] h-[135px] rounded-md overflow-hidden bg-black mb-1 flex items-center justify-center">
                  {season.poster ? (
                    <img
                      src={season.poster}
                      alt={`Affiche saison ${season.season_number}`}
                      className="w-full h-full object-contain"
                      loading="lazy"
                      style={{
                        imageRendering: "auto",
                        filter: "contrast(1.05) brightness(1.04)",
                      }}
                    />
                  ) : (
                    <Layers className="w-10 h-10 text-gray-400" />
                  )}
                </div>
                <span className="text-xs text-primary font-bold mt-1">
                  S{season.season_number}
                </span>
                <span className="text-xs text-gray-100 font-medium w-full text-center truncate" title={season.title || `Saison ${season.season_number}`}>
                  {season.title || `Saison ${season.season_number}`}
                </span>
              </button>
            ))}
          </div>
        ) : (
          <div className="text-gray-400 italic p-4 rounded-lg bg-gray-900/60 border border-gray-800 shadow-inner" role="status">
            Aucune saison disponible pour cette série.
          </div>
        )}
      </div>

      {/* Séparateur professionnel */}
      {!isMobile && (
        <div className="w-[2px] mx-2 bg-gradient-to-b from-transparent via-gray-700/80 to-transparent rounded-full shadow-lg self-stretch" />
      )}

      {/* Episodes */}
      <div className="flex-1 min-w-0">
        {noSeasons ? null : (
          seasonEpisodes.length > 0 ? (
            <div>
              <h3
                className="text-lg font-semibold mb-3 text-gray-200 flex items-center gap-2"
                id="episodes-heading"
              >
                <Play className="inline w-5 h-5 text-primary" />
                Épisodes de la saison&nbsp;
                {
                  seasons.find((s) => s.id === selectedSeasonId)
                    ?.season_number ?? ""
                }
              </h3>
              {/* Nouvelle grille responsive d'épisodes */}
              <div className="grid gap-5 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8">
                {seasonEpisodes.map((ep) => (
                  <MiniEpisodePoster
                    key={ep.id}
                    posterUrl={ep.poster || ep.thumbnail_url || "/placeholder-poster.jpg"}
                    number={ep.episode_number}
                    title={ep.title}
                    onClick={() => router.push(`/series/${id}/watch/${ep.id}`)}
                  />
                ))}
              </div>
            </div>
          ) : (
            <div className="text-gray-400 italic p-4 rounded-lg bg-gray-900/60 border border-gray-800 shadow-inner" role="status">
              Aucun épisode disponible pour cette saison.
            </div>
          )
        )}
      </div>
    </div>
  );
}