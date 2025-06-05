import Link from "next/link";
import { Tv } from "lucide-react";

/**
 * Carte de série compacte, harmonisée avec /series et inspirée de xalaflix.io
 */
export default function SeriesCard({
  series,
  isUserVIP = false,
  className = "",
}: {
  series: {
    id: string;
    title: string;
    poster?: string;
    year?: number | string;
    isVIP?: boolean;
  };
  isUserVIP?: boolean;
  className?: string;
}) {
  const { id, title, poster, year, isVIP, startYear, endYear, start_year, end_year } = series;
  const posterSrc = poster || "/placeholder-poster.png";

  // Robust year display logic: prefer "year" if present, else build from start/end
  let displayYear = "";
  if (year) {
    displayYear = String(year);
  } else if (startYear || endYear) {
    displayYear = [startYear, endYear].filter(Boolean).join(" - ");
  } else if (start_year || end_year) {
    displayYear = [start_year, end_year].filter(Boolean).join(" - ");
  }

  return (
    <Link
      href={`/series/${id}`}
      className={`
        group block bg-gray-800 rounded-lg overflow-hidden transition-all duration-300
        hover:scale-[1.04] hover:shadow-2xl hover:ring-2 hover:ring-purple-400/40
        focus-visible:ring-4 focus-visible:ring-purple-400/60
        ${isVIP && !isUserVIP ? 'opacity-70 grayscale hover:grayscale-0' : ''}
        ${className}
        w-[110px] sm:w-[140px] max-w-full
      `}
      tabIndex={0}
      aria-label={title}
      style={{ willChange: 'transform, box-shadow' }}
    >
      <div className="relative aspect-[2/3] w-full">
        <img
          src={posterSrc}
          alt={`Affiche de ${title}`}
          className="w-full h-full object-cover transition-all duration-300 group-hover:brightness-90 group-hover:scale-105"
          loading="lazy"
          style={{ willChange: 'transform, filter' }}
        />
        {isVIP && (
          <div className="absolute top-2 right-2 bg-gradient-to-r from-amber-400 to-yellow-600 text-black px-1.5 py-0.5 rounded-full text-[10px] font-bold shadow animate-pulse">
            VIP
          </div>
        )}
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center pointer-events-none">
          <Tv className="h-7 w-7 text-white drop-shadow-lg animate-fade-in-up" />
        </div>
      </div>
      <div className="p-2 transition-colors duration-200 group-hover:bg-gray-900/70">
        <h3 className="font-semibold truncate text-xs text-center group-hover:text-purple-400 transition-colors duration-200">{title}</h3>
        <p className="text-[11px] text-gray-400 group-hover:text-gray-200 transition-colors duration-200 text-center">{displayYear}</p>
      </div>
    </Link>
  );
}