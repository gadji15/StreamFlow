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
import MediaPosterCard from "@/components/MediaPosterCard";

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
      } catch {
        setError("Impossible de charger le film.");
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
        {/* Suggestions */}
        <div className="mt-8">
          <h2 className="text-xl font-bold text-white mb-2">Films similaires</h2>
          <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>
            {suggestions.map((film, idx) => (
              <MediaPosterCard
                key={film.id}
                href={`/films/${film.id}`}
                poster={
                  film.poster
                    ? /^https?:\/\//.test(film.poster)
                      ? film.poster
                      : getTMDBImageUrl(film.poster, "w300")
                    : "/placeholder-poster.png"
                }
                title={film.title}
                year={film.year}
                isVIP={film.is_vip}
                isMovie={true}
                animationDelay={`${idx * 0.06}s`}
              />
            ))}
          </div>
          {movie?.genre && (
            <div className="mt-4">
              <a
                href={`/films?genre=${encodeURIComponent(movie.genre)}`}
                className="text-primary underline"
              >
                Voir tout
              </a>
            </div>
          )}
        </div>
      </>
  );
}