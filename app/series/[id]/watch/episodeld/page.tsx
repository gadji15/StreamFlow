'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ChevronLeft, Info, ListPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { VideoPlayer } from '@/components/video-player';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabaseClient';

// Aligne avec la table Supabase "episodes"
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

export default function WatchEpisodePage() {
  const params = useParams();
  const router = useRouter();
  const seriesId = params?.id as string;
  const episodeId = params?.episodeId as string;
  
  const [episode, setEpisode] = useState<Episode | null>(null);
  const [seriesTitle, setSeriesTitle] = useState('');
  const [nextEpisode, setNextEpisode] = useState<Episode | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isVIP, setIsVIP] = useState(false);
  const { toast } = useToast();
  
  // Charger les détails de l'épisode et de la série
  useEffect(() => {
    const loadEpisodeAndSeries = async () => {
      if (!seriesId || !episodeId) return;

      setIsLoading(true);
      setError(null);

      try {
        // Charger l'épisode demandé
        const { data: episodeData, error: epErr } = await supabase
          .from('episodes')
          .select('id, title, description, season, episode_number, duration, is_vip, published, video_url, thumbnail_url, season_id, series_id, air_date, sort_order, tmdb_id, trailer_url, video_unavailable, created_at, updated_at')
          .eq('id', episodeId)
          .single();

        if (epErr || !episodeData) {
          setError("Épisode non trouvé.");
          return;
        }

        // Vérifier si l'épisode est publié
        if (!episodeData.published) {
          setError("Cet épisode n'est pas disponible.");
          return;
        }

        // Récupérer le statut VIP de l'utilisateur (si besoin)
        let userIsVIP = false;
        // (ici tu peux ajouter la logique pour récupérer le statut VIP de l'utilisateur connecté via profils)
        // setIsVIP(userIsVIP);

        // Vérifier si l'épisode est VIP et si l'utilisateur est VIP
        if (episodeData.is_vip && !userIsVIP) {
          setError("Cet épisode est réservé aux membres VIP.");
          return;
        }

        setEpisode({
          ...episodeData,
          isVIP: episodeData.is_vip,
          episodeNumber: episodeData.episode_number,
          thumbnailUrl: episodeData.thumbnail_url,
          videoUrl: episodeData.video_url,
        });

        // Charger les informations de la série
        const { data: seriesData } = await supabase
          .from('series')
          .select('title')
          .eq('id', seriesId)
          .single();

        if (seriesData) {
          setSeriesTitle(seriesData.title);
        }

        // Charger tous les épisodes pour trouver le suivant
        const { data: allEpisodes } = await supabase
          .from('episodes')
          .select('id, title, description, season, episode_number, duration, is_vip, published, video_url, thumbnail_url, season_id, series_id, air_date, sort_order, tmdb_id, trailer_url, video_unavailable, created_at, updated_at')
          .eq('series_id', seriesId)
          .eq('published', true);

        // Filtrer les épisodes VIP si l'utilisateur n'est pas VIP
        const filteredEpisodes = userIsVIP
          ? (allEpisodes || [])
          : (allEpisodes || []).filter((ep: any) => !ep.is_vip);

        // Trier les épisodes par saison et numéro
        const sortedEpisodes = filteredEpisodes.sort((a: any, b: any) => {
          if (a.season !== b.season) {
            return a.season - b.season;
          }
          return a.episode_number - b.episode_number;
        });

        // Trouver l'index de l'épisode actuel
        const currentIndex = sortedEpisodes.findIndex((ep: any) => ep.id === episodeId);

        // Si ce n'est pas le dernier épisode, définir le suivant
        if (currentIndex !== -1 && currentIndex < sortedEpisodes.length - 1) {
          const nextEp = sortedEpisodes[currentIndex + 1];
          setNextEpisode({
            ...nextEp,
            isVIP: nextEp.is_vip,
            episodeNumber: nextEp.episode_number,
            thumbnailUrl: nextEp.thumbnail_url,
            videoUrl: nextEp.video_url,
          });
        }
      } catch (error) {
        console.error("Erreur de chargement de l'épisode:", error);
        setError("Impossible de charger les détails de l'épisode.");
      } finally {
        setIsLoading(false);
      }
    };

    loadEpisodeAndSeries();
  }, [seriesId, episodeId]);
  
  // Gérer la navigation vers l'épisode suivant
  const goToNextEpisode = () => {
    if (nextEpisode) {
      router.push(`/series/${seriesId}/watch/${nextEpisode.id}`);
    }
  };
  
  // Gérer le retour à la page de la série
  const goBackToSeries = () => {
    router.push(`/series/${seriesId}`);
  };
  
  // Afficher un écran de chargement
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }
  
  // Afficher un message d'erreur
  if (error || !episode) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Button variant="ghost" onClick={goBackToSeries} className="mb-4">
          <ChevronLeft className="h-4 w-4 mr-1" /> Retour à la série
        </Button>
        
        <div className="bg-red-900/20 border border-red-800 rounded-lg p-6 max-w-md mx-auto mt-8 text-center">
          <h2 className="text-xl font-bold mb-2">Erreur</h2>
          <p>{error || "Épisode non trouvé"}</p>
          <Button 
            onClick={goBackToSeries}
            className="mt-4"
          >
            Retour à la série
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-black min-h-screen">
      {/* Lecture vidéo */}
      <div className="relative w-full aspect-video bg-black">
        <VideoPlayer
          src={episode.videoUrl || ''}
          poster={episode.thumbnailUrl}
          title={`${seriesTitle} - S${episode.season} E${episode.episodeNumber}: ${episode.title}`}
          onEnded={nextEpisode ? goToNextEpisode : undefined}
          nextEpisode={nextEpisode ? {
            title: nextEpisode.title,
            season: nextEpisode.season,
            episode: nextEpisode.episodeNumber,
            onNext: goToNextEpisode
          } : undefined}
        />
      </div>
      
      {/* Informations de l'épisode */}
      <div className="container mx-auto px-4 py-6">
        <Button variant="ghost" onClick={goBackToSeries} className="mb-4">
          <ChevronLeft className="h-4 w-4 mr-1" /> Retour à la série
        </Button>
        
        <div className="bg-gray-800 rounded-lg p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-xl font-bold">{seriesTitle}</h1>
              <h2 className="text-lg">
                Saison {episode.season}, Épisode {episode.episodeNumber}: {episode.title}
              </h2>
            </div>
            
            {nextEpisode && (
              <Button
                variant="outline"
                onClick={goToNextEpisode}
              >
                <ListPlus className="h-4 w-4 mr-2" />
                Épisode suivant
              </Button>
            )}
          </div>
          
          <p className="text-gray-300">{episode.description}</p>
        </div>
      </div>
    </div>
  );
}