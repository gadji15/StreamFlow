"use client";
import React, { useEffect, useId, useState } from "react";
import { Layers, Play } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

// Props : seasons, episodes, id (seriesId), isVIP, isMobile, selectedSeasonId, setSelectedSeasonId, component SeasonEpisodeList, renderSeasonsNavMobile, renderSeasonsNavDesktop
export default function SeasonsEpisodesTab({
  seasons,
  episodes,
  id,
  isVIP,
  isMobile,
  selectedSeasonId,
  setSelectedSeasonId,
  renderSeasonsNavMobile,
  renderSeasonsNavDesktop,
}) {
  const router = useRouter();

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
      if (season) setSeasonAriaMessage(`Saison ${season.number} affichée`);
    }
  }, [selectedSeasonId, seasons]);

  return (
    <div
      className={cn(
        "flex gap-8",
        isMobile ? "flex-col" : "flex-row"
      )}
    >
      {/* Sidebar (desktop) / Accordion (mobile) */}
      <div
        className={cn(
          isMobile ? "w-full" : "w-1/4 min-w-[11rem]"
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
          isMobile
            ? renderSeasonsNavMobile()
            : renderSeasonsNavDesktop()
        ) : (
          <div className="text-gray-400 italic p-4 rounded-lg bg-gray-900/60 border border-gray-800 shadow-inner" role="status">
            Aucune saison disponible pour cette série.
          </div>
        )}
      </div>
      {/* Episodes */}
      <div className="flex-1">
        {!noSeasons ? (
          !noEpisodes ? (
            <div>
              <h3
                className="text-lg font-semibold mb-3 text-gray-200 flex items-center gap-2"
                id="episodes-heading"
              >
                <Play className="inline w-5 h-5 text-primary" />
                Épisodes de la saison&nbsp;
                {
                  seasons.find((s) => s.id === selectedSeasonId)
                    ?.number ?? ""
                }
              </h3>
              <div className="space-y-4">
                {/* Listing épisode custom pour design et accessibilité */}
                {seasonEpisodes.map((ep, idx) => (
                  <div
                    key={ep.id}
                    className="flex items-center gap-4 rounded-lg bg-gray-900/70 border border-gray-800 hover:border-primary transition-all shadow-sm focus-within:ring-2 focus-within:ring-primary/50"
                    tabIndex={0}
                    role="button"
                    aria-label={`Accéder à l'épisode ${ep.episode_number} : ${ep.title}`}
                    onClick={() =>
                      router.push(
                        `/series/${id}/watch/${ep.id}`
                      )
                    }
                    onKeyDown={(e) => {
                      if (
                        e.key === "Enter" ||
                        e.key === " " ||
                        e.key === "Spacebar"
                      ) {
                        router.push(
                          `/series/${id}/watch/${ep.id}`
                        );
                      }
                    }}
                  >
                    {/* Miniature si disponible, sinon icône */}
                    {ep.thumbnail_url ? (
                      <img
                        src={ep.thumbnail_url}
                        alt={
                          ep.title
                            ? `Miniature de l'épisode ${ep.episode_number} - ${ep.title}`
                            : `Miniature de l'épisode ${ep.episode_number}`
                        }
                        className="w-16 h-10 object-cover rounded-md border border-gray-700 bg-black"
                      />
                    ) : (
                      <div className="w-16 h-10 flex items-center justify-center bg-gray-800 rounded-md border border-gray-700">
                        <Play className="w-6 h-6 text-gray-400" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0 py-2">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-primary">
                          Épisode {ep.episode_number}
                        </span>
                        {ep.title && (
                          <span className="text-gray-100 font-medium truncate">
                            {ep.title}
                          </span>
                        )}
                      </div>
                      {ep.description && (
                        <span className="block text-gray-400 text-xs line-clamp-2">
                          {ep.description}
                        </span>
                      )}
                    </div>
                    {ep.duration && (
                      <span className="px-2 py-0.5 bg-gray-800 text-xs rounded text-gray-300 ml-2">
                        {ep.duration}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-gray-400 italic p-4 rounded-lg bg-gray-900/60 border border-gray-800 shadow-inner" role="status">
              Aucun épisode disponible pour cette saison.
            </div>
          )
        ) : null}
      </div>
    </div>
  );
}