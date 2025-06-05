"use client";
import { useEffect, useState } from "react";
import { useWatchHistory, WatchHistoryItem } from "@/hooks/use-watch-history";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Loader2, Tv, Film as FilmIcon, PlayCircle } from "lucide-react";

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
  const { history, loading: historyLoading, error: historyError, refresh } = useWatchHistory();

  const [contentMap, setContentMap] = useState<Record<string, ContentData>>({});
  const [loadingContent, setLoadingContent] = useState(false);
  const [filter, setFilter] = useState<"all" | "film" | "episode">("all");

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
      <h1 className="text-2xl font-bold mb-6">Votre historique de visionnage</h1>
      {/* Toggle de filtre */}
      <div className="flex gap-2 mb-6">
        {FILTERS.map(f => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value as "all" | "film" | "episode")}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition border ${
              filter === f.value
                ? "bg-violet-700 text-white border-violet-700"
                : "bg-gray-800 text-gray-300 border-gray-700 hover:bg-violet-900/50"
            }`}
            type="button"
          >
            {f.label}
          </button>
        ))}
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
              <div key={`${type}:${id}:${item.watched_at}`} className="w-full max-w-xs mx-auto">
                <Link href={content.link}>
                  <div className="relative group rounded-lg overflow-hidden shadow bg-gray-900/70 hover:scale-105 transition will-change-transform">
                    <img
                      src={content.backdrop || "/placeholder-backdrop.jpg"}
                      alt={content.title}
                      className="w-full h-32 object-cover object-center"
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