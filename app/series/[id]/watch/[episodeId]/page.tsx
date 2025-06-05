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

  return (
    <>
      {/* Player harmonisé */}
      {/* Debug : log des données épisode */}
      {console.log("EPISODE DEBUG", episode)}
      <div className="w-full max-w-3xl mx-auto my-8">
        <VideoMultiPlayer
          videoUrl={episode?.video_url || undefined}
          streamtapeUrl={episode?.streamtape_url || undefined}
          uqloadUrl={episode?.uqload_url || undefined}
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
        <h2 className="text-xl font-bold mb-2">Séries similaires</h2>
        <p className="text-gray-400 mb-6">Découvrez d'autres séries du même univers ou genre !</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-5">
          {similarSeries.map((serie) => (
            <a
              key={serie.id}
              href={`/series/${serie.id}`}
              className="block group"
            >
              <img
                src={serie.poster || "/placeholder-poster.png"}
                alt={serie.title}
                className="w-full h-56 object-cover rounded-lg group-hover:scale-105 transition"
              />
              <h3 className="mt-2 text-gray-200 font-semibold text-sm">{serie.title}</h3>
              <div className="text-xs text-gray-400">{serie.genre}</div>
            </a>
          ))}
        </div>
      </div>
    </>
  );
}