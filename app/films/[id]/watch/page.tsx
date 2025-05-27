"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { VideoPlayer } from "@/components/video-player";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import LoadingScreen from "@/components/loading-screen";
import FilmInfo from "@/components/FilmInfo";
import SimilarMoviesGrid from "@/components/SimilarMoviesGrid";
import Link from "next/link";
import { getMoviesByGenre, Movie } from "@/lib/supabaseFilms";
import { supabase } from "@/lib/supabaseClient";
import { getTMDBImageUrl } from "@/lib/tmdb";
import { ArrowLeft } from "lucide-react";

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

export default function WatchFilmPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [movie, setMovie] = useState<Movie | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [similarMovies, setSimilarMovies] = useState<Movie[]>([]);
  const [loadingSimilar, setLoadingSimilar] = useState(true);

  useEffect(() => {
    async function fetchMovieAndSimilar() {
      setLoading(true);
      setError(null);
      try {
        const { data, error: movieError } = await supabase
          .from("films")
          .select("*")
          .eq("id", id)
          .single();

        if (movieError || !data) {
          setError("Film non trouvé.");
        } else {
          const currentMovie: Movie = {
            ...data,
            backdropUrl: normalizeBackdropUrl(data.backdrop),
            posterUrl: data.poster
              ? /^https?:\/\//.test(data.poster)
                ? data.poster
                : getTMDBImageUrl(data.poster, "w300")
              : "/placeholder-poster.png",
          };
          setMovie(currentMovie);

          // Fetch similar movies by genre (fallback: no genre = show popular)
          setLoadingSimilar(true);
          let similar: Movie[] = [];
          try {
            if (currentMovie.genre) {
              // getMoviesByGenre attend un genreId. Si plusieurs genres, prendre le 1er ou mapper.
              const genreList = typeof currentMovie.genre === "string"
                ? currentMovie.genre.split(",").map(g => g.trim())
                : Array.isArray(currentMovie.genre)
                  ? currentMovie.genre
                  : [];
              const mainGenre = genreList[0] || "";
              if (mainGenre) {
                similar = await getMoviesByGenre(mainGenre, 12, "popularity");
                // Remove the current movie from similar list
                similar = similar.filter((m) => m.id !== currentMovie.id);
              }
            }
            // Si pas de genre ou pas de résultat, fallback sur populaires hors film en cours
            if (!similar.length) {
              const { data: popular } = await supabase
                .from("films")
                .select("*")
                .order("popularity", { ascending: false })
                .limit(12);
              if (popular) {
                similar = popular.filter((m: Movie) => m.id !== currentMovie.id);
              }
            }
          } catch (err) {
            similar = [];
          }
          setSimilarMovies(similar);
          setLoadingSimilar(false);
        }
      } catch {
        setError("Impossible de charger le film.");
      } finally {
        setLoading(false);
      }
    }
    if (id) fetchMovieAndSimilar();
  }, [id]);

  if (loading) return <LoadingScreen />;
  if (error || !movie) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-black/90 px-4">
        <div className="bg-red-900/50 border border-red-700 rounded-lg p-6 max-w-md w-full text-center">
          <h2 className="text-2xl font-bold mb-2">Erreur</h2>
          <p className="text-gray-300">{error || "Film non trouvé"}</p>
          <Button onClick={() => router.push(`/films/${id}`)} className="mt-4 rounded-2xl text-lg px-6 py-3">
            <ArrowLeft className="h-5 w-5 mr-2" /> Retour à la fiche film
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-black text-white flex flex-col justify-center items-center overflow-x-hidden">
      {/* Backdrop */}
      {movie.backdropUrl && (
        <div className="fixed inset-0 z-0 w-full h-full">
          <img
            src={movie.backdropUrl}
            alt={`Backdrop de ${movie.title}`}
            className="w-full h-full object-cover object-center blur-md brightness-50 scale-105 transition-all duration-500"
            draggable={false}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/40 to-black/90" />
        </div>
      )}

      {/* Main Content */}
      <div className="relative z-10 w-full max-w-4xl mx-auto pt-24 pb-10 px-2 sm:px-6 flex flex-col items-center">
        {/* Retour bouton flottant */}
        <Button
          variant="secondary"
          className="absolute top-6 left-2 sm:left-6 rounded-full shadow-lg bg-black/70 text-lg px-5 py-3 hover:scale-105 hover:bg-black/90 transition-all"
          onClick={() => router.push(`/films/${id}`)}
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Retour à la fiche film
        </Button>

        {/* Player */}
        <div className="w-full max-w-3xl aspect-video rounded-2xl shadow-2xl overflow-hidden bg-black mt-8 animate-fadeInUp">
          <VideoPlayer
            src={movie.video_url || ""}
            poster={movie.posterUrl}
            title={movie.title}
            autoPlay
          />
        </div>

        {/* Metadata */}
        <section className="w-full max-w-3xl mx-auto mt-8 bg-gray-900/80 backdrop-blur-lg rounded-2xl shadow-lg px-6 py-6 flex flex-col gap-2 animate-fadeInUp">
          <div className="flex flex-wrap items-center gap-3 mb-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mr-3">
              {movie.title}
            </h1>
            {movie.year && (
              <span className="text-base px-3 py-1 rounded-xl bg-gray-800/50 text-gray-200 font-medium">
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
          <p className="text-gray-200 text-base whitespace-pre-line mt-1">{movie.description}</p>
        </section>

        {/* Films similaires améliorés */}
        <section className="w-full max-w-6xl mx-auto mt-10 animate-fadeInUp">
          <h3 className="font-bold text-xl mb-3 text-primary">Films similaires</h3>
          {loadingSimilar ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="h-64 bg-gray-800 rounded-xl animate-pulse"
                  aria-hidden="true"
                ></div>
              ))}
            </div>
          ) : similarMovies.length === 0 ? (
            <div className="text-center p-8 text-gray-400">
              Aucun film similaire trouvé.
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {similarMovies.map((film, idx) => (
                <Link
                  key={film.id}
                  href={`/films/${film.id}`}
                  className="group flex flex-col items-center bg-gray-800 rounded-xl p-3 shadow transition-transform duration-300 hover:scale-[1.045] hover:shadow-xl outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  style={{
                    opacity: 0,
                    animation: `fadeInUp 0.54s cubic-bezier(.23,1.02,.25,1) forwards`,
                    animationDelay: `${idx * 0.06}s`
                  }}
                  tabIndex={0}
                >
                  <img
                    src={film.poster || film.posterUrl || "/placeholder-poster.png"}
                    alt={film.title}
                    className="w-full h-48 rounded-lg object-cover mb-2 border-2 border-gray-700 bg-gray-900 transition-transform duration-200 group-hover:scale-105"
                    onError={e => {
                      (e.currentTarget as HTMLImageElement).src = "/placeholder-poster.png";
                    }}
                  />
                  <span className="font-medium text-gray-100 text-sm text-center line-clamp-2">
                    {film.title}
                  </span>
                  {film.rating !== undefined && film.rating !== null && (
                    <span className="text-xs text-yellow-400 mt-1">
                      ★ {film.rating.toFixed(1)}
                    </span>
                  )}
                  {film.is_vip && (
                    <span className="absolute top-2 right-2 bg-gradient-to-r from-amber-400 to-yellow-600 text-black px-2 py-0.5 rounded-full text-xs font-bold">
                      VIP
                    </span>
                  )}
                </Link>
              ))}
              <style>{`
                @keyframes fadeInUp {
                  0% {
                    opacity: 0;
                    transform: translateY(24px);
                  }
                  100% {
                    opacity: 1;
                    transform: translateY(0);
                  }
                }
              `}</style>
            </div>
          )}
        </section>
      </div>

      {/* Animation keyframes */}
      <style>{`
        @keyframes fadeInUp {
          0% {
            opacity: 0;
            transform: translateY(24px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeInUp {
          animation: fadeInUp 0.6s cubic-bezier(.23,1.02,.25,1) both;
        }
      `}</style>
    </div>
  );
}