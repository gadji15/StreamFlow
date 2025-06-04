"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import SeasonModalUser from "@/components/series/SeasonModalUser";
import { Badge } from "@/components/ui/badge";
import WatchLayout from "@/components/watch/WatchLayout";
import type { Episode as EpisodeType, Season, Series } from "@/types/series";

export default function WatchEpisodePage() {
  const params = useParams();
  const router = useRouter();
  const seriesId = params?.id as string;
  const episodeId = params?.episodeId as string;

  const [episode, setEpisode] = useState<EpisodeType | null>(null);
  const [series, setSeries] = useState<Series | null>(null);
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [selectedSeasonIndex, setSelectedSeasonIndex] = useState(0);
  const [isSeasonModalOpen, setIsSeasonModalOpen] = useState(false);
  const [nextEpisode, setNextEpisode] = useState<EpisodeType | null>(null);
  const [previousEpisode, setPreviousEpisode] = useState<EpisodeType | null>(null);
  const [similarSeries, setSimilarSeries] = useState<Series[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Chargement en parallèle pour le gain de performance
  useEffect(() => {
    let isMounted = true;
    const fetchAll = async () => {
      setLoading(true);
      setError(null);
      try {
        const [
          episodeRes,
          seriesRes,
          seasonsRes,
          similarRes
        ] = await Promise.all([
          supabase.from("episodes").select("*, season:season_id(season_number)").eq("id", episodeId).single(),
          supabase.from("series").select("*").eq("id", seriesId).single(),
          supabase.from("seasons").select("id, season_number, poster, title, episodes (*)").eq("series_id", seriesId).order("season_number", { ascending: true }),
          supabase.from("series").select("id, title, genre, poster").neq("id", seriesId).order("popularity", { ascending: false }).limit(12)
        ]);
        const episodeData = episodeRes.data;
        const seriesData = seriesRes.data;
        const seasonsData = seasonsRes.data;
        const similar = similarRes.data;

        if (!episodeData) throw new Error("Épisode non trouvé");
        if (!seriesData) throw new Error("Série non trouvée");
        if (!seasonsData) throw new Error("Aucune saison trouvée");
        if (!episodeData.published) throw new Error("Cet épisode n'est pas disponible.");

        if (!isMounted) return;
        setEpisode({
          ...episodeData,
          season: episodeData.season?.season_number ?? null,
        });
        setSeries(seriesData);

        const sortedSeasons = seasonsData.map((s: any) => ({
          ...s,
          episodes: (s.episodes || []).sort((a: any, b: any) => a.episode_number - b.episode_number)
        }));
        setSeasons(sortedSeasons);
        const currentSeasonIdx = sortedSeasons.findIndex((s: any) => s.season_number === episodeData.season?.season_number);
        setSelectedSeasonIndex(currentSeasonIdx !== -1 ? currentSeasonIdx : 0);

        const publishedEpisodes = sortedSeasons
          .flatMap((s: any) =>
            (s.episodes || []).map((ep: any) => ({
              ...ep,
              season: s.season_number,
            }))
          )
          .filter((ep: any) => ep.published)
          .sort((a: any, b: any) =>
            a.season !== b.season
              ? a.season - b.season
              : a.episode_number - b.episode_number
          );
        const idx = publishedEpisodes.findIndex((ep: any) => ep.id === episodeId);
        setPreviousEpisode(idx > 0 ? publishedEpisodes[idx - 1] : null);
        setNextEpisode(idx !== -1 && idx < publishedEpisodes.length - 1 ? publishedEpisodes[idx + 1] : null);

        setSimilarSeries(similar || []);
      } catch (err: any) {
        if (isMounted) setError(err.message || "Erreur lors du chargement.");
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchAll();
    return () => { isMounted = false; };
  }, [seriesId, episodeId]);

  // Navigation
  const goToNextEpisode = useCallback(() => {
    if (nextEpisode) router.push(`/series/${seriesId}/watch/${nextEpisode.id}`);
  }, [nextEpisode, router, seriesId]);
  const goToPreviousEpisode = useCallback(() => {
    if (previousEpisode) router.push(`/series/${seriesId}/watch/${previousEpisode.id}`);
  }, [previousEpisode, router, seriesId]);
  const goBackToSeries = useCallback(() => {
    router.push(`/series/${seriesId}`);
  }, [router, seriesId]);
  const handleEpisodeClick = useCallback((episode: EpisodeType) => {
    setIsSeasonModalOpen(false);
    router.push(`/series/${seriesId}/watch/${episode.id}`);
  }, [router, seriesId]);

  // Backdrop
  const backdropUrl =
    episode?.thumbnail_url ||
    series?.poster ||
    "/placeholder-backdrop.jpg";

  return (
    <WatchLayout
      title={
        episode && series
          ? [
              series.title,
              `S${episode.season}${episode.episode_number ? "E" + episode.episode_number : ""}`,
              episode.title,
            ]
              .filter(Boolean)
              .join(" - ")
          : "Lecture épisode"
      }
      seoTitle={
        episode && series
          ? `${series.title} - S${episode.season}E${episode.episode_number} - ${episode.title}`
          : undefined
      }
      videoUrl={episode?.video_url || ""}
      posterUrl={episode?.thumbnail_url}
      backdropUrl={backdropUrl}
      loading={loading}
      error={error || (!episode || !series ? "Épisode ou série introuvable" : undefined)}
      onBack={goBackToSeries}
      backLabel={
        <span className="flex items-center"><ChevronLeft className="h-5 w-5 mr-2" /> Retour à la fiche série</span>
      }
      isVip={series?.is_vip}
      metadata={
        episode && series && (
          <>
            <div className="flex flex-wrap items-center gap-3 mb-1">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mr-3">
                {series.title}
              </h1>
              <span className="text-base px-3 py-1 rounded-xl bg-gray-800/70 text-gray-200 font-medium">
                Saison {episode.season ?? "?"}, Épisode {episode.episode_number ?? "?"} <span className="ml-2 text-xs text-gray-400">({
                  `S${episode.season !== undefined && episode.season !== null ? String(episode.season).padStart(2, "0") : "??"}E${episode.episode_number !== undefined && episode.episode_number !== null ? String(episode.episode_number).padStart(2, "0") : "??"}` 
                })</span>
              </span>
              {series.genre && (
                <span className="text-base px-3 py-1 rounded-xl bg-primary/20 text-primary font-medium">
                  {series.genre}
                </span>
              )}
              {series.is_vip && (
                <Badge
                  variant="secondary"
                  className="text-amber-400 bg-amber-900/60 border-amber-800/80 px-4 py-1 text-lg ml-1"
                >
                  VIP
                </Badge>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-4 text-gray-300 text-sm mb-2">
              {episode.duration && (
                <span>
                  <b>Durée :</b> {episode.duration} min
                </span>
              )}
            </div>
            <div className="my-2">
              <span
                className="inline-block px-4 py-2 rounded-lg border-2 border-primary bg-primary/20 text-primary font-bold text-lg shadow"
                style={{ letterSpacing: "0.03em" }}
              >
                Saison {episode.season ?? "?"}, Épisode {episode.episode_number ?? "?"}
                <span className="ml-2 text-xs text-primary font-mono">
                  ({
                    `S${episode.season !== undefined && episode.season !== null ? String(episode.season).padStart(2, "0") : "??"}E${episode.episode_number !== undefined && episode.episode_number !== null ? String(episode.episode_number).padStart(2, "0") : "??"}`
                  })
                </span>
                <span className="ml-2 text-primary font-normal">{episode.title && `- ${episode.title}`}</span>
              </span>
            </div>
          </>
        )
      }
      description={episode?.description}
      suggestions={
        similarSeries.map((serie) => ({
          id: serie.id,
          title: serie.title,
          genre: serie.genre,
          poster: serie.poster || "/placeholder-poster.png",
          link: `/series/${serie.id}`,
        }))
      }
      suggestionsTitle="Séries similaires"
      suggestionsSubtitle="Découvrez d'autres séries du même univers ou genre !"
      suggestionsLink={
        series?.genre ? `/series?genre=${encodeURIComponent(series.genre)}` : undefined
      }
      suggestionsLinkLabel="Voir tout"
      afterPlayer={
        // Navigation épisodes
        <nav className="w-full flex justify-between items-center mt-4 gap-2" aria-label="Navigation épisodes">
          <button
            className="rounded-full px-4 py-2 text-base shadow hover:scale-105 hover:bg-gray-900/90 transition-all bg-gray-800 text-white border border-gray-700"
            onClick={() => setIsSeasonModalOpen(true)}
            aria-label="Sélectionner saison/épisode"
          >
            saison/épisode
          </button>
          <div className="flex gap-2">
            {previousEpisode && (
              <button
                className="rounded-full px-4 py-2 text-base shadow hover:scale-105 hover:bg-gray-900/90 transition-all bg-gray-800 text-white border border-gray-700"
                onClick={goToPreviousEpisode}
                aria-label="Épisode précédent"
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                P
              </button>
            )}
            {nextEpisode && (
              <button
                className="rounded-full px-4 py-2 text-base shadow hover:scale-105 hover:bg-gray-900/90 transition-all bg-gray-800 text-white border border-gray-700"
                onClick={goToNextEpisode}
                aria-label="Épisode suivant"
              >
                S
                <ChevronLeft className="h-4 w-4 ml-1 rotate-180" />
              </button>
            )}
          </div>
          <SeasonModalUser
            open={isSeasonModalOpen}
            onClose={() => setIsSeasonModalOpen(false)}
            seasons={seasons}
            selectedSeasonIndex={selectedSeasonIndex}
            onSeasonChange={setSelectedSeasonIndex}
            onEpisodeClick={(ep) => handleEpisodeClick(ep as EpisodeType)}
          />
        </nav>
      }
    />
  );
}