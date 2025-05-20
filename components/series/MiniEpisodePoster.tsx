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
      className="group flex flex-col items-center w-full max-w-[120px] focus:outline-none"
      aria-label={`Regarder épisode ${number} : ${title}`}
    >
      <div className="w-[120px] h-[180px] rounded-lg overflow-hidden shadow-md bg-gray-900 transition-transform duration-150 group-hover:scale-105 group-hover:shadow-xl group-focus:scale-105">
        <img
          src={posterUrl || "/placeholder-poster.jpg"}
          alt={title}
          className="w-full h-full object-contain bg-black"
          loading="lazy"
          style={{
            imageRendering: "auto",
            filter: "contrast(1.1) brightness(1.02) saturate(1.05)",
          }}
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