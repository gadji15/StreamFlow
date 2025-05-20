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
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabaseClient';
import SeasonEpisodeList from '@/components/series/season-episode-list';
import CastingGrid from "@/components/CastingGrid";
import SimilarSeriesGrid from "@/components/series/SimilarSeriesGrid";
import SeriesBackdrop from "@/components/SeriesBackdrop";
import SeriesPosterCard from "@/components/SeriesPosterCard";
import SeriesInfo from "@/components/SeriesInfo";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

// TypeScript type for Series and Episode (aligned with Supabase)
type Series = {
  id: string;
  title: string;
  original_title?: string;
  description: string;
  start_year: number;
  end_year?: number | null;
  creator?: string;
  genres: string[];
  cast?: { name: string; role: string }[];
  trailer_url?: string;
  is_vip?: boolean;
  published?: boolean;
  poster_url?: string;
  backdrop_url?: string;
  seasons?: number;
  rating?: number;
};

type Episode = {
  id: string;
  title: string;
  description: string;
  season: number;
  episode_number: number;
  is_vip?: boolean;
  published?: boolean;
  // ...other fields as needed
};

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
  const { user } = useCurrentUser();
  const [isVIP, setIsVIP] = useState(false);

  const { toast } = useToast();

  // Charger les détails de la série et ses épisodes
  useEffect(() => {
    const loadSeriesDetails = async () => {
      if (!id) return;

      setIsLoading(true);
      setError(null);

      try {
        // Charger la série depuis Supabase
        const { data: seriesData, error: seriesError } = await supabase
          .from('series')
          .select('*')
          .eq('id', id)
          .single();

        if (seriesError || !seriesData) {
          setError("Série non trouvée.");
          return;
        }

        // Vérifier si la série est publiée
        if (!seriesData.published) {
          setError("Cette série n'est pas disponible.");
          return;
        }

        setSeries(seriesData);

        // VIP: vérifier le statut de l'utilisateur
        let userIsVIP = false;
        if (user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('is_vip')
            .eq('id', user.id)
            .single();
          userIsVIP = !!profile?.is_vip;
          setIsVIP(userIsVIP);
        } else {
          setIsVIP(false);
        }

        // Afficher le dialog VIP si la série est VIP et l'utilisateur ne l'est pas
        if (seriesData.is_vip && !userIsVIP) {
          setShowVipDialog(true);
        }

        // Définir la saison sélectionnée par défaut (la plus récente)
        if (seriesData.seasons && seriesData.seasons > 0) {
          setSelectedSeason(seriesData.seasons);
        }

        // Charger les épisodes depuis Supabase
        const { data: episodesData, error: episodesError } = await supabase
          .from('episodes')
          .select('*')
          .eq('series_id', id)
          .eq('published', true);

        if (episodesError) {
          setEpisodes([]);
        } else {
          // Filtrer les épisodes VIP si l'utilisateur n'est pas VIP
          const filteredEpisodes = userIsVIP
            ? (episodesData || [])
            : (episodesData || []).filter((ep: any) => !ep.is_vip);
          setEpisodes(filteredEpisodes);
        }

        // Incrémenter le nombre de vues côté serveur
        supabase
          .from('series')
          .update({ views: (seriesData.views || 0) + 1 })
          .eq('id', id);

        // Journaliser l'activité de vue de série
        if (user) {
          supabase.from('activities').insert([{
            user_id: user.id,
            action: "content_view",
            content_type: "series",
            content_id: id,
            details: { title: seriesData.title, isVIP: seriesData.is_vip },
            timestamp: new Date().toISOString()
          }]);
        }

        // Vérifier si la série est dans les favoris de l'utilisateur
        if (user) {
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
    // eslint-disable-next-line
  }, [id, user]);

  // Gérer l'ajout/suppression des favoris via Supabase (cloud)
  const toggleFavorite = async () => {
    if (!user) {
      toast({
        title: "Connectez-vous",
        description: "Vous devez être connecté pour ajouter des séries à vos favoris.",
        variant: "destructive",
      });
      return;
    }

    if (isFavorite) {
      // Supprimer le favori
      const { error } = await supabase
        .from("favorites")
        .delete()
        .eq("user_id", user.id)
        .eq("series_id", id);

      if (!error) {
        setIsFavorite(false);
        toast({
          title: "Retiré des favoris",
          description: `"${series?.title}" a été retiré de vos favoris.`,
        });
        // Log activity
        supabase.from('activities').insert([{
          user_id: user.id,
          action: "favorite_remove",
          content_type: "series",
          content_id: id,
          details: { title: series?.title },
          timestamp: new Date().toISOString()
        }]);
      } else {
        toast({
          title: "Erreur",
          description: "Impossible de retirer cette série des favoris.",
          variant: "destructive",
        });
      }
    } else {
      // Ajouter le favori
      const { error } = await supabase.from("favorites").insert([
        {
          user_id: user.id,
          series_id: id,
          created_at: new Date().toISOString(),
        },
      ]);
      if (!error) {
        setIsFavorite(true);
        toast({
          title: "Ajouté aux favoris",
          description: `"${series?.title}" a été ajouté à vos favoris.`,
        });
        supabase.from('activities').insert([{
          user_id: user.id,
          action: "favorite_add",
          content_type: "series",
          content_id: id,
          details: { title: series?.title },
          timestamp: new Date().toISOString()
        }]);
      } else {
        toast({
          title: "Erreur",
          description: "Impossible d'ajouter cette série aux favoris.",
          variant: "destructive",
        });
      }
    }
    // Rafraîchir la vérification pour garder l’UI à jour
    checkIfFavorite(id);
  };

  // Vérifier si la série est dans les favoris de l'utilisateur (Supabase)
  const checkIfFavorite = async (seriesId: string) => {
    if (user && seriesId) {
      const { data, error } = await supabase
        .from("favorites")
        .select("id")
        .eq("user_id", user.id)
        .eq("series_id", seriesId)
        .maybeSingle();
      setIsFavorite(!!data && !error);
    }
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

  // Chargement
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mx-auto"></div>
        <p className="mt-4">Chargement de la série...</p>
      </div>
    );
  }

  // Erreur
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
      {/* Backdrop premium avec composant dédié */}
      <div className="relative w-full h-[50vh] md:h-[65vh] lg:h-[75vh] z-0 mb-6">
        <SeriesBackdrop src={series.backdrop_url} alt={series.title} />
        <div className="container mx-auto px-4 h-full flex flex-col justify-end py-8 relative z-10">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Poster premium */}
            <SeriesPosterCard src={series.poster_url} alt={series.title} />
            {/* Détails */}
            <div className="flex-1">
              <SeriesInfo
                title={series.title}
                startYear={series.start_year}
                endYear={series.end_year}
                seasons={series.seasons}
                genres={series.genres}
                rating={series.rating}
              />
              <p className="text-gray-100 my-4 line-clamp-4 md:line-clamp-none drop-shadow">
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
                  disabled={seasonEpisodes.length === 0 || (series.is_vip && !isVIP)}
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
            <TabsTrigger value="similar">Séries similaires</TabsTrigger>
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
                {series.trailer_url && (
                  <div className="bg-gray-800 rounded-lg p-6">
                    <h2 className="text-xl font-semibold mb-4">Bande-annonce</h2>
                    <div className="aspect-video">
                      <iframe
                        className="w-full h-full rounded-lg"
                        src={`https://www.youtube.com/embed/${extractYouTubeId(series.trailer_url)}`}
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
                    {series.original_title && (
                      <li className="flex justify-between">
                        <span className="text-gray-400">Titre original :</span>
                        <span>{series.original_title}</span>
                      </li>
                    )}
                    <li className="flex justify-between">
                      <span className="text-gray-400">Années :</span>
                      <span>{series.start_year}{series.end_year ? ` - ${series.end_year}` : ' - Présent'}</span>
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
                      <span className="text-right">{series.genres?.join(', ') || ''}</span>
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
                
                {/* Casting dynamique via TMDB */}
                <div className="bg-gray-800 rounded-lg p-6">
                  <h2 className="text-xl font-semibold mb-4">Casting</h2>
                  {series.tmdb_id ? (
                    <CastingGrid tmdbId={series.tmdb_id.toString()} fallbackCast={series.cast} />
                  ) : series.cast && series.cast.length > 0 ? (
                    <CastingGrid tmdbId={""} fallbackCast={series.cast} />
                  ) : (
                    <div className="text-gray-400">Aucun casting disponible.</div>
                  )}
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="similar">
            {/* Séries similaires */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Séries similaires</h2>
              {series.tmdb_id ? (
                <SimilarSeriesGrid currentSeriesId={id} tmdbId={series.tmdb_id.toString()} />
              ) : (
                <div className="text-gray-400">Aucune suggestion disponible.</div>
              )}
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
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
}