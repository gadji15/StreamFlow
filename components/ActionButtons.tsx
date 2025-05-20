import React from "react";
import { Play, Info, Heart, Share } from "lucide-react";
import { Button } from "./ui/button";

/**
 * Ensemble de boutons d'action stylés avec animations.
 */
export default function ActionButtons({
  canWatch,
  videoUrl,
  trailerUrl,
  isFavorite,
  onToggleFavorite,
  onShare,
  onPlay,
}: {
  canWatch: boolean;
  videoUrl?: string;
  trailerUrl?: string;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  onShare: () => void;
  onPlay: () => void;
}) {
  return (
    <div className="flex flex-wrap gap-4">
      <Button
        size="lg"
        disabled={!canWatch || !videoUrl}
        className={
          "transition-all duration-200 shadow-lg hover:scale-105 hover:bg-primary-700 " +
          (!canWatch || !videoUrl ? "opacity-50 cursor-not-allowed" : "")
        }
        onClick={onPlay}
      >
        <Play className="mr-2 h-5 w-5" /> Regarder
      </Button>

      {trailerUrl && (
        <Button
          variant="outline"
          size="lg"
          className="transition-all duration-200 hover:border-primary-500"
          onClick={() => {
            if (trailerUrl.startsWith("http")) {
              window.open(trailerUrl, "_blank", "noopener,noreferrer");
            }
          }}
        >
          <Info className="mr-2 h-5 w-5" /> Bande-annonce
        </Button>
      )}

      <Button
        variant="ghost"
        size="lg"
        className="transition-all duration-200 hover:bg-red-900/30"
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
        size="lg"
        className="transition-all duration-200 hover:bg-blue-900/30"
        onClick={onShare}
      >
        <Share className="mr-2 h-5 w-5" /> Partager
      </Button>
    </div>
  );
}