import React, { useState, useRef, useEffect } from "react";
import StatusBadge from "./StatusBadge";
import VipBadge from "./VipBadge";
import SeriesActionMenu from "./SeriesActionMenu";

export default function SeriesRow({
  serie,
  selected,
  onSelect,
  onAction,
  seasonCount,
  genres,
}) {
  const posterUrl = serie.poster || '/placeholder-backdrop.jpg';
  const genreList = Array.isArray(serie.genres)
    ? serie.genres
    : (typeof serie.genre === "string"
        ? serie.genre.split(',').map(g => g.trim())
        : []);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // Ferme le menu contextuel si clic en dehors
  useEffect(() => {
    if (!menuOpen) return;
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

  return (
    <tr className="border-b border-gray-700 group hover:bg-gray-700/10 transition">
      <td className="py-4 px-2 align-middle">
        <button
          type="button"
          aria-label={selected ? "Désélectionner" : "Sélectionner"}
          onClick={() => onSelect(serie.id)}
          className="bg-transparent border-none focus:outline-none"
        >
          {selected ? "☑️" : "⬜"}
        </button>
      </td>
      <td className="py-4 min-w-[210px]">
        <div className="flex items-center">
          <div className="h-10 w-10 overflow-hidden rounded mr-3 flex-shrink-0 border border-gray-600 bg-gray-800">
            <img
              src={posterUrl}
              alt={serie.title}
              className="h-full w-full object-cover"
              onError={e => { (e.target as HTMLImageElement).src = '/placeholder-backdrop.jpg'; }}
            />
          </div>
          <div>
            <div className="font-medium">{serie.title}</div>
            <div className="text-xs text-gray-400 mt-0.5 flex flex-wrap gap-1">
              {genreList.slice(0, 2).map(g => (
                <span key={g} className="px-1 bg-gray-700/60 rounded">{g}</span>
              ))}
              {genreList.length > 2 && <span>…</span>}
            </div>
          </div>
        </div>
      </td>
      <td className="py-4 text-center">{serie.start_year ?? "-"}</td>
      <td className="py-4 text-center">{serie.end_year ?? "-"}</td>
      <td className="py-4 text-center">
        <span className="inline-block bg-purple-600/20 text-purple-400 px-2 py-0.5 rounded-full text-xs font-semibold">
          {seasonCount ?? "-"}
        </span>
      </td>
      <td className="py-4 text-center">{serie.creator ?? "-"}</td>
      <td className="py-4 text-center">
        {genreList.join(", ") || "-"}
      </td>
      <td className="py-4 text-center">
        {serie.vote_average
          ? <span>{Number(serie.vote_average).toFixed(1)}</span>
          : <span className="text-gray-500">-</span>
        }
      </td>
      <td className="py-4 text-center">
        <StatusBadge published={!!serie.published} />
      </td>
      <td className="py-4 text-center">
        <VipBadge isvip={!!serie.isvip} />
      </td>
      <td className="py-4 text-right">
        <div className="flex justify-end items-center space-x-2 relative">
          <button
            type="button"
            aria-label={`Aperçu de la série "${serie.title}"`}
            className="bg-gray-700 text-white px-2 rounded"
            onClick={() => onAction && onAction("preview", serie)}
          >
            👁️
          </button>
          <button
            type="button"
            aria-label={`Afficher saisons et épisodes pour "${serie.title}"`}
            className="bg-gray-700 text-white px-2 rounded"
            onClick={() => onAction && onAction("expand", serie)}
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
                onSeasons={() => { setMenuOpen(false); onAction && onAction("seasons", serie); }}
                serieTitle={serie.title}
              />
            </div>
          )}
        </div>
      </td>
    </tr>
  );
}