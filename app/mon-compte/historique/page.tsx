"use client";
import { useEffect, useState } from "react";
import { useWatchHistory, WatchHistoryItem } from "@/hooks/use-watch-history";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Loader2, Tv, Film as FilmIcon, PlayCircle, Trash2 } from "lucide-react";

type ContentData = {
  id: string;
  title: string;
  backdrop?: string;
  type: "film" | "series" | "episode";
  link: string;
};

const FILTERS = [
  { label: "Tout", value: "all" },
  { label: "Films", value: "film" },
  { label: "Épisodes", value: "episode" },
];

export default function HistoriquePage() {
  const { user } = useSupabaseAuth();
  const { history, loading: historyLoading, error: historyError, refresh, deleteHistoryItem } = useWatchHistory();

  const [contentMap, setContentMap] = useState<Record<string, ContentData>>({});
  const [loadingContent, setLoadingContent] = useState(false);
  const [filter, setFilter] = useState<"all" | "film" | "episode">("all");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Map chaque ligne à {type, id}
  function getTypeAndId(item: WatchHistoryItem): { type: "film" | "series" | "episode", id: string } | null {
    if (item.film_id) return { type: "film", id: item.film_id };
    if (item.series_id) return { type: "series", id: item.series_id };
    if (item.episode_id) return { type: "episode", id: item.episode_id };
    return null;
  }

  // Fetch all content details for items in the history
  useEffect(() => {
    if (!history || history.length === 0) {
      setContentMap({});
      return;
    }
    let cancelled = false;
    async function fetchContent() {
      setLoadingContent(true);
      // Regrouper les ids par type
      const filmIds = history.filter(h => h.film_id).map(h => h.film_id as string);
      const seriesIds = history.filter(h => h.series_id).map(h => h.series_id as string);
      const episodeIds = history.filter(h => h.episode_id).map(h => h.episode_id as string);

      // Nouvelle version : un seul fetch POST dynamique
      let filmsRes: any[] = [], seriesRes: any[] = [], episodesRes: any[] = [];
      try {
        const apiResponse = await fetch("/api/fetch-multiple", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            requests: [
              filmIds.length ? { table: "films", ids: filmIds } : null,
              seriesIds.length ? { table: "series", ids: seriesIds } : null,
              episodeIds.length ? { table: "episodes", ids: episodeIds } : null,
            ].filter(Boolean)
          }),
        });
        const { films = [], series = [], episodes = [] } = await apiResponse.json();
        filmsRes = films;
        seriesRes = series;
        episodesRes = episodes;
      } catch (err) {
        // Vous pouvez afficher une erreur si besoin
        filmsRes = [];
        seriesRes = [];
        episodesRes = [];
      }

      // Build map: key = `${type}:${id}`
      const map: Record<string, ContentData> = {};

      if (filmsRes && Array.isArray(filmsRes)) {
        for (const film of filmsRes) {
          map[`film:${film.id}`] = {
            id: String(film.id),
            title: film.title,
            backdrop: film.backdrop || film.backdrop_url || film.poster,
            type: "film",
            link: `/films/${film.id}`,
          };
        }
      }
      if (seriesRes && Array.isArray(seriesRes)) {
        for (const serie of seriesRes) {
          map[`series:${serie.id}`] = {
            id: String(serie.id),
            title: serie.title,
            backdrop: serie.backdrop || serie.backdrop_url || serie.poster,
            type: "series",
            link: `/series/${serie.id}`,
          };
        }
      }
      if (episodesRes && Array.isArray(episodesRes)) {
        for (const episode of episodesRes) {
          map[`episode:${episode.id}`] = {
            id: String(episode.id),
            title: episode.title ?? `Épisode ${episode.episode_number}`,
            backdrop: episode.backdrop || episode.thumbnail_url || episode.poster,
            type: "episode",
            link: `/series/${episode.series_id}/watch/${episode.id}`,
          };
        }
      }
      if (!cancelled) setContentMap(map);
      setLoadingContent(false);
    }
    fetchContent();
    return () => {
      cancelled = true;
    };
  }, [history]);

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold mb-4">Historique</h1>
        <p className="text-gray-400 mb-6">Vous devez être connecté pour voir votre historique.</p>
        <Button asChild>
          <Link href="/login">Se connecter</Link>
        </Button>
      </div>
    );
  }

  // Filtrage selon le toggle
  const filteredHistory = history.filter(item => {
    const typeAndId = getTypeAndId(item);
    if (!typeAndId) return false;
    if (filter === "all") return true;
    return typeAndId.type === filter;
  });

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-lg sm:text-2xl font-bold mb-6">Votre historique de visionnage</h1>
      {/* Toggle de filtre avec icônes et responsive */}
      <div className="flex gap-1 sm:gap-2 mb-6 justify-center">
        <button
          onClick={() => setFilter("all")}
          className={`px-3 py-1.5 sm:px-6 sm:py-2 rounded-full text-sm sm:text-base font-medium transition border flex items-center gap-1.5 sm:gap-2
            ${filter === "all"
              ? "bg-gray-900 text-primary border-primary shadow"
              : "bg-gray-800 text-gray-300 border-gray-700 hover:bg-primary/20 hover:text-primary"}
          `}
          type="button"
        >
          <span>
            <svg className={`inline-block h-4 w-4 sm:h-5 sm:w-5 transition-colors duration-200 ${filter === "all" ? "text-yellow-400" : "text-gray-400"}`} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M12 2v2m6.364.636l-1.414 1.414M22 12h-2M19.364 19.364l-1.414-1.414M12 22v-2M4.636 19.364l1.414-1.414M2 12h2M4.636 4.636l1.414 1.414" /><circle cx="12" cy="12" r="5" /></svg>
          </span>
          Tout
        </button>
        <button
          onClick={() => setFilter("film")}
          className={`px-3 py-1.5 sm:px-6 sm:py-2 rounded-full text-sm sm:text-base font-medium transition border flex items-center gap-1.5 sm:gap-2
            ${filter === "film"
              ? "bg-gray-900 text-blue-400 border-blue-400 shadow"
              : "bg-gray-800 text-gray-300 border-gray-700 hover:bg-blue-400/20 hover:text-blue-400"}
          `}
          type="button"
        >
          <svg className={`inline-block h-4 w-4 sm:h-5 sm:w-5 transition-colors duration-200 ${filter === "film" ? "text-primary" : "text-gray-400"}`} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><rect x="2" y="7" width="20" height="15" rx="2" /><path d="M16 2l4 5"/><path d="M8 2l-4 5"/></svg>
          Films
        </button>
        <button
          onClick={() => setFilter("episode")}
          className={`px-3 py-1.5 sm:px-6 sm:py-2 rounded-full text-sm sm:text-base font-medium transition border flex items-center gap-1.5 sm:gap-2
            ${filter === "episode"
              ? "bg-gray-900 text-purple-400 border-purple-400 shadow"
              : "bg-gray-800 text-gray-300 border-gray-700 hover:bg-purple-400/20 hover:text-purple-400"}
          `}
          type="button"
        >
          <svg className={`inline-block h-4 w-4 sm:h-5 sm:w-5 transition-colors duration-200 ${filter === "episode" ? "text-purple-400" : "text-gray-400"}`} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polygon points="10 8 16 12 10 16 10 8"/></svg>
          Épisodes
        </button>
      </div>

      {historyLoading || loadingContent ? (
        <div className="flex items-center justify-center py-16 text-gray-400">
          <Loader2 className="animate-spin h-6 w-6 mr-2" /> Chargement de l’historique...
        </div>
      ) : historyError ? (
        <div className="text-red-400 text-center py-10">
          Erreur lors du chargement de l’historique.
          <Button onClick={refresh} className="ml-2">Recharger</Button>
        </div>
      ) : !filteredHistory || filteredHistory.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          Aucun contenu visionné pour le moment.
        </div>
      ) : (
        <div
          className="grid gap-3"
          style={{
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))"
          }}
        >
          {filteredHistory.map((item) => {
            const typeAndId = getTypeAndId(item);
            if (!typeAndId) return null;
            const { type, id } = typeAndId;
            const content = contentMap[`${type}:${id}`];
            if (!content) return null;
            // Progress pour la barre (0-100)
            const progress = Math.min(item.progress ?? 0, 100);
            return (
              <div key={`${type}:${id}:${item.watched_at}`} className="w-full max-w-[320px] mx-auto relative group">
                {/* Bouton supprimer */}
                <button
                  type="button"
                  className="absolute top-2 right-2 z-20 p-1 rounded-full bg-black/70 hover:bg-red-700/90 text-gray-300 hover:text-white transition opacity-70 hover:opacity-100 focus:outline-none"
                  title="Retirer de l'historique"
                  aria-label="Retirer de l'historique"
                  disabled={deletingId === item.id}
                  onClick={async (e) => {
                    e.preventDefault(); // Évite le clic sur la carte/lien
                    setDeletingId(item.id);
                    await deleteHistoryItem(item.id);
                    setDeletingId(null);
                  }}
                >
                  {deletingId === item.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                </button>
                <Link href={content.link}>
                  <div className="relative aspect-[16/9] w-full rounded-lg overflow-hidden shadow bg-gray-900/70 group hover:scale-105 transition will-change-transform">
                    <img
                      src={content.backdrop || "/placeholder-backdrop.jpg"}
                      alt={content.title}
                      className="absolute top-0 left-0 w-full h-full object-cover object-center"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent pointer-events-none" />
                    <div className="absolute bottom-2 left-3 right-3 z-10">
                      <span className="block text-white text-xs font-semibold truncate drop-shadow">{content.title}</span>
                    </div>
                    <div className="absolute top-2 left-2">
                      {content.type === "film" ? (
                        <FilmIcon className="h-5 w-5 text-white" />
                      ) : (
                        <PlayCircle className="h-5 w-5 text-white" />
                      )}
                    </div>
                    {/* Barre de progression violette design */}
                    <div className="absolute bottom-0 left-0 right-0 h-2 bg-gray-700/60">
                      <div
                        className="h-full bg-gradient-to-r from-purple-500 to-violet-500 rounded-full"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <div className="absolute bottom-2 right-3 text-[10px] text-gray-300/90">
                      {item.completed ? <span className="text-green-400">Terminé</span> : `${progress}%`}
                    </div>
                  </div>
                  <div className="mt-1 text-[12px] text-gray-400 text-center">
                    Vu le {format(new Date(item.watched_at), "PPPp", { locale: fr })}
                  </div>
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}