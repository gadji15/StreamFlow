"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Play, Star, Calendar, Film, ChevronDown, Clock, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { VipBadge } from "@/components/vip-badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CommentsSection } from "@/components/comments-section";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabaseClient";
import SeasonEpisodeList from "@/components/series/season-episode-list";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useFavoriteSeries } from "@/hooks/useFavoriteSeries";
import Head from "next/head";

// Typage strict
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
  views?: number;
};

type Episode = {
  id: string;
  title: string;
  description: string;
  season: number;
  episode_number: number;
  is_vip?: boolean;
  published?: boolean;
  duration?: number;
  thumbnail_url?: string;
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
  const [showVipDialog, setShowVipDialog] = useState(false);
  const { user } = useCurrentUser();
  const [isVIP, setIsVIP] = useState(false);

  const { toast } = useToast();

  // Hook favoris via Supabase
  const { isFavorite, loading: loadingFavorite, toggleFavorite } = useFavoriteSeries(id, user?.id);

  // Chargement de la série et de ses épisodes
  useEffect(() => {
    const loadSeriesDetails = async () => {
      if (!id) return;

      setIsLoading(true);
      setError(null);

      try {
        // Charger la série
        const { data: seriesData, error: seriesError } = await supabase
          .from("series")
          .select("*")
          .eq("id", id)
          .single();

        if (seriesError || !seriesData) {
          setError("Série non trouvée.");
          return;
        }

        if (!seriesData.published) {
          setError("Cette série n'est pas disponible.");
          return;
        }

        setSeries(seriesData);

        // VIP : statut utilisateur
        let userIsVIP = false;
        if (user) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("is_vip")
            .eq("id", user.id)
            .single();
          userIsVIP = !!profile?.is_vip;
          setIsVIP(userIsVIP);
        } else {
          setIsVIP(false);
        }

        // Dialog VIP si besoin
        if (seriesData.is_vip && !userIsVIP) {
          setShowVipDialog(true);
        }

        // Saison par défaut = la dernière (plus récente)
        if (seriesData.seasons && seriesData.seasons > 0) {
          setSelectedSeason(seriesData.seasons);
        }

        // Charger les épisodes
        const { data: episodesData, error: episodesError } = await supabase
          .from("episodes")
          .select("*")
          .eq("series_id", id)
          .eq("published", true);

        if (episodesError) {
          setEpisodes([]);
        } else {
          // Filtrer VIP si besoin
          const filteredEpisodes = userIsVIP
            ? (episodesData || [])
            : (episodesData || []).filter((ep: any) => !ep.is_vip);
          setEpisodes(filteredEpisodes);
        }

        // Incrémenter les vues
        supabase
          .from("series")
          .update({ views: (seriesData.views || 0) + 1 })
          .eq("id", id);

        // Log activité vue
        if (user) {
          supabase.from("activities").insert([
            {
              user_id: user.id,
              action: "content_view",
              content_type: "series",
              content_id: id,
              details: { title: seriesData.title, isVIP: seriesData.is_vip },
              timestamp: new Date().toISOString(),
            },
          ]);
        }
      } catch (error) {
        setError("Impossible de charger les détails de la série.");
      } finally {
        setIsLoading(false);
      }
    };

    loadSeriesDetails();
    // eslint-disable-next-line
  }, [id, user]);

  // Saisons
  const getSeasonEpisodes = (season: number) =>
    episodes.filter((ep) => ep.season === season);

  const getAvailableSeasons = () => {
    const seasons = [...new Set(episodes.map((ep) => ep.season))];
    return seasons.sort((a, b) => a - b);
  };

  // Navigation VIP
  const goToVipPage = () => {
    setShowVipDialog(false);
    router.push("/vip");
  };

  // Chargement
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <div className="animate-pulse rounded-full h-12 w-12 border-4 border-amber-500/60 mx-auto mb-4"></div>
        <p className="mt-4">Chargement de la série…</p>
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
          <Button onClick={() => router.push("/series")} className="mt-4">
            Retour aux séries
          </Button>
        </div>
      </div>
    );
  }

  const availableSeasons = getAvailableSeasons();
  const seasonEpisodes = getSeasonEpisodes(selectedSeason);

  return (
    <>
      <Head>
        <title>{series.title} | Détail Série</title>
        <meta name="description" content={series.description?.slice(0, 150)} />
      </Head>

      {/* Header visuel */}
      <section
        className="relative w-full h-[50vh] md:h-[60vh] bg-cover bg-center bg-no-repeat mb-6"
        style={{
          backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.7), rgba(0,0,0,0.95)), url(${series.backdrop_url || "/placeholder-backdrop.png"})`,
        }}
        aria-label="Image de fond série"
      >
        <div className="container mx-auto px-4 h-full flex flex-col justify-end py-8">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Poster */}
            <div className="w-32 h-48 md:w-48 md:h-72 flex-shrink-0 -mt-20 md:-mt-40 rounded-lg overflow-hidden shadow-xl border-4 border-amber-600/30">
              <img
                src={series.poster_url || "/placeholder-poster.png"}
                alt={`Affiche de ${series.title}`}
                className="w-full h-full object-cover"
              />
            </div>
            {/* Détails */}
            <div className="flex-1">
              <div className="flex items-center">
                <h1 className="text-2xl md:text-4xl font-bold">{series.title}</h1>
                {series.is_vip && (
                  <span className="ml-2">
                    <VipBadge size="default" variant="default" />
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-3 text-sm text-gray-300 mt-2">
                <span className="flex items-center">
                  <Calendar className="mr-1 h-4 w-4" />
                  {series.start_year}
                  {series.end_year ? ` - ${series.end_year}` : " - Présent"}
                </span>
                <span className="flex items-center">
                  <Film className="mr-1 h-4 w-4" />
                  {series.seasons} Saison{series.seasons && series.seasons > 1 ? "s" : ""}
                </span>
                {series.rating && (
                  <span className="flex items-center">
                    <Star className="mr-1 h-4 w-4 text-yellow-400" />
                    {series.rating.toFixed(1)}/10
                  </span>
                )}
              </div>

              <div className="mt-2 flex flex-wrap gap-2">
                {series.genres?.map((genre, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 bg-gray-700 text-xs rounded-full"
                  >
                    {genre}
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
                        description:
                          "Il n'y a pas d'épisodes disponibles pour cette saison.",
                        variant: "destructive",
                      });
                    }
                  }}
                  disabled={seasonEpisodes.length === 0 || (series.is_vip && !isVIP)}
                  aria-label="Regarder le premier épisode disponible"
                >
                  <Play className="h-5 w-5" />
                  Regarder
                </Button>

                <Button
                  variant={isFavorite ? "default" : "outline"}
                  size="lg"
                  className="gap-2"
                  onClick={async () => {
                    if (!user) {
                      toast({
                        title: "Connectez-vous",
                        description:
                          "Vous devez être connecté pour utiliser les favoris.",
                        variant: "destructive",
                      });
                      return;
                    }
                    const ok = await toggleFavorite();
                    toast({
                      title: isFavorite
                        ? "Retiré des favoris"
                        : "Ajouté aux favoris",
                      description: isFavorite
                        ? `"${series.title}" a été retiré de vos favoris.`
                        : `"${series.title}" a été ajouté à vos favoris.`,
                    });
                  }}
                  disabled={loadingFavorite}
                  aria-label={
                    isFavorite
                      ? "Retirer des favoris"
                      : "Ajouter aux favoris"
                  }
                >
                  {isFavorite ? (
                    <>
                      <Sparkles className="h-5 w-5 text-yellow-400" />
                      Retirer des favoris
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-5 w-5" />
                      Ajouter aux favoris
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contenu principal */}
      <main className="container mx-auto px-4">
        <Tabs defaultValue="episodes" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="episodes">Épisodes</TabsTrigger>
            <TabsTrigger value="details">Détails</TabsTrigger>
            <TabsTrigger value="comments">Commentaires</TabsTrigger>
          </TabsList>

          <TabsContent value="episodes" className="space-y-6">
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">
                  Saison {selectedSeason}
                </h2>
                <div className="relative">
                  <select
                    value={selectedSeason}
                    onChange={(e) => setSelectedSeason(Number(e.target.value))}
                    className="appearance-none bg-gray-700 rounded-md px-4 py-2 pr-10 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    aria-label="Sélectionnez la saison"
                  >
                    {availableSeasons.map((season) => (
                      <option key={season} value={season}>
                        Saison {season}
                      </option>
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
                        src={
                          series.trailer_url.includes("youtube.com/watch")
                            ? series.trailer_url.replace("watch?v=", "embed/")
                            : series.trailer_url
                        }
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
                      <span>
                        {series.start_year}
                        {series.end_year ? ` - ${series.end_year}` : " - Présent"}
                      </span>
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
                      <span className="text-right">
                        {series.genres?.join(", ") || ""}
                      </span>
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
                          {actor.role && (
                            <span className="text-gray-400">{actor.role}</span>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="comments">
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Commentaires</h2>
              <CommentsSection contentId={id} contentType="series" />
            </div>
          </TabsContent>
        </Tabs>
      </main>

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
            <Button variant="outline" onClick={() => setShowVipDialog(false)}>
              Retour
            </Button>
            <Button onClick={goToVipPage}>Découvrir l'offre VIP</Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}