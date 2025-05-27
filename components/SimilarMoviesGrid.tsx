import React, { useEffect, useState } from "react";
import { fetchTMDBSimilarMovies, getTMDBImageUrl, TMDBMovie } from "@/lib/tmdb";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function SimilarMoviesGrid({ tmdbId }: { tmdbId: string }) {
  const { id: currentFilmId } = useParams() as { id: string };
  const [movies, setMovies] = useState<TMDBMovie[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    fetchTMDBSimilarMovies(tmdbId)
      .then((data) => {
        if (isMounted) setMovies(data.slice(0, 12));
      })
      .catch(() => {
        if (isMounted) setMovies([]);
      })
      .finally(() => setLoading(false));
    return () => {
      isMounted = false;
    };
  }, [tmdbId]);

  // Exclure le film en cours si id TMDB = id courant (possible si mapping direct)
  let filteredMovies = movies.filter(movie =>
    movie.id?.toString() !== tmdbId && movie.id?.toString() !== currentFilmId
  );
  // Limiter à 12 films max (2 lignes de 6 sur desktop, 2x3 ou 2x4 selon responsive)
  filteredMovies = filteredMovies.slice(0, 12);

  if (loading) {
    return (
      <div
        className="
          w-full
          [display:grid]
          gap-3
          [grid-template-columns:repeat(auto-fit,minmax(140px,1fr))]
        "
      >
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="bg-gray-800 rounded-md sm:rounded-lg md:rounded-xl animate-pulse flex flex-col items-center"
            style={{ height: "210px" }}
          ></div>
        ))}
      </div>
    );
  }

  if (!filteredMovies.length) {
    return (
      <div className="text-center py-10">
        <p className="text-gray-400">Aucun film similaire trouvé.</p>
      </div>
    );
  }

  return (
    <div
      className="
        w-full
        [display:grid]
        gap-3
        [grid-template-columns:repeat(auto-fit,minmax(140px,1fr))]
        "
        style={{
          gridAutoRows: "1fr",
          maxHeight: "calc(2 * 210px + 1.5rem)", // 2 rows max, 210px card + gap
          overflow: "hidden"
        }}
    >
      {filteredMovies.map((movie, idx) => (
        <Link
          key={movie.id}
          href={`/films/${movie.id}`}
          className="
            bg-gray-800 overflow-hidden transition-transform hover:scale-105 group
            flex flex-col items-center
            rounded-md
            sm:rounded-lg md:rounded-xl
            h-full
          "
          style={{
            opacity: 0,
            animation: `fadeInUp 0.54s cubic-bezier(.23,1.02,.25,1) forwards`,
            animationDelay: `${idx * 0.06}s`,
          }}
        >
          <div
            className="
              relative aspect-[2/3]
              w-full
              h-full
              flex flex-col items-center
            "
          >
            <img
              src={getTMDBImageUrl(movie.poster_path, "w300") || "/placeholder-poster.png"}
              alt={movie.title}
              className="
                w-full h-full object-cover transition-all duration-300
                rounded-md
                sm:rounded-lg
                md:rounded-xl
              "
              onError={e => {
                (e.target as HTMLImageElement).src = "/placeholder-poster.png";
              }}
              loading="lazy"
            />
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              {/* Icône Film */}
              <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4h16v16H4V4zm4 4v8M8 8h8v8H8V8z" />
              </svg>
            </div>
          </div>
          <div className="flex flex-col items-center w-full px-1 pb-1 pt-1">
            <h3 className="
              truncate font-medium w-full text-center
              text-xs
              sm:text-sm
              md:text-base
            ">{movie.title}</h3>
            <p className="text-[11px] text-gray-400 w-full text-center">
              {movie.release_date ? new Date(movie.release_date).getFullYear() : ""}
            </p>
          </div>
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
  );
}