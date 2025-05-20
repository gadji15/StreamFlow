"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, Sparkles, Share2, Star } from "lucide-react";
import LoadingScreen from "@/components/loading-screen";

// Helpers
function isFullUrl(str) {
  return /^https?:\/\//.test(str);
}
function getImageUrl(raw, fallback, size = "original") {
  if (!raw) return fallback;
  if (isFullUrl(raw)) return raw;
  if (raw.startsWith("/")) return `https://image.tmdb.org/t/p/${size}${raw}`;
  return raw;
}

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

// Casting grid
function CastingSection({ casting }) {
  const cast = Array.isArray(casting) && casting.length > 0 ? casting : [];
  if (cast.length === 0) {
    return (
      <div className="text-gray-400 text-center py-4 text-sm italic">Aucun acteur renseigné pour cette série.</div>
    );
  }
  return (
    <ul className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3 py-3">
      {cast.map((actor, idx) => (
        <li
          key={idx}
          className="flex flex-col items-center bg-gray-900/80 rounded-lg shadow p-2 transition transform hover:scale-105 focus-within:ring-2 ring-amber-400 min-w-0"
          tabIndex={0}
          aria-label={`${actor.name}${actor.role ? ", " + actor.role : ""}`}
        >
          <img
            src={getImageUrl(actor.image, "/no-image.png", "w185")}
            alt={actor.name}
            className="w-14 h-14 object-cover rounded-full border border-gray-700 shadow mb-1"
            loading="lazy"
            style={{ minWidth: "3.5rem", minHeight: "3.5rem" }}
          />
          <span className="text-white font-semibold text-[13px] truncate w-full text-center">{actor.name}</span>
          {actor.role && (
            <span className="text-gray-400 text-xs text-center truncate w-full">{actor.role}</span>
          )}
        </li>
      ))}
    </ul>
  );
}

// Similar series
function SimilarSeriesGrid({ currentId, genre }) {
  const [similar, setSimilar] = React.useState([]);
  React.useEffect(() => {
    const fetchSimilar = async () => {
      if (!genre) return setSimilar([]);
      const { data } = await supabase
        .from("series")
        .select("*")
        .neq("id", currentId)
        .ilike("genre", `%${genre.split(",")[0].trim()}%`)
        .eq("published", true)
        .limit(12);
      setSimilar(data || []);
    };
    fetchSimilar();
  }, [currentId, genre]);
  if (!similar || similar.length === 0)
    return <div className="text-gray-400 text-center py-3 text-sm italic">Aucune série similaire trouvée.</div>;
  return (
    <ul className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 py-3">
      {similar.map((serie) => (
        <li key={serie.id} className="flex flex-col items-center bg-gray-900/80 rounded-lg shadow p-2 hover:scale-105 transition cursor-pointer"
          onClick={() => window.location.href = `/series/${serie.id}`}>
          <img
            src={getImageUrl(serie.poster, "/placeholder-poster.jpg", "w300")}
            alt={serie.title}
            className="w-16 h-24 object-cover rounded border border-gray-700 shadow mb-1"
            loading="lazy"
          />
          <span className="text-white font-semibold text-xs truncate w-full text-center">{serie.title}</span>
        </li>
      ))}
    </ul>
  );
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

        const { data: fetchedEpisodes } = await supabase
          .from("episodes")
          .select("*")
          .eq("series_id", id)
          .eq("published", true);

        setEpisodes(fetchedEpisodes || []);
        setSeries(fetchedSeries);

        // Default season logic
        if (fetchedEpisodes && fetchedEpisodes.length > 0) {
          const seasons = Array.from(new Set(fetchedEpisodes.map((ep) => ep.season))).sort((a, b) => a - b);
          setSelectedSeason(seasons[0]);
        }

        // Favorite logic
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
      <div className="relative h-[40vw] min-h-[160px] max-h-[360px] w-full overflow-hidden rounded-b-2xl shadow-xl">
        <img
          src={backdropUrl}
          alt={`Backdrop de ${series.title}`}
          className="absolute inset-0 w-full h-full object-cover object-center brightness-[.56] blur-[2px] scale-105 pointer-events-none select-none"
          style={{ zIndex: 1 }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-transparent to-black/90 z-10" />
        <div className="relative z-20 flex flex-col xs:flex-row items-end xs:items-center gap-4 xs:gap-7 px-2 xs:px-3 sm:px-4 pt-6 pb-4 max-w-7xl mx-auto">
          {/* Poster */}
          <div className="relative -mt-24 xs:mt-0 shadow-xl shrink-0">
            <img
              src={posterUrl}
              alt={`Affiche ${series.title}`}
              className="w-28 h-40 xs:w-32 xs:h-48 sm:w-36 sm:h-56 object-cover rounded-xl border-4 border-gray-800 shadow-2xl bg-gray-900"
              style={{ boxShadow: "0 6px 32px 0 #0007" }}
            />
            {series.isvip && (
              <span className="absolute top-2 left-2 bg-gradient-to-r from-amber-600 to-yellow-500 text-black font-bold text-[10px] px-2 py-0.5 rounded-full shadow-lg border border-amber-300 uppercase tracking-wide">
                VIP
              </span>
            )}
          </div>
          {/* Main info */}
          <div className="flex-1 flex flex-col gap-2 xs:gap-3 items-start max-w-2xl">
            <h1 className="text-2xl xs:text-3xl sm:text-4xl font-extrabold drop-shadow tracking-tight leading-tight">
              {series.title}
            </h1>
            <div className="flex flex-wrap gap-2 items-center text-xs xs:text-sm">
              {series.start_year && (
                <span className="text-amber-400">{series.start_year}{series.end_year ? ` - ${series.end_year}` : " - ..."} </span>
              )}
              <Genres genre={series.genre} />
              {series.vote_average !== null && (
                <span className="flex items-center gap-1 bg-gray-800/80 px-2 py-0.5 rounded text-amber-300 font-semibold text-xs">
                  <Star className="w-4 h-4 text-amber-400" /> {series.vote_average}
                </span>
              )}
            </div>
            <div className="flex gap-2 flex-wrap mt-1">
              {series.creator && (
                <Badge variant="secondary" className="bg-indigo-900/80 border-indigo-500 text-indigo-200 px-2 py-0.5 text-xs">
                  Créateur&nbsp;: <span className="font-medium">{series.creator}</span>
                </Badge>
              )}
              {series.seasons && (
                <Badge className="bg-gray-700/80 border-gray-600 text-gray-200 px-2 py-0.5 text-xs">
                  {series.seasons} saison{series.seasons > 1 ? "s" : ""}
                </Badge>
              )}
            </div>
            {/* Actions */}
            <div className="flex gap-2 mt-1 flex-wrap">
              <Button
                size="sm"
                className="gap-2 bg-amber-500 text-black hover:bg-amber-600 shadow py-1 px-3 text-xs xs:text-sm"
                onClick={handleWatch}
                aria-label="Regarder la série"
              >
                <Play className="h-4 w-4" /> Regarder
              </Button>
              <Button
                variant={isFavorite ? "default" : "outline"}
                size="sm"
                className="gap-2 py-1 px-3 text-xs xs:text-sm"
                onClick={toggleFavorite}
                aria-label={isFavorite ? "Retirer des favoris" : "Ajouter aux favoris"}
              >
                <Sparkles className="h-4 w-4" />
                {isFavorite ? "Retirer des favoris" : "Ajouter aux favoris"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="gap-2 py-1 px-3 text-xs xs:text-sm"
                onClick={handleShare}
                aria-label="Partager"
              >
                <Share2 className="h-4 w-4" />
                Partager
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-2 xs:px-3 sm:px-4 py-6">
        {/* Overview */}
        <section aria-labelledby="synopsis-heading" className="mb-8">
          <h2 id="synopsis-heading" className="text-lg md:text-xl font-bold mb-2">Synopsis</h2>
          <p className="text-gray-200 text-[15px] md:text-base whitespace-pre-line leading-relaxed rounded-lg bg-gray-900/70 p-3 shadow">
            {series.description || <span className="italic text-gray-500">Aucun synopsis disponible.</span>}
          </p>
        </section>

        {/* Episodes: sticky/fixed season nav */}
        <section aria-labelledby="episodes-heading" className="mb-8">
          <div className="sticky top-[64px] bg-gray-950/95 z-30 py-2 xs:py-0 mb-1 flex flex-col xs:flex-row xs:items-center gap-2 border-b border-gray-800">
            <h2 id="episodes-heading" className="text-lg md:text-xl font-bold">Épisodes</h2>
            {availableSeasons.length > 1 && (
              <div className="flex items-center gap-2 overflow-x-auto">
                <label htmlFor="season-select" className="text-xs text-gray-400 font-medium">
                  Saison&nbsp;:
                </label>
                <nav aria-label="Navigation des saisons" className="flex gap-1">
                  {availableSeasons.map((season) => (
                    <button
                      key={season}
                      onClick={() => setSelectedSeason(season)}
                      className={`px-3 py-1 rounded-full text-xs font-semibold transition focus:outline-none focus:ring-2 ring-amber-400
                        ${season === selectedSeason
                          ? "bg-amber-600 text-black shadow"
                          : "bg-gray-800/80 text-amber-200 hover:bg-amber-700/50"
                        }`}
                      aria-current={season === selectedSeason}
                    >
                      Saison {season}
                    </button>
                  ))}
                </nav>
              </div>
            )}
          </div>
          {seasonEpisodes.length > 0 ? (
            <ul className="divide-y divide-gray-800 rounded-lg overflow-hidden shadow bg-gray-900/70">
              {seasonEpisodes.map((ep) => (
                <li
                  key={ep.id}
                  className="flex items-start gap-3 px-2 py-2 hover:bg-gray-900/90 focus-within:bg-gray-800/80 transition group"
                  tabIndex={0}
                  aria-label={`Épisode ${ep.episode}: ${ep.title}`}
                >
                  <span className="text-amber-400 font-bold text-base w-7 text-right shrink-0">{ep.episode}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="font-semibold text-xs truncate">{ep.title}</span>
                      {ep.is_watched && (
                        <span className="ml-2 px-2 py-0.5 rounded-full text-xs bg-green-700/60 text-green-200">Vu</span>
                      )}
                    </div>
                    {ep.description && (
                      <p className="text-gray-300 text-xs truncate">{ep.description}</p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-gray-400 text-center py-4 text-sm italic">Aucun épisode publié pour cette saison.</div>
          )}
        </section>

        {/* Casting */}
        <section aria-labelledby="casting-heading" className="mb-8">
          <h2 id="casting-heading" className="text-lg md:text-xl font-bold mb-2">Casting</h2>
          <CastingSection casting={series.casting} />
        </section>

        {/* Séries similaires */}
        <section aria-labelledby="similar-heading" className="mb-8">
          <h2 id="similar-heading" className="text-lg md:text-xl font-bold mb-2">Séries similaires</h2>
          <SimilarSeriesGrid currentId={series.id} genre={series.genre} />
        </section>

        {/* Commentaires */}
        <section aria-labelledby="comments-heading" className="mb-12">
          <h2 id="comments-heading" className="text-lg md:text-xl font-bold mb-2">Commentaires</h2>
          <div className="rounded-lg bg-gray-900/80 p-4">
            {typeof window !== "undefined" && window.StreamFlowComments ? (
              <window.StreamFlowComments contentId={series.id} contentType="series" />
            ) : (
              <span className="text-gray-400 italic">
                Les commentaires arrivent bientôt. <button className="underline text-indigo-400 hover:text-indigo-200">Contactez-nous</button> pour être notifié.
              </span>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}