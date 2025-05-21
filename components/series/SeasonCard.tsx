import React from "react";
import { Layers } from "lucide-react";
import { cn } from "@/lib/utils";

interface SeasonCardProps {
  posterUrl?: string;
  seasonNumber: number;
  title?: string;
  onClick?: () => void;
  selected?: boolean;
}

const SeasonCard: React.FC<SeasonCardProps> = ({
  posterUrl,
  seasonNumber,
  title,
  onClick,
  selected = false,
}) => {
  return (
    <button
      className={cn(
        "group relative flex flex-col items-center w-full aspect-[2/3] min-w-[120px] max-w-[180px] rounded-xl overflow-hidden shadow-lg border transition-all duration-200 bg-gray-900/80 hover:scale-105 hover:shadow-2xl focus-visible:ring-2 focus-visible:ring-primary cursor-pointer",
        selected
          ? "border-primary ring-2 ring-primary"
          : "border-gray-800 hover:border-primary"
      )}
      aria-label={`Saison ${seasonNumber}${title ? " - " + title : ""}`}
      onClick={onClick}
      tabIndex={0}
      type="button"
    >
      {posterUrl ? (
        <img
          src={posterUrl}
          alt={`Affiche saison ${seasonNumber}`}
          className="w-full h-full object-cover bg-black transition-transform duration-300 group-hover:scale-105"
          draggable={false}
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-gray-800">
          <Layers className="w-10 h-10 text-gray-400" />
        </div>
      )}
      {/* Animation border sur hover */}
      <span className="absolute inset-0 rounded-xl pointer-events-none border-2 border-transparent group-hover:border-primary transition-all duration-200"></span>
      {/* Saison number and title below poster */}
      <div className="w-full flex flex-col items-center mt-2">
        <div className="text-primary font-bold text-base mb-0.5 select-none">
          S{seasonNumber}
        </div>
        <div className="font-bold text-gray-100 text-sm md:text-base truncate max-w-full text-center" title={title || `Saison ${seasonNumber}`}>
          {title || `Saison ${seasonNumber}`}
        </div>
      </div>
    </button>
  );
};

export default SeasonCard;