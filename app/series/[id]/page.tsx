"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import LoadingScreen from "@/components/loading-screen";
import { Star, Play, Sparkles, Share2 } from "lucide-react";

// Helpers
function isFullUrl(str) {
  return /^https?:\/\//.test(str);
}
function getImageUrl(raw, fallback, size = "original") {
  if (!raw) return fallback;
  if (isFullUrl(raw)) return raw;
  // If admin saves TMDB path, allow it
  if (raw.startsWith("/")) return `https://image.tmdb.org/t/p/${size}${raw}`;
  return raw;
}

export default function SeriesDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useCurrentUser();
  const { toast } = useToast();

  const [series, setSeries] = useState(null);
  const [episodes, setEpisodes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [selectedSeason, setSelectedSeason] = useState(null);

  useEffect(() => {
    if (!id) return;
    setIsLoading(true);
    setError(null);
    (async () => {
      try {
        // Fetch series details (all fields from admin)
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

        // Fetch episodes (optional)
        const { data: fetchedEpisodes } = await supabase
          .from("episodes")
          .select("*")
          .eq("series_id", id)
          .eq("published", true);

        setEpisodes(fetchedEpisodes || []);
        setSeries(fetchedSeries);

        // Set default selected season
        if (fetchedSeries.seasons && fetchedSeries.seasons > 0) {
          setSelectedSeason(fetchedSeries.seasons);
        } else if (fetchedEpisodes && fetchedEpisodes.length > 0) {
          setSelectedSeason(Math.max(...fetchedEpisodes.map((ep) => ep.season)));
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
    })();
  }, [id, user]);

  // Responsive casting grid
  function CastingSection({ casting }) {
    if (!Array.isArray(casting) || casting.length === 0) {
      return (
        <div className="text-gray-400 text-center py-6">Aucun casting disponible.</div>
      );
    }
    return (
      <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 py-4">
        {casting.map((actor, idx) => (
          <li
            key={idx}
            className="flex flex-col items-center bg-gray-900/80 rounded-lg shadow p-3 transition-transform hover:scale-[1.03] focus-within:ring-2 ring-amber-400"
            tabIndex={0}
            aria-label={`${actor.name}${actor.role ? ", " + actor.role : ""}`}
          >
            <img
              src={getImageUrl(actor.image, "/no-image.png", "w185")}
              alt={actor.name}
              className="w-20 h-20 object-cover rounded-full border-2 border-gray-700 shadow mb-2"
              loading="lazy"
            />
            <span className="text-white font-semibold text-sm truncate w-full text-center">{actor.name}</span>
            {actor.role && (
              <span className="text-gray-400 text-xs text-center truncate w-full">{actor.role}</span>
            )}
          </li>
        ))}
      </ul>
    );
  }

  // Responsive genres chips
  function Genres({ genre }) {
    if (!genre) return null;
    const genres = typeof genre === "string" ? genre.split(",").map(g => g.trim()).filter(Boolean) : [];
    return (
      <div className="flex flex-wrap gap-2 mt-2 mb-2">
        {genres.map((g, i) => (
          <span
            key={g + i}
            className="bg-amber-900/60 text-amber-300 px-3 py-0.5 rounded-full text-xs font-medium shadow"
          >
            {g}
          </span>
        ))}
      </div>
    );
  }

  // Responsive seasons/episodes
  const availableSeasons = Array.from(
    new Set(episodes.map((ep) => ep.season))
  ).sort((a, b) => a - b);
  const seasonEpisodes = episodes.filter(
    (ep) => ep.season === selectedSeason
  );

  // Favorite logic
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

  const handleWatch = () => {
    if (seasonEpisodes.length > 0) {
      router.push(`/series/${id}/watch/${seasonEpisodes[0].id}`);
    }
  };

  if (isLoading) return <LoadingScreen />;
  if (error || !series) {
    return (
      <div className="container mx-auto px-4 py-12 flex flex-col items-center">
        <div className="bg-red-900/50 border border-red-700 rounded-lg p-8 max-w-md w-full shadow-lg text-center">
          <h2 className="text-2xl font-bold mb-3">Erreur</h2>
          <p className="text-gray-300">{error || "Série non trouvée"}</p>
          <Button className="mt-6" onClick={() => router.back()}>Retour</Button>
        </div>
      </div>
    );
  }

  // Images
  const posterUrl = getImageUrl(series.poster, "/placeholder-poster.jpg", "w500");
  const backdropUrl = getImageUrl(series.backdrop, "/placeholder-backdrop.jpg", "original");

  // Responsive/accessible layout start
  return (
    <div className="relative min-h-screen bg-gradient-to-b from-gray-950 via-gray-900/95 to-gray-950 text-white">
      {/* Backdrop header */}
      <div className="relative h-[36vw] min-h-[225px] max-h-[420px] w-full overflow-hidden rounded-b-3xl shadow-xl">
        <img
          src={backdropUrl}
          alt={`Backdrop de ${series.title}`}
          className="absolute inset-0 w-full h-full object-cover object-center brightness-[.54] blur-[2px] scale-105 pointer-events-none select-none"
          style={{ zIndex: 1 }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/80 z-10" />
        <div className="relative z-20 flex flex-col-reverse md:flex-row items-end md:items-center gap-8 px-4 pt-8 pb-6 max-w-7xl mx-auto">
          {/* Poster */}
          <div className="relative -mt-24 md:mt-0 shadow-xl">
            <img
              src={posterUrl}
              alt={`Affiche ${series.title}`}
              className="w-40 h-60 object-cover rounded-2xl border-4 border-gray-800 shadow-2xl bg-gray-900"
              style={{ boxShadow: "0 6px 32px 0 #0007" }}
            />
            {series.isvip && (
              <span className="absolute top-2 left-2 bg-gradient-to-r from-amber-600 to-yellow-500 text-black font-bold text-xs px-3 py-1 rounded-full shadow-lg border-2 border-amber-300 uppercase tracking-wide">
                VIP
              </span>
            )}
          </div>
          {/* Main info */}
          <div className="flex-1 flex flex-col gap-3 md:gap-5 items-start max-w-2xl">
            <h1 className="text-3xl md:text-4xl font-extrabold drop-shadow tracking-tight leading-tight">
              {series.title}
            </h1>
            <div className="flex flex-wrap gap-3 items-center text-sm">
              {series.start_year && (
                <span className="text-amber-400">{series.start_year}{series.end_year ? ` - ${series.end_year}` : " - ..."} </span>
              )}
              <Genres genre={series.genre} />
              {series.vote_average !== null && (
                <span className="flex items-center gap-1 bg-gray-800/80 px-2 py-1 rounded text-amber-300 font-semibold text-xs">
                  <Star className="w-4 h-4 text-amber-400" /> {series.vote_average}
                </span>
              )}
            </div>
            <div className="flex gap-2 flex-wrap mt-2">
              {series.creator && (
                <Badge variant="secondary" className="bg-indigo-900/80 border-indigo-500 text-indigo-200 px-3 py-0.5 text-xs">
                  Créateur&nbsp;: <span className="font-medium">{series.creator}</span>
                </Badge>
              )}
              {series.seasons && (
                <Badge className="bg-gray-700/80 border-gray-600 text-gray-200 px-3 py-0.5 text-xs">
                  {series.seasons} saison{series.seasons > 1 ? "s" : ""}
                </Badge>
              )}
            </div>
            {/* Actions */}
            <div className="flex gap-3 mt-2 flex-wrap">
              <Button
                size="lg"
                className="gap-2 bg-amber-500 text-black hover:bg-amber-600 shadow"
                onClick={handleWatch}
                aria-label="Regarder la série"
              >
                <Play className="h-5 w-5" /> Regarder
              </Button>
              <Button
                variant={isFavorite ? "default" : "outline"}
                size="lg"
                className="gap-2"
                onClick={toggleFavorite}
                aria-label={isFavorite ? "Retirer des favoris" : "Ajouter aux favoris"}
              >
                <Sparkles className="h-5 w-5" />
                {isFavorite ? "Retirer des favoris" : "Ajouter aux favoris"}
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="gap-2"
                onClick={handleShare}
                aria-label="Partager"
              >
                <Share2 className="h-5 w-5" />
                Partager
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Overview */}
        <section aria-labelledby="synopsis-heading" className="mb-10">
          <h2 id="synopsis-heading" className="text-xl md:text-2xl font-bold mb-3">Synopsis</h2>
          <p className="text-gray-200 text-base md:text-lg whitespace-pre-line leading-relaxed rounded-lg bg-gray-900/70 p-4 shadow">
            {series.description || <span className="italic text-gray-500">Aucun synopsis disponible.</span>}
          </p>
        </section>

        {/* Episodes */}
        <section aria-labelledby="episodes-heading" className="mb-10">
          <div className="flex flex-col md:flex-row md:items-center gap-3 mb-4">
            <h2 id="episodes-heading" className="text-xl md:text-2xl font-bold">Épisodes</h2>
            {availableSeasons.length > 1 && (
              <div className="flex items-center gap-2">
                <label htmlFor="season-select" className="text-xs text-gray-400 font-medium">
                  Saison&nbsp;:
                </label>
                <select
                  id="season-select"
                  value={selectedSeason || ""}
                  onChange={(e) => setSelectedSeason(Number(e.target.value))}
                  className="appearance-none bg-gray-800/80 rounded-md px-4 py-1 pr-8 focus:ring-2 focus:ring-amber-500 text-white border border-gray-700 text-xs"
                >
                  {availableSeasons.map((season) => (
                    <option key={season} value={season}>
                      Saison {season}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
          {seasonEpisodes.length > 0 ? (
            <ul className="divide-y divide-gray-800 rounded-lg overflow-hidden shadow-lg bg-gray-900/70">
              {seasonEpisodes.map((ep) => (
                <li
                  key={ep.id}
                  className="flex items-start gap-4 px-4 py-3 hover:bg-gray-900/90 focus-within:bg-gray-800/80 transition group"
                  tabIndex={0}
                  aria-label={`Épisode ${ep.episode}: ${ep.title}`}
                >
                  <span className="text-amber-400 font-bold text-lg w-8 text-right">{ep.episode}</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold">{ep.title}</span>
                      {ep.is_watched && (
                        <span className="ml-2 px-2 py-0.5 rounded-full text-xs bg-green-700/60 text-green-200">Vu</span>
                      )}
                    </div>
                    {ep.description && (
                      <p className="text-gray-300 text-xs">{ep.description}</p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-gray-400 text-center py-8">Aucun épisode publié pour cette saison.</div>
          )}
        </section>

        {/* Casting */}
        <section aria-labelledby="casting-heading" className="mb-10">
          <h2 id="casting-heading" className="text-xl md:text-2xl font-bold mb-3">Casting</h2>
          <CastingSection casting={series.casting} />
        </section>

        {/* Commentaires */}
        <section aria-labelledby="comments-heading" className="mb-12">
          <h2 id="comments-heading" className="text-xl md:text-2xl font-bold mb-3">Commentaires</h2>
          <div className="rounded-lg bg-gray-900/80 p-6">
            {/* Remplacer la ligne suivante par votre composant de commentaires si besoin */}
            <span className="text-gray-400 italic">Section commentaires à intégrer.</span>
          </div>
        </section>
      </div>
    </div>
  );
}