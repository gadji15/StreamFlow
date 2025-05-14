import React from "react";
import { Eye, Layers, MoreHorizontal, CheckSquare, Square, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
// import StatusBadge from "./StatusBadge"; // À créer si besoin
// import VipBadge from "./VipBadge";       // À créer si besoin
// import SeriesActionMenu from "./SeriesActionMenu"; // À créer si besoin

export default function SeriesRow({
  serie,
  selected,
  onSelect,
  onAction,
  seasonCount,
  genres
}) {
  const posterUrl = serie.poster || '/placeholder-backdrop.jpg';
  const genreList = serie.genre ? serie.genre.split(',').map(g => g.trim()) : [];

  return (
    <tr className="border-b border-gray-700 group hover:bg-gray-700/10 transition">
      <td className="py-4 px-2 align-middle">
        <button
          type="button"
          aria-label={selected ? "Désélectionner" : "Sélectionner"}
          onClick={() => onSelect(serie.id)}
          className="bg-transparent border-none focus:outline-none"
        >
          {selected ? (
            <CheckSquare className="h-5 w-5 text-indigo-500" />
          ) : (
            <Square className="h-5 w-5 text-gray-400" />
          )}
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
      <td className="py-4 text-center">
        {serie.start_year ?? "-"}
        {(!serie.end_year || serie.end_year === 0) && (
          <span className="ml-2 inline-block bg-cyan-700/30 text-cyan-400 px-2 py-0.5 rounded-full text-xs font-semibold align-middle">En cours</span>
        )}
      </td>
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
        {serie.vote_average ? (
          <div className="flex items-center justify-center">
            <Star className="h-4 w-4 text-yellow-500 mr-1 fill-current" />
            <span>{Number(serie.vote_average).toFixed(1)}</span>
          </div>
        ) : (
          <span className="text-gray-500">-</span>
        )}
      </td>
      <td className="py-4 text-center">
        {/* <StatusBadge published={serie.published} /> */}
        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${serie.published ? "bg-green-500/20 text-green-500" : "bg-gray-500/20 text-gray-400"}`}>
          {serie.published ? 'Publiée' : 'Brouillon'}
        </span>
      </td>
      <td className="py-4 text-center">
        {/* <VipBadge isvip={serie.isvip} /> */}
        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${serie.isvip ? "bg-amber-500/20 text-amber-500" : "bg-gray-500/20 text-gray-400"}`}>
          {serie.isvip ? 'VIP' : 'Non'}
        </span>
      </td>
      <td className="py-4 text-right">
        <div className="flex justify-end items-center space-x-2">
          {/* Aperçu rapide */}
          <Button
            variant="outline"
            size="icon"
            aria-label="Aperçu"
            onClick={() => onAction && onAction("preview", serie)}
          >
            <Eye className="h-4 w-4" />
          </Button>
          {/* Arborescence Saisons/Episodes */}
          <Button
            variant="outline"
            size="icon"
            aria-label="Afficher saisons/épisodes"
            onClick={() => onAction && onAction("expand", serie)}
          >
            <Layers className="h-4 w-4" />
          </Button>
          {/* Menu hamburger actions */}
          <Button
            variant="ghost"
            size="icon"
            aria-label="Actions"
            onClick={() => onAction && onAction("menu", serie)}
          >
            <MoreHorizontal className="h-4 w-4" />
          </Button>
          {/* Ici tu pourras brancher SeriesActionMenu pour afficher les actions avancées */}
        </div>
      </td>
    </tr>
  );
}