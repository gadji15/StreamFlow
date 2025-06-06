"use client";

import React, { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useToast } from "@/components/ui/use-toast";
import LoadingScreen from "@/components/loading-screen";
import SeriesBackdrop from "@/components/SeriesBackdrop";
import SeriesPosterCard from "@/components/SeriesPosterCard";
import SeriesInfo from "@/components/SeriesInfo";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CommentsSection } from "@/components/comments-section";
import SeasonsEpisodesTab from "@/components/series/SeasonsEpisodesTab";
import CastingGrid from "@/components/CastingGrid";
import SimilarSeriesGrid from "@/components/series/SimilarSeriesGrid";
import { getTMDBImageUrl } from "@/lib/tmdb";
import { cn } from "@/lib/utils";
import { BookText, Users, CopyPlus, MessageSquare, Layers, Play, Sparkles, Share2 } from "lucide-react";
import { useMobile } from "@/hooks/use-mobile";

export default function SeriesDetailPage() {
  const params = useParams();
  const id = params && typeof params.id === "string"
    ? params.id
    : Array.isArray(params?.id)
    ? params.id[0]
    : undefined;
  const router = useRouter();
  const { user } = useCurrentUser();
  const { toast } = useToast();
  const isMobile = useMobile();

  // Data state
  const [series, setSeries] = useState<any>(null);
  const [seasons, setSeasons] = useState<any[]>([]);
  const [episodes, setEpisodes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isVIP, setIsVIP] = useState(false);
  const [selectedSeasonId, setSelectedSeasonId] = useState<string | null>(null);

  const isInitialMount = useRef(true);

  // --- DATA FETCHING ---
  async function fetchAllSeriesData(seriesId: string, userId: string | null) {
    try {
      setIsLoading(true);
      setError(null);

      // Series details
      const { data: fetchedSeries, error: seriesError } = await supabase
        .from("series")
        .select("*")
        .eq("id", seriesId)
        .single();

      if (seriesError || !fetchedSeries) {
        setError("Série non trouvée.");
        setIsLoading(false);
        return;
      }

      // All seasons for the series (ordered)
      const { data: fetchedSeasons } = await supabase
        .from("seasons")
        .select("*")
        .eq("series_id", seriesId)
        .order("season_number", { ascending: true });

      // All episodes for the series (ordered)
      const { data: fetchedEpisodes } = await supabase
        .from("episodes")
        .select("*")
        .eq("series_id", seriesId)
        .order("episode_number");

      // Map poster/backdrop
      const normalizedPosterUrl = (raw: any) => {
        if (typeof raw === "string" && raw.trim().length > 0) {
          if (/^https?:\/\//.test(raw)) return raw.trim();
          return getTMDBImageUrl(raw, "w300");
        }
        return "/placeholder-poster.jpg";
      };
      const normalizedBackdropUrl = (raw: any) => {
        if (typeof raw === "string" && raw.trim().length > 0) {
          if (/^https?:\/\//.test(raw)) return raw.trim();
          return getTMDBImageUrl(raw, "original");
        }
        return "/placeholder-backdrop.jpg";
      };

      setSeries({
        ...fetchedSeries,
        posterUrl: normalizedPosterUrl(fetchedSeries.poster),
        backdropUrl: normalizedBackdropUrl(fetchedSeries.backdrop),
      });

      setSeasons(fetchedSeasons || []);
      setEpisodes(fetchedEpisodes || []);

      if (fetchedSeasons && fetchedSeasons.length > 0) {
        // Cherche la première saison qui a au moins un épisode
        const seasonWithEpisodes = fetchedSeasons.find(season =>
          (fetchedEpisodes || []).some(ep => ep.season_id === season.id)
        );
        setSelectedSeasonId(
          seasonWithEpisodes
            ? seasonWithEpisodes.id
            : fetchedSeasons[fetchedSeasons.length - 1].id
        );
      } else {
        setSelectedSeasonId(null);
      }

      // VIP logic (user profile)
      if (userId) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("is_vip")
          .eq("id", userId)
          .single();
        setIsVIP(profile?.is_vip || false);
      } else {
        setIsVIP(false);
      }

      // Check favorite
      if (userId) {
        const { data } = await supabase
          .from("favorites")
          .select("id")
          .eq("user_id", userId)
          .eq("series_id", seriesId)
          .maybeSingle();
        setIsFavorite(!!data);
      }
    } catch (err) {
      setError("Impossible de charger les détails de la série.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    if (!id) return;
    fetchAllSeriesData(id as string, user?.id || null);
    isInitialMount.current = false;
    // eslint-disable-next-line
  }, [id, user]);

  useEffect(() => {
    if (!id) return;
    const seasonsSub = supabase
      .channel("public:seasons")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "seasons", filter: `series_id=eq.${id}` },
        () => {
          if (!isInitialMount.current) fetchAllSeriesData(id as string, user?.id || null);
        }
      )
      .subscribe();

    const episodesSub = supabase
      .channel("public:episodes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "episodes", filter: `series_id=eq.${id}` },
        () => {
          if (!isInitialMount.current) fetchAllSeriesData(id as string, user?.id || null);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(seasonsSub);
      supabase.removeChannel(episodesSub);
    };
    // eslint-disable-next-line
  }, [id, user]);

  // --- ACCESS LOGIC ---
  const canWatch = !series?.is_vip || isVIP;
  const seasonEpisodes = episodes.filter(
    (ep) => ep.season_id === selectedSeasonId
  );

  // --- FAVORITE HANDLING ---
  const toggleFavorite = async () => {
    if (!user) {
      toast({
        title: "Connexion requise",
        description: "Connectez-vous pour utiliser les favoris.",
        variant: "destructive",
      });
      return;
    }
    if (!series) return;

    if (isFavorite) {
      await supabase
        .from("favorites")
        .delete()
        .eq("user_id", user.id)
        .eq("series_id", id);
      setIsFavorite(false);
      toast({
        title: "Retiré des favoris",
        description: `"${series.title}" retiré de vos favoris.`,
      });
    } else {
      await supabase.from("favorites").insert([
        { user_id: user.id, series_id: id, created_at: new Date().toISOString() },
      ]);
      setIsFavorite(true);
      toast({
        title: "Ajouté aux favoris",
        description: `"${series.title}" ajouté à vos favoris.`,
      });
    }
  };

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Lien copié",
        description: "Lien copié dans le presse-papiers.",
      });
    }
  };

  const handleWatchFirst = () => {
    const seasonEpisodes = episodes.filter(
      (ep) => ep.season_id === selectedSeasonId
    );
    if (seasonEpisodes.length > 0) {
      router.push(`/series/${id}/watch/${seasonEpisodes[0].id}`);
    }
  };

  if (isLoading) return <LoadingScreen />;
  if (error || !series) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <div className="bg-red-900/50 border border-red-700 rounded-lg p-6">
          <h2 className="text-2xl font-bold mb-2">Erreur</h2>
          <p className="text-gray-300">{error || "Série non trouvée"}</p>
        </div>
      </div>
    );
  }

  // --- DESIGN HARMONISÉ AVEC LA PAGE FILM ---
  return (
    <>
      {series.backdropUrl && (
        <SeriesBackdrop src={series.backdropUrl} alt={`Backdrop de ${series.title}`} />
      )}

      <div className="container mx-auto px-2 sm:px-4 pt-24 sm:pt-32 pb-6 sm:pb-8 relative z-10">
        <div className="flex flex-col md:flex-row gap-6 sm:gap-10">
          {/* Poster et badge VIP */}
          <div className="w-full md:w-1/3 lg:w-1/4 flex flex-col items-center md:items-start gap-4 sm:gap-6 relative">
            <div className="w-32 sm:w-44 md:w-full ml-2 sm:ml-0">
              <SeriesPosterCard src={series.posterUrl} alt={`Affiche de ${series.title}`} />
            </div>
            {series.is_vip && (
              <div className="mt-4 w-full flex flex-col items-center">
                <Badge variant="secondary" className="mb-2 text-amber-400 bg-amber-900/60 border-amber-800/80 px-3 py-0.5 sm:px-4 sm:py-1 text-base sm:text-lg">
                  Contenu VIP
                </Badge>
                <div className="p-2 sm:p-3 bg-gradient-to-r from-amber-900/30 to-yellow-900/30 border border-amber-800/50 rounded-lg w-full text-center">
                  <p className="text-amber-400 font-medium mb-1 text-xs sm:text-base">
                    {isVIP
                      ? "Vous avez accès à ce contenu exclusif grâce à votre abonnement VIP."
                      : "Ce contenu est réservé aux abonnés VIP. Découvrez tous les avantages de l'abonnement VIP."}
                  </p>
                  {!isVIP && (
                    <Button
                      size="sm"
                      className="mt-2 sm:mt-3 w-full bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-xs sm:text-base"
                      onClick={() => router.push("/vip")}
                    >
                      Devenir VIP
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="flex-1 flex flex-col gap-4 sm:gap-5">
            <SeriesInfo
              title={series.title}
              startYear={series.start_year}
              endYear={series.end_year}
              seasons={seasons.length}
              genres={series.genre}
              rating={series.vote_average}
              className="text-base sm:text-lg"
            />

            {/* Actions harmonisées film/serie - icônes-only sur mobile, complet sur desktop */}
            <div className="flex sm:hidden mb-2">
              <div className="flex gap-2 w-full">
                <Button
                  size="icon"
                  className="p-2 sm:p-4 transition-colors hover:bg-primary/20 active:bg-primary/40 focus-visible:ring-2 focus-visible:ring-primary"
                  onClick={handleWatchFirst}
                  disabled={!canWatch || seasonEpisodes.length === 0}
                  aria-label="Regarder la série"
                >
                  <Play className="h-5 w-5 sm:h-6 sm:w-6" />
                </Button>
                <Button
                  variant={isFavorite ? "default" : "outline"}
                  size="icon"
                  className="p-2 sm:p-4 transition-colors hover:bg-purple-400/20 active:bg-purple-400/40 focus-visible:ring-2 focus-visible:ring-purple-400"
                  onClick={toggleFavorite}
                  aria-label={isFavorite ? "Retirer des favoris" : "Ajouter aux favoris"}
                >
                  <Sparkles className="h-5 w-5 sm:h-6 sm:w-6" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="p-2 sm:p-4 transition-colors hover:bg-blue-400/20 active:bg-blue-400/40 focus-visible:ring-2 focus-visible:ring-blue-400"
                  onClick={handleShare}
                  aria-label="Partager"
                >
                  <Share2 className="h-5 w-5 sm:h-6 sm:w-6" />
                </Button>
              </div>
            </div>
            <div className="hidden sm:flex flex-row gap-3 mb-2">
              <Button
                size="lg"
                className="w-auto gap-2"
                onClick={handleWatchFirst}
                disabled={!canWatch || seasonEpisodes.length === 0}
                aria-label="Regarder la série"
              >
                <Play className="h-5 w-5" />
                Regarder
              </Button>
              <Button
                variant={isFavorite ? "default" : "outline"}
                size="lg"
                className="w-auto gap-2"
                onClick={toggleFavorite}
                aria-label={isFavorite ? "Retirer des favoris" : "Ajouter aux favoris"}
              >
                <Sparkles className="h-5 w-5" />
                {isFavorite ? "Retirer des favoris" : "Ajouter aux favoris"}
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="w-auto gap-2"
                onClick={handleShare}
                aria-label="Partager"
              >
                <Share2 className="h-5 w-5" />
                Partager
              </Button>
            </div>

            <p className="text-gray-300 text-sm sm:text-base mt-2 mb-2 sm:mb-3">{series.description}</p>
          </div>
        </div>

        {/* Onglets premium harmonisés */}
        <div className="mt-8 sm:mt-12">
          <Tabs defaultValue="seasons">
            <TabsList className="w-full min-w-0 flex-nowrap gap-1 overflow-x-auto whitespace-nowrap border-b border-gray-700 scrollbar-hide text-xs sm:text-base">
              <TabsTrigger
                value="seasons"
                className="flex-shrink-0 min-w-[44px] py-0.5 flex flex-col items-center group data-[state=active]:bg-transparent transition-colors hover:bg-gray-800/50"
              >
                <Layers className="w-5 h-5 mb-0.5 sm:hidden group-data-[state=active]:text-primary hover:text-primary text-gray-400 transition-colors" />
                <span className="hidden sm:inline group-data-[state=active]:text-primary hover:text-primary transition-colors">Saisons</span>
              </TabsTrigger>
              <TabsTrigger
                value="trailer"
                className="flex-shrink-0 min-w-[44px] py-0.5 flex flex-col items-center group data-[state=active]:bg-transparent transition-colors hover:bg-gray-800/50"
              >
                <BookText className="w-5 h-5 mb-0.5 sm:hidden group-data-[state=active]:text-primary hover:text-primary text-gray-400 transition-colors" />
                <span className="hidden sm:inline group-data-[state=active]:text-primary hover:text-primary transition-colors">Bande-annonce</span>
              </TabsTrigger>
              <TabsTrigger
                value="casting"
                className="flex-shrink-0 min-w-[44px] py-0.5 flex flex-col items-center group data-[state=active]:bg-transparent transition-colors hover:bg-gray-800/50"
              >
                <Users className="w-5 h-5 mb-0.5 sm:hidden group-data-[state=active]:text-primary hover:text-primary text-gray-400 transition-colors" />
                <span className="hidden sm:inline group-data-[state=active]:text-primary hover:text-primary transition-colors">Casting</span>
              </TabsTrigger>
              <TabsTrigger
                value="related"
                className="flex-shrink-0 min-w-[44px] py-0.5 flex flex-col items-center group data-[state=active]:bg-transparent transition-colors hover:bg-gray-800/50"
              >
                <CopyPlus className="w-5 h-5 mb-0.5 sm:hidden group-data-[state=active]:text-primary hover:text-primary text-gray-400 transition-colors" />
                <span className="hidden sm:inline group-data-[state=active]:text-primary hover:text-primary transition-colors">Séries similaires</span>
              </TabsTrigger>
              <TabsTrigger
                value="comments"
                className="flex-shrink-0 min-w-[44px] py-0.5 flex flex-col items-center group data-[state=active]:bg-transparent transition-colors hover:bg-gray-800/50"
              >
                <MessageSquare className="w-5 h-5 mb-0.5 sm:hidden group-data-[state=active]:text-primary hover:text-primary text-gray-400 transition-colors" />
                <span className="hidden sm:inline group-data-[state=active]:text-primary hover:text-primary transition-colors">Commentaires</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="seasons" className="pt-6">
              <SeasonsEpisodesTab
                seasons={seasons}
                episodes={episodes}
                id={id}
                isVIP={isVIP}
                isMobile={isMobile}
                selectedSeasonId={selectedSeasonId}
                setSelectedSeasonId={setSelectedSeasonId}
                renderSeasonsNavMobile={() => <></>}
                renderSeasonsNavDesktop={() => <></>}
              />
            </TabsContent>

            <TabsContent value="trailer" className="pt-6">
              {series.trailer_url ? (
                <div>
                  <h2 className="text-base font-semibold mb-2">Bande-annonce</h2>
                  <div className="aspect-video bg-black rounded-lg overflow-hidden">
                    <iframe
                      src={
                        series.trailer_url.includes("youtube.com/watch")
                          ? series.trailer_url.replace("watch?v=", "embed/")
                          : series.trailer_url
                      }
                      title={`Bande-annonce de ${series.title}`}
                      allowFullScreen
                      className="w-full h-full"
                    ></iframe>
                  </div>
                </div>
              ) : (
                <div className="text-gray-400">Aucune bande-annonce disponible.</div>
              )}
            </TabsContent>

            <TabsContent value="casting" className="pt-6">
              <h2 className="text-base font-semibold mb-2">Casting</h2>
              {series.tmdb_id ? (
                <CastingGrid
                  tmdbId={series.tmdb_id}
                  type="tv"
                  fallbackCast={series.cast}
                />
              ) : series.cast && series.cast.length > 0 ? (
                <ul className="space-y-2">
                  {series.cast.map((actor: any, idx: number) => {
                    let imgUrl = null;
                    if (actor.image) {
                      if (/^https?:\/\//.test(actor.image)) {
                        imgUrl = actor.image;
                      } else {
                        imgUrl = getTMDBImageUrl(actor.image, "w185");
                      }
                    } else if (actor.profile_path) {
                      imgUrl = getTMDBImageUrl(actor.profile_path, "w185");
                    }
                    return (
                      <li key={idx} className="flex items-center gap-3">
                        {imgUrl && (
                          <img
                            src={imgUrl}
                            alt={actor.name}
                            className="w-10 h-10 object-cover rounded-full border border-gray-600"
                            loading="lazy"
                          />
                        )}
                        <div className="flex-1 flex justify-between items-center">
                          <span className="font-medium text-sm">{actor.name}</span>
                          {actor.role && (
                            <span className="text-gray-400 text-xs">
                              {actor.role}
                            </span>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <div className="text-gray-400">Aucun casting disponible.</div>
              )}
            </TabsContent>

            <TabsContent value="related" className="pt-6">
              <h2 className="text-base font-semibold mb-2">Séries similaires</h2>
              <SimilarSeriesGrid tmdbId={series.tmdb_id} currentSeriesId={id as string} />
            </TabsContent>

            <TabsContent value="comments" className="pt-6">
              <h2 className="text-base font-semibold mb-2">Commentaires</h2>
              <CommentsSection contentId={id as string} contentType="series" />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
}