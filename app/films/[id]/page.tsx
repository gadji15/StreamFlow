"use client";

import React, { useEffect, useState } from "react";
import { useParams, notFound, useRouter } from "next/navigation";
import LoadingScreen from "@/components/loading-screen";
import { useToast } from "@/components/ui/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CommentsSection } from "@/components/comments-section";
import { supabase } from "@/lib/supabaseClient";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import FilmBackdrop from "@/components/FilmBackdrop";
import FilmPosterCard from "@/components/FilmPosterCard";
import FilmInfo from "@/components/FilmInfo";
import ActionButtons from "@/components/ActionButtons";
import CastingGrid from "@/components/CastingGrid";
import { fetchTMDBSimilarMovies, getTMDBImageUrl } from "@/lib/tmdb";
import FilmCard from "@/components/FilmCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { BookText, Users, CopyPlus, MessageSquare } from "lucide-react";

function normalizePosterUrl(raw: any) {
  if (typeof raw === "string" && raw.trim().length > 0) {
    if (/^https?:\/\//.test(raw)) return raw.trim();
    return getTMDBImageUrl(raw, "w300");
  }
  return "/placeholder-poster.png";
}
function normalizeBackdropUrl(raw: any) {
  if (typeof raw === "string" && raw.trim().length > 0) {
    if (/^https?:\/\//.test(raw)) return raw.trim();
    return getTMDBImageUrl(raw, "original");
  }
  return "/placeholder-backdrop.jpg";
}

function SimilarLocalMovies({ currentMovieId, tmdbId }: { currentMovieId: string; tmdbId: string }) {
  const [similarLocal, setSimilarLocal] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function fetchSimilar() {
      setLoading(true);
      try {
        if (!tmdbId) {
          setSimilarLocal([]);
          return;
        }
        // 1. Get similar movies from TMDB
        const similarFromTMDB = await fetchTMDBSimilarMovies(tmdbId);
        const similarTMDBIds = similarFromTMDB.map((m) => m.id);

        // 2. Fetch all local films
        const { data: localFilms, error } = await supabase
          .from("films")
          .select("*")
          .neq("id", currentMovieId);

        if (error || !localFilms) {
          setSimilarLocal([]);
          return;
        }

        // 3. Cross-reference: local films whose tmdb_id is in similarTMDBIds
        const matching = localFilms.filter(
          (film: any) =>
            film.tmdb_id && similarTMDBIds.includes(Number(film.tmdb_id))
        );

        setSimilarLocal(matching);
      } catch (e) {
        setSimilarLocal([]);
      } finally {
        setLoading(false);
      }
    }
    fetchSimilar();
  }, [tmdbId, currentMovieId]);

  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="h-64 bg-gray-800 rounded-xl animate-pulse"
            aria-hidden="true"
          ></div>
        ))}
      </div>
    );
  }

  if (!similarLocal.length) {
    return (
      <div className="text-center p-8 text-gray-400">
        Aucun film similaire disponible dans la plateforme.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
      {similarLocal.map((film) => (
        <FilmCard
          key={film.id}
          id={film.id}
          title={film.title}
          description={film.description}
          imageUrl={normalizePosterUrl(film.poster)}
        />
      ))}
    </div>
  );
}

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
  const router = useRouter();

  useEffect(() => {
    if (!id) return;

    const fetchMovie = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const { data: fetchedMovie, error: movieError } = await supabase
          .from("films")
          .select("*")
          .eq("id", id)
          .single();

        if (movieError || !fetchedMovie) {
          setError("Film non trouvé.");
          notFound();
        } else {
          const normalizedMovie = {
            ...fetchedMovie,
            posterUrl: normalizePosterUrl(fetchedMovie.poster),
            backdropUrl: normalizeBackdropUrl(fetchedMovie.backdrop),
            trailerUrl: fetchedMovie.trailer_url || "",
            videoUrl: fetchedMovie.video_url || "",
            duration: fetchedMovie.duration ?? fetchedMovie.runtime ?? 0,
            rating: fetchedMovie.vote_average ?? null,
            tmdbId: fetchedMovie.tmdb_id || "",
            isVIP: fetchedMovie.is_vip,
          };
          setMovie(normalizedMovie);

          supabase
            .from("films")
            .update({ views: (fetchedMovie.views || 0) + 1 })
            .eq("id", id);

          if (user) {
            const { data: profile } = await supabase
              .from("profiles")
              .select("is_vip")
              .eq("id", user.id)
              .single();
            setIsVIP(profile?.is_vip || false);

            supabase.from("activities").insert([
              {
                user_id: user.id,
                action: "content_view",
                content_type: "movie",
                content_id: id,
                details: { title: fetchedMovie.title, isVIP: fetchedMovie.is_vip },
                timestamp: new Date().toISOString(),
              },
            ]);
          }

          checkIfFavorite(id);
        }
      } catch (err) {
        setError("Impossible de charger les détails du film.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchMovie();
  }, [id, user]);

  const checkIfFavorite = async (movieId: string) => {
    if (user && movieId) {
      const { data, error } = await supabase
        .from("favorites")
        .select("id")
        .eq("user_id", user.id)
        .eq("film_id", movieId)
        .maybeSingle();
      setIsFavorite(!!data && !error);
    }
  };

  const toggleFavorite = async () => {
    if (!user) {
      toast({
        title: "Connexion requise",
        description: "Veuillez vous connecter pour ajouter ce film à vos favoris.",
        variant: "destructive",
      });
      return;
    }
    if (!movie) return;

    if (isFavorite) {
      const { error } = await supabase
        .from("favorites")
        .delete()
        .eq("user_id", user.id)
        .eq("film_id", id);

      if (!error) {
        setIsFavorite(false);
        toast({
          title: "Retiré des favoris",
          description: `"${movie.title}" a été retiré de vos favoris.`,
        });
        supabase.from("activities").insert([
          {
            user_id: user.id,
            action: "favorite_remove",
            content_type: "movie",
            content_id: id,
            details: { title: movie.title },
            timestamp: new Date().toISOString(),
          },
        ]);
      } else {
        toast({
          title: "Erreur",
          description: "Impossible de retirer ce film des favoris.",
          variant: "destructive",
        });
      }
    } else {
      const { error } = await supabase.from("favorites").insert([
        {
          user_id: user.id,
          film_id: id,
          created_at: new Date().toISOString(),
        },
      ]);
      if (!error) {
        setIsFavorite(true);
        toast({
          title: "Ajouté aux favoris",
          description: `"${movie.title}" a été ajouté à vos favoris.`,
        });
        supabase.from("activities").insert([
          {
            user_id: user.id,
            action: "favorite_add",
            content_type: "movie",
            content_id: id,
            details: { title: movie.title },
            timestamp: new Date().toISOString(),
          },
        ]);
      } else {
        toast({
          title: "Erreur",
          description: "Impossible d'ajouter ce film aux favoris.",
          variant: "destructive",
        });
      }
    }
    checkIfFavorite(id);
  };

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Lien copié",
        description: "Le lien du film a été copié dans le presse-papiers.",
      });
    }
  };

  const handlePlay = () => {
    if (movie && (!movie.isVIP || isVIP) && movie.videoUrl) {
      router.push(`/films/${movie.id}/watch`);
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

  const canWatch = !movie.isVIP || isVIP;

  return (
    <>
      {movie.backdropUrl && (
        <FilmBackdrop src={movie.backdropUrl} alt={`Backdrop de ${movie.title}`} />
      )}

      <div className="container mx-auto px-4 pt-32 pb-8 relative z-10">
        <div className="flex flex-col md:flex-row gap-10">
          {/* Poster et VIP badge */}
          <div className="w-full md:w-1/3 lg:w-1/4 flex flex-col items-center md:items-start gap-6 relative">
            <FilmPosterCard src={movie.posterUrl} alt={`Affiche de ${movie.title}`} />
            {movie.isVIP && (
              <div className="mt-4 w-full flex flex-col items-center">
                <Badge variant="secondary" className="mb-2 text-amber-400 bg-amber-900/60 border-amber-800/80 px-4 py-1 text-lg">
                  Contenu VIP
                </Badge>
                <div className="p-3 bg-gradient-to-r from-amber-900/30 to-yellow-900/30 border border-amber-800/50 rounded-lg w-full text-center">
                  <p className="text-amber-400 font-medium mb-1">
                    {isVIP
                      ? "Vous avez accès à ce contenu exclusif grâce à votre abonnement VIP."
                      : "Ce contenu est réservé aux abonnés VIP. Découvrez tous les avantages de l'abonnement VIP."}
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
              </div>
            )}
          </div>

          <div className="flex-1 flex flex-col gap-5">
            <FilmInfo
              title={movie.title}
              year={movie.year}
              duration={movie.duration}
              genres={movie.genre}
              rating={movie.rating}
            />

            <ActionButtons
              canWatch={canWatch}
              videoUrl={movie.videoUrl}
              trailerUrl={movie.trailerUrl}
              isFavorite={isFavorite}
              onToggleFavorite={toggleFavorite}
              onShare={handleShare}
              onPlay={handlePlay}
            />

            <p className="text-gray-300 text-base mt-2 mb-3">{movie.description}</p>
            {movie.director && (
              <p className="mb-3">
                <span className="font-medium">Réalisateur :</span>{" "}
                <span className="text-gray-300">{movie.director}</span>
              </p>
            )}
          </div>
        </div>

        {/* Onglets premium */}
        <div className="mt-12">
          <Tabs defaultValue="overview">
            <TabsList className="w-full min-w-0 flex-nowrap gap-1 overflow-x-auto whitespace-nowrap border-b border-gray-700 scrollbar-hide">
  <TabsTrigger value="overview" className="flex-shrink-0 min-w-[44px] text-xs py-0.5 flex flex-col items-center">
    <BookText className="w-5 h-5 inline sm:hidden" />
    <span className="hidden sm:inline">Synopsis</span>
  </TabsTrigger>
  <TabsTrigger value="casting" className="flex-shrink-0 min-w-[44px] text-xs py-0.5 flex flex-col items-center">
    <Users className="w-5 h-5 inline sm:hidden" />
    <span className="hidden sm:inline">Casting</span>
  </TabsTrigger>
  <TabsTrigger value="related" className="flex-shrink-0 min-w-[44px] text-xs py-0.5 flex flex-col items-center">
    <CopyPlus className="w-5 h-5 inline sm:hidden" />
    <span className="hidden sm:inline">Films similaires</span>
  </TabsTrigger>
  <TabsTrigger value="comments" className="flex-shrink-0 min-w-[44px] text-xs py-0.5 flex flex-col items-center">
    <MessageSquare className="w-5 h-5 inline sm:hidden" />
    <span className="hidden sm:inline">Commentaires</span>
  </TabsTrigger>
</TabsList>
            {/* 
              Pour que la classe scrollbar-none fonctionne partout, ajoutez ceci dans votre CSS global :
              .scrollbar-none { scrollbar-width: none; -ms-overflow-style: none; }
              .scrollbar-none::-webkit-scrollbar { display: none; }
            */}
            <TabsContent value="overview" className="pt-6">
  <div className="mb-4">
    <h2 className="text-base font-semibold mb-2">Synopsis</h2>
    <p className="text-gray-300 whitespace-pre-line">{movie.description}</p>
  </div>
  {movie.trailerUrl && (
    <div>
      <h2 className="text-base font-semibold mb-2">Bande-annonce</h2>
      <div className="aspect-video bg-black rounded-lg overflow-hidden">
        <iframe
          src={
            movie.trailerUrl.includes("youtube.com/watch")
              ? movie.trailerUrl.replace("watch?v=", "embed/")
              : movie.trailerUrl
          }
          title={`Bande-annonce de ${movie.title}`}
          allowFullScreen
          className="w-full h-full"
        ></iframe>
      </div>
    </div>
  )}
</TabsContent>

            <TabsContent value="casting" className="pt-6">
  <h2 className="text-base font-semibold mb-2">Casting</h2>
  {movie.tmdbId ? (
    <CastingGrid tmdbId={movie.tmdbId} type="movie" fallbackCast={movie.cast} />
  ) : (
    <div className="text-gray-400">Aucun casting disponible.</div>
  )}
</TabsContent>

            <TabsContent value="related" className="pt-6">
  <h2 className="text-base font-semibold mb-2">Films similaires</h2>
  <SimilarLocalMovies currentMovieId={id} tmdbId={movie.tmdbId} />
</TabsContent>

            <TabsContent value="comments" className="pt-6">
  <h2 className="text-base font-semibold mb-2">Commentaires</h2>
  <CommentsSection contentId={id} contentType="movie" />
</TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
}