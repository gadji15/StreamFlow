import React from "react";
import { Calendar, Film, Star } from "lucide-react";

/**
 * Affiche les informations principales d'une série.
 * Accessible, personnalisable, et robuste.
 */
type SeriesInfoProps = {
  title: string;
  startYear?: number | string;
  endYear?: number | string | null;
  seasons?: number;
  genres?: string[] | string;
  rating?: number | null;
  showTitle?: boolean;
  showYears?: boolean;
  showSeasons?: boolean;
  showGenres?: boolean;
  showRating?: boolean;
  // Customisation avancée
  genreBadgeClassName?: string;
  ratingColorClassName?: string;
  className?: string;
};

export default function SeriesInfo({
  title,
  startYear,
  endYear,
  seasons,
  genres,
  rating,
  showTitle = true,
  showYears = true,
  showSeasons = true,
  showGenres = true,
  showRating = true,
  genreBadgeClassName = "px-3 py-1 bg-gray-700 text-xs rounded-full",
  ratingColorClassName = "",
  className,
}: SeriesInfoProps) {
  // Nettoie et normalise le tableau des genres
  let genreList: string[] = [];
  if (showGenres && genres) {
    if (Array.isArray(genres)) {
      genreList = genres.map((g) => g.trim()).filter(Boolean);
    } else {
      genreList = genres.split(",").map((g) => g.trim()).filter(Boolean);
    }
  }

  return (
    <section aria-label="Informations principales sur la série" className={`mb-3 ${className ?? ""}`}>
      {showTitle && (
        <h1 className="text-3xl md:text-4xl font-bold mb-2 text-white drop-shadow" tabIndex={0}>
          {title}
        </h1>
      )}
      <div
        className="flex flex-wrap items-center gap-x-4 gap-y-2 text-white drop-shadow font-semibold mb-3"
        aria-label="Détails principaux"
      >
        {showYears && startYear && (
          <span className="flex items-center" aria-label={`Années de diffusion : ${startYear}${endYear ? ` - ${endYear}` : " - Présent"}`}>
            <Calendar className="mr-1 h-4 w-4" aria-hidden="true" />
            {startYear}
            {endYear ? ` - ${endYear}` : " - Présent"}
          </span>
        )}
        {showSeasons && seasons !== undefined && seasons !== null && (
          <span className="flex items-center" aria-label={`${seasons} saison${seasons > 1 ? "s" : ""}`}>
            <Film className="mr-1 h-4 w-4" aria-hidden="true" />
            {seasons} Saison{seasons > 1 ? "s" : ""}
          </span>
        )}
        {showRating && rating !== undefined && rating !== null && (
          <span className={`flex items-center ${ratingColorClassName}`} aria-label={`Note : ${rating.toFixed(1)}/10`}>
            <Star className="mr-1 h-4 w-4 text-yellow-400" aria-hidden="true" />
            {rating.toFixed(1)}/10
          </span>
        )}
      </div>
      {showGenres && genreList.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4" aria-label="Genres">
          {genreList.map((genre) => (
            <span
              key={genre}
              className={genreBadgeClassName}
              tabIndex={0}
              aria-label={`Genre : ${genre}`}
            >
              {genre}
            </span>
          ))}
        </div>
      )}
    </section>
  );
}