import React from "react";
import Link from "next/link";
import { Film, Tv } from "lucide-react";

/**
 * Carte unifiée pour série ou film, avec overlay, badge VIP, titre, année, hover et design home.
 */
export default function MediaPosterCard({
  href,
  poster,
  title,
  year,
  isVIP,
  isMovie = false,
  className = "",
  style = {},
  animationDelay,
}: {
  href: string;
  poster: string | null | undefined;
  title: string;
  year?: string | number | null;
  isVIP?: boolean;
  isMovie?: boolean;
  subtitle?: string | React.ReactNode; // <-- ajout
  className?: string;
  style?: React.CSSProperties;
  animationDelay?: string;
}) {
  return (
    <Link
      href={href}
      className={`
        bg-gray-800 overflow-hidden transition-transform hover:scale-105 group
        flex flex-col items-center
        rounded-md
        sm:rounded-lg md:rounded-xl
        h-full
        ${className}
      `}
      style={{
        ...style,
        ...(animationDelay ? {
          opacity: 0,
          animation: `fadeInUp 0.54s cubic-bezier(.23,1.02,.25,1) forwards`,
          animationDelay,
        } : {}),
      }}
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
          onError={e => {
            (e.target as HTMLImageElement).src = '/placeholder-poster.png';
          }}
          loading="lazy"
        />
        {isVIP && (
          <div className="absolute top-2 right-2 bg-gradient-to-r from-amber-400 to-yellow-600 text-black px-1.5 py-0.5 rounded-full text-xs font-bold">
            VIP
          </div>
        )}
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          {isMovie ? (
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
          {typeof subtitle !== "undefined" ? subtitle : year}
        </p>
      </div>
      {/* Animation keyframes */}
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
    </Link>
  );
}