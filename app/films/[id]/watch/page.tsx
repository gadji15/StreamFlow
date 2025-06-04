"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/lib/supabaseClient";
import { getTMDBImageUrl } from "@/lib/tmdb";
import WatchLayout from "@/components/watch/WatchLayout";

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

  useEffect(() => {
    async function fetchMovieAndSuggestions() {
      setLoading(true);
      setError(null);
      try {
        const [movieRes, suggestionsRes] = await Promise.all([
          supabase
            .from("films")
            .select("*")
            .eq("id", id)
            .single(),
          supabase
            .from("films")
            .select("id, title, genre, poster")
            .neq("id", id)
            .order("popularity", { ascending: false })
            .limit(12),
        ]);

        const data = movieRes.data;
        const suggestionsData = suggestionsRes.data;

        if (!data) {
          setError("Film non trouvé.");
        } else {
          setMovie({
            ...data,
            backdropUrl: normalizeBackdropUrl(data.backdrop),
            posterUrl: data.poster
              ? /^https?:\/\//.test(data.poster)
                ? data.poster
                : getTMDBImageUrl(data.poster, "w300")
              : "/placeholder-poster.png",
          });
          setSuggestions(suggestionsData || []);
        }
      } catch {
        setError("Impossible de charger le film.");
      } finally {
        setLoading(false);
      }
    }
    if (id) fetchMovieAndSuggestions();
  }, [id]);

  const goBack = () => router.push(`/films/${id}`);

  return (
    <WatchLayout
      title={movie?.title || "Lecture film"}
      seoTitle={movie?.title ? `${movie.title} - Streaming` : undefined}
      videoUrl={movie?.video_url || ""}
      posterUrl={movie?.posterUrl}
      backdropUrl={movie?.backdropUrl}
      loading={loading}
      error={error || (!movie ? "Film introuvable" : undefined)}
      onBack={goBack}
      backLabel={
        <span className="flex items-center"><ArrowLeft className="h-5 w-5 mr-2" /> Retour à la fiche film</span>
      }
      isVip={movie?.is_vip}
      metadata={
        movie && (
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
        )
      }
      description={movie?.description}
      suggestions={
        suggestions.map((film) => ({
          id: film.id,
          title: film.title,
          genre: film.genre,
          poster: film.poster
            ? /^https?:\/\//.test(film.poster)
              ? film.poster
              : getTMDBImageUrl(film.poster, "w300")
            : "/placeholder-poster.png",
          link: `/films/${film.id}`,
        }))
      }
      suggestionsTitle="Films similaires"
      suggestionsSubtitle="Découvrez d'autres œuvres que vous pourriez aimer !"
      suggestionsLink={
        movie?.genre ? `/films?genre=${encodeURIComponent(movie.genre)}` : undefined
      }
      suggestionsLinkLabel="Voir tout"
    />
  );
}