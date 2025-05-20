import React, { useEffect, useState } from "react";
import { fetchTMDBSimilarMovies, getTMDBImageUrl, TMDBMovie } from "@/lib/tmdb";
import Link from "next/link";

export default function SimilarMoviesGrid({ tmdbId }: { tmdbId: string }) {
  const [movies, setMovies] = useState<TMDBMovie[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    fetchTMDBSimilarMovies(tmdbId)
      .then((data) => {
        if (isMounted) setMovies(data.slice(0, 12)); // Limit to 12 similar movies
      })
      .catch(() => {
        if (isMounted) setMovies([]);
      })
      .finally(() => setLoading(false));
    return () => {
      isMounted = false;
    };
  }, [tmdbId]);

  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="h-64 bg-gray-800 rounded-xl animate-pulse"
            aria-hidden="true"
          ></div>
        ))}
      </div>
    );
  }

  if (!movies.length) {
    return (
      <div className="text-center p-8 text-gray-400">
        Aucun film similaire trouvé.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
      {movies.map((movie, idx) => (
        <a
          key={movie.id}
          href={`https://www.themoviedb.org/movie/${movie.id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="group flex flex-col items-center bg-gray-800 rounded-xl p-3 shadow transition-transform duration-300 hover:scale-[1.045] hover:shadow-xl outline-none focus-visible:ring-2 focus-visible:ring-primary"
          style={{
            opacity: 0,
            animation: `fadeInUp 0.54s cubic-bezier(.23,1.02,.25,1) forwards`,
            animationDelay: `${idx * 0.06}s`
          }}
          tabIndex={0}
        >
          <img
            src={getTMDBImageUrl(movie.poster_path, "w300")}
            alt={movie.title}
            className="w-full h-48 rounded-lg object-cover mb-2 border-2 border-gray-700 bg-gray-900 transition-transform duration-200 group-hover:scale-105"
            onError={(e) => {
              e.currentTarget.src = "/placeholder-poster.png";
            }}
          />
          <span className="font-medium text-gray-100 text-sm text-center line-clamp-2">
            {movie.title}
          </span>
          {movie.vote_average !== undefined && movie.vote_average !== null && (
            <span className="text-xs text-yellow-400 mt-1">
              ★ {movie.vote_average.toFixed(1)}
            </span>
          )}
        </a>
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
  );
}