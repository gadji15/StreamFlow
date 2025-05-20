"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter, notFound } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useToast } from "@/components/ui/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SeasonEpisodeList from "@/components/series/season-episode-list";
import { CommentsSection } from "@/components/comments-section";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, Sparkles, Share2, Star, ChevronDown } from "lucide-react";
import dynamic from "next/dynamic";
import LoadingScreen from "@/components/loading-screen";

// You may need to create/adapt these components for true DRYness and design consistency.
import SeriesBackdrop from "@/components/SeriesBackdrop";
import SeriesPosterCard from "@/components/SeriesPosterCard";
import SeriesInfo from "@/components/SeriesInfo";
import ActionButtons from "@/components/ActionButtons";
import SeriesCard from "@/components/SeriesCard";

const CastingGrid = dynamic(() => import("@/components/CastingGrid"), { ssr: false });

export default function SeriesDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useCurrentUser();
  const { toast } = useToast();

  const [series, setSeries] = useState<any>(null);
  const [episodes, setEpisodes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isVIP, setIsVIP] = useState(false);
  const [selectedSeason, setSelectedSeason] = useState<number | null>(null);
  const [similarSeries, setSimilarSeries] = useState<any[]>([]);

  useEffect(() => {
    if (!id) return;
    const fetchSeries = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Get series details
        const { data: fetchedSeries, error: seriesError } = await supabase
          .from("series")
          .select("*")
          .eq("id", id)
          .single();

        if (seriesError || !fetchedSeries) {
          setError("Série non trouvée.");
          setIsLoading(false);
          return;
        }

        // Normalization (robuste, inspiré de la page film)
let posterUrl = fetchedSeries.poster_url || "/placeholder-poster.png";
if (
  typeof posterUrl === "string" &&
  posterUrl.startsWith("/") &&
  !posterUrl.startsWith("/placeholder")
) {
  posterUrl = `https://image.tmdb.org/t/p/w500${posterUrl}`;
}
let backdropUrl = fetchedSeries.backdrop_url || "/placeholder-backdrop.png";
if (
  typeof backdropUrl === "string" &&
  backdropUrl.startsWith("/") &&
  !backdropUrl.startsWith("/placeholder")
) {
  backdropUrl = `https://image.tmdb.org/t/p/original${backdropUrl}`;
}

setSeries({
  ...fetchedSeries,
  posterUrl,
  backdropUrl,
});

        // Fetch episodes
        const { data: fetchedEpisodes, error: episodesError } = await supabase
          .from("episodes")
          .select("*")
          .eq("series_id", id)
          .eq("published", true);

        setEpisodes(fetchedEpisodes || []);

        // VIP logic
        if (user) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("is_vip")
            .eq("id", user.id)
            .single();
          setIsVIP(profile?.is_vip || false);
        } else {
          setIsVIP(false);
        }

        // Set default selected season
        if (fetchedSeries.seasons && fetchedSeries.seasons > 0) {
          setSelectedSeason(fetchedSeries.seasons);
        } else if (fetchedEpisodes && fetchedEpisodes.length > 0) {
          setSelectedSeason(Math.max(...fetchedEpisodes.map((ep) => ep.season)));
        }

        // TODO: Fetch similar series logic (TMDB/local), placeholder for now
        setSimilarSeries([]);

        // Check favorite
        if (user) {
          const { data } = await supabase
            .from("favorites")
            .select("id")
            .eq("user_id", user.id)
            .eq("series_id", id)
            .maybeSingle();
          setIsFavorite(!!data);
        }
      } catch (err) {
        setError("Impossible de charger les détails de la série.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchSeries();
  }, [id, user]);

  // Episodes per season
  const availableSeasons = Array.from(
    new Set(episodes.map((ep) => ep.season))
  ).sort((a, b) => a - b);

  const seasonEpisodes = episodes.filter(
    (ep) => ep.season === selectedSeason
  );

  // Favorite logic (DRY, similar to films)
  const toggleFavorite = async () => {
    if (!user) {
      toast({
        title: "Connexion requise",
        description: "Veuillez vous connecter pour utiliser les favoris.",
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
        description: `"${series.title}" a été retiré de vos favoris.`,
      });
    } else {
      await supabase.from("favorites").insert([
        {
          user_id: user.id,
          series_id: id,
          created_at: new Date().toISOString(),
        },
      ]);
      setIsFavorite(true);
      toast({
        title: "Ajouté aux favoris",
        description: `"${series.title}" a été ajouté à vos favoris.`,
      });
    }
  };

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Lien copié",
        description: "Le lien de la série a été copié dans le presse-papiers.",
      });
    }
  };

  // Watch button: jump to first episode of selected season
  const handleWatch = () => {
    if (seasonEpisodes.length > 0) {
      router.push(`/series/${id}/watch/${seasonEpisodes[0].id}`);
    }
  };

  // Loading/Error states
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

  // VIP logic
  const canWatch = !series.is_vip || isVIP;

  return (
    <>
      {/* Backdrop header */}
      {series.backdropUrl && (
        <SeriesBackdrop src={series.backdropUrl} alt={`Backdrop de ${series.title}`} />
      )}

      <div className="container mx-auto px-4 pt-32 pb-8 relative z-10">
        <div className="flex flex-col md:flex-row gap-10">
          {/* Poster et VIP badge */}
          <div className="w-full md:w-1/3 lg:w-1/4 flex flex-col items-center md:items-start gap-6 relative">
            <SeriesPosterCard src={series.posterUrl} alt={`Affiche de ${series.title}`} />
            {/* VIP Badge/Card */}
            {series.is_vip && (
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
                      onClick={() => router.push("/vip")}
                    >
                      Devenir VIP
                    </Button>
                  )}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col gap-3 w-full mt-4">
              <Button
                size="lg"
                className="w-full gap-2"
                onClick={handleWatch}
                disabled={!canWatch}
                aria-label="Regarder la série"
              >
                <Play className="h-5 w-5" />
                Regarder
              </Button>
              <Button
                variant={isFavorite ? "default" : "outline"}
                size="lg"
                className="w-full gap-2"
                onClick={toggleFavorite}
                aria-label={isFavorite ? "Retirer des favoris" : "Ajouter aux favoris"}
              >
                <Sparkles className="h-5 w-5" />
                {isFavorite ? "Retirer des favoris" : "Ajouter aux favoris"}
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="w-full gap-2"
                onClick={handleShare}
                aria-label="Partager"
              >
                <Share2 className="h-5 w-5" />
                Partager
              </Button>
            </div>
          </div>

          {/* Main info & tabs */}
          <div className="flex-1 flex flex-col gap-5">
            <SeriesInfo
              title={series.title}
              years={series.start_year + (series.end_year ? ` - ${series.end_year}` : " - Présent")}
              seasons={series.seasons}
              genres={series.genres}
              rating={series.rating}
            />

            {/* Tabs for overview, episodes, casting, similar, comments */}
            <div className="mt-8">
              <Tabs defaultValue="overview">
                <TabsList className="w-full md:w-auto border-b border-gray-700">
                  <TabsTrigger value="overview">Aperçu</TabsTrigger>
                  <TabsTrigger value="episodes">Épisodes</TabsTrigger>
                  <TabsTrigger value="casting">Casting</TabsTrigger>
                  <TabsTrigger value="similar">Séries similaires</TabsTrigger>
                  <TabsTrigger value="comments">Commentaires</TabsTrigger>
                </TabsList>

                {/* Aperçu */}
                <TabsContent value="overview" className="pt-6">
                  <div className="mb-8">
                    <h2 className="text-xl font-semibold mb-4">Synopsis</h2>
                    <p className="text-gray-300 whitespace-pre-line">{series.description}</p>
                  </div>
                  {series.trailer_url && (
                    <div>
                      <h2 className="text-xl font-semibold mb-4">Bande-annonce</h2>
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
                  )}
                </TabsContent>

                {/* Episodes */}
                <TabsContent value="episodes" className="pt-6">
                  <div className="flex items-center mb-4 gap-4">
                    <div>
                      <label htmlFor="season-select" className="text-gray-400 mr-2">
                        Saison :
                      </label>
                      <select
                        id="season-select"
                        value={selectedSeason || ""}
                        onChange={(e) => setSelectedSeason(Number(e.target.value))}
                        className="appearance-none bg-gray-700 rounded-md px-4 py-2 pr-10 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                      >
                        {availableSeasons.map((season) => (
                          <option key={season} value={season}>
                            Saison {season}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="inline ml-[-24px] text-gray-400 pointer-events-none" />
                    </div>
                    {/* Progression */}
                    {seasonEpisodes.length > 0 && (
                      <span className="text-xs text-gray-400">
                        {seasonEpisodes.filter(ep => ep.is_watched).length}/{seasonEpisodes.length} épisode
                        {seasonEpisodes.length > 1 ? "s" : ""} vu
                        {seasonEpisodes.length > 1 ? "s" : ""}
                      </span>
                    )}
                  </div>
                  <SeasonEpisodeList
                    episodes={seasonEpisodes}
                    seriesId={id}
                    isVIP={isVIP}
                  />
                </TabsContent>

                {/* Casting */}
                <TabsContent value="casting" className="pt-6">
                  <h2 className="text-xl font-semibold mb-4">Casting</h2>
                  {series.tmdb_id ? (
                    <CastingGrid tmdbId={String(series.tmdb_id)} fallbackCast={series.cast} />
                  ) : series.cast && series.cast.length > 0 ? (
                    <ul className="space-y-3">
                      {series.cast.map((actor, index) => (
                        <li key={index} className="flex justify-between">
                          <span className="font-medium">{actor.name}</span>
                          {actor.role && (
                            <span className="text-gray-400">{actor.role}</span>
                          )}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="text-gray-400">Aucun casting disponible.</div>
                  )}
                </TabsContent>

                {/* Séries similaires */}
                <TabsContent value="similar" className="pt-6">
                  <h2 className="text-xl font-semibold mb-4">Séries similaires</h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {similarSeries.length > 0 ? (
                      similarSeries.map((serie) => (
                        <SeriesCard
                          key={serie.id}
                          title={serie.title}
                          description={serie.description}
                          imageUrl={serie.poster_url || "/placeholder-poster.png"}
                        />
                      ))
                    ) : (
                      <div className="text-gray-400 col-span-6 text-center">
                        Aucune série similaire trouvée.
                      </div>
                    )}
                  </div>
                </TabsContent>

                {/* Commentaires */}
                <TabsContent value="comments" className="pt-6">
                  <h2 className="text-xl font-semibold mb-4">Commentaires</h2>
                  <CommentsSection contentId={id} contentType="series" />
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}