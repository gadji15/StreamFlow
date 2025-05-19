"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Play } from "lucide-react";

const TMDB_API_KEY = process.env.NEXT_PUBLIC_TMDB_KEY;
const TMDB_BASE_URL = "https://api.themoviedb.org/3";

export interface RelatedMovie {
  id: number;
  title: string;
  poster_path?: string;
  release_date?: string;
}

interface RelatedMoviesProps {
  tmdbId: number;
  excludeMovieId?: string;
}

export default function RelatedMovies({ tmdbId, excludeMovieId }: RelatedMoviesProps) {
  const [movies, setMovies] = useState<RelatedMovie[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!tmdbId || !TMDB_API_KEY) return;

    const fetchRelated = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `${TMDB_BASE_URL}/movie/${tmdbId}/similar?api_key=${TMDB_API_KEY}&language=fr-FR&page=1`
        );
        if (!res.ok) throw new Error("TMDB error");
        const data = await res.json();
        if (data && data.results) {
          setMovies(data.results.filter((m: any) => m.id !== Number(excludeMovieId)).slice(0, 12));
        } else {
          setMovies([]);
        }
      } catch {
        setMovies([]);
      } finally {
        setLoading(false);
      }
    };
    fetchRelated();
  }, [tmdbId, excludeMovieId]);

  if (loading) {
    return <div className="text-gray-400 text-center">Chargement...</div>;
  }

  if (!movies.length) {
    return <div className="text-gray-400 text-center">Aucun film similaire trouvé.</div>;
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
      {movies.map(movie => (
        <Link
          key={movie.id}
          href={`/films/${movie.id}`}
          className="group relative bg-gray-900 rounded-lg shadow-md overflow-hidden hover:scale-105 transition"
        >
          <Image
            src={
              movie.poster_path
                ? `https://image.tmdb.org/t/p/w342${movie.poster_path}`
                : "/placeholder-poster.png"
            }
            alt={movie.title}
            width={220}
            height={330}
            className="object-cover w-full h-64"
            loading="lazy"
          />
          <div className="absolute inset-0 flex flex-col justify-end p-2 bg-gradient-to-t from-black/80 via-black/20 to-transparent">
            <div className="flex items-center mb-1">
              <Play className="h-4 w-4 text-purple-400 mr-1" />
              <span className="font-bold text-white text-xs truncate">{movie.title}</span>
            </div>
            {movie.release_date && (
              <span className="text-xs text-gray-300">{movie.release_date.slice(0, 4)}</span>
            )}
          </div>
        </Link>
      ))}
    </div>
  );
}