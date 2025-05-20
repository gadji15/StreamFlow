"use client";
import React, { useEffect, useId, useState } from "react";
import { Layers, Play } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import EpisodeCard from "./EpisodeCard";
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
        "flex gap-8",
        isMobile ? "flex-col" : "flex-row"
      )}
    >
      {/* Saisons en cards */}
      <div
        className={cn(
          isMobile ? "w-full mb-4" : "w-1/3 min-w-[13rem] max-w-md"
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
          <div className={cn("grid gap-4", seasonGridCols)}>
            {seasons.map((season) => (
              <button
                key={season.id}
                onClick={() => setSelectedSeasonId(season.id)}
                className={cn(
                  "group relative flex flex-col items-center border rounded-xl overflow-hidden shadow transition-all outline-none focus-visible:ring-2 focus-visible:ring-primary cursor-pointer bg-gray-900/80 hover:border-primary",
                  season.id === selectedSeasonId
                    ? "border-primary ring-2 ring-primary"
                    : "border-gray-800"
                )}
                aria-current={season.id === selectedSeasonId}
                aria-label={`Saison ${season.season_number}${season.title ? " - " + season.title : ""}`}
              >
                {/* Poster saison */}
<div className="w-full aspect-[2/3] min-h-[120px] max-h-[180px] rounded-lg overflow-hidden bg-gray-900 relative flex-shrink-0 transition-all group-hover:scale-105">
  {season.poster ? (
    <img
      src={season.poster}
      alt={`Affiche saison ${season.season_number}`}
      className="w-full h-full object-cover transition-all"
    />
  ) : (
    <div className="w-full h-full flex items-center justify-center bg-gray-800">
      <Layers className="w-10 h-10 text-gray-400" />
    </div>
  )}
  {/* Overlay numéro et titre */}
  <div className={cn(
    "absolute top-2 left-2 px-2 py-0.5 rounded bg-black/60 text-xs font-semibold text-primary shadow",
    season.id === selectedSeasonId ? "bg-primary/80 text-white" : ""
  )}>
    S{season.season_number}
  </div>
  <div className="w-full px-2 py-2 bg-gradient-to-t from-gray-900/90 via-gray-900/70 to-transparent absolute bottom-0 left-0">
    <div className="font-bold text-gray-100 text-xs sm:text-sm truncate">
      {season.title || `Saison ${season.season_number}`}
    </div>
    {season.episode_count && (
      <div className="text-[11px] sm:text-xs text-gray-400">
        {season.episode_count} épisode{season.episode_count > 1 ? "s" : ""}
      </div>
    )}
    {season.air_date && (
      <div className="text-[11px] sm:text-xs text-gray-500">
        {season.air_date}
      </div>
    )}
  </div>
</div>
                  {season.episode_count && (
                    <div className="text-xs text-gray-400">
                      {season.episode_count} épisode{season.episode_count > 1 ? "s" : ""}
                    </div>
                  )}
                  {season.air_date && (
                    <div className="text-xs text-gray-500">
                      {season.air_date}
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="text-gray-400 italic p-4 rounded-lg bg-gray-900/60 border border-gray-800 shadow-inner" role="status">
            Aucune saison disponible pour cette série.
          </div>
        )}
      </div>
      {/* Episodes */}
      <div className="flex-1">
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
              <div className="space-y-4">
                {seasonEpisodes.map((ep) => (
                  <EpisodeCard
                    key={ep.id}
                    episode={{
                      ...ep,
                      thumbnail_url: ep.poster || ep.thumbnail_url, // compatibilité poster ou thumbnail
                    }}
                    watched={isWatched(ep.id)}
                    loadingWatched={loadingWatched}
                    isVIP={isVIP}
                    user={user}
                    onMarkWatched={markWatched}
                    onUnmarkWatched={unmarkWatched}
                    onWatch={() => router.push(`/series/${id}/watch/${ep.id}`)}
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