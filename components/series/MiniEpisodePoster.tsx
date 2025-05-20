import React from "react";

interface MiniEpisodePosterProps {
  posterUrl: string;
  number: number | string;
  title: string;
}

export default function MiniEpisodePoster({
  posterUrl,
  number,
  title,
}: MiniEpisodePosterProps) {
  return (
    <div className="flex flex-col items-center w-full max-w-[110px]">
      <div className="w-[90px] h-[130px] rounded-lg overflow-hidden border border-gray-700 shadow bg-gray-900">
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
    </div>
  );
}