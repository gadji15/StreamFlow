"use client";
import React, { useState } from "react";
import { Layers } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import SeasonCard from "./SeasonCard";
import SeasonModalUser from "./SeasonModalUser";

// Ajout du typage complet des props
type SeasonsEpisodesTabProps = {
  seasons: any[];
  episodes: any[];
  id: string | undefined;
  isVIP: boolean;
  isMobile: boolean;
  selectedSeasonId: string | null;
  setSelectedSeasonId: React.Dispatch<React.SetStateAction<string | null>>;
  renderSeasonsNavMobile: () => React.ReactElement;
  renderSeasonsNavDesktop: () => React.ReactElement;
};


export default function SeasonsEpisodesTab({
  seasons,
  episodes,
  id, // series id
  isVIP,
  isMobile,
  selectedSeasonId,
  setSelectedSeasonId,
  renderSeasonsNavMobile,
  renderSeasonsNavDesktop,
}: SeasonsEpisodesTabProps) {
  const router = useRouter();

  // Association des épisodes à leur saison correspondante
  const seasonsWithEpisodes = (seasons || []).map((season) => ({
    ...season,
    episodes: (episodes || []).filter((ep) => ep.season_id === season.id),
  }));

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedSeasonIdx, setSelectedSeasonIdx] = useState<number | null>(null);

  // Responsive grid cols
  const seasonGridCols = "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6";

  const handleSeasonClick = (idx: number) => {
    setSelectedSeasonIdx(idx);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setTimeout(() => setSelectedSeasonIdx(null), 200);
  };

  const handleSeasonChange = (idx: number) => {
    setSelectedSeasonIdx(idx);
  };

  const handleEpisodeClick = (episode: any) => {
    router.push(`/series/${id}/watch/${episode.id}`);
    setModalOpen(false);
  };

  return (
    <div className="w-full flex flex-col gap-8">
      <h2 className="text-xl font-bold mb-2 text-gray-100 flex items-center gap-2" id="saisons-heading">
        <Layers className="inline w-6 h-6 text-primary" />
        Saisons
      </h2>
      {(!seasons || seasons.length === 0) ? (
        <div className="text-gray-400 italic p-4 rounded-lg bg-gray-900/60 border border-gray-800 shadow-inner" role="status">
          Aucune saison disponible pour cette série.
        </div>
      ) : (
        <div className={cn("grid gap-6", seasonGridCols)}>
          {seasonsWithEpisodes.map((season, idx) => (
            <SeasonCard
              key={season.id}
              posterUrl={season.poster}
              seasonNumber={season.season_number}
              title={season.title}
              onClick={() => handleSeasonClick(idx)}
              selected={idx === selectedSeasonIdx && modalOpen}
            />
          ))}
        </div>
      )}

      {/* Modal Saison */}
      {selectedSeasonIdx !== null && seasonsWithEpisodes[selectedSeasonIdx] && (
        <SeasonModalUser
          open={modalOpen}
          onClose={handleCloseModal}
          seasons={seasonsWithEpisodes}
          selectedSeasonIndex={selectedSeasonIdx}
          onSeasonChange={handleSeasonChange}
          onEpisodeClick={handleEpisodeClick}
        />
      )}
    </div>
  );
}