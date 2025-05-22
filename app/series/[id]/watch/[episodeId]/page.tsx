'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ChevronLeft, Layers, Info, ListPlus, Film } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { VideoPlayer } from '@/components/video-player';
import SeasonModalUser from '@/components/series/SeasonModalUser';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabaseClient';

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
  // autres champs si besoin
};

export default function WatchEpisodePage() {
  const params = useParams();
  const router = useRouter();
  const seriesId = params?.id as string;
  const episodeId = params?.episodeId as string;

  // States principaux
  const [episode, setEpisode] = useState<Episode | null>(null);
  const [seriesTitle, setSeriesTitle] = useState('');
  const [seriesPoster, setSeriesPoster] = useState('');
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [selectedSeasonIndex, setSelectedSeasonIndex] = useState(0);
  const [isSeasonModalOpen, setIsSeasonModalOpen] = useState(false);
  const [nextEpisode, setNextEpisode] = useState<Episode | null>(null);
  const [similarSeries, setSimilarSeries] = useState<Series[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { toast } = useToast();

  // Charger les détails de l'épisode, de la série, des saisons, etc.
  useEffect(() => {
    const loadEpisodePageData = async () => {
      if (!seriesId || !episodeId) return;
      setIsLoading(true);
      setError(null);

      try {
        // 1. Charger l'épisode courant
        const { data: episodeData, error: epErr } = await supabase
          .from('episodes')
          .select('*')
          .eq('id', episodeId)
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
          .from('series')
          .select('*')
          .eq('id', seriesId)
          .single();

        if (seriesData) {
          setSeriesTitle(seriesData.title);
          setSeriesPoster(seriesData.poster || '');
        }

        // 3. Charger toutes les saisons de la série avec leurs épisodes
        const { data: seasonsData } = await supabase
          .from('seasons')
          .select('id, season_number, poster, title, episodes (*)')
          .eq('series_id', seriesId)
          .order('season_number', { ascending: true });

        if (seasonsData) {
          setSeasons(seasonsData.map((s: any) => ({
            ...s,
            episodes: (s.episodes || []).sort((a: any, b: any) => a.episode_number - b.episode_number)
          })));
          // Sélectionner la bonne saison par défaut
          const currentSeasonIdx = seasonsData.findIndex((s: any) =>
            (s.season_number === episodeData.season)
          );
          setSelectedSeasonIndex(currentSeasonIdx !== -1 ? currentSeasonIdx : 0);
        }

        // 4. Charger les séries similaires (exemple via TMDB ou table locale)
        // Ici, on simule (à adapter selon ta logique)
        const { data: similar } = await supabase
          .from('series')
          .select('*')
          .neq('id', seriesId)
          .order('popularity', { ascending: false })
          .limit(10);
        setSimilarSeries(similar || []);

        // 5. Déterminer l'épisode suivant (dans la saison ou la série)
        if (seasonsData) {
          const allEpisodes = seasonsData.flatMap((s: any) => s.episodes || []);
          const sortedEpisodes = allEpisodes
            .filter((ep: any) => ep.published)
            .sort((a: any, b: any) =>
              a.season !== b.season
                ? a.season - b.season
                : a.episode_number - b.episode_number
            );
          const currentIdx = sortedEpisodes.findIndex((ep: any) => ep.id === episodeId);
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

  // Gestion clic sur un épisode depuis le modal saisons
  const handleEpisodeClick = (ep: Episode) => {
    setIsSeasonModalOpen(false);
    router.push(`/series/${seriesId}/watch/${ep.id}`);
  };

  // Affichage loading
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  // Affichage erreur
  if (error || !episode) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Button variant="ghost" onClick={goBackToSeries} className="mb-4">
          <ChevronLeft className="h-4 w-4 mr-1" /> Retour à la série
        </Button>
        <div className="bg-red-900/20 border border-red-800 rounded-lg p-6 max-w-md mx-auto mt-8 text-center">
          <h2 className="text-xl font-bold mb-2">Erreur</h2>
          <p>{error || "Épisode non trouvé"}</p>
          <Button onClick={goBackToSeries} className="mt-4">
            Retour à la série
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-950 to-gray-900 text-white flex flex-col">
      {/* Header contextuel */}
      <header className="flex items-center justify-between px-4 pt-5 pb-2 bg-gradient-to-b from-black/90 to-transparent sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <Button variant="ghost" onClick={goBackToSeries} className="rounded-full p-2">
            <ChevronLeft className="h-5 w-5" />
          </Button>
          {seriesPoster && (
            <img src={seriesPoster} alt={seriesTitle} className="h-10 w-10 object-cover rounded shadow" />
          )}
          <h1 className="font-bold text-lg sm:text-2xl truncate">{seriesTitle}</h1>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="ghost" className="rounded-full p-2" aria-label="Voir les infos série">
            <Info className="h-5 w-5" />
          </Button>
          <Button
            variant="outline"
            className="rounded-full px-3 py-2 flex items-center gap-2"
            onClick={() => setIsSeasonModalOpen(true)}
            aria-label="Voir saisons et épisodes"
          >
            <Layers className="w-5 h-5 mr-1" />
            Saisons
          </Button>
        </div>
      </header>

      {/* Modal saisons/épisodes */}
      <SeasonModalUser
        open={isSeasonModalOpen}
        onClose={() => setIsSeasonModalOpen(false)}
        seasons={seasons}
        selectedSeasonIndex={selectedSeasonIndex}
        onSeasonChange={setSelectedSeasonIndex}
        onEpisodeClick={handleEpisodeClick}
      />

      {/* Player vidéo premium */}
      <main className="flex-1 flex flex-col items-center justify-start w-full">
        <div className="relative w-full max-w-4xl aspect-video mt-4 rounded-xl overflow-hidden shadow-lg border border-gray-800 bg-black mx-auto">
          <VideoPlayer
            src={episode.video_url || ''}
            poster={episode.thumbnail_url}
            title={`${seriesTitle} - S${episode.season} E${episode.episode_number}: ${episode.title}`}
            onEnded={nextEpisode ? goToNextEpisode : undefined}
            nextEpisode={nextEpisode ? {
              title: nextEpisode.title,
              season: nextEpisode.season,
              episode: nextEpisode.episode_number,
              onNext: goToNextEpisode
            } : undefined}
            onClose={undefined}
          />
          {/* Overlay titre/infos flottantes */}
          <div className="absolute bottom-2 left-4 bg-black/50 rounded px-3 py-1 flex items-center gap-3">
            <span className="font-bold text-primary text-base drop-shadow">
              S{episode.season}E{episode.episode_number} : {episode.title}
            </span>
            {episode.is_vip && (
              <span className="ml-2 text-xs px-2 py-0.5 rounded bg-yellow-700/80 text-yellow-200 font-bold">VIP</span>
            )}
          </div>
        </div>

        {/* Infos de l'épisode */}
        <section className="w-full max-w-4xl mx-auto mt-6 px-2 sm:px-0">
          <div className="bg-gray-800/70 rounded-xl p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h2 className="font-bold text-lg">{seriesTitle}</h2>
              <div className="text-sm text-gray-300 mb-1">
                Saison {episode.season}, Épisode {episode.episode_number}
              </div>
              <p className="text-gray-300 text-base">{episode.description}</p>
            </div>
            {nextEpisode && (
              <Button
                variant="outline"
                onClick={goToNextEpisode}
                className="flex-shrink-0 mt-4 md:mt-0"
              >
                <ListPlus className="h-4 w-4 mr-2" />
                Épisode suivant
              </Button>
            )}
          </div>
        </section>

        {/* Séries similaires en grille (max 3 lignes) */}
        <section className="w-full max-w-6xl mx-auto mt-10 px-2 sm:px-0">
          <h3 className="font-bold text-lg mb-3 text-primary">Séries similaires</h3>
          <div className="relative">
            <div
              className={`
                grid gap-6
                grid-cols-2
                sm:grid-cols-3
                md:grid-cols-4
                lg:grid-cols-5
                xl:grid-cols-6
                2xl:grid-cols-7
              `}
              style={{
                maxHeight: "900px", // 3 lignes * 300px env
                overflow: "auto",
              }}
            >
              {similarSeries.map((serie) => (
                <div
                  key={serie.id}
                  className="bg-gray-900/70 rounded-lg shadow border border-gray-800 hover:scale-105 transition-all cursor-pointer"
                  tabIndex={0}
                  role="button"
                  aria-label={`Voir la série ${serie.title}`}
                  onClick={() => router.push(`/series/${serie.id}`)}
                  onKeyDown={e => {
                    if (e.key === "Enter" || e.key === " ") {
                      router.push(`/series/${serie.id}`);
                    }
                  }}
                  style={{ minWidth: 0 }}
                >
                  <div className="aspect-[2/3] rounded-t-lg overflow-hidden">
                    <img
                      src={serie.poster || '/placeholder-poster.png'}
                      alt={serie.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="px-2 py-2 text-center">
                    <span className="font-semibold text-sm truncate block">{serie.title}</span>
                    {serie.genre && (
                      <span className="text-xs text-gray-400">{serie.genre}</span>
                    )}
                  </div>
                </div>
              ))}
              {similarSeries.length === 0 && (
                <div className="text-gray-400 py-8 text-center w-full">Aucune suggestion pour le moment.</div>
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}