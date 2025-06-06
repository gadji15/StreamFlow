import React from "react";
import { Play, Info, Heart, Share } from "lucide-react";
import { Button } from "./ui/button";

/**
 * Ensemble de boutons d'action stylés avec animations, adaptatif mobile/desktop.
 */
interface ActionButtonsProps {
  canWatch: boolean;
  videoUrl?: string;
  trailerUrl?: string;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  onShare: () => void;
  onPlay: () => void;
  fullWidth?: boolean;
}

export default function ActionButtons({
  canWatch,
  videoUrl,
  trailerUrl,
  isFavorite,
  onToggleFavorite,
  onShare,
  onPlay,
  fullWidth = false,
  iconsOnly = false, // nouvelle prop pour mobile
}: ActionButtonsProps & { iconsOnly?: boolean }) {
  return (
    <div className={`flex flex-wrap gap-2 ${fullWidth ? "flex-col w-full" : ""}`}>
      {canWatch && videoUrl && (
        <Button
          size={iconsOnly ? "icon" : "lg"}
          className={`font-bold ${fullWidth ? "w-full" : ""} ${iconsOnly ? "p-2 sm:p-4" : ""}`}
          onClick={onPlay}
          aria-label="Regarder"
        >
          <Play className={`${iconsOnly ? "h-5 w-5 sm:h-6 sm:w-6" : "mr-2 h-5 w-5"}`} />
          {!iconsOnly && "Regarder"}
        </Button>
      )}
      {trailerUrl && (
        <Button
          variant="outline"
          size={iconsOnly ? "icon" : "default"}
          className={`${fullWidth ? "w-full" : ""} ${iconsOnly ? "p-2 sm:p-4" : ""}`}
          onClick={() => window.open(trailerUrl, "_blank")}
          aria-label="Bande-annonce"
        >
          <Info className={`${iconsOnly ? "h-5 w-5 sm:h-6 sm:w-6" : "mr-2 h-5 w-5"}`} />
          {!iconsOnly && "Bande-annonce"}
        </Button>
      )}
      <Button
        variant={isFavorite ? "secondary" : "outline"}
        size={iconsOnly ? "icon" : "default"}
        className={`${fullWidth ? "w-full" : ""} ${iconsOnly ? "p-2 sm:p-4" : ""}`}
        onClick={onToggleFavorite}
        aria-label={isFavorite ? "Retirer des favoris" : "Ajouter aux favoris"}
      >
        <Heart
          className={`${
            iconsOnly ? "h-5 w-5 sm:h-6 sm:w-6" : "mr-2 h-5 w-5"
          } ${isFavorite ? "fill-current text-red-500" : ""}`}
        />
        {!iconsOnly && (isFavorite ? "Retirer des favoris" : "Ajouter aux favoris")}
      </Button>
      <Button
        variant="ghost"
        size={iconsOnly ? "icon" : "default"}
        className={`${fullWidth ? "w-full" : ""} ${iconsOnly ? "p-2 sm:p-4" : ""}`}
        onClick={onShare}
        aria-label="Partager"
      >
        <Share className={`${iconsOnly ? "h-5 w-5 sm:h-6 sm:w-6" : "mr-2 h-5 w-5"}`} />
        {!iconsOnly && "Partager"}
      </Button>
    </div>
  );
}