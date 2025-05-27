"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { VideoPlayer } from "@/components/video-player";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import LoadingScreen from "@/components/loading-screen";
import SeasonModalUser from "@/components/series/SeasonModalUser";
import Footer from "@/components/footer";
import { supabase } from "@/lib/supabaseClient";
import { ChevronLeft, ListPlus } from "lucide-react";

type Episode = {
  id: string;
  title: string;
  description: string;
  season: number;
  episode_number: number;
  duration: number;
  is_vip?: boolean;
  published?: boolean;
  video_url?: string;
  thumbnail_url?: string;
};

type Season = {
  id: string;
  season_number: number;
  poster?: string;
  title?: string;
  episodes: Episode[];
};

type Series = {
  id: string;
  title: string;
  poster?: string;
  genre?: string;
  is_vip?: boolean;
};

export default function WatchEpisodePage() {
  const params = useParams();
  const router = useRouter();
  const seriesId = params?.id as string;
  const episodeId = params?.episodeId as string;

  // States principaux
  const [episode, setEpisode] = useState<Episode | null>(null);
  const [series, setSeries] = useState<Series | null>(null);
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [selectedSeasonIndex, setSelectedSeasonIndex] = useState(0);
  const [isSeasonModalOpen, setIsSeasonModalOpen] = useState(false);
  const [nextEpisode, setNextEpisode] = useState<Episode | null>(null);
  const [similarSeries, setSimilarSeries] = useState<Series[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Data loading
  useEffect(() => {
    const loadEpisodePageData = async () => {
      if (!seriesId || !episodeId) return;
      setIsLoading(true);
      setError(null);

      try {
        // 1. Charger l'épisode courant
        const { data: episodeData, error: epErr } = await supabase
          .from("episodes")
          .select("*")
          .eq("id", episodeId)
          .single();

        if (epErr || !episodeData) {
          setError("Épisode non trouvé.");
          setIsLoading(false);
          return;
        }

        if (!episodeData.published) {
          setError("Cet épisode n'est pas disponible.");
          setIsLoading(false);
          return;
        }

        setEpisode({ ...episodeData });

        // 2. Charger la série
        const { data: seriesData } = await supabase
          .from("series")
          .select("*")
          .eq("id", seriesId)
          .single();

        if (seriesData) {
          setSeries(seriesData);
        }

        // 3. Charger toutes les saisons de la série avec leurs épisodes
        const { data: seasonsData } = await supabase
          .from("seasons")
          .select("id, season_number, poster, title, episodes (*)")
          .eq("series_id", seriesId)
          .order("season_number", { ascending: true });

        if (seasonsData) {
          setSeasons(
            seasonsData.map((s: any) => ({
              ...s,
              episodes: (s.episodes || []).sort(
                (a: any, b: any) => a.episode_number - b.episode_number
              ),
            }))
          );
          // Sélectionner la bonne saison par défaut
          const currentSeasonIdx = seasonsData.findIndex(
            (s: any) => s.season_number === episodeData.season
          );
          setSelectedSeasonIndex(currentSeasonIdx !== -1 ? currentSeasonIdx : 0);
        }

        // 4. Séries similaires (exemple basique)
        const { data: similar } = await supabase
          .from("series")
          .select("*")
          .neq("id", seriesId)
          .order("popularity", { ascending: false })
          .limit(12);
        setSimilarSeries(similar || []);

        // 5. Épisode suivant (dans la saison ou la série)
        if (seasonsData) {
          const allEpisodes = seasonsData.flatMap((s: any) => s.episodes || []);
          const sortedEpisodes = allEpisodes
            .filter((ep: any) => ep.published)
            .sort((a: any, b: any) =>
              a.season !== b.season
                ? a.season - b.season
                : a.episode_number - b.episode_number
            );
          const currentIdx = sortedEpisodes.findIndex(
            (ep: any) => ep.id === episodeId
          );
          if (currentIdx !== -1 && currentIdx < sortedEpisodes.length - 1) {
            setNextEpisode(sortedEpisodes[currentIdx + 1]);
          }
        }
      } catch (error) {
        setError("Erreur lors du chargement des données.");
      } finally {
        setIsLoading(false);
      }
    };

    loadEpisodePageData();
  }, [seriesId, episodeId]);

  // Handlers navigation
  const goToNextEpisode = () => {
    if (nextEpisode) {
      router.push(`/series/${seriesId}/watch/${nextEpisode.id}`);
    }
  };

  const goBackToSeries = () => {
    router.push(`/series/${seriesId}`);
  };

  const handleEpisodeClick = (ep: Episode) => {
    setIsSeasonModalOpen(false);
    router.push(`/series/${seriesId}/watch/${ep.id}`);
  };

  // Loading
  if (isLoading) {
    return <LoadingScreen />;
  }

  // Error
  if (error || !episode || !series) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-black/90 px-4">
        <div className="bg-red-900/50 border border-red-700 rounded-lg p-6 max-w-md w-full text-center">
          <h2 className="text-2xl font-bold mb-2">Erreur</h2>
          <p className="text-gray-300">{error || "Épisode non trouvé"}</p>
          <Button onClick={goBackToSeries} className="mt-4 rounded-2xl text-lg px-6 py-3">
            <ChevronLeft className="h-5 w-5 mr-2" /> Retour à la fiche série
          </Button>
        </div>
      </div>
    );
  }

  // Immersive backdrop
  const backdropUrl =
    episode.thumbnail_url ||
    series.poster ||
    "/placeholder-backdrop.jpg";

  return (
    <div className="relative min-h-screen bg-black text-white flex flex-col justify-center items-center overflow-x-hidden">
      {/* Backdrop */}
      {backdropUrl && (
        <div className="fixed inset-0 z-0 w-full h-full">
          <img
            src={backdropUrl}
            alt={`Backdrop de ${series.title}`}
            className="w-full h-full object-cover object-center blur-md brightness-50 scale-105 transition-all duration-500"
            draggable={false}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/40 to-black/90" />
        </div>
      )}

      {/* Main Content */}
      <div className="relative z-10 w-full max-w-4xl mx-auto pt-24 pb-10 px-2 sm:px-6 flex flex-col items-center">
        {/* Retour bouton flottant */}
        <Button
          variant="secondary"
          className="absolute top-6 left-2 sm:left-6 rounded-full shadow-lg bg-black/70 text-lg px-5 py-3 hover:scale-105 hover:bg-black/90 transition-all"
          onClick={goBackToSeries}
        >
          <ChevronLeft className="h-5 w-5 mr-2" />
          Retour à la fiche série
        </Button>

        {/* Player */}
        <div className="w-full max-w-3xl aspect-video rounded-2xl shadow-2xl overflow-hidden bg-black mt-8 animate-fadeInUp">
          <VideoPlayer
            src={episode.video_url || ""}
            poster={episode.thumbnail_url}
            title={
              [
                series.title,
                `S${episode.season}${episode.episode_number ? "E" + episode.episode_number : ""}`,
                episode.title,
              ]
                .filter(Boolean)
                .join(" - ")
            }
            autoPlay
            onEnded={nextEpisode ? goToNextEpisode : undefined}
            nextEpisode={
              nextEpisode
                ? {
                    title: nextEpisode.title,
                    onPlay: goToNextEpisode,
                  }
                : undefined
            }
          />
        </div>

        {/* Modal navigation saisons/épisodes */}
        <div className="w-full flex justify-end mt-4">
          <Button
            variant="outline"
            className="rounded-full px-4 py-2 text-base shadow hover:scale-105 hover:bg-gray-900/90 transition-all"
            onClick={() => setIsSeasonModalOpen(true)}
          >
            Sélectionner saison/épisode
          </Button>
        </div>
        <SeasonModalUser
          open={isSeasonModalOpen}
          onClose={() => setIsSeasonModalOpen(false)}
          seasons={seasons}
          selectedSeasonIndex={selectedSeasonIndex}
          onSeasonChange={setSelectedSeasonIndex}
          onEpisodeClick={handleEpisodeClick}
        />

        {/* Metadata */}
        <section className="w-full max-w-3xl mx-auto mt-8 bg-gray-900/80 backdrop-blur-lg rounded-2xl shadow-lg px-6 py-6 flex flex-col gap-2 animate-fadeInUp">
          <div className="flex flex-wrap items-center gap-3 mb-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mr-3">
              {series.title}
            </h1>
            <span className="text-base px-3 py-1 rounded-xl bg-gray-800/50 text-gray-200 font-medium">
              Saison {episode.season}, Épisode {episode.episode_number}
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
          <p className="text-gray-200 text-base whitespace-pre-line mt-1">{episode.description}</p>
        </section>

        {/* Séries similaires */}
        <section className="w-full max-w-6xl mx-auto mt-10 animate-fadeInUp">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-xl font-bold">Séries similaires</h2>
              <p className="text-gray-400 text-sm mt-1">Découvrez d'autres séries du même univers ou genre&nbsp;!</p>
            </div>
            {/* Optionnel : bouton voir tout vers la catégorie/genre de la série */}
            {series.genre && (
              <Link
                href={`/series?genre=${encodeURIComponent(series.genre)}`}
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
                <span className="underline underline-offset-4">Voir tout</span>
              </Link>
            )}
          </div>
          <div
            className={`
              w-full
              [display:grid]
              gap-3
              [grid-template-columns:repeat(auto-fit,minmax(140px,1fr))]
            `}
            style={{
              gridAutoRows: "1fr",
              maxHeight: "calc(2 * 210px + 1.5rem)", // 2 rows max
              overflow: "hidden"
            }}
          >
            {similarSeries.slice(0, 12).map((serie, idx) => (
              <Link
                key={serie.id}
                href={`/series/${serie.id}`}
                className="
                  bg-gray-800 overflow-hidden transition-transform hover:scale-105 group
                  flex flex-col items-center
                  rounded-md
                  sm:rounded-lg md:rounded-xl
                  h-full
                "
                style={{
                  opacity: 0,
                  animation: `fadeInUp 0.54s cubic-bezier(.23,1.02,.25,1) forwards`,
                  animationDelay: `${idx * 0.06}s`,
                }}
              >
                <div
                  className="
                    relative aspect-[2/3]
                    w-full
                    h-full
                    flex flex-col items-center
                  "
                >
                  <img
                    src={serie.poster || "/placeholder-poster.png"}
                    alt={serie.title}
                    className="
                      w-full h-full object-cover transition-all duration-300
                      rounded-md
                      sm:rounded-lg
                      md:rounded-xl
                    "
                    onError={e => {
                      (e.target as HTMLImageElement).src = "/placeholder-poster.png";
                    }}
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <rect x="4" y="4" width="16" height="16" rx="2" strokeWidth="2" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 8h8v8H8z" />
                    </svg>
                  </div>
                </div>
                <div className="flex flex-col items-center w-full px-1 pb-1 pt-1">
                  <h3 className="
                    truncate font-medium w-full text-center
                    text-xs
                    sm:text-sm
                    md:text-base
                  ">{serie.title}</h3>
                  <p className="text-[11px] text-gray-400 w-full text-center">
                    {serie.genre || ""}
                  </p>
                </div>
              </Link>
            ))}
            {similarSeries.length === 0 && (
              <div className="text-gray-400 py-8 text-center w-full">
                Aucune suggestion pour le moment.
              </div>
            )}
          </div>
        </section>
      </div>
    <Footer />
      {/* Animation keyframes */}
      <style>{`
        @keyframes fadeInUp {
          0% {
            opacity: 0;
            transform: translateY(24px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeInUp {
          animation: fadeInUp 0.6s cubic-bezier(.23,1.02,.25,1) both;
        }
      `}</style>
    </div>
  );
}