import React, { useRef, useEffect } from "react";
import { ChevronLeft, ChevronRight, X, Layers } from "lucide-react";
import { cn } from "@/lib/utils";
import EpisodePoster from "./EpisodePoster";
import { AnimatePresence, motion } from "framer-motion";

interface Episode {
  thumbnail_url: string | undefined;
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
  currentEpisodeId?: string;
  triggerRef?: React.RefObject<HTMLElement>;
}

const SeasonModalUser: React.FC<SeasonModalUserProps> = ({
  open,
  onClose,
  seasons,
  selectedSeasonIndex,
  onSeasonChange,
  onEpisodeClick,
  currentEpisodeId,
  triggerRef,
}) => {
  const season = seasons[selectedSeasonIndex];

  // Animation direction
  const [direction, setDirection] = React.useState<"left" | "right">("right");
  const prevSeasonIdx = React.useRef(selectedSeasonIndex);

  // For focus trap
  const modalRef = useRef<HTMLDivElement | null>(null);

  // Store grid column count for navigation
  const [cols, setCols] = React.useState(2);

  // Detect columns on mount/update (responsive)
  useEffect(() => {
    if (!open) return;
    // Try to detect the grid columns when rendered
    setTimeout(() => {
      const grid = modalRef.current?.querySelector(".episode-grid");
      if (grid) {
        const style = window.getComputedStyle(grid);
        const template = style.getPropertyValue("grid-template-columns");
        if (template) {
          setCols(template.split(" ").length);
        }
      }
    }, 60);
  }, [open, selectedSeasonIndex, season?.episodes?.length]);

  useEffect(() => {
    if (selectedSeasonIndex > prevSeasonIdx.current) setDirection("right");
    else if (selectedSeasonIndex < prevSeasonIdx.current) setDirection("left");
    prevSeasonIdx.current = selectedSeasonIndex;
  }, [selectedSeasonIndex]);

  const canGoPrev = selectedSeasonIndex > 0;
  const canGoNext = selectedSeasonIndex < seasons.length - 1;

  // Focus trap + auto-focus on open
  useEffect(() => {
    if (!open || !modalRef.current) return;
    // Focus first focusable element
    const focusable = modalRef.current.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    // Focus the first one after a tick
    setTimeout(() => {
      if (focusable.length) focusable[0].focus();
    }, 30);

    // Trap focus
    const handleFocus = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;
      const els = Array.from(
        modalRef.current!.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )
      ).filter(el => !el.hasAttribute("disabled") && el.tabIndex !== -1);
      if (!els.length) return;
      const first = els[0];
      const last = els[els.length - 1];
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener("keydown", handleFocus);
    return () => window.removeEventListener("keydown", handleFocus);
  }, [open]);

  // Keyboard navigation for seasons
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      // Season navigation
      if (e.key === "ArrowLeft" && canGoPrev) {
        setDirection("left");
        onSeasonChange(selectedSeasonIndex - 1);
      }
      if (e.key === "ArrowRight" && canGoNext) {
        setDirection("right");
        onSeasonChange(selectedSeasonIndex + 1);
      }
      if (e.key === "Escape") {
        onClose();
        // Focus return on close
        setTimeout(() => {
          if (triggerRef?.current) triggerRef.current.focus();
        }, 50);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, selectedSeasonIndex, canGoPrev, canGoNext, onSeasonChange, onClose, triggerRef]);

  // For a11y: label id
  const titleId = `season-modal-title-${season?.id || "x"}`;

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.96, y: 40 },
    visible: { opacity: 1, scale: 1, y: 0 },
    exit: { opacity: 0, scale: 0.96, y: 40 },
  };

  const contentVariants = {
    initial: (direction: "left" | "right") => ({
      opacity: 0,
      x: direction === "right" ? 40 : -40,
      scale: 0.98,
    }),
    animate: { opacity: 1, x: 0, scale: 1, transition: { duration: 0.33, ease: "easeOut" } },
    exit: (direction: "left" | "right") => ({
      opacity: 0,
      x: direction === "right" ? -40 : 40,
      scale: 0.98,
      transition: { duration: 0.27, ease: "easeIn" },
    }),
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          ref={modalRef}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          initial="hidden"
          animate="visible"
          exit="exit"
          variants={modalVariants}
          transition={{ duration: 0.25, ease: "easeInOut" }}
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          tabIndex={-1}
        >
          {/* Modal Card */}
          <motion.div
            className="relative w-full max-w-xs sm:max-w-sm xs:max-w-[85vw] mx-2 rounded-2xl shadow-2xl border border-neutral-800 flex flex-col"
            initial={{ scale: 0.96, opacity: 0, y: 40 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.96, opacity: 0, y: 40 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            onClick={e => e.stopPropagation()}
            style={{
              maxHeight: "60vh",
              width: "100%",
              maxWidth: "85vw",
              background: "rgba(24, 24, 27, 0.68)", // plus transparent
              backdropFilter: "blur(2px)",
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 pt-4 pb-2 border-b border-gray-800 relative">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setDirection("left");
                    canGoPrev && onSeasonChange(selectedSeasonIndex - 1);
                  }}
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
                <span
                  id={titleId}
                  className="flex items-center font-bold text-primary text-lg select-none"
                >
                  <Layers className="w-5 h-5 mr-1" />
                  S{season?.season_number}
                </span>
                <button
                  onClick={() => {
                    setDirection("right");
                    canGoNext && onSeasonChange(selectedSeasonIndex + 1);
                  }}
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
                onClick={() => {
                  onClose();
                  setTimeout(() => {
                    if (triggerRef?.current) triggerRef.current.focus();
                  }, 50);
                }}
                aria-label="Fermer"
                className="p-1 rounded hover:bg-gray-800 transition-colors absolute right-4"
                tabIndex={0}
                type="button"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <AnimatePresence
              custom={direction}
              mode="wait"
            >
              <motion.div
                key={season?.id}
                className="flex-1 flex flex-col"
                custom={direction}
                initial="initial"
                animate="animate"
                exit="exit"
                variants={contentVariants}
                style={{ minHeight: 0 }}
              >
                {/* Season title */}
                <div className="px-4 pt-1 pb-2 text-center">
                  <div className="font-extrabold text-gray-100 text-xl md:text-2xl truncate max-w-full" title={season?.title || `Saison ${season?.season_number}`}>
                    {season?.title || `Saison ${season?.season_number}`}
                  </div>
                </div>
                {/* Episodes grid */}
                <div className="flex-1 overflow-y-auto px-4 pb-4">
                  {season?.episodes && season.episodes.length > 0 ? (
                    <div
                      className="episode-grid grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6"
                      tabIndex={-1}
                    >
                      {season.episodes.map((ep, idx) => (
                        <button
                          key={ep.id}
                          tabIndex={0}
                          className={cn(
                            "text-left focus:outline-none focus:ring-2 focus:ring-primary/80 rounded transition",
                            currentEpisodeId === ep.id && "ring-2 ring-primary/80 ring-offset-2 ring-offset-gray-900"
                          )}
                          onClick={() => onEpisodeClick(ep)}
                          onKeyDown={e => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              onEpisodeClick(ep);
                            }
                            // Navigation grille au clavier
                            if (["ArrowRight", "ArrowLeft", "ArrowDown", "ArrowUp"].includes(e.key)) {
                              e.preventDefault();
                              const total = season.episodes.length;
                              let nextIdx = idx;
                              if (e.key === "ArrowRight") nextIdx = (idx + 1) % total;
                              if (e.key === "ArrowLeft") nextIdx = (idx - 1 + total) % total;
                              if (e.key === "ArrowDown") nextIdx = Math.min(idx + cols, total - 1);
                              if (e.key === "ArrowUp") nextIdx = Math.max(idx - cols, 0);
                              const btns = (e.currentTarget.parentElement?.querySelectorAll("button") || []);
                              (btns[nextIdx] as HTMLElement | undefined)?.focus();
                            }
                          }}
                          aria-label={ep.title ? `Épisode ${ep.episode_number} : ${ep.title}` : `Épisode ${ep.episode_number}`}
                          type="button"
                        >
                          <EpisodePoster
                            posterUrl={ep.thumbnail_url}
                            episodeNumber={ep.episode_number}
                            title={ep.title}
                            onClick={() => onEpisodeClick(ep)}
                          />
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="text-gray-400 italic p-6 rounded-lg bg-gray-900/60 border border-gray-800 shadow-inner text-center">
                      Aucun épisode disponible pour cette saison.
                    </div>
                  )}
                </div>
              </motion.div>
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SeasonModalUser;