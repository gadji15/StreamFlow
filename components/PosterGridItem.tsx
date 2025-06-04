import React from "react";
import Link from "next/link";
import { Film, Tv } from "lucide-react";

/**
 * Un item de grille réutilisable pour l'affichage d'un film ou d'une série dans une grille de posters,
 * avec design, overlay, badge VIP, titre, année/genre, animation hover.
 */
export type PosterGridItemProps = {
  id: string;
  title: string;
  poster: string;
  link: string;
  genre?: string;
  yearOrPeriod?: string;
  isVIP?: boolean;
  type: "movie" | "series";
  className?: string;
};

export default function PosterGridItem({
  id,
  title,
  poster,
  link,
  genre,
  yearOrPeriod,
  isVIP,
  type,
  className = "",
}: PosterGridItemProps) {
  return (
    <Link
      key={id}
      href={link}
      className={`
        bg-gray-800 overflow-hidden transition-transform hover:scale-105 group
        flex flex-col items-center
        rounded-md
        sm:rounded-lg md:rounded-xl
        h-full
        ${className}
      `}
      aria-label={title}
      tabIndex={0}
    >
      <div
        className={`
          relative aspect-[2/3]
          w-full
          h-full
          flex flex-col items-center
        `}
      >
        <img
          src={poster || "/placeholder-poster.png"}
          alt={title}
          className={`
            w-full h-full object-cover transition-all duration-300
            rounded-md
            sm:rounded-lg
            md:rounded-xl
          `}
          loading="lazy"
          onError={e => {
            (e.target as HTMLImageElement).src = '/placeholder-poster.png';
          }}
        />
        {isVIP && (
          <div className="absolute top-2 right-2 bg-gradient-to-r from-amber-400 to-yellow-600 text-black px-1.5 py-0.5 rounded-full text-xs font-bold shadow">
            VIP
          </div>
        )}
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          {type === "movie" ? (
            <Film className="w-7 h-7 text-white" />
          ) : (
            <Tv className="w-7 h-7 text-white" />
          )}
        </div>
      </div>
      <div className="flex flex-col items-center w-full px-1 pb-1 pt-1">
        <h3 className={`
          truncate font-medium w-full text-center
          text-xs
          sm:text-sm
          md:text-base
        `}>{title}</h3>
        <p className="text-[11px] text-gray-400 w-full text-center">
          {yearOrPeriod || genre || ""}
        </p>
      </div>
    </Link>
  );
}