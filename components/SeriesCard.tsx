

import Link from "next/link";
import { Tv } from "lucide-react";

/**
 * Carte de série compacte, harmonisée avec /series et inspirée de xalaflix.io
 */
export default function SeriesCard({
  series,
  isUserVIP = false,
  className = "",
  posterProps,
}: {
  series: {
    id: string;
    title: string;
    poster?: string;
    year?: string | number;
    isVIP?: boolean;
    startYear?: string | number;
    endYear?: string | number;
    start_year?: string | number;
    end_year?: string | number;
  };
  isUserVIP?: boolean;
  className?: string;
  posterProps?: React.ImgHTMLAttributes<HTMLImageElement>;
}) {
  const { id, title, poster, year, isVIP, startYear, endYear, start_year, end_year } = series;
  const posterSrc = poster || "/placeholder-poster.png";

  // Determine displayYear based on available fields
  let displayYear: string | number | undefined = year;
  if (!displayYear && (startYear || endYear || start_year || end_year)) {
    const start = startYear || start_year;
    const end = endYear || end_year;
    if (start && end && start !== end) {
      displayYear = `${start}–${end}`;
    } else if (start) {
      displayYear = start;
    } else if (end) {
      displayYear = end;
    }
  }

  return (
    <Link
      href={`/series/${id}`}
      className={`
        group block bg-gray-800 rounded-lg overflow-hidden transition-all duration-300
        hover:scale-[1.04] hover:shadow-2xl hover:ring-2 hover:ring-primary/40
        focus-visible:ring-4 focus-visible:ring-primary/60
        ${isVIP && !isUserVIP ? 'opacity-70 grayscale hover:grayscale-0' : ''}
        ${className}
        w-full
      `}
      tabIndex={0}
      aria-label={title}
      style={{ willChange: 'transform, box-shadow' }}
    >
      <div className="relative aspect-[2/3]">
        <img
          src={posterSrc}
          alt={`Affiche de ${title}`}
          className="w-full h-full object-cover transition-all duration-300 group-hover:brightness-90 group-hover:scale-105"
          loading="lazy"
          style={{ willChange: 'transform, filter' }}
          {...posterProps}
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