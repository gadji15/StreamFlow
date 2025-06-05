import Link from "next/link";
import { Film } from "lucide-react";

interface FilmCardProps {
  movie: {
    id: string;
    title: string;
    poster?: string;
    year?: number | string;
    isVIP?: boolean;
  };
  isUserVIP: boolean;
  animationDelay?: string;
}

export default function FilmCard({ movie, isUserVIP, animationDelay }: FilmCardProps) {
  const { id, title, poster, year, isVIP } = movie;
  const posterSrc = poster || '/placeholder-poster.png';

  return (
    <Link
      href={`/films/${id}`}
      className={`group block bg-gray-800 rounded-lg overflow-hidden shadow-sm transition-all duration-300
        hover:scale-[1.06] hover:shadow-xl hover:ring-2 hover:ring-primary/50
        focus-visible:ring-4 focus-visible:ring-primary/60
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
      <div className="relative aspect-[2/3] flex flex-col justify-end">
        <img
          src={posterSrc}
          alt={`Affiche de ${title}`}
          className="w-full h-full object-cover transition-all duration-300 group-hover:brightness-90 group-hover:scale-105"
          loading="lazy"
          style={{ willChange: 'transform, filter' }}
        />
        {isVIP && (
          <div className="absolute top-1.5 right-1.5 bg-gradient-to-r from-amber-400 to-yellow-600 text-black px-1.5 py-0.5 rounded-full text-[11px] font-bold shadow animate-pulse z-20">
            VIP
          </div>
        )}
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center pointer-events-none z-10">
          <Film className="h-8 w-8 text-white drop-shadow-lg" />
        </div>
        {/* Badge Titre + Année */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-r from-primary/90 to-primary/80 px-2 py-1 flex items-center justify-between z-20">
          <span className="font-semibold text-xs truncate text-white flex-1">{title}</span>
          <span className="ml-2 text-[11px] text-white/80 whitespace-nowrap">{year ?? ""}</span>
        </div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-r from-primary/90 to-primary/80 px-2 py-1 flex items-center justify-between z-10">
        <span className="font-semibold text-xs truncate text-white flex-1">{title}</span>
        <span className="ml-2 text-[11px] text-white/80 whitespace-nowrap">{year ?? ""}</span>
      </div>
    </Link>
  );
}