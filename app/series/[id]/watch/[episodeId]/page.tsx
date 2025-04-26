'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ChevronLeft, Info, ListPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { VideoPlayer } from '@/components/video-player';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/components/ui/use-toast';
import { getSeries, getEpisode, getSeriesEpisodes, Episode } from '@/lib/firebase/firestore/series';

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
  
  const { isLoggedIn, isVIP } = useAuth();
  const { toast } = useToast();
  
  // Charger les détails de l'épisode et de la série
  useEffect(() => {
    const loadEpisodeAndSeries = async () => {
      if (!seriesId || !episodeId) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        // Charger l'épisode demandé
        const episodeData = await getEpisode(episodeId);
        
        if (!episodeData) {
          setError("Épisode non trouvé.");
          return;
        }
        
        // Vérifier si l'épisode est publié
        if (!episodeData.isPublished) {
          setError("Cet épisode n'est pas disponible.");
          return;
        }
        
        // Vérifier si l'épisode est VIP et si l'utilisateur est VIP
        if (episodeData.isVIP && !isVIP) {
          setError("Cet épisode est réservé aux membres VIP.");
          return;
        }
        
        setEpisode(episodeData);
        
        // Charger les informations de la série
        const seriesData = await getSeries(seriesId);
        
        if (seriesData) {
          setSeriesTitle(seriesData.title);
        }
        
        // Charger tous les épisodes pour trouver le suivant
        const allEpisodes = await getSeriesEpisodes(seriesId, {
          onlyPublished: true
        });
        
        // Filtrer les épisodes VIP si l'utilisateur n'est pas VIP
        const filteredEpisodes = isVIP 
          ? allEpisodes 
          : allEpisodes.filter(ep => !ep.isVIP);
        
        // Trier les épisodes par saison et numéro
        const sortedEpisodes = filteredEpisodes.sort((a, b) => {
          if (a.season !== b.season) {
            return a.season - b.season;
          }
          return a.episodeNumber - b.episodeNumber;
        });
        
        // Trouver l'index de l'épisode actuel
        const currentIndex = sortedEpisodes.findIndex(ep => ep.id === episodeId);
        
        // Si ce n'est pas le dernier épisode, définir le suivant
        if (currentIndex !== -1 && currentIndex < sortedEpisodes.length - 1) {
          setNextEpisode(sortedEpisodes[currentIndex + 1]);
        }
      } catch (error) {
        console.error("Erreur de chargement de l'épisode:", error);
        setError("Impossible de charger les détails de l'épisode.");
      } finally {
        setIsLoading(false);
      }
    };
    
    loadEpisodeAndSeries();
  }, [seriesId, episodeId, isVIP]);
  
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