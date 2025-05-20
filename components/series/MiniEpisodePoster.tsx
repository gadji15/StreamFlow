import React from "react";
import { useRouter } from "next/navigation";

interface MiniEpisodePosterProps {
  posterUrl: string;
  number: number | string;
  title: string;
  onClick?: () => void;
}

export default function MiniEpisodePoster({
  posterUrl,
  number,
  title,
  onClick,
}: MiniEpisodePosterProps) {
  return (
    <button
      tabIndex={0}
      onClick={onClick}
      className="group flex flex-col items-center w-full max-w-[110px] focus:outline-none"
      aria-label={`Regarder épisode ${number} : ${title}`}
    >
      <div className="w-[90px] h-[130px] rounded-lg overflow-hidden border border-gray-700 shadow bg-gray-900 transition-transform duration-150 group-hover:scale-105 group-hover:shadow-xl group-hover:border-primary group-focus:scale-105 group-focus:border-primary">
        <img
          src={posterUrl || "/placeholder-poster.jpg"}
          alt={title}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      </div>
      <div className="mt-1 flex flex-col items-center w-full">
        <span className="text-xs text-primary font-semibold">Ép. {number}</span>
        <span className="text-xs text-gray-200 font-medium w-full text-center truncate" title={title}>
          {title}
        </span>
      </div>
    </button>
  );
}