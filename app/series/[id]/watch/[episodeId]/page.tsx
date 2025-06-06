"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import SeasonModalUser from "@/components/series/SeasonModalUser";
import { Badge } from "@/components/ui/badge";
import WatchLayout from "@/components/watch/WatchLayout";
import dynamic from "next/dynamic";
const VideoMultiPlayer = dynamic(() => import("@/components/VideoMultiPlayer"), { ssr: false });
import MediaPosterCard from "@/components/MediaPosterCard";
import SeriesCard from "@/components/SeriesCard";
import { useWatchProgress } from "@/components/ui/useWatchProgress";
import { useWatchHistory } from "@/hooks/use-watch-history";
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

  // Hook pour responsive columns (mêmes seuils que ContentSection)
  function useResponsiveColumns() {
    const [columns, setColumns] = useState(5);
    useEffect(() => {
      function handleResize() {
        const width = window.innerWidth;
        if (width < 400) setColumns(2);
        else if (width < 600) setColumns(3);
        else if (width < 900) setColumns(4);
        else if (width < 1080) setColumns(5);
        else if (width < 1400) setColumns(6);
        else if (width < 1800) setColumns(7);
        else setColumns(8);
      }
      handleResize();
      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }, []);
    return columns;
  }
  const columns = useResponsiveColumns();
  const maxSuggestions = columns * 2;

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
        ] = await Promise.all([
          supabase.from("episodes").select("*, streamtape_url, uqload_url, season:season_id(season_number)").eq("id", episodeId).single(),
          supabase.from("series").select("*").eq("id", seriesId).single(),
          supabase.from("seasons").select("id, season_number, poster, title, episodes (*)").eq("series_id", seriesId).order("season_number", { ascending: true }),
        ]);
        const episodeData = episodeRes.data;
        const seriesData = seriesRes.data;
        const seasonsData = seasonsRes.data;

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

        // Suggestions séries similaires : priorité au même genre
        let similar: Series[] = [];
        const genre = seriesData.genre;
        if (genre) {
          const similarRes = await supabase
            .from("series")
            .select("id, title, genre, poster, start_year, end_year")
            .neq("id", seriesId)
            .eq("genre", genre)
            .order("popularity", { ascending: false })
            .limit(maxSuggestions);
          similar = similarRes.data || [];

          // Si pas assez de suggestions, compléter AVEC une deuxième requête SANS le genre (popularité seulement)
          if (similar.length < maxSuggestions) {
            const fallbackRes = await supabase
              .from("series")
              .select("id, title, genre, poster, start_year, end_year")
              .neq("id", seriesId)
              .order("popularity", { ascending: false })
              .limit(maxSuggestions - similar.length);
            // Ajouter seulement les séries non déjà proposées
            const fallbackFiltered = (fallbackRes.data || []).filter(f => 
              !similar.some(s => s.id === f.id)
            );
            similar = similar.concat(fallbackFiltered);
          }
        } else {
          // Fallback populaire
          const similarRes = await supabase
            .from("series")
            .select("id, title, genre, poster, start_year, end_year")
            .neq("id", seriesId)
            .order("popularity", { ascending: false })
            .limit(maxSuggestions);
          similar = similarRes.data || [];
        }

        setSimilarSeries(similar);
      } catch (err: any) {
        if (isMounted) setError(err.message || "Erreur lors du chargement.");
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchAll();
    return () => { isMounted = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seriesId, episodeId, columns]);

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

  // Ajout du suivi de progression pour les épisodes
  const { handleProgress, markAsWatched } = useWatchProgress({
    type: "episode",
    id: episodeId,
  });

  // Récupérer la progression sauvegardée pour cet épisode
  const { history } = useWatchHistory();
  let resumeSeconds: number | undefined = undefined;
  let showResumeHint = false;
  if (history && episode) {
    const hist = history.find(
      (h) => h.episode_id === episodeId && typeof h.progress === "number" && h.progress > 0
    );
    if (hist && episode.duration) {
      // episode.duration est en minutes, il faut convertir en secondes
      const totalSeconds = episode.duration * 60;
      resumeSeconds = Math.floor((hist.progress / 100) * totalSeconds);
      // Éviter la reprise à la toute fin
      if (resumeSeconds > totalSeconds - 3) resumeSeconds = totalSeconds - 3;
      if (resumeSeconds < 0) resumeSeconds = 0;
      // Afficher la notif si progress > 0 et < 98%
      if (hist.progress > 0 && hist.progress < 98) showResumeHint = true;
    }
  }

  return (
    <>
      {/* Notification de reprise */}
      {showResumeHint && resumeSeconds && <ResumeHintToast seconds={resumeSeconds} />}
      {/* Player harmonisé */}
      <div className="w-full max-w-3xl mx-auto my-8">
        <VideoMultiPlayer
          videoUrl={episode?.video_url || undefined}
          streamtapeUrl={episode?.streamtape_url || undefined}
          uqloadUrl={episode?.uqload_url || undefined}
          loading={loading}
          onVideoProgress={handleProgress}
          onIframeActivate={markAsWatched}
          resumeSeconds={resumeSeconds}
        />
      </div>

      {/* Bloc titre/métadonnées harmonisé */}
      {episode && series && (
        <div className="flex flex-wrap items-center gap-3 mb-1 w-full max-w-3xl mx-auto">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mr-3">
            {series.title}
          </h1>
          <span className="text-base px-3 py-1 rounded-xl bg-gray-800/70 text-gray-200 font-medium">
            Saison {episode.season ?? "?"}, Épisode {episode.episode_number ?? "?"}
            <span className="ml-2 text-xs text-gray-400">
              ({
                `S${episode.season !== undefined && episode.season !== null ? String(episode.season).padStart(2, "0") : "??"}E${episode.episode_number !== undefined && episode.episode_number !== null ? String(episode.episode_number).padStart(2, "0") : "??"}`
              })
            </span>
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
      )}

      {/* Bloc durée et navigation épisode */}
      <div className="flex flex-wrap items-center gap-4 text-gray-300 text-sm mb-2 w-full max-w-3xl mx-auto">
        {episode?.duration && (
          <span>
            <b>Durée :</b> {episode.duration} min
          </span>
        )}
        <nav className="flex gap-2 ml-auto" aria-label="Navigation épisodes">
          <button
            className="rounded-full px-4 py-2 text-base shadow hover:scale-105 hover:bg-gray-900/90 transition-all bg-gray-800 text-white border border-gray-700"
            onClick={() => setIsSeasonModalOpen(true)}
            aria-label="Sélectionner saison/épisode"
          >
            Saison/épisode
          </button>
          {previousEpisode && (
            <button
              className="rounded-full px-4 py-2 text-base shadow hover:scale-105 hover:bg-gray-900/90 transition-all bg-gray-800 text-white border border-gray-700"
              onClick={goToPreviousEpisode}
              aria-label="Épisode précédent"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Précédent
            </button>
          )}
          {nextEpisode && (
            <button
              className="rounded-full px-4 py-2 text-base shadow hover:scale-105 hover:bg-gray-900/90 transition-all bg-gray-800 text-white border border-gray-700"
              onClick={goToNextEpisode}
              aria-label="Épisode suivant"
            >
              Suivant
              <ChevronLeft className="h-4 w-4 ml-1 rotate-180" />
            </button>
          )}
        </nav>
      </div>
      <SeasonModalUser
        open={isSeasonModalOpen}
        onClose={() => setIsSeasonModalOpen(false)}
        seasons={seasons}
        selectedSeasonIndex={selectedSeasonIndex}
        onSeasonChange={setSelectedSeasonIndex}
        onEpisodeClick={(ep) => handleEpisodeClick(ep as EpisodeType)}
      />

      {/* Bloc description/synopsis */}
      {episode?.description && (
        <div className="w-full max-w-3xl mx-auto my-6">
          <h2 className="text-base font-semibold mb-2">Synopsis</h2>
          <p className="text-gray-300 whitespace-pre-line">{episode.description}</p>
        </div>
      )}

      {/* Bloc suggestions harmonisé */}
      <div className="w-full max-w-6xl mx-auto my-12">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-2 mb-4">
          <h2 className="text-2xl font-extrabold text-primary flex items-center gap-2 tracking-wide drop-shadow mb-0">
            <span className="inline-block">
              <svg width="24" height="24" fill="none" className="align-middle text-primary"><circle cx="12" cy="12" r="11" stroke="currentColor" strokeWidth="2" /></svg>
            </span>
            Séries similaires
          </h2>
          {series?.genre && (
            (() => {
              const GENRE_SLUGS: Record<string, string> = {
                "Thriller": "thriller",
                "Science-Fiction": "sci-fi",
                "Comédie": "comedy",
                "Drame": "drama",
                "Animation": "animation",
                "Famille": "family",
                "Aventure": "adventure",
                "Documentaire": "documentary",
                // Ajoutez d'autres mappings si nécessaire
              };
              const genreSlug = GENRE_SLUGS[series.genre] ?? (series.genre || "").toLowerCase().replace(/\s+/g, "-");
              return (
                <a
                  href={`/series?genre=${encodeURIComponent(genreSlug)}`}
                  className={`
                    text-sm flex items-center font-medium
                    bg-gradient-to-r from-fuchsia-400 via-pink-400 to-violet-500
                    bg-clip-text text-transparent
                    underline underline-offset-4
                    transition-all duration-300
                    hover:bg-none hover:text-violet-400 hover:scale-105
                    focus:outline-none
                  `}
                  style={{
                    WebkitTextFillColor: 'transparent',
                    background: 'linear-gradient(90deg, #e879f9, #ec4899, #a78bfa)',
                    WebkitBackgroundClip: 'text',
                    padding: 0,
                    border: "none"
                  }}
                >
                  <span className="underline underline-offset-4">
                    Voir tout
                  </span>
                  <svg className="h-4 w-4 ml-1 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                </a>
              );
            })()
          )}
        </div>
        <p className="text-gray-400 mb-6">Découvrez d'autres séries du même univers ou genre !</p>
        <div
          className="grid gap-3"
          style={{
            gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))"
          }}
        >
          {similarSeries.map((serie) => {
            const sy = (serie as any).start_year;
            const ey = (serie as any).end_year;
            let year = "";
            if (sy && ey) year = `${sy} - ${ey}`;
            else if (sy) year = String(sy);
            else if (ey) year = String(ey);
            return (
              <SeriesCard
                key={serie.id}
                series={{
                  id: String(serie.id),
                  title: serie.title,
                  poster: serie.poster,
                  year,
                  isVIP: serie.is_vip ?? false,
                }}
              />
            );
          })}
        </div>
      </div>
    </>
  );
}