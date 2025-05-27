import React, { useState, useRef, useEffect } from "react";
import StatusBadge from "./StatusBadge";
import VipBadge from "./VipBadge";
import SeriesActionMenu from "./SeriesActionMenu";
import { useRouter } from "next/navigation";

type Serie = {
  id: string | number;
  poster?: string;
  title: string;
  genres?: string[];
  genre?: string;
  start_year?: number | string;
  end_year?: number | string;
  creator?: string;
  vote_average?: number | string;
  published?: boolean;
  isvip?: boolean;
};

type SeriesRowProps = {
  serie: Serie;
  selected: boolean;
  onSelect: (id: string | number) => void;
  onAction?: (action: string, serie: Serie) => void;
  seasonCount?: number;
  genres?: string[];
};

export default function SeriesRow({
  serie,
  selected,
  onSelect,
  onAction,
  seasonCount,
  genres,
}: SeriesRowProps) {
  const router = useRouter();
  const posterUrl = serie.poster || '/placeholder-backdrop.jpg';
  const genreList = Array.isArray(serie.genres)
    ? serie.genres
    : (typeof serie.genre === "string"
        ? serie.genre.split(',').map(g => g.trim())
        : []);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Ferme le menu contextuel si clic en dehors
  useEffect(() => {
    if (!menuOpen) return;
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && event.target && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

  return (
    <tr className="border-b border-gray-700 group hover:bg-gray-700/10 transition">
      <td className="py-2 px-1 align-middle">
        <button
          type="button"
          aria-label={selected ? "Désélectionner" : "Sélectionner"}
          onClick={() => onSelect(serie.id)}
          className="bg-transparent border-none focus:outline-none"
        >
          {selected ? "☑️" : "⬜"}
        </button>
      </td>
      <td className="py-2 min-w-[160px] max-w-[210px]">
        <div className="flex items-center">
          <div className="h-8 w-8 overflow-hidden rounded mr-2 flex-shrink-0 border border-gray-600 bg-gray-800">
            <img
              src={posterUrl}
              alt={serie.title}
              className="h-full w-full object-cover"
              onError={e => { (e.target as HTMLImageElement).src = '/placeholder-backdrop.jpg'; }}
            />
          </div>
          <div>
            <div className="font-medium text-xs sm:text-sm">{serie.title}</div>
            <div className="text-[10px] text-gray-400 mt-0.5 flex flex-wrap gap-1">
              {genreList.slice(0, 2).map(g => (
                <span key={g} className="px-1 bg-gray-700/60 rounded">{g}</span>
              ))}
              {genreList.length > 2 && <span>…</span>}
            </div>
          </div>
        </div>
      </td>
      <td className="py-2 text-center hidden xs:table-cell">{serie.start_year ?? "-"}</td>
      <td className="py-2 text-center hidden md:table-cell">{serie.end_year ?? "-"}</td>
      <td className="py-2 text-center hidden sm:table-cell">
        <span className="inline-block bg-purple-600/20 text-purple-400 px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-semibold">
          {seasonCount ?? "-"}
        </span>
      </td>
      <td className="py-2 text-center hidden md:table-cell">{serie.creator ?? "-"}</td>
      <td className="py-2 text-center hidden lg:table-cell">
        {genreList.join(", ") || "-"}
      </td>
      <td className="py-2 text-center hidden sm:table-cell">
        {serie.vote_average
          ? <span className="text-xs">{Number(serie.vote_average).toFixed(1)}</span>
          : <span className="text-gray-500">-</span>
        }
      </td>
      <td className="py-2 text-center hidden sm:table-cell">
        <StatusBadge published={!!serie.published} />
      </td>
      <td className="py-2 text-center hidden md:table-cell">
        <VipBadge isvip={!!serie.isvip} />
      </td>
      <td className="py-2 text-right">
        <div className="flex flex-col sm:flex-row justify-end items-center gap-1 sm:space-x-2 relative">
          <button
            type="button"
            aria-label={`Aperçu de la série "${serie.title}"`}
            className="bg-gray-700 text-white px-2 rounded mb-1 sm:mb-0"
            onClick={() => onAction && onAction("preview", serie)}
          >
            👁️
          </button>
          <button
            type="button"
            aria-label={`Afficher saisons et épisodes pour "${serie.title}"`}
            className="bg-gray-700 text-white px-2 rounded mb-1 sm:mb-0"
            onClick={() => {
              console.log("[SeriesRow] CLICK expand", serie.id);
              if (onAction) {
                onAction("expand", serie);
              } else {
                console.warn("[SeriesRow] onAction prop is missing");
              }
            }}
          >
            📚
          </button>
          <button
            type="button"
            aria-label={`Ouvrir le menu d'actions pour "${serie.title}" (éditer, supprimer, gérer les saisons)`}
            className="bg-gray-700 text-white px-2 rounded"
            onClick={() => setMenuOpen(o => !o)}
            tabIndex={0}
          >
            ⋮
          </button>
          {menuOpen && (
            <div ref={menuRef} className="absolute right-0 mt-2 z-20">
              <SeriesActionMenu
                onEdit={() => { setMenuOpen(false); onAction && onAction("edit", serie); }}
                onDelete={() => { setMenuOpen(false); onAction && onAction("delete", serie); }}
                onSeasons={() => {
                  setMenuOpen(false);
                  router.push(`/admin/series/${serie.id}`);
                }}
                serieTitle={serie.title}
              />
            </div>
          )}
        </div>
      </td>
    </tr>
  );
}