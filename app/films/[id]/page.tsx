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
import dynamic from "next/dynamic";
import RelatedMovies from '@/components/RelatedMovies';
import Image from 'next/image';

const VideoPlayer = dynamic(() => import('@/components/VideoPlayer'), { ssr: false });

const TMDB_API_KEY = process.env.NEXT_PUBLIC_TMDB_KEY;
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

interface CastPerson {
  id: number;
  name: string;
  character?: string;
  profile_path?: string;
}

export default function FilmDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const [movie, setMovie] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [cast, setCast] = useState<CastPerson[]>([]);
  const [isFetchingCast, setIsFetchingCast] = useState(false);

  const { user } = useCurrentUser();
  const [isVIP, setIsVIP] = useState(false);
  const { toast } = useToast();

  // Fetch movie details + VIP logic
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
          // Normalisation
          const normalizedMovie = {
            ...fetchedMovie,
            posterUrl: fetchedMovie.poster || '/placeholder-poster.png',
            backdropUrl: fetchedMovie.backdrop || '/placeholder-backdrop.jpg',
            trailerUrl: fetchedMovie.trailer_url || "",
            videoUrl: fetchedMovie.video_url || "",
            duration: fetchedMovie.duration ?? fetchedMovie.runtime ?? 0,
            rating: fetchedMovie.vote_average ?? null,
            tmdb_id: fetchedMovie.tmdb_id || null,
            genre: fetchedMovie.genre || fetchedMovie.genres || "",
          };
          setMovie(normalizedMovie);

          // Incrémentation vues
          supabase
            .from('films')
            .update({ views: (fetchedMovie.views || 0) + 1 })
            .eq('id', id);

          // VIP
          if (user) {
            const { data: profile } = await supabase
              .from('profiles')
              .select('is_vip')
              .eq('id', user.id)
              .single();
            setIsVIP(profile?.is_vip || false);

            // Journalisation
            supabase.from('activities').insert([{
              user_id: user.id,
              action: "content_view",
              content_type: "movie",
              content_id: id,
              details: { title: fetchedMovie.title, isVIP: fetchedMovie.is_vip },
              timestamp: new Date().toISOString()
            }]);
          }

          syncFavoriteServer(id);

          // Fetch cast from TMDB
          if (normalizedMovie.tmdb_id) {
            fetchCastFromTMDB(normalizedMovie.tmdb_id);
          } else {
            setCast([]);
          }
        }
      } catch (err) {
        console.error("Erreur de chargement du film:", err);
        setError("Impossible de charger les détails du film.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchMovie();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, user]);

  // Fetch cast from TMDB
  const fetchCastFromTMDB = async (tmdbId: number) => {
    if (!TMDB_API_KEY) return;
    setIsFetchingCast(true);
    try {
      const res = await fetch(
        `${TMDB_BASE_URL}/movie/${tmdbId}/credits?api_key=${TMDB_API_KEY}&language=fr-FR`
      );
      if (!res.ok) throw new Error('TMDB error');
      const data = await res.json();
      if (data && data.cast) {
        setCast(
          data.cast
            .filter((p: any) => p.known_for_department === "Acting")
            .slice(0, 10)
        );
      } else {
        setCast([]);
      }
    } catch (err) {
      setCast([]);
    } finally {
      setIsFetchingCast(false);
    }
  };

  // FAVORITES: server-side robust
  const syncFavoriteServer = async (movieId: string) => {
    if (!user) return setIsFavorite(false);
    try {
      const res = await fetch(`/api/favorites?userId=${user.id}`);
      const json = await res.json();
      setIsFavorite(Array.isArray(json.favorites) && json.favorites.some((fav: any) => String(fav.movie_id) === movieId));
    } catch {
      setIsFavorite(false);
    }
  };

  const handleToggleFavorite = async () => {
    if (!user) {
      toast({
        title: "Connexion requise",
        description: "Veuillez vous connecter pour ajouter ce film à vos favoris.",
        variant: "destructive"
      });
      return;
    }
    if (!movie) return;
    try {
      if (isFavorite) {
        await fetch('/api/favorites', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: user.id, movieId: id }),
        });
        setIsFavorite(false);
        toast({
          title: "Retiré des favoris",
          description: `"${movie.title}" a été retiré de vos favoris.`
        });
      } else {
        await fetch('/api/favorites', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: user.id, movieId: id }),
        });
        setIsFavorite(true);
        toast({
          title: "Ajouté aux favoris",
          description: `"${movie.title}" a été ajouté à vos favoris.`
        });
      }
    } catch {
      toast({
        title: "Erreur",
        description: "Impossible de modifier vos favoris.",
        variant: "destructive"
      });
    }
  };

  // Partage avancé (Web Share API)
  const handleShare = () => {
    try {
      const url = typeof window !== "undefined" ? window.location.href : "";
      if (navigator.share) {
        navigator.share({
          title: movie?.title,
          text: "Découvrez ce film sur la plateforme !",
          url,
        });
      } else {
        navigator.clipboard.writeText(url);
        toast({ title: "Lien copié !", description: "Lien du film copié dans le presse-papiers." });
      }
    } catch {
      toast({ title: "Erreur", description: "Impossible de partager le lien.", variant: "destructive" });
    }
  };

  if (isLoading) return <LoadingScreen />;
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
  if (!movie) return notFound();

  const canWatch = !movie.isVIP || isVIP;

  return (
    <div className="relative min-h-screen bg-black">
      {/* Backdrop */}
      {movie.backdropUrl && (
        <div className="relative w-full h-[40vh] md:h-[55vh] z-0">
          <Image
            src={movie.backdropUrl}
            alt={`Backdrop de ${movie.title}`}
            fill
            className="object-cover object-top pointer-events-none select-none"
            onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/placeholder-backdrop.jpg'; }}
            draggable={false}
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/60 to-transparent backdrop-blur-sm"></div>
        </div>
      )}

      <div className="container max-w-6xl mx-auto px-4 relative z-10 -mt-24 flex flex-col md:flex-row gap-8">
        {/* Poster */}
        <div className="flex flex-col items-center md:items-start flex-shrink-0 w-full md:w-[240px] lg:w-[280px]">
          <div className="relative -mt-32 md:-mt-36">
            <Image
              src={movie.posterUrl || '/placeholder-poster.png'}
              alt={`Affiche de ${movie.title}`}
              width={240}
              height={360}
              className="w-48 md:w-60 aspect-[2/3] rounded-2xl shadow-2xl border-[3px] border-white/10 bg-gray-900 object-cover"
              onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/placeholder-poster.png'; }}
              draggable={false}
              priority
            />
          </div>
          {/* VIP badge */}
          {movie.isVIP && (
            <div className="mt-4 p-3 bg-gradient-to-r from-amber-900/30 to-yellow-900/30 border border-amber-800/50 rounded-lg w-full text-center">
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

        {/* Main Info Block */}
        <div className="flex-1 flex flex-col justify-end">
          <h1 className="text-3xl md:text-4xl font-extrabold mb-2 text-white drop-shadow-sm">{movie.title}</h1>
          <div className="flex flex-wrap items-center gap-3 text-gray-300 text-sm mb-3">
            <span className="flex items-center">
              <Calendar className="mr-1 h-4 w-4" /> {movie.year}
            </span>
            {movie.duration > 0 && (
              <span className="flex items-center">
                <Clock className="mr-1 h-4 w-4" /> {Math.floor(movie.duration / 60)}h {movie.duration % 60}min
              </span>
            )}
            {movie.rating && (
              <span className="flex items-center">
                <Star className="mr-1 h-4 w-4 text-yellow-400" /> {movie.rating.toFixed(1)}/10
              </span>
            )}
            {movie.genre && movie.genre.split(',').map((genre: string) => (
              <span key={genre.trim()} className="px-3 py-1 bg-gray-700 text-xs rounded-full">
                {genre.trim()}
              </span>
            ))}
          </div>

          <div className="flex flex-wrap gap-4 mb-6">
            <Button
              size="lg"
              disabled={!canWatch || !movie.videoUrl}
              className={!canWatch || !movie.videoUrl ? "opacity-50 cursor-not-allowed" : ""}
              onClick={() => {}}
            >
              <Play className="mr-2 h-5 w-5" /> Regarder
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="hidden md:inline-flex"
              onClick={() => {
                document.getElementById("player-section")?.scrollIntoView({ behavior: "smooth" });
              }}
            >
              Voir le player
            </Button>

            {movie.trailerUrl && (
              <Button
                variant="outline"
                size="lg"
                onClick={() => {
                  if (movie.trailerUrl.startsWith('http')) {
                    window.open(movie.trailerUrl, '_blank', 'noopener,noreferrer');
                  }
                }}
              >
                <Info className="mr-2 h-5 w-5" /> Bande-annonce
              </Button>
            )}

            <Button
              variant="ghost"
              size="lg"
              onClick={handleToggleFavorite}
            >
              <Heart
                className={`mr-2 h-5 w-5 ${isFavorite ? 'fill-current text-red-500' : ''}`}
              />
              {isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
            </Button>

            <Button variant="ghost" size="lg" onClick={handleShare}>
              <Share className="mr-2 h-5 w-5" /> Partager
            </Button>
          </div>

          <div className="text-gray-300 mb-3 whitespace-pre-line">{movie.description}</div>

          {/* Director */}
          {movie.director && (
            <div className="mb-2">
              <span className="font-medium text-gray-200">Réalisateur:</span>{" "}
              <span className="text-gray-300">{movie.director}</span>
            </div>
          )}

          {/* Cast grid */}
          <div className="mb-6">
            <p className="font-medium mb-1 text-gray-200">Casting:</p>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4">
              {isFetchingCast ? (
                <div className="col-span-full text-gray-400 text-center">Chargement du casting...</div>
              ) : cast.length > 0 ? (
                cast.map((person) => (
                  <div key={person.id} className="flex flex-col items-center bg-gray-800/70 rounded-xl p-3 shadow hover:scale-105 transition">
                    <Image
                      src={person.profile_path
                        ? `https://image.tmdb.org/t/p/w185${person.profile_path}`
                        : '/placeholder-cast.png'}
                      alt={person.name}
                      width={80}
                      height={80}
                      className="w-20 h-20 rounded-full object-cover mb-2 border-2 border-gray-700"
                    />
                    <span className="font-semibold text-white text-xs text-center">{person.name}</span>
                    <span className="text-xs text-gray-400 text-center">{person.character || '-'}</span>
                  </div>
                ))
              ) : (
                <div className="col-span-full text-gray-400 text-center">Aucun membre de casting trouvé.</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Video Section */}
      <div id="player-section" className="container max-w-4xl mx-auto px-4 mt-10">
        <h2 className="text-xl font-bold text-white mb-4">Lecteur vidéo</h2>
        <VideoPlayer
          src={movie.videoUrl}
          poster={movie.posterUrl}
          title={movie.title}
          canWatch={canWatch}
          fallbackMessage={!canWatch ? "Vous n'avez pas accès à ce contenu (VIP requis)." : undefined}
        />
      </div>

      {/* Tabs section */}
      <div className="container max-w-5xl mx-auto px-4 mt-10">
        <Tabs defaultValue="overview">
          <TabsList className="w-full md:w-auto border-b border-gray-700">
            <TabsTrigger value="overview">Synopsis</TabsTrigger>
            <TabsTrigger value="related">Films similaires</TabsTrigger>
            <TabsTrigger value="comments">Commentaires</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="pt-6">
            {movie.trailerUrl && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold mb-4 text-white">Bande-annonce</h2>
                <div className="aspect-video bg-black rounded-lg overflow-hidden">
                  <iframe
                    src={
                      movie.trailerUrl.includes('youtube.com/watch')
                        ? movie.trailerUrl.replace('watch?v=', 'embed/')
                        : movie.trailerUrl
                    }
                    title={`Bande-annonce de ${movie.title}`}
                    allowFullScreen
                    className="w-full h-full"
                  ></iframe>
                </div>
              </div>
            )}
            <div>
              <h2 className="text-xl font-semibold mb-4 text-white">Synopsis</h2>
              <p className="text-gray-300 whitespace-pre-line">{movie.description}</p>
            </div>
          </TabsContent>

          <TabsContent value="related" className="pt-6">
            <h2 className="text-xl font-semibold mb-4 text-white">Films similaires</h2>
            {movie.tmdb_id ? (
              <RelatedMovies tmdbId={movie.tmdb_id} excludeMovieId={id} />
            ) : (
              <div className="col-span-full text-center p-8 text-gray-400">
                Films similaires non disponibles.
              </div>
            )}
          </TabsContent>

          <TabsContent value="comments" className="pt-6">
            <h2 className="text-xl font-semibold mb-4 text-white">Commentaires</h2>
            <div className="bg-gray-900/80 rounded-lg p-4">
              <CommentsSection contentId={id} contentType="movie" />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}