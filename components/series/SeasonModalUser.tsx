import React from "react";
import { ChevronLeft, ChevronRight, X, Layers } from "lucide-react";
import { cn } from "@/lib/utils";
import EpisodePoster from "./EpisodePoster";
import { AnimatePresence, motion } from "framer-motion";

interface Episode {
  id: string;
  episode_number: number;
  poster?: string;
  title?: string;
}

interface Season {
  id: string;
  season_number: number;
  poster?: string;
  title?: string;
  episodes: Episode[];
}

interface SeasonModalUserProps {
  open: boolean;
  onClose: () => void;
  seasons: Season[];
  selectedSeasonIndex: number;
  onSeasonChange: (index: number) => void;
  onEpisodeClick: (episode: Episode) => void;
}

const SeasonModalUser: React.FC<SeasonModalUserProps> = ({
  open,
  onClose,
  seasons,
  selectedSeasonIndex,
  onSeasonChange,
  onEpisodeClick,
}) => {
  const season = seasons[selectedSeasonIndex];

  // Navigation
  const canGoPrev = selectedSeasonIndex > 0;
  const canGoNext = selectedSeasonIndex < seasons.length - 1;

  // Keyboard navigation
  React.useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft" && canGoPrev) onSeasonChange(selectedSeasonIndex - 1);
      if (e.key === "ArrowRight" && canGoNext) onSeasonChange(selectedSeasonIndex + 1);
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, selectedSeasonIndex, canGoPrev, canGoNext, onSeasonChange, onClose]);

  // Animation variants for framer-motion
  const modalVariants = {
    hidden: { opacity: 0, scale: 0.96, y: 40 },
    visible: { opacity: 1, scale: 1, y: 0 },
    exit: { opacity: 0, scale: 0.96, y: 40 },
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          initial="hidden"
          animate="visible"
          exit="exit"
          variants={modalVariants}
          transition={{ duration: 0.25, ease: "easeInOut" }}
          role="dialog"
          aria-modal="true"
          tabIndex={-1}
        >
          {/* Modal Card */}
          <motion.div
            className="relative w-full max-w-md sm:max-w-sm xs:max-w-[92vw] mx-2 rounded-2xl shadow-2xl border border-neutral-800 flex flex-col"
            initial={{ scale: 0.96, opacity: 0, y: 40 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.96, opacity: 0, y: 40 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            onClick={e => e.stopPropagation()}
            style={{
              maxHeight: "70vh",
              width: "100%",
              maxWidth: "92vw",
              background: "rgba(24, 24, 27, 0.85)", // bg-neutral-900/85 avec transparence
              backdropFilter: "blur(2px)",
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 pt-4 pb-2 border-b border-gray-800 relative">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => canGoPrev && onSeasonChange(selectedSeasonIndex - 1)}
                  disabled={!canGoPrev}
                  aria-label="Saison précédente"
                  className={cn(
                    "p-1 rounded hover:bg-gray-800 transition-colors",
                    !canGoPrev && "opacity-40 cursor-not-allowed"
                  )}
                  tabIndex={0}
                  type="button"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <span className="flex items-center font-bold text-primary text-lg select-none">
                  <Layers className="w-5 h-5 mr-1" />
                  S{season?.season_number}
                </span>
                <button
                  onClick={() => canGoNext && onSeasonChange(selectedSeasonIndex + 1)}
                  disabled={!canGoNext}
                  aria-label="Saison suivante"
                  className={cn(
                    "p-1 rounded hover:bg-gray-800 transition-colors",
                    !canGoNext && "opacity-40 cursor-not-allowed"
                  )}
                  tabIndex={0}
                  type="button"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </div>
              <button
                onClick={onClose}
                aria-label="Fermer"
                className="p-1 rounded hover:bg-gray-800 transition-colors absolute right-4"
                tabIndex={0}
                type="button"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Season title */}
            <div className="px-4 pt-1 pb-2 text-center">
              <div className="font-extrabold text-gray-100 text-xl md:text-2xl truncate max-w-full" title={season?.title || `Saison ${season?.season_number}`}>
                {season?.title || `Saison ${season?.season_number}`}
              </div>
            </div>

            {/* Episodes grid */}
            <div className="flex-1 overflow-y-auto px-4 pb-4">
              {season?.episodes && season.episodes.length > 0 ? (
                <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                  {season.episodes.map((ep) => (
                    <EpisodePoster
                      key={ep.id}
                      posterUrl={ep.poster}
                      episodeNumber={ep.episode_number}
                      title={ep.title}
                      onClick={() => onEpisodeClick(ep)}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-gray-400 italic p-6 rounded-lg bg-gray-900/60 border border-gray-800 shadow-inner text-center">
                  Aucun épisode disponible pour cette saison.
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SeasonModalUser;