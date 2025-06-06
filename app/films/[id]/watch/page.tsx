"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/lib/supabaseClient";
import { getTMDBImageUrl } from "@/lib/tmdb";
import WatchLayout from "@/components/watch/WatchLayout";
import dynamic from "next/dynamic";
import Link from "next/link";
const VideoMultiPlayer = dynamic(() => import("@/components/VideoMultiPlayer"), { ssr: false });
import MediaPosterCard from "@/components/MediaPosterCard";
import FilmCard from "@/components/FilmCard";
import { useWatchProgress } from "@/components/ui/useWatchProgress";
import { useWatchHistory } from "@/hooks/use-watch-history";
import ResumeHintToast from "@/components/ui/ResumeHintToast";

function normalizeBackdropUrl(raw: string | undefined) {
  if (typeof raw === "string" && raw.trim().length > 0) {
    if (/^https?:\/\//.test(raw)) return raw.trim();
    return getTMDBImageUrl(raw, "original");
  }
  return "/placeholder-backdrop.jpg";
}

type Movie = {
  id: string;
  title: string;
  year?: number;
  genre?: string;
  is_vip?: boolean;
  duration?: number;
  rating?: number;
  description?: string;
  backdrop?: string;
  poster?: string;
  video_url?: string;
  streamtape_url?: string;
  uqload_url?: string;
  tmdb_id?: string;
  backdropUrl?: string;
  posterUrl?: string;
  part_number?: number; // Ajouté pour saga/parties
  isvip?: boolean; // Ajouté pour compatibilité avec isVIP
  saga_id?: string; // Ajouté pour compatibilité saga
};

type WatchLayoutProps = {
  title: string;
  seoTitle?: string;
  videoUrl: string;
  posterUrl?: string;
  backdropUrl?: string;
  loading: boolean;
  error?: string | null;
  onBack: () => void;
  backLabel?: React.ReactNode; // <-- doit être React.ReactNode et non string
  isVip?: boolean;
  metadata?: React.ReactNode;
  description?: string;
  suggestions?: Array<{
    id: string;
    title: string;
    genre?: string;
    poster?: string;
    link: string;
  }>;
  suggestionsTitle?: string;
  suggestionsSubtitle?: string;
  suggestionsLink?: string;
  suggestionsLinkLabel?: string;
};

export default function WatchFilmPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [movie, setMovie] = useState<Movie | null>(null);
  const [suggestions, setSuggestions] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPlayerError, setShowPlayerError] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // SECTION AUTRES PARTIES / CONTINUITÉS
  const [continuities, setContinuities] = useState<Movie[]>([]);

  // Hook pour responsive count (mêmes seuils que ContentSection)
  function useResponsiveColumns() {
    const [columns, setColumns] = useState(5);
    useEffect(() => {
      function handleResize() {
        const width = window.innerWidth;
        if (width < 400) setColumns(2);
        else if (width < 600) setColumns(3);
        else if (width < 900) setColumns(4);
        else if (width < 1080) setColumns(5);
        else if (width < 1400) setColumns(6);
        else if (width < 1800) setColumns(7);
        else setColumns(8);
      }
      handleResize();
      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }, []);
    return columns;
  }
  const columns = useResponsiveColumns();
  const maxSuggestions = columns * 2;

  useEffect(() => {
    async function fetchMovieAndSuggestions() {
      setLoading(true);
      setError(null);
      try {
        // Charger le film courant
        const movieRes = await supabase
          .from("films")
          .select("*, streamtape_url, uqload_url")
          .eq("id", id)
          .single();

        const data = movieRes.data;

        if (!data) {
          setError("Film non trouvé.");
          setMovie(null);
          setSuggestions([]);
          setContinuities([]);
          setLoading(false);
          return;
        }
        // Préparer le genre pour la requête de suggestions
        const genre = data.genre;

        let suggestionsData: Movie[] = [];
        if (genre) {
          // Suggestions du même genre, exclut le film courant, triées par popularité
          const similarRes = await supabase
            .from("films")
            .select("id, title, genre, poster, year")
            .neq("id", id)
            .eq("genre", genre)
            .order("popularity", { ascending: false })
            .limit(maxSuggestions);

          suggestionsData = similarRes.data || [];

          // Si pas assez de suggestions, compléter AVEC une deuxième requête SANS le genre (popularité seulement)
          if (suggestionsData.length < maxSuggestions) {
            const fallbackRes = await supabase
              .from("films")
              .select("id, title, genre, poster, year")
              .neq("id", id)
              .order("popularity", { ascending: false })
              .limit(maxSuggestions - suggestionsData.length);
            // Ajouter seulement les films qui n'ont pas déjà été proposés
            const fallbackFiltered = (fallbackRes.data || []).filter(f => 
              !suggestionsData.some(s => s.id === f.id)
            );
            suggestionsData = suggestionsData.concat(fallbackFiltered);
          }
        } else {
          // Fallback : suggestions les plus populaires hors film courant
          const suggestionsRes = await supabase
            .from("films")
            .select("id, title, genre, poster, year")
            .neq("id", id)
            .order("popularity", { ascending: false })
            .limit(maxSuggestions);
          suggestionsData = suggestionsRes.data || [];
        }

        setMovie({
          ...data,
          backdropUrl: normalizeBackdropUrl(data.backdrop),
          posterUrl: data.poster
            ? /^https?:\/\//.test(data.poster)
              ? data.poster
              : getTMDBImageUrl(data.poster, "w300")
            : "/placeholder-poster.png",
        });
        setSuggestions(suggestionsData);

        // SECTION AUTRES PARTIES / CONTINUITÉS
        if (data.saga_id) {
          const { data: parts, error: contErr } = await supabase
            .from("films")
            .select("id, title, poster, year, isvip, part_number")
            .eq("saga_id", data.saga_id)
            .neq("id", data.id)
            .order("part_number", { ascending: true });
          setContinuities(parts || []);
        } else {
          setContinuities([]);
        }

      } catch {
        setError("Impossible de charger le film.");
        setContinuities([]);
      } finally {
        setLoading(false);
      }
    }
    if (id) fetchMovieAndSuggestions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, columns]);

  const goBack = () => router.push(`/films/${id}`);

  // Gestion du suivi de la progression
  const { handleProgress, markAsWatched } = useWatchProgress({
    type: "film",
    id,
  });

  // Reprise automatique : calculer resumeSeconds depuis l'historique
  const { history } = useWatchHistory();
  let resumeSeconds: number | undefined = undefined;
  let showResumeHint = false;
  if (history && movie) {
    const hist = history.find(
      (h) => h.film_id === id && typeof h.progress === "number" && h.progress > 0
    );
    if (hist && movie.duration) {
      const totalSeconds = movie.duration * 60;
      resumeSeconds = Math.floor(((hist.progress ?? 0) / 100) * totalSeconds);
      if (resumeSeconds > totalSeconds - 3) resumeSeconds = totalSeconds - 3;
      if (resumeSeconds < 0) resumeSeconds = 0;
      // Afficher la notif si progress > 0 et < 98%
      if (hist.progress !== null && hist.progress > 0 && hist.progress < 98) showResumeHint = true;
    }
  }

  return (
    <>
      {/* Bouton retour visible */}
      <div className="fixed left-3 top-16 sm:top-6 sm:left-8 z-50">
        <button
          onClick={goBack}
          className="flex items-center gap-2 px-3 py-2 bg-gray-800/80 rounded-xl text-white shadow-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary transition-all"
          aria-label="Retour au film"
        >
          <ArrowLeft className="h-5 w-5" />
          <span className="hidden xs:inline">Retour</span>
        </button>
      </div>

      {/* Notification de reprise */}
      {showResumeHint && resumeSeconds && <ResumeHintToast seconds={resumeSeconds} />}

      {/* Skeleton loader pendant le chargement */}
      {loading && (
        <div className="w-full max-w-3xl mx-auto my-8 animate-pulse">
          <div className="aspect-video rounded-xl bg-gray-800/50 mb-6" />
          <div className="h-6 w-3/4 bg-gray-700 rounded mb-2" />
          <div className="h-4 w-2/3 bg-gray-700 rounded mb-2" />
          <div className="h-4 w-1/2 bg-gray-700 rounded mb-2" />
        </div>
      )}

      {/* Player harmonisé */}
      {!loading && (
      <div className="w-full max-w-3xl mx-auto my-8" role="region" aria-label="Lecteur vidéo principal">
        {/* Message d’erreur si vidéo absente */}
        {(!movie?.video_url && !movie?.streamtape_url && !movie?.uqload_url) && (
          <div className="p-6 bg-red-900/60 border border-red-700 rounded-xl text-center text-lg text-white font-bold">
            Impossible de charger cette vidéo pour le moment.
          </div>
        )}
        {(movie?.video_url || movie?.streamtape_url || movie?.uqload_url) && (
          <VideoMultiPlayer
            videoUrl={movie?.video_url || undefined}
            streamtapeUrl={movie?.streamtape_url || undefined}
            uqloadUrl={movie?.uqload_url || undefined}
            loading={loading}
            onVideoProgress={handleProgress}
            onIframeActivate={markAsWatched}
            resumeSeconds={resumeSeconds}
            onError={() => setShowPlayerError(true)}
          />
        )}
        {/* Message d’erreur si le player lève une erreur runtime */}
        {showPlayerError && (
          <div className="p-4 mt-4 bg-red-900/60 border border-red-700 rounded-xl text-center text-base text-white font-bold">
            Erreur lors du chargement du lecteur vidéo. Essayez un autre navigateur ou contactez le support.
          </div>
        )}
      </div>
      )}

      {/* Infos film et suggestions */}
      {movie && (
        <>
          <div className="flex flex-wrap items-center gap-3 mb-1 mt-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mr-3">
              {movie.title}
            </h1>
            {movie.year && (
              <span className="text-base px-3 py-1 rounded-xl bg-gray-800/70 text-gray-200 font-medium">
                {movie.year}
              </span>
            )}
            {movie.genre && (
              <span className="text-base px-3 py-1 rounded-xl bg-primary/20 text-primary font-medium">
                {movie.genre}
              </span>
            )}
            {movie.is_vip && (
              <Badge
                variant="secondary"
                className="text-amber-400 bg-amber-900/60 border-amber-800/80 px-4 py-1 text-lg ml-1"
              >
                VIP
              </Badge>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-4 text-gray-300 text-sm mb-2">
            {movie.duration && (
              <span>
                <b>Durée :</b> {movie.duration} min
              </span>
            )}
            {movie.rating && (
              <span>
                <b>Note :</b> <span className="text-yellow-400">★ {movie.rating.toFixed(1)}</span>
              </span>
            )}
          </div>
        </>
      )}
      <div className="mt-6">
        <p className="text-gray-300">{movie?.description}</p>
      </div>

        {/* SECTION SAGA/PARTIES AVEC TITRE DYNAMIQUE ET FILM ACTUEL */}
        {(continuities.length > 0 || (movie && movie.saga_id)) && (
          <div className="mt-8">
            {/* Titre dynamique saga */}
            <h2 className="flex items-center gap-2 text-xl font-bold text-primary mb-4">
              {/* Icône saga type */}
              <span className="inline-block align-middle">
                {/* Icone "saga/franchise" type */}
                <svg width="26" height="26" fill="none" viewBox="0 0 24 24" className="text-primary drop-shadow" style={{display: 'inline'}}><path d="M5 3v18a2 2 0 002 2h10a2 2 0 002-2V3" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/><rect x="7" y="5" width="10" height="3" rx="1" fill="currentColor" className="text-primary/60"/><rect x="7" y="10" width="10" height="3" rx="1" fill="currentColor" className="text-primary/80"/><rect x="7" y="15" width="10" height="3" rx="1" fill="currentColor" className="text-primary"/></svg>
              </span>
              {/* Titre dynamique */}
              {(() => {
                const nb = continuities.length + 1; // +1 pour le film actuel
                if (nb === 2) return <>Saga en 2 parties</>;
                if (nb === 3) return <>Trilogie</>;
                if (nb === 4) return <>Quadrilogie</>;
                if (nb > 4) return <>Saga ({nb} parties)</>;
                return <>Saga</>;
              })()}
            </h2>
            {/* Grille des parties incluant le film courant */}
            <div
              className="grid gap-3"
              style={{
                gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))"
              }}
            >
              {/* Film actuel en premier */}
              {movie && (
                <div className="relative group flex flex-col w-[140px] mx-auto">
                  <FilmCard
                    key={movie.id}
                    movie={{
                      id: String(movie.id),
                      title:
                        movie.title +
                        (movie.part_number
                          ? ` (Partie ${movie.part_number})`
                          : ""),
                      poster: movie.posterUrl,
                      year: movie.year,
                      isVIP: movie.isvip ?? false,
                    }}
                    posterProps={{ loading: "lazy" }}
                  />
                  {/* Badge FILM ACTUEL */}
                  <span
                    className="absolute top-2 left-2 bg-indigo-600/90 text-white font-bold text-xs px-2 py-1 rounded shadow-lg border border-indigo-700 uppercase pointer-events-none"
                    style={{ zIndex: 2, letterSpacing: 0.5 }}
                  >
                    Film actuel
                  </span>
                </div>
              )}
              {/* Autres parties */}
              {continuities.map((part) => (
                <div className="w-[140px] mx-auto">
                  <FilmCard
                    key={part.id}
                    movie={{
                      id: String(part.id),
                      title:
                        part.title +
                        (part.part_number
                          ? ` (Partie ${part.part_number})`
                          : ""),
                      poster:
                        part.poster
                          ? /^https?:\/\//.test(part.poster)
                            ? part.poster
                            : getTMDBImageUrl(part.poster, "w300")
                          : "/placeholder-poster.png",
                      year: part.year,
                      isVIP: part.isvip ?? false,
                    }}
                    posterProps={{ loading: "lazy" }}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Suggestions */}
        <div className="mt-8">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-2 mb-4">
            <h2 className="text-2xl font-extrabold text-primary flex items-center gap-2 tracking-wide drop-shadow mb-0">
              <span className="inline-block">
                <svg width="24" height="24" fill="none" className="align-middle text-primary"><circle cx="12" cy="12" r="11" stroke="currentColor" strokeWidth="2" /></svg>
              </span>
              Films similaires
            </h2>
            {movie?.genre && (
              (() => {
                // Mapping du label ou du champ genre vers le slug utilisé dans l'URL
                const GENRE_SLUGS: Record<string, string> = {
                  "Action": "action",
                  "Comédie": "comedy",
                  "Drame": "drama",
                  "Animation": "animation",
                  "Famille": "family",
                  "Science-Fiction": "sci-fi",
                  "Aventure": "adventure",
                  "Documentaire": "documentary",
                  // Ajoutez d'autres mappings si nécessaire
                };
                // Utilise le slug si trouvé, sinon fallback sur la version minuscule sans espaces
                const genreSlug = GENRE_SLUGS[movie.genre] ?? (movie.genre || "").toLowerCase().replace(/\s+/g, "-");
                return (
                  <a
                    href={`/films?genre=${encodeURIComponent(genreSlug)}`}
                    className={`
                      text-sm flex items-center font-medium
                      bg-gradient-to-r from-fuchsia-400 via-pink-400 to-violet-500
                      bg-clip-text text-transparent
                      underline underline-offset-4
                      transition-all duration-300
                      hover:bg-none hover:text-violet-400 hover:scale-105
                      focus:outline-none
                    `}
                    style={{
                      WebkitTextFillColor: 'transparent',
                      background: 'linear-gradient(90deg, #e879f9, #ec4899, #a78bfa)',
                      WebkitBackgroundClip: 'text',
                      padding: 0,
                      border: "none"
                    }}
                  >
                    <span className="underline underline-offset-4">
                      Voir tout
                    </span>
                    <svg className="h-4 w-4 ml-1 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                  </a>
                );
              })()
            )}
          </div>
          <div
            className="grid gap-3"
            style={{
              gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))"
            }}
          >
            {suggestions.map((film) => (
              <Link key={film.id} href={`/films/${film.id}`}>
                <FilmCard
                  movie={{
                    id: String(film.id),
                    title: film.title,
                    poster: film.poster
                      ? /^https?:\/\//.test(film.poster)
                        ? film.poster
                        : getTMDBImageUrl(film.poster, "w300")
                      : "/placeholder-poster.png",
                    year: film.year,
                    isVIP: film.is_vip ?? false,
                  }}
                  posterProps={{ loading: "lazy" }}
                />
              </Link>
            ))}
          </div>
        </div>
      </>
  );
}