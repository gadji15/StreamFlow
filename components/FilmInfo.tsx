import React from "react";
import { Calendar, Clock, Star } from "lucide-react";

/**
 * Affiche les infos principales du film : titre, année, durée, genres, note.
 */
export interface FilmInfoProps {
  title: string;
  year?: number | string;
  duration?: number;
  genres?: string;
  rating?: number | null;
  className?: string;
}

export default function FilmInfo({
  title,
  year,
  duration,
  genres,
  rating,
  className,
}: FilmInfoProps) {
  return (
    <div className={className ?? ""}>
      <h1 className="text-3xl md:text-4xl font-bold mb-2">{title}</h1>
      <div className="flex flex-wrap items-center space-x-4 text-white drop-shadow mb-3">
        {year && (
          <span className="flex items-center font-semibold">
            <Calendar className="mr-1 h-4 w-4" /> {year}
          </span>
        )}
        {duration && (
          <span className="flex items-center font-semibold">
            <Clock className="mr-1 h-4 w-4" /> {Math.floor(duration / 60)}h {duration % 60}min
          </span>
        )}
        {rating != null && (
          <span className="flex items-center font-bold text-yellow-400 drop-shadow">
            <Star className="mr-1 h-4 w-4 text-yellow-400" /> {rating.toFixed(1)}/10
          </span>
        )}
      </div>
      {genres && (
        <div className="flex flex-wrap gap-2 mb-4">
          {genres.split(",").map((genre) => (
            <span
              key={genre.trim()}
              className="px-3 py-1 bg-gray-700 text-xs rounded-full"
            >
              {genre.trim()}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}