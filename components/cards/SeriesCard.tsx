import Link from "next/link";
import { Tv } from "lucide-react";

interface SeriesCardProps {
  series: {
    id: string;
    title: string;
    poster?: string;
    year?: number | string;
    isVIP?: boolean;
  };
  isUserVIP: boolean;
  animationDelay?: string;
}

export default function SeriesCard({ series, isUserVIP, animationDelay }: SeriesCardProps) {
  const { id, title, poster, year, isVIP } = series;
  const posterSrc = poster || '/placeholder-poster.png';

  return (
    <Link
      href={`/series/${id}`}
      className={`group block bg-gray-800 rounded-lg overflow-hidden shadow-sm transition-all duration-300
        hover:scale-[1.06] hover:shadow-xl hover:ring-2 hover:ring-purple-400/50
        focus-visible:ring-4 focus-visible:ring-purple-400/60
        ${isVIP && !isUserVIP ? 'opacity-70 grayscale hover:grayscale-0' : ''}
        `}
      tabIndex={0}
      aria-label={title}
      style={{
        width: 124,
        minWidth: 112,
        maxWidth: 144,
        fontSize: '0.93rem',
        animationDelay,
        aspectRatio: "2/3"
      }}
    >
      <div className="relative aspect-[2/3]">
        <img
          src={posterSrc}
          alt={`Affiche de ${title}`}
          className="w-full h-full object-cover transition-all duration-300 group-hover:brightness-90 group-hover:scale-105"
          loading="lazy"
          style={{ willChange: 'transform, filter' }}
        />
        {isVIP && (
          <div className="absolute top-1.5 right-1.5 bg-gradient-to-r from-amber-400 to-yellow-600 text-black px-1.5 py-0.5 rounded-full text-[11px] font-bold shadow animate-pulse">
            VIP
          </div>
        )}
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center pointer-events-none">
          <Tv className="h-8 w-8 text-white drop-shadow-lg" />
        </div>
      </div>
      <div className="p-2 transition-colors duration-200 group-hover:bg-gray-900/70">
        <h3 className="font-semibold truncate text-xs group-hover:text-purple-400 transition-colors">{title}</h3>
        <p className="text-[11px] text-gray-400 group-hover:text-gray-200 transition-colors">{year ?? ""}</p>
      </div>
    </Link>
  );
}