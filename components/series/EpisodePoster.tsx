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
        // Affichage poster vrai, plus grand, net et responsive
        "relative flex flex-col items-center w-full aspect-[2/3] min-w-[120px] max-w-[220px] md:max-w-[170px] rounded-xl overflow-hidden shadow-lg border transition-all duration-200 bg-gray-900/80 hover:scale-105 hover:shadow-2xl focus-visible:ring-2 focus-visible:ring-primary cursor-pointer"
      )}
      aria-label={`Épisode ${episodeNumber}${title ? " - " + title : ""}`}
      onClick={onClick}
      tabIndex={0}
      type="button"
      style={{
        // Permet au poster d'occuper l'espace vertical en gardant le ratio
        flex: "1 1 0",
      }}
    >
      {/* Etiquette épisode */}
      <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/70 text-xs font-semibold text-primary shadow z-10">
        E{episodeNumber}
      </div>
      {posterUrl ? (
        <img
          src={posterUrl}
          alt={`Poster épisode ${episodeNumber}`}
          className="w-full h-full object-contain bg-black transition-transform duration-300 group-hover:scale-105"
          draggable={false}
          style={{
            // On force le contenu à ne pas être crop, à toujours afficher tout le poster
            objectFit: "contain",
            objectPosition: "center",
          }}
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-gray-800">
          <span className="font-bold text-lg text-gray-400">E{episodeNumber}</span>
        </div>
      )}
      {/* Overlay titre adaptatif */}
      <div className="w-full absolute bottom-0 left-0 px-2 py-3 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
        <div className="font-semibold text-gray-100 text-xs md:text-sm truncate" title={title || `Épisode ${episodeNumber}`}>
          {title || `Épisode ${episodeNumber}`}
        </div>
      </div>
      {/* Effet border animé */}
      <span className="absolute inset-0 rounded-xl pointer-events-none border-2 border-transparent group-hover:border-primary transition-all duration-200"></span>
    </button>
  );
};

export default EpisodePoster;