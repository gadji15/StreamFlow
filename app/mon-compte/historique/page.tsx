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
  poster?: string;
  type: "film" | "series" | "episode";
  link: string;
};

export default function HistoriquePage() {
  const { user } = useSupabaseAuth();
  const { history, loading: historyLoading, error: historyError, refresh } = useWatchHistory();

  const [contentMap, setContentMap] = useState<Record<string, ContentData>>({});
  const [loadingContent, setLoadingContent] = useState(false);

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

      // Batch fetch for each type (évite les requêtes multiples)
      const [filmsRes, seriesRes, episodesRes] = await Promise.all([
        filmIds.length
          ? fetch(`/api/fetch-multiple?table=films&ids=${filmIds.join(",")}`).then(r => r.json())
          : [],
        seriesIds.length
          ? fetch(`/api/fetch-multiple?table=series&ids=${seriesIds.join(",")}`).then(r => r.json())
          : [],
        episodeIds.length
          ? fetch(`/api/fetch-multiple?table=episodes&ids=${episodeIds.join(",")}`).then(r => r.json())
          : [],
      ]);

      // Build map: key = `${type}:${id}`
      const map: Record<string, ContentData> = {};

      if (filmsRes && Array.isArray(filmsRes)) {
        for (const film of filmsRes) {
          map[`film:${film.id}`] = {
            id: String(film.id),
            title: film.title,
            poster: film.poster,
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
            poster: serie.poster,
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
            poster: episode.poster || episode.thumbnail_url,
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

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold mb-6">Votre historique de visionnage</h1>
      {historyLoading || loadingContent ? (
        <div className="flex items-center justify-center py-16 text-gray-400">
          <Loader2 className="animate-spin h-6 w-6 mr-2" /> Chargement de l’historique...
        </div>
      ) : historyError ? (
        <div className="text-red-400 text-center py-10">
          Erreur lors du chargement de l’historique.
          <Button onClick={refresh} className="ml-2">Recharger</Button>
        </div>
      ) : !history || history.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          Aucun contenu visionné pour le moment.
        </div>
      ) : (
        <div
          className="grid gap-3"
          style={{
            gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))"
          }}
        >
          {history.map((item) => {
            const typeAndId = getTypeAndId(item);
            if (!typeAndId) return null;
            const { type, id } = typeAndId;
            const content = contentMap[`${type}:${id}`];
            if (!content) return null;
            return (
              <div key={`${type}:${id}:${item.watched_at}`} className="w-[140px] mx-auto">
                <Link href={content.link}>
                  <div className="group block bg-gray-800 rounded-lg overflow-hidden transition-all duration-300 hover:scale-[1.04] hover:shadow-2xl hover:ring-2 hover:ring-purple-400/40 focus-visible:ring-4 focus-visible:ring-purple-400/60 w-full">
                    <div className="relative aspect-[2/3]">
                      <img
                        src={content.poster || "/placeholder-poster.png"}
                        alt={`Affiche de ${content.title}`}
                        className="w-full h-full object-cover transition-all duration-300 group-hover:brightness-90 group-hover:scale-105"
                        loading="lazy"
                        style={{ willChange: 'transform, filter' }}
                      />
                      <div className="absolute top-2 left-2">
                        {content.type === "film" ? (
                          <FilmIcon className="h-5 w-5 text-white drop-shadow animate-fade-in-up" />
                        ) : content.type === "series" ? (
                          <Tv className="h-5 w-5 text-white drop-shadow animate-fade-in-up" />
                        ) : (
                          <PlayCircle className="h-5 w-5 text-white drop-shadow animate-fade-in-up" />
                        )}
                      </div>
                    </div>
                    <div className="p-2 group-hover:bg-gray-900/70 transition-colors duration-200">
                      <h3 className="font-semibold truncate text-xs mb-1 group-hover:text-purple-400 transition-colors duration-200">{content.title}</h3>
                      <p className="text-[11px] text-gray-400 mb-1 capitalize">{content.type}</p>
                      <p className="text-[11px] text-gray-400">
                        Vu le{" "}
                        {format(new Date(item.watched_at), "PPPp", { locale: fr })}
                      </p>
                      {item.completed && (
                        <span className="inline-block text-green-500 text-[10px] mt-1">Terminé</span>
                      )}
                    </div>
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