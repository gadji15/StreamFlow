"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useToast } from "@/components/ui/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Sidebar,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Play,
  Share2,
  Sparkles,
  ChevronDown,
  BookText,
  Layers,
  Users,
  CopyPlus,
  MessageSquare,
} from "lucide-react";
import LoadingScreen from "@/components/loading-screen";
import SeriesBackdrop from "@/components/SeriesBackdrop";
import SeriesPosterCard from "@/components/SeriesPosterCard";
import SeriesInfo from "@/components/SeriesInfo";
import SeasonEpisodeList from "@/components/series/season-episode-list";
import { CommentsSection } from "@/components/comments-section";
import CastingGrid from "@/components/CastingGrid";
import { useMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import SimilarSeriesGrid from "@/components/series/SimilarSeriesGrid";
import { getTMDBImageUrl } from "@/lib/tmdb";

export default function SeriesDetailPage() {
  const { id } = useParams();
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

  // --- DATA FETCHING ---
  useEffect(() => {
    if (!id) return;
    setIsLoading(true);
    setError(null);

    async function fetchData() {
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

        // Get all seasons for the series (ordered)
        const { data: fetchedSeasons } = await supabase
          .from("seasons")
          .select("*")
          .eq("series_id", id)
          .order("number", { ascending: true });

        // Get all episodes for the series (ordered)
        const { data: fetchedEpisodes } = await supabase
          .from("episodes")
          .select("*")
          .eq("series_id", id)
          .order("season")
          .order("episode_number");

        // Map poster/backdrop/cast from admin
        function normalizedPosterUrl(raw: any) {
          if (typeof raw === "string" && raw.trim().length > 0) {
            if (/^https?:\/\//.test(raw)) return raw.trim();
            return getTMDBImageUrl(raw, "w300");
          }
          return "/placeholder-poster.jpg";
        }
        function normalizedBackdropUrl(raw: any) {
          if (typeof raw === "string" && raw.trim().length > 0) {
            if (/^https?:\/\//.test(raw)) return raw.trim();
            return getTMDBImageUrl(raw, "original");
          }
          return "/placeholder-backdrop.jpg";
        }

        setSeries({
          ...fetchedSeries,
          posterUrl: normalizedPosterUrl(fetchedSeries.poster),
          backdropUrl: normalizedBackdropUrl(fetchedSeries.backdrop),
        });
        setSeasons(fetchedSeasons || []);
        setEpisodes(fetchedEpisodes || []);

        // Set default selected season (last one)
        if (fetchedSeasons && fetchedSeasons.length > 0) {
          setSelectedSeasonId(fetchedSeasons[fetchedSeasons.length - 1].id);
        } else {
          setSelectedSeasonId(null);
        }

        // VIP logic (user profile)
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
    }
    fetchData();
  }, [id, user]);

  // --- EVENT HANDLERS ---
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
    // Go to first episode of selected season
    const seasonEpisodes = episodes.filter(
      (ep) => ep.season_id === selectedSeasonId
    );
    if (seasonEpisodes.length > 0) {
      router.push(`/series/${id}/watch/${seasonEpisodes[0].id}`);
    }
  };

  // --- ACCESS LOGIC ---
  const canWatch = !series?.is_vip || isVIP;

  // --- SEASON/EPS NAVIGATION ---
  const renderSeasonsNavDesktop = () => (
    <SidebarProvider>
      <Sidebar className="sticky top-28 h-[calc(100vh-7rem)] bg-transparent border-r border-gray-800 min-w-[11rem] pr-1">
        <SidebarMenu>
          {seasons.map((season) => (
            <SidebarMenuItem key={season.id}>
              <SidebarMenuButton
                isActive={season.id === selectedSeasonId}
                onClick={() => setSelectedSeasonId(season.id)}
                aria-label={`Naviguer vers la saison ${season.number}`}
              >
                Saison {season.number}
                {season.title && (
                  <span className="truncate text-xs text-gray-400 ml-1">
                    {season.title}
                  </span>
                )}
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </Sidebar>
    </SidebarProvider>
  );

  const renderSeasonsNavMobile = () => (
    <Collapsible>
      <div className="flex items-center gap-2 mb-3">
        <span className="font-medium">Saison :</span>
        <CollapsibleTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
            aria-expanded="false"
          >
            {seasons.find((s) => s.id === selectedSeasonId)
              ? `Saison ${seasons.find((s) => s.id === selectedSeasonId).number}`
              : "Choisir"}
            <ChevronDown className="h-4 w-4" />
          </Button>
        </CollapsibleTrigger>
      </div>
      <CollapsibleContent>
        <div className="flex flex-wrap gap-2 mb-2">
          {seasons.map((season) => (
            <Button
              key={season.id}
              size="sm"
              variant={season.id === selectedSeasonId ? "secondary" : "ghost"}
              onClick={() => setSelectedSeasonId(season.id)}
              aria-label={`Saison ${season.number}`}
              className="mb-1"
            >
              Saison {season.number}
              {season.title && (
                <span className="truncate text-xs text-gray-400 ml-1">
                  {season.title}
                </span>
              )}
            </Button>
          ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );

  // Episodes for selected season
  const seasonEpisodes = episodes.filter(
    (ep) => ep.season_id === selectedSeasonId
  );

  // --- RENDER ---
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

  return (
    <div className="relative min-h-screen bg-background">
      {/* --- Backdrop Header --- */}
      {series.backdropUrl && (
        <SeriesBackdrop
          src={series.backdropUrl}
          alt={`Backdrop de ${series.title}`}
        />
      )}

      {/* --- Main Content --- */}
      <div className="container mx-auto px-2 sm:px-4 max-w-6xl pt-32 pb-8 relative z-10">
        {/* --- Header --- */}
        <div className="flex flex-col md:flex-row gap-8 md:gap-12 items-start">
          {/* Poster & VIP badge */}
          <div className="w-full md:w-1/3 lg:w-1/4 flex flex-col items-center md:items-start gap-6 relative md:sticky md:top-32 md:self-start">
            <SeriesPosterCard
              src={series.posterUrl}
              alt={`Affiche de ${series.title}`}
            />
            {series.is_vip && (
              <div className="mt-4 w-full flex flex-col items-center">
                <Badge
                  variant="secondary"
                  className="mb-2 text-amber-400 bg-amber-900/60 border-amber-800/80 px-4 py-1 text-lg"
                >
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

            {/* Actions */}
            <div className="flex flex-col gap-3 w-full min-w-0 mt-4 max-w-xs md:max-w-none mx-auto md:mx-0">
              <Button
                size="lg"
                className="w-full gap-2"
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
                className="w-full gap-2"
                onClick={toggleFavorite}
                aria-label={
                  isFavorite ? "Retirer des favoris" : "Ajouter aux favoris"
                }
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

          {/* Main info & Tabs */}
          <div className="flex-1 flex flex-col gap-6 w-full">
            <SeriesInfo
              title={series.title}
              years={
                series.start_year +
                (series.end_year ? ` - ${series.end_year}` : " - Présent")
              }
              seasons={seasons.length}
              genres={series.genre}
              rating={series.vote_average}
            />

            {/* Barre d'onglets (comme sur la page film) */}
            <div className="mt-8">
  <Tabs defaultValue="overview">
    <TabsList className="w-full min-w-0 flex-nowrap gap-1 overflow-x-auto whitespace-nowrap border-b border-gray-700 scrollbar-hide">
      <TabsTrigger value="overview" className="flex-shrink-0 min-w-[44px] text-xs py-0.5 flex flex-col items-center">
        <BookText className="w-5 h-5 inline sm:hidden" />
        <span className="hidden sm:inline">Synopsis</span>
      </TabsTrigger>
      <TabsTrigger value="seasons" className="flex-shrink-0 min-w-[44px] text-xs py-0.5 flex flex-col items-center">
        <Layers className="w-5 h-5 inline sm:hidden" />
        <span className="hidden sm:inline">Saisons</span>
      </TabsTrigger>
      <TabsTrigger value="casting" className="flex-shrink-0 min-w-[44px] text-xs py-0.5 flex flex-col items-center">
        <Users className="w-5 h-5 inline sm:hidden" />
        <span className="hidden sm:inline">Casting</span>
      </TabsTrigger>
      <TabsTrigger value="related" className="flex-shrink-0 min-w-[44px] text-xs py-0.5 flex flex-col items-center">
        <CopyPlus className="w-5 h-5 inline sm:hidden" />
        <span className="hidden sm:inline">Séries similaires</span>
      </TabsTrigger>
      <TabsTrigger value="comments" className="flex-shrink-0 min-w-[44px] text-xs py-0.5 flex flex-col items-center">
        <MessageSquare className="w-5 h-5 inline sm:hidden" />
        <span className="hidden sm:inline">Commentaires</span>
      </TabsTrigger>
    </TabsList>

    {/* --- Synopsis --- */}
    <TabsContent value="overview" className="pt-6">
      <div className="mb-4">
        <h2 className="text-base font-semibold mb-2">Synopsis</h2>
        <p className="text-gray-300 whitespace-pre-line">
          {series.description}
        </p>
      </div>
      {series.trailer_url && (
        <div>
          <h2 className="text-base font-semibold mb-2">
            Bande-annonce
          </h2>
          <div className="aspect-video bg-black rounded-lg overflow-hidden">
            <iframe
              src={
                series.trailer_url.includes("youtube.com/watch")
                  ? series.trailer_url.replace(
                      "watch?v=",
                      "embed/"
                    )
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

    {/* --- Saisons & Episodes --- */}
    <TabsContent value="seasons" className="pt-6">
      <div
        className={cn(
          "flex gap-8",
          isMobile ? "flex-col" : "flex-row"
        )}
      >
        {/* Sidebar (desktop) / Accordion (mobile) */}
        <div className={cn(isMobile ? "w-full" : "w-1/4 min-w-[11rem]")}>
          {isMobile
            ? renderSeasonsNavMobile()
            : renderSeasonsNavDesktop()}
        </div>
        {/* Episodes */}
        <div className="flex-1">
          <SeasonEpisodeList
            episodes={seasonEpisodes}
            seriesId={id as string}
            isVIP={isVIP}
          />
        </div>
      </div>
    </TabsContent>

    {/* --- Casting --- */}
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
        <div className="text-gray-400">
          Aucun casting disponible.
        </div>
      )}
    </TabsContent>

    {/* --- Séries similaires (onglet harmonisé) --- */}
    <TabsContent value="related" className="pt-6">
      <h2 className="text-base font-semibold mb-2">
        Séries similaires
      </h2>
      <SimilarSeriesGrid tmdbId={series.tmdb_id} />
    </TabsContent>

    {/* --- Commentaires --- */}
    <TabsContent value="comments" className="pt-6">
      <h2 className="text-base font-semibold mb-2">Commentaires</h2>
      <CommentsSection contentId={id as string} contentType="series" />
    </TabsContent>
  </Tabs>
</div>
                          </li>
                        );
                      })}
                    </ul>
                  ) : (
                    <div className="text-gray-400">
                      Aucun casting disponible.
                    </div>
                  )}
                </TabsContent>

                {/* --- Similaires --- */}
                <TabsContent value="similar" className="pt-6">
                  <h2 className="text-base font-semibold mb-2">
                    Séries similaires
                  </h2>
                  <SimilarSeriesGrid tmdbId={series.tmdb_id} />
                </TabsContent>

                {/* --- Commentaires --- */}
                <TabsContent value="comments" className="pt-6">
                  <h2 className="text-base font-semibold mb-2">Commentaires</h2>
                  <CommentsSection contentId={id as string} contentType="series" />
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}