"use client";

import { useEffect, useState } from "react";
import { useParams, notFound } from "next/navigation";
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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

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
          .from("films")
          .select("*")
          .eq("id", id)
          .single();

        if (movieError || !fetchedMovie) {
          setError("Film non trouvé.");
          notFound();
        } else {
          // Mapper snake_case vers camelCase pour l'affichage
          const normalizedMovie = {
            ...fetchedMovie,
            posterUrl: fetchedMovie.poster || "/placeholder-poster.png",
            backdropUrl: fetchedMovie.backdrop || "/placeholder-backdrop.jpg",
            trailerUrl: fetchedMovie.trailer_url || "",
            videoUrl: fetchedMovie.video_url || "",
            // fallback duration for legacy
            duration: fetchedMovie.duration ?? fetchedMovie.runtime ?? 0,
            rating: fetchedMovie.vote_average ?? null,
            tmdbId: fetchedMovie.tmdb_id || "",
          };
          setMovie(normalizedMovie);

          // Incrémenter le nombre de vues (côté serveur)
          supabase
            .from("films")
            .update({ views: (fetchedMovie.views || 0) + 1 })
            .eq("id", id);

          // Récupérer le statut VIP de l'utilisateur (si besoin)
          if (user) {
            const { data: profile } = await supabase
              .from("profiles")
              .select("is_vip")
              .eq("id", user.id)
              .single();
            setIsVIP(profile?.is_vip || false);

            // Journaliser l'activité
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
    if (typeof window !== "undefined" && user) {
      const favorites = JSON.parse(localStorage.getItem("favorites") || "[]");
      setIsFavorite(favorites.includes(movieId));
    }
  };

  // Ajouter/retirer des favoris
  const toggleFavorite = () => {
    if (!user) {
      toast({
        title: "Connexion requise",
        description: "Veuillez vous connecter pour ajouter ce film à vos favoris.",
        variant: "destructive",
      });
      return;
    }
    if (!movie) return;
    const favorites = JSON.parse(localStorage.getItem("favorites") || "[]");

    if (isFavorite) {
      const updatedFavorites = favorites.filter((fav: string) => fav !== id);
      localStorage.setItem("favorites", JSON.stringify(updatedFavorites));
      setIsFavorite(false);

      toast({
        title: "Retiré des favoris",
        description: `"${movie.title}" a été retiré de vos favoris.`,
      });

      if (user) {
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
      }
    } else {
      favorites.push(id);
      localStorage.setItem("favorites", JSON.stringify(favorites));
      setIsFavorite(true);

      toast({
        title: "Ajouté aux favoris",
        description: `"${movie.title}" a été ajouté à vos favoris.`,
      });

      if (user) {
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
      }
    }
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
      window.open(movie.videoUrl, "_blank", "noopener,noreferrer");
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
      {movie.backdropUrl && (
        <FilmBackdrop src={movie.backdropUrl} alt={`Backdrop de ${movie.title}`} />
      )}

      <div className="container mx-auto px-4 pt-32 pb-8 relative z-10">
        <div className="flex flex-col md:flex-row gap-10">
          {/* Poster et VIP badge */}
          <div className="w-full md:w-1/3 lg:w-1/4 flex flex-col items-center md:items-start gap-6 relative">
            <FilmPosterCard src={movie.posterUrl} alt={`Affiche de ${movie.title}`} />
            {/* VIP Badge/Card */}
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

          {/* Bloc infos */}
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

            {/* Synopsis court */}
            <p className="text-gray-300 text-base mt-2 mb-3">{movie.description}</p>

            {/* Réalisateur */}
            {movie.director && (
              <p className="mb-3">
                <span className="font-medium">Réalisateur :</span>{" "}
                <span className="text-gray-300">{movie.director}</span>
              </p>
            )}

            {/* Casting dynamique déplacé dans l'onglet Synopsis */}
          </div>
        </div>

        {/* Onglets premium */}
        <div className="mt-12">
          <Tabs defaultValue="overview">
            <TabsList className="w-full md:w-auto border-b border-gray-700">
              <TabsTrigger value="overview">Synopsis</TabsTrigger>
              <TabsTrigger value="casting">Casting</TabsTrigger>
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
              <h2 className="text-xl font-semibold mb-4">Casting</h2>
              {movie.tmdbId ? (
                <CastingGrid tmdbId={movie.tmdbId} fallbackCast={movie.cast} />
              ) : (
                <div className="text-gray-400">Aucun casting disponible.</div>
              )}
            </TabsContent>

            <TabsContent value="related" className="pt-6">
              <h2 className="text-xl font-semibold mb-4">Films similaires</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {/* Films similaires dynamiques TMDB à intégrer ici */}
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