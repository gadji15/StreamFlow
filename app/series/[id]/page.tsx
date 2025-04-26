'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  Play, 
  Star, 
  Calendar, 
  Info, 
  ThumbsUp,
  ThumbsDown,
  Film,
  ChevronDown,
  Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { VipBadge } from '@/components/vip-badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CommentsSection } from '@/components/comments-section';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/components/ui/use-toast';
import { getSeries, getSeriesEpisodes, incrementSeriesViews, Series, Episode } from '@/lib/firebase/firestore/series';
import { formatDuration } from '@/lib/utils';
import SeasonEpisodeList from '@/components/series/season-episode-list';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

export default function SeriesDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  
  const [series, setSeries] = useState<Series | null>(null);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSeason, setSelectedSeason] = useState<number>(1);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showVipDialog, setShowVipDialog] = useState(false);
  
  const { user, isLoggedIn, isVIP } = useAuth();
  const { toast } = useToast();
  
  // Charger les détails de la série et ses épisodes
  useEffect(() => {
    const loadSeriesDetails = async () => {
      if (!id) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        // Charger les détails de la série
        const seriesData = await getSeries(id);
        
        if (!seriesData) {
          setError("Série non trouvée.");
          return;
        }
        
        // Vérifier si la série est publiée
        if (!seriesData.isPublished) {
          setError("Cette série n'est pas disponible.");
          return;
        }
        
        // Vérifier si la série est VIP et si l'utilisateur est VIP
        if (seriesData.isVIP && !isVIP) {
          setShowVipDialog(true);
        }
        
        setSeries(seriesData);
        
        // Définir la saison sélectionnée par défaut (la plus récente)
        if (seriesData.seasons && seriesData.seasons > 0) {
          setSelectedSeason(seriesData.seasons);
        }
        
        // Charger les épisodes
        const episodesData = await getSeriesEpisodes(id, {
          onlyPublished: true
        });
        
        // Filtrer les épisodes VIP si l'utilisateur n'est pas VIP
        const filteredEpisodes = isVIP 
          ? episodesData 
          : episodesData.filter(episode => !episode.isVIP);
        
        setEpisodes(filteredEpisodes);
        
        // Incrémenter le nombre de vues
        await incrementSeriesViews(id);
        
        // Vérifier si la série est dans les favoris de l'utilisateur
        if (isLoggedIn) {
          // Récupérer les favoris depuis le localStorage
          const favorites = JSON.parse(localStorage.getItem('favoritesSeries') || '[]');
          setIsFavorite(favorites.includes(id));
        }
      } catch (error) {
        console.error("Erreur de chargement de la série:", error);
        setError("Impossible de charger les détails de la série.");
      } finally {
        setIsLoading(false);
      }
    };
    
    loadSeriesDetails();
  }, [id, isVIP, isLoggedIn]);
  
  // Gérer l'ajout/suppression des favoris
  const toggleFavorite = () => {
    if (!isLoggedIn) {
      toast({
        title: "Connectez-vous",
        description: "Vous devez être connecté pour ajouter des séries à vos favoris.",
        variant: "destructive",
      });
      return;
    }
    
    // Récupérer les favoris actuels
    const favorites = JSON.parse(localStorage.getItem('favoritesSeries') || '[]');
    
    let newFavorites;
    if (isFavorite) {
      // Retirer des favoris
      newFavorites = favorites.filter((favId: string) => favId !== id);
      toast({
        title: "Retiré des favoris",
        description: `"${series?.title}" a été retiré de vos favoris.`,
      });
    } else {
      // Ajouter aux favoris
      newFavorites = [...favorites, id];
      toast({
        title: "Ajouté aux favoris",
        description: `"${series?.title}" a été ajouté à vos favoris.`,
      });
    }
    
    // Mettre à jour le localStorage
    localStorage.setItem('favoritesSeries', JSON.stringify(newFavorites));
    setIsFavorite(!isFavorite);
    
    // À terme, cette fonction devrait aussi mettre à jour les favoris dans Firestore
  };
  
  // Obtenir les épisodes de la saison sélectionnée
  const getSeasonEpisodes = (season: number) => {
    return episodes.filter(episode => episode.season === season);
  };
  
  // Obtenir la liste des saisons disponibles
  const getAvailableSeasons = () => {
    const seasons = [...new Set(episodes.map(episode => episode.season))];
    return seasons.sort((a, b) => a - b);
  };
  
  // Rediriger vers la page VIP
  const goToVipPage = () => {
    setShowVipDialog(false);
    router.push('/vip');
  };
  
  // Afficher un écran de chargement
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mx-auto"></div>
        <p className="mt-4">Chargement de la série...</p>
      </div>
    );
  }
  
  // Afficher un message d'erreur
  if (error || !series) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <div className="bg-red-900/20 border border-red-800 rounded-lg p-6 max-w-md mx-auto">
          <h2 className="text-xl font-bold mb-2">Erreur</h2>
          <p>{error || "Série non trouvée"}</p>
          <Button 
            onClick={() => router.push('/series')}
            className="mt-4"
          >
            Retour aux séries
          </Button>
        </div>
      </div>
    );
  }
  
  // Obtenir les saisons disponibles
  const availableSeasons = getAvailableSeasons();
  const seasonEpisodes = getSeasonEpisodes(selectedSeason);
  
  return (
    <div className="pb-8">
      {/* Backdrop et informations principales */}
      <div 
        className="relative w-full h-[50vh] md:h-[60vh] bg-cover bg-center bg-no-repeat mb-6"
        style={{ 
          backgroundImage: `linear-gradient(to bottom, rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.95)), url(${series.backdropUrl || '/placeholder-backdrop.png'})` 
        }}
      >
        <div className="container mx-auto px-4 h-full flex flex-col justify-end py-8">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Poster */}
            <div className="w-32 h-48 md:w-48 md:h-72 flex-shrink-0 -mt-20 md:-mt-40 rounded-lg overflow-hidden shadow-xl">
              <img 
                src={series.posterUrl || '/placeholder-poster.png'} 
                alt={series.title} 
                className="w-full h-full object-cover"
              />
            </div>
            
            {/* Détails */}
            <div className="flex-1">
              <div className="flex items-center">
                <h1 className="text-2xl md:text-4xl font-bold">{series.title}</h1>
                {series.isVIP && (
                  <div className="ml-2">
                    <VipBadge />
                  </div>
                )}
              </div>
              
              <div className="flex flex-wrap items-center gap-3 text-sm text-gray-300 mt-2">
                <span className="flex items-center">
                  <Calendar className="mr-1 h-4 w-4" /> 
                  {series.startYear}{series.endYear ? ` - ${series.endYear}` : ' - Présent'}
                </span>
                <span className="flex items-center">
                  <Film className="mr-1 h-4 w-4" /> 
                  {series.seasons} Saison{series.seasons > 1 ? 's' : ''}
                </span>
                {series.rating && (
                  <span className="flex items-center">
                    <Star className="mr-1 h-4 w-4 text-yellow-400" /> 
                    {series.rating.toFixed(1)}/10
                  </span>
                )}
              </div>
              
              <div className="mt-2 flex flex-wrap gap-2">
                {series.genres.map(genreId => (
                  <span 
                    key={genreId} 
                    className="px-3 py-1 bg-gray-700 text-xs rounded-full"
                  >
                    {genreId}
                  </span>
                ))}
              </div>
              
              <p className="text-gray-300 my-4 line-clamp-4 md:line-clamp-none">
                {series.description}
              </p>
              
              <div className="flex flex-wrap gap-3 mt-4">
                <Button 
                  size="lg" 
                  className="gap-2"
                  onClick={() => {
                    if (seasonEpisodes.length > 0) {
                      router.push(`/series/${id}/watch/${seasonEpisodes[0].id}`);
                    } else {
                      toast({
                        title: "Aucun épisode disponible",
                        description: "Il n'y a pas d'épisodes disponibles pour cette saison.",
                        variant: "destructive",
                      });
                    }
                  }}
                  disabled={seasonEpisodes.length === 0 || (series.isVIP && !isVIP)}
                >
                  <Play className="h-5 w-5" /> 
                  Regarder
                </Button>
                
                <Button
                  variant="outline"
                  size="lg"
                  className="gap-2"
                  onClick={toggleFavorite}
                >
                  {isFavorite ? (
                    <>
                      <ThumbsDown className="h-5 w-5" />
                      Retirer des favoris
                    </>
                  ) : (
                    <>
                      <ThumbsUp className="h-5 w-5" />
                      Ajouter aux favoris
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Contenu principal */}
      <div className="container mx-auto px-4">
        <Tabs defaultValue="episodes" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="episodes">Épisodes</TabsTrigger>
            <TabsTrigger value="details">Détails</TabsTrigger>
            <TabsTrigger value="comments">Commentaires</TabsTrigger>
          </TabsList>
          
          <TabsContent value="episodes" className="space-y-6">
            {/* Sélecteur de saison */}
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Saison {selectedSeason}</h2>
                
                <div className="relative">
                  <select
                    value={selectedSeason}
                    onChange={(e) => setSelectedSeason(Number(e.target.value))}
                    className="appearance-none bg-gray-700 rounded-md px-4 py-2 pr-10 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    {availableSeasons.map(season => (
                      <option key={season} value={season}>Saison {season}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 pointer-events-none text-gray-400" />
                </div>
              </div>
              
              {/* Liste des épisodes */}
              <SeasonEpisodeList 
                episodes={seasonEpisodes} 
                seriesId={id} 
                isVIP={isVIP}
              />
            </div>
          </TabsContent>
          
          <TabsContent value="details" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 space-y-6">
                {/* Synopsis */}
                <div className="bg-gray-800 rounded-lg p-6">
                  <h2 className="text-xl font-semibold mb-4">Synopsis</h2>
                  <p className="text-gray-300">{series.description}</p>
                </div>
                
                {/* Bande-annonce */}
                {series.trailerUrl && (
                  <div className="bg-gray-800 rounded-lg p-6">
                    <h2 className="text-xl font-semibold mb-4">Bande-annonce</h2>
                    <div className="aspect-video">
                      <iframe
                        className="w-full h-full rounded-lg"
                        src={`https://www.youtube.com/embed/${extractYouTubeId(series.trailerUrl)}`}
                        title={`Bande-annonce de ${series.title}`}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      ></iframe>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="space-y-6">
                {/* Informations */}
                <div className="bg-gray-800 rounded-lg p-6">
                  <h2 className="text-xl font-semibold mb-4">Informations</h2>
                  <ul className="space-y-2">
                    <li className="flex justify-between">
                      <span className="text-gray-400">Titre :</span>
                      <span>{series.title}</span>
                    </li>
                    {series.originalTitle && (
                      <li className="flex justify-between">
                        <span className="text-gray-400">Titre original :</span>
                        <span>{series.originalTitle}</span>
                      </li>
                    )}
                    <li className="flex justify-between">
                      <span className="text-gray-400">Années :</span>
                      <span>{series.startYear}{series.endYear ? ` - ${series.endYear}` : ' - Présent'}</span>
                    </li>
                    <li className="flex justify-between">
                      <span className="text-gray-400">Saisons :</span>
                      <span>{series.seasons}</span>
                    </li>
                    {series.creator && (
                      <li className="flex justify-between">
                        <span className="text-gray-400">Créateur :</span>
                        <span>{series.creator}</span>
                      </li>
                    )}
                    <li className="flex justify-between">
                      <span className="text-gray-400">Genres :</span>
                      <span className="text-right">{series.genres.join(', ')}</span>
                    </li>
                    {series.rating && (
                      <li className="flex justify-between">
                        <span className="text-gray-400">Note :</span>
                        <span className="flex items-center">
                          <Star className="h-4 w-4 text-yellow-400 mr-1 fill-current" />
                          {series.rating.toFixed(1)}/10
                        </span>
                      </li>
                    )}
                  </ul>
                </div>
                
                {/* Casting */}
                {series.cast && series.cast.length > 0 && (
                  <div className="bg-gray-800 rounded-lg p-6">
                    <h2 className="text-xl font-semibold mb-4">Casting</h2>
                    <ul className="space-y-3">
                      {series.cast.map((actor, index) => (
                        <li key={index} className="flex justify-between">
                          <span className="font-medium">{actor.name}</span>
                          {actor.role && <span className="text-gray-400">{actor.role}</span>}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="comments">
            {/* Commentaires */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Commentaires</h2>
              <CommentsSection contentId={id} contentType="series" />
            </div>
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Dialog VIP */}
      <Dialog open={showVipDialog} onOpenChange={setShowVipDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Contenu VIP</DialogTitle>
            <DialogDescription>
              Cette série est réservée aux membres VIP. Abonnez-vous pour accéder à ce contenu exclusif.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-between mt-4">
            <Button 
              variant="outline" 
              onClick={() => setShowVipDialog(false)}
            >
              Retour
            </Button>
            <Button onClick={goToVipPage}>
              Découvrir l'offre VIP
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Fonction pour extraire l'ID YouTube d'une URL
function extractYouTubeId(url: string) {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
}