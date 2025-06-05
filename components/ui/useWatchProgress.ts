import { useRef, useCallback } from "react";
import { useWatchHistory } from "@/hooks/use-watch-history";

/**
 * Utilitaire pour tracker la progression de lecture d'une vidéo
 * et enregistrer dans l'historique (films ou épisodes).
 *
 * @param options
 *   - type: "film" | "episode"
 *   - id: string (film_id ou episode_id)
 */
export function useWatchProgress({ type, id }: { type: "film" | "episode"; id: string }) {
  const { upsertHistory } = useWatchHistory();
  const lastSavedProgress = useRef(0);

  // Appeler cette fonction à chaque update de temps
  const handleProgress = useCallback(
    (current: number, duration: number) => {
      if (!duration || !current) return;
      const progressPct = Math.min(Math.round((current / duration) * 100), 100);
      // N'enregistrer que si le changement est significatif (tous les 10%)
      if (progressPct - lastSavedProgress.current < 10 && progressPct !== 100) return;
      lastSavedProgress.current = progressPct;
      upsertHistory({
        film_id: type === "film" ? id : undefined,
        episode_id: type === "episode" ? id : undefined,
        progress: progressPct,
        completed: progressPct >= 98,
      });
    },
    [type, id, upsertHistory]
  );

  // Appeler ceci pour marquer comme "vu" (iframe) : à l'activation ou à la fermeture
  const markAsWatched = useCallback(() => {
    upsertHistory({
      film_id: type === "film" ? id : undefined,
      episode_id: type === "episode" ? id : undefined,
      progress: 100,
      completed: true,
    });
  }, [type, id, upsertHistory]);

  return { handleProgress, markAsWatched };
}