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
}: ActionButtonsProps) {
  return (
    <div className={`flex flex-wrap gap-2 ${fullWidth ? "flex-col w-full" : ""}`}>
      {canWatch && videoUrl && (
        <Button
          size="lg"
          className={`font-bold ${fullWidth ? "w-full" : ""}`}
          onClick={onPlay}
        >
          <Play className="mr-2 h-5 w-5" /> Regarder
        </Button>
      )}
      {trailerUrl && (
        <Button
          variant="outline"
          className={fullWidth ? "w-full" : ""}
          onClick={() => window.open(trailerUrl, "_blank")}
        >
          <Info className="mr-2 h-5 w-5" /> Bande-annonce
        </Button>
      )}
      <Button
        variant={isFavorite ? "secondary" : "outline"}
        className={fullWidth ? "w-full" : ""}
        onClick={onToggleFavorite}
      >
        <Heart
          className={`mr-2 h-5 w-5 ${
            isFavorite ? "fill-current text-red-500" : ""
          }`}
        />
        {isFavorite ? "Retirer des favoris" : "Ajouter aux favoris"}
      </Button>
      <Button
        variant="ghost"
        className={fullWidth ? "w-full" : ""}
        onClick={onShare}
      >
        <Share className="mr-2 h-5 w-5" /> Partager
      </Button>
    </div>
  );
}