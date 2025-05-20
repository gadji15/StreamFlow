import React from "react";
import { Calendar, Film, Star } from "lucide-react";

/**
 * Affiche les infos principales d'une série : titre, années, saisons, genres, note.
 */
export default function SeriesInfo({
  title,
  startYear,
  endYear,
  seasons,
  genres,
  rating,
}: {
  title: string;
  startYear?: number | string;
  endYear?: number | string | null;
  seasons?: number;
  genres?: string[] | string;
  rating?: number | null;
}) {
  return (
    <>
      <h1 className="text-3xl md:text-4xl font-bold mb-2 text-white drop-shadow">{title}</h1>
      <div className="flex flex-wrap items-center space-x-4 text-white drop-shadow font-semibold mb-3">
        {startYear && (
          <span className="flex items-center">
            <Calendar className="mr-1 h-4 w-4" /> 
            {startYear}{endYear ? ` - ${endYear}` : ' - Présent'}
          </span>
        )}
        {seasons && (
          <span className="flex items-center">
            <Film className="mr-1 h-4 w-4" /> 
            {seasons} Saison{seasons > 1 ? "s" : ""}
          </span>
        )}
        {rating && (
          <span className="flex items-center font-bold text-yellow-400 drop-shadow">
            <Star className="mr-1 h-4 w-4 text-yellow-400" /> 
            {rating.toFixed(1)}/10
          </span>
        )}
      </div>
      {genres && (
        <div className="flex flex-wrap gap-2 mb-4">
          {(Array.isArray(genres) ? genres : genres.split(",")).map((genre) => (
            <span
              key={genre.trim()}
              className="px-3 py-1 bg-gray-700 text-xs rounded-full"
            >
              {genre.trim()}
            </span>
          ))}
        </div>
      )}
    </>
  );
}