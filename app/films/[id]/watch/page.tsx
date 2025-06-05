"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/lib/supabaseClient";
import { getTMDBImageUrl } from "@/lib/tmdb";
import WatchLayout from "@/components/watch/WatchLayout";
import dynamic from "next/dynamic";
const VideoMultiPlayer = dynamic(() => import("@/components/VideoMultiPlayer"), { ssr: false });
import FilmCard from "@/components/cards/FilmCard";

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

  return (
    <>
      {console.log("MOVIE DEBUG", movie)}
      <div className="w-full max-w-3xl mx-auto my-8">
        <VideoMultiPlayer
          streamtapeUrl={movie?.streamtape_url || undefined}
          uqloadUrl={movie?.uqload_url || undefined}
          loading={loading}
        />
      </div>
      {/* Tu peux ajouter ici d'autres infos ou suggestions, mais plus de WatchLayout ni de player concurrent */}
            {movie && (
              <>
                <div className="flex flex-wrap items-center gap-3 mb-1">
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
                gridTemplateColumns: "repeat(auto-fit, minmax(124px, 1fr))",
              }}
            >
              {/* Film actuel en premier */}
              {movie && (
                <div className="relative group flex flex-col">
                  <div style={{ width: 124, minWidth: 112, maxWidth: 144 }}>
                    <FilmCard
                      movie={{
                        ...movie,
                        poster: movie.posterUrl,
                        title:
                          movie.title +
                          (movie.part_number
                            ? ` (Partie ${movie.part_number})`
                            : ""),
                        isVIP: movie.isvip ?? movie.is_vip,
                      }}
                      isUserVIP={false}
                    />
                    {/* Badge FILM ACTUEL */}
                    <span
                      className="absolute top-2 left-2 bg-indigo-600/90 text-white font-bold text-xs px-2 py-1 rounded shadow-lg border border-indigo-700 uppercase pointer-events-none"
                      style={{ zIndex: 2, letterSpacing: 0.5 }}
                    >
                      Film actuel
                    </span>
                  </div>
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
                <FilmCard
                  key={part.id}
                  movie={{
                    ...part,
                    poster: part.poster
                      ? /^https?:\/\//.test(part.poster)
                        ? part.poster
                        : getTMDBImageUrl(part.poster, "w300")
                      : "/placeholder-poster.png",
                    title:
                      part.title +
                      (part.part_number
                        ? ` (Partie ${part.part_number})`
                        : ""),
                    isVIP: part.isvip ?? part.is_vip,
                  }}
                  isUserVIP={false}
                />
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
            className="flex flex-wrap gap-x-5 gap-y-6 justify-start"
          >
            {suggestions.map((film, idx) => (
              <div
                key={film.id}
                className="w-[150px] flex-shrink-0"
                style={{ maxWidth: "100%" }}
              >
                <FilmCard
                  movie={{
                    ...film,
                    poster: film.poster
                      ? /^https?:\/\//.test(film.poster)
                        ? film.poster
                        : getTMDBImageUrl(film.poster, "w300")
                      : "/placeholder-poster.png",
                    isVIP: film.isvip ?? film.is_vip,
                  }}
                  isUserVIP={false}
                  animationDelay={`${idx * 0.06}s`}
                />
              </div>
            ))}
          </div>
        </div>
      </>
  );
}