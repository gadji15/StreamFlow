import React from "react";
import { cn } from "@/lib/utils";

interface EpisodePosterProps {
  posterUrl?: string;
  episodeNumber: number;
  title?: string;
  onClick?: () => void;
}

const EpisodePoster: React.FC<EpisodePosterProps> = ({
  posterUrl,
  episodeNumber,
  title,
  onClick,
}) => {
  return (
    <button
      className={cn(
        "relative flex flex-col items-center w-full aspect-[2/3] min-w-[90px] max-w-[140px] rounded-lg overflow-hidden shadow-md border transition-all duration-200 bg-gray-900/80 hover:scale-105 hover:shadow-xl focus-visible:ring-2 focus-visible:ring-primary cursor-pointer"
      )}
      aria-label={`Épisode ${episodeNumber}${title ? " - " + title : ""}`}
      onClick={onClick}
      tabIndex={0}
      type="button"
    >
      <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/70 text-xs font-semibold text-primary shadow z-10">
        E{episodeNumber}
      </div>
      {posterUrl ? (
        <img
          src={posterUrl}
          alt={`Affiche épisode ${episodeNumber}`}
          className="w-full h-full object-contain bg-gray-900 transition-transform duration-300 group-hover:scale-105"
          style={{ backgroundColor: "#18181b", padding: "2px" }}
          draggable={false}
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-gray-800">
          <span className="font-bold text-lg text-gray-400">E{episodeNumber}</span>
        </div>
      )}
      {/* Overlay titre adaptatif */}
      <div className="w-full absolute bottom-0 left-0 px-2 py-2 bg-gradient-to-t from-black/80 via-black/50 to-transparent">
        <div className="font-medium text-gray-100 text-xs truncate" title={title || `Épisode ${episodeNumber}`}>
          {title || `Épisode ${episodeNumber}`}
        </div>
      </div>
    </button>
  );
};

export default EpisodePoster;