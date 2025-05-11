'use client';

import { useEffect, useState } from 'react';
import { useParams, notFound } from 'next/navigation';
import { Play, Star, Calendar, Clock, Info, Heart, Share } from 'lucide-react';
import { Button } from '@/components/ui/button';
import LoadingScreen from '@/components/loading-screen';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { CommentsSection } from '@/components/comments-section';
import { supabase } from '@/lib/supabaseClient';
import { useCurrentUser } from '@/hooks/useCurrentUser';

export default function FilmDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const [movie, setMovie] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);

  const { user } = useCurrentUser();
  const [isVIP, setIsVIP] = useState(false);
  const { toast } = useToast();
  
  useEffect(() => {
    if (!id) return;

    const fetchMovie = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const { data: fetchedMovie, error: movieError } = await supabase
          .from('films')
          .select('*')
          .eq('id', id)
          .single();

        if (movieError || !fetchedMovie) {
          setError("Film non trouvé.");
          notFound();
        } else {
          setMovie(fetchedMovie);

          // Incrémenter le nombre de vues (côté serveur)
          supabase
            .from('films')
            .update({ views: (fetchedMovie.views || 0) + 1 })
            .eq('id', id);

          // Récupérer le statut VIP de l'utilisateur (si besoin)
          if (user) {
            const { data: profile } = await supabase
              .from('profiles')
              .select('is_vip')
              .eq('id', user.id)
              .single();
            setIsVIP(profile?.is_vip || false);

            // Journaliser l'activité
            supabase.from('activities').insert([{
              user_id: user.id,
              action: "content_view",
              content_type: "movie",
              content_id: id,
              details: { title: fetchedMovie.title, isVIP: fetchedMovie.is_vip },
              timestamp: new Date().toISOString()
            }]);
          }

          // Vérifier si le film est dans les favoris
          checkIfFavorite(id);
        }
      } catch (err) {
        console.error("Erreur de chargement du film:", err);
        setError("Impossible de charger les détails du film.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchMovie();
  }, [id, user]);
  
  // Vérifier si le film est dans les favoris de l'utilisateur
  const checkIfFavorite = async (movieId: string) => {
    // Dans une version complète, ceci vérifierait dans Firestore
    // Pour l'instant, on simule avec localStorage
    if (typeof window !== "undefined" && user) {
      const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
      setIsFavorite(favorites.includes(movieId));
    }
  };
  
  // Ajouter/retirer des favoris
  const toggleFavorite = () => {
    if (!user) {
      toast({
        title: "Connexion requise",
        description: "Veuillez vous connecter pour ajouter ce film à vos favoris.",
        variant: "destructive"
      });
      return;
    }
    
    if (!movie) return;
    
    // Dans une version complète, ceci gérerait les favoris dans Firestore
    // Pour l'instant, on simule avec localStorage
    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    
    if (isFavorite) {
      const updatedFavorites = favorites.filter((fav: string) => fav !== id);
      localStorage.setItem('favorites', JSON.stringify(updatedFavorites));
      setIsFavorite(false);
      
      toast({
        title: "Retiré des favoris",
        description: `"${movie.title}" a été retiré de vos favoris.`
      });
      
      // Journaliser l'activité
      if (user) {
        supabase.from('activities').insert([{
          user_id: user.id,
          action: "favorite_remove",
          content_type: "movie",
          content_id: id,
          details: { title: movie.title },
          timestamp: new Date().toISOString()
        }]);
      }
    } else {
      favorites.push(id);
      localStorage.setItem('favorites', JSON.stringify(favorites));
      setIsFavorite(true);
      
      toast({
        title: "Ajouté aux favoris",
        description: `"${movie.title}" a été ajouté à vos favoris.`
      });
      
      // Journaliser l'activité
      if (user) {
        supabase.from('activities').insert([{
          user_id: user.id,
          action: "favorite_add",
          content_type: "movie",
          content_id: id,
          details: { title: movie.title },
          timestamp: new Date().toISOString()
        }]);
      }
    }
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <div className="bg-red-900/50 border border-red-700 rounded-lg p-6">
          <h2 className="text-2xl font-bold mb-2">Erreur</h2>
          <p className="text-gray-300">{error}</p>
        </div>
      </div>
    );
  }

  if (!movie) {
    return notFound();
  }
  
  // Vérifier si l'utilisateur peut voir ce film (VIP)
  const canWatch = !movie.isVIP || isVIP;

  return (
    <>
      {/* Backdrop avec overlay */}
      {movie.backdropUrl && (
        <div className="absolute top-0 left-0 right-0 h-[50vh] z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-gray-900"></div>
          <img 
            src={movie.backdropUrl} 
            alt={`Backdrop de ${movie.title}`}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      
      <div className="container mx-auto px-4 py-8 relative z-10 mt-16">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Poster */}
          <div className="w-full md:w-1/3 lg:w-1/4 flex-shrink-0">
            <img 
              src={movie.posterUrl || '/placeholder-poster.png'} 
              alt={`Affiche de ${movie.title}`} 
              className="w-full rounded-lg shadow-lg"
            />
            
            {/* Infos sur mobile */}
            <div className="md:hidden mt-4 space-y-2">
              <div className="flex items-center space-x-4 text-gray-400">
                <span className="flex items-center">
                  <Calendar className="mr-1 h-4 w-4" /> {movie.year}
                </span>
                <span className="flex items-center">
                  <Clock className="mr-1 h-4 w-4" /> {Math.floor(movie.duration / 60)}h {movie.duration % 60}min
                </span>
                {movie.rating && (
                  <span className="flex items-center">
                    <Star className="mr-1 h-4 w-4 text-yellow-400" /> {movie.rating.toFixed(1)}/10
                  </span>
                )}
              </div>
              
              <div className="flex flex-wrap gap-2">
                {movie.genres.map((genre) => (
                  <span key={genre} className="px-3 py-1 bg-gray-700 text-xs rounded-full">
                    {genre}
                  </span>
                ))}
              </div>
            </div>
            
            {movie.isVIP && (
              <div className="mt-4 p-3 bg-gradient-to-r from-amber-900/30 to-yellow-900/30 border border-amber-800/50 rounded-lg">
                <p className="text-amber-400 font-medium mb-1">Contenu VIP</p>
                <p className="text-sm text-gray-300">
                  {isVIP 
                    ? "Vous avez accès à ce contenu exclusif grâce à votre abonnement VIP."
                    : "Ce contenu est réservé aux abonnés VIP. Découvrez tous les avantages de l'abonnement VIP."
                  }
                </p>
                {!isVIP && (
                  <Button 
                    size="sm" 
                    className="mt-3 w-full bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700"
                  >
                    Devenir VIP
                  </Button>
                )}
              </div>
            )}
          </div>

          {/* Détails */}
          <div className="flex-1">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">{movie.title}</h1>
            
            {/* Infos sur desktop */}
            <div className="hidden md:block">
              <div className="flex items-center space-x-4 text-gray-400 mb-4">
                <span className="flex items-center">
                  <Calendar className="mr-1 h-4 w-4" /> {movie.year}
                </span>
                <span className="flex items-center">
                  <Clock className="mr-1 h-4 w-4" /> {Math.floor(movie.duration / 60)}h {movie.duration % 60}min
                </span>
                {movie.rating && (
                  <span className="flex items-center">
                    <Star className="mr-1 h-4 w-4 text-yellow-400" /> {movie.rating.toFixed(1)}/10
                  </span>
                )}
              </div>
              
              <div className="flex flex-wrap gap-2 mb-6">
                {movie.genres.map((genre) => (
                  <span key={genre} className="px-3 py-1 bg-gray-700 text-xs rounded-full">
                    {genre}
                  </span>
                ))}
              </div>
            </div>
            
            <p className="text-gray-300 mb-6">{movie.description}</p>
            
            {/* Informations sur le réalisateur et le casting */}
            {(movie.director || (movie.cast && movie.cast.length > 0)) && (
              <div className="mb-6">
                {movie.director && (
                  <p className="mb-1">
                    <span className="font-medium">Réalisateur:</span>{" "}
                    <span className="text-gray-300">{movie.director}</span>
                  </p>
                )}
                
                {movie.cast && movie.cast.length > 0 && (
                  <div>
                    <p className="font-medium mb-1">Casting:</p>
                    <div className="flex flex-wrap gap-x-6 gap-y-2 text-gray-300 text-sm">
                      {movie.cast.map((person, index) => (
                        <div key={index} className="flex items-center">
                          {person.photoUrl ? (
                            <img 
                              src={person.photoUrl} 
                              alt={person.name} 
                              className="w-6 h-6 rounded-full mr-2 object-cover"
                            />
                          ) : (
                            <div className="w-6 h-6 rounded-full bg-gray-700 mr-2 flex items-center justify-center text-xs">
                              {person.name.charAt(0)}
                            </div>
                          )}
                          <span>{person.name}</span>
                          {person.role && (
                            <span className="text-gray-400 ml-1">({person.role})</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
            
            <div className="flex flex-wrap gap-4">
              <Button
                size="lg"
                disabled={!canWatch}
                className={!canWatch ? "opacity-50 cursor-not-allowed" : ""}
              >
                <Play className="mr-2 h-5 w-5" /> Regarder
              </Button>
              
              {movie.trailerUrl && (
                <Button variant="outline" size="lg">
                  <Info className="mr-2 h-5 w-5" /> Bande-annonce
                </Button>
              )}
              
              <Button
                variant="ghost"
                size="lg"
                onClick={toggleFavorite}
              >
                <Heart 
                  className={`mr-2 h-5 w-5 ${isFavorite ? 'fill-current text-red-500' : ''}`} 
                />
                {isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
              </Button>
              
              <Button variant="ghost" size="lg">
                <Share className="mr-2 h-5 w-5" /> Partager
              </Button>
            </div>
          </div>
        </div>

        {/* Onglets supplémentaires */}
        <div className="mt-12">
          <Tabs defaultValue="overview">
            <TabsList className="w-full md:w-auto border-b border-gray-700">
              <TabsTrigger value="overview">Synopsis</TabsTrigger>
              <TabsTrigger value="related">Films similaires</TabsTrigger>
              <TabsTrigger value="comments">Commentaires</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="pt-6">
              <div className="mb-8">
                <h2 className="text-xl font-semibold mb-4">Synopsis</h2>
                <p className="text-gray-300 whitespace-pre-line">{movie.description}</p>
              </div>
              
              {movie.trailerUrl && (
                <div>
                  <h2 className="text-xl font-semibold mb-4">Bande-annonce</h2>
                  <div className="aspect-video bg-black rounded-lg overflow-hidden">
                    <iframe
                      src={movie.trailerUrl.replace('watch?v=', 'embed/')}
                      title={`Bande-annonce de ${movie.title}`}
                      allowFullScreen
                      className="w-full h-full"
                    ></iframe>
                  </div>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="related" className="pt-6">
              <h2 className="text-xl font-semibold mb-4">Films similaires</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {/* Films similaires seraient chargés ici */}
                <div className="text-center p-8 text-gray-400">
                  Pas de films similaires disponibles pour le moment.
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="comments" className="pt-6">
              <h2 className="text-xl font-semibold mb-4">Commentaires</h2>
              <CommentsSection contentId={id} contentType="movie" />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
}