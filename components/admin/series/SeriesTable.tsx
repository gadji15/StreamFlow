import React from "react";
import SeriesRow from "./SeriesRow";

interface SeriesTableProps {
  series: any[];
  selectedIds: (string | number)[];
  onSelect: (id: string | number) => void;
  onSelectAll: () => void;
  allSelected: boolean;
  onAction: (action: string, serie: any) => void;
  page: number;
  totalPages: number;
  setPage: (p: number) => void;
  loading: boolean;
  seasonCounts?: { [seriesId: string]: number };
  genres: string[];
  deletingId?: string | null;
  bulkDeleting?: boolean;
}

export default function SeriesTable({
  series,
  selectedIds,
  onSelect,
  onSelectAll,
  allSelected,
  onAction,
  page,
  totalPages,
  setPage,
  loading,
  seasonCounts = {},
  genres = [],
  deletingId,
  bulkDeleting,
}: SeriesTableProps) {
  // Mobile "card" view for <sm screens
  return (
    <>
      {/* Table for tablet and desktop */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full text-left min-w-[520px]">
          <thead>
            <tr className="border-b border-gray-700">
              <th className="pb-3 font-medium w-5">
                <button
                  type="button"
                  aria-label="Tout sélectionner"
                  onClick={onSelectAll}
                  className="bg-transparent border-none focus:outline-none"
                >
                  {allSelected ? (
                    <span className="inline-block w-4 h-4 bg-indigo-500 rounded" />
                  ) : (
                    <span className="inline-block w-4 h-4 bg-gray-400 rounded" />
                  )}
                </button>
              </th>
              <th className="pb-3 font-medium">Série</th>
              <th className="pb-3 font-medium text-center hidden xs:table-cell">Début</th>
              <th className="pb-3 font-medium text-center hidden md:table-cell">Fin</th>
              <th className="pb-3 font-medium text-center hidden sm:table-cell">Saisons</th>
              <th className="pb-3 font-medium text-center hidden md:table-cell">Créateur</th>
              <th className="pb-3 font-medium text-center hidden lg:table-cell">Genres</th>
              <th className="pb-3 font-medium text-center hidden sm:table-cell">Note</th>
              <th className="pb-3 font-medium text-center hidden sm:table-cell">Statut</th>
              <th className="pb-3 font-medium text-center hidden md:table-cell">VIP</th>
              <th className="pb-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {series.map(serie => (
              <SeriesRow
                key={serie.id}
                serie={serie}
                selected={selectedIds.includes(serie.id)}
                onSelect={onSelect}
                onAction={(action, serie) => {
                  if (onAction) onAction(action, serie);
                }}
                seasonCount={seasonCounts[serie.id]}
                genres={genres}
              />
            ))}
            {series.length === 0 && (
              <tr>
                <td colSpan={11} className="text-gray-500 text-center py-8">
                  Aucune série trouvée.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {/* Card list for mobile */}
      <div className="sm:hidden flex flex-col gap-3">
        {series.length === 0 ? (
          <div className="text-gray-500 text-center py-8">Aucune série trouvée.</div>
        ) : (
          series.map(serie => (
            <div key={serie.id} className="bg-gray-800 rounded-lg shadow border border-gray-700 flex flex-col p-2">
              <div className="flex items-center gap-2">
                <div className="h-10 w-10 rounded overflow-hidden border border-gray-600 flex-shrink-0 bg-gray-700">
                  <img
                    src={serie.poster || '/placeholder-backdrop.jpg'}
                    alt={serie.title}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-xs">{serie.title}</div>
                  <div className="text-[10px] text-gray-400 flex gap-1 flex-wrap mt-0.5">
                    {serie.genre && (
                      <span className="bg-gray-700/60 px-1 rounded">{(serie.genre || "").split(',')[0]}</span>
                    )}
                    {serie.start_year && (
                      <span className="">{serie.start_year}</span>
                    )}
                    {seasonCounts[serie.id] && (
                      <span className="">{seasonCounts[serie.id]} saisons</span>
                    )}
                  </div>
                </div>
                <button
                  type="button"
                  aria-label={selectedIds.includes(serie.id) ? "Désélectionner" : "Sélectionner"}
                  onClick={() => onSelect(serie.id)}
                  className="ml-2 bg-gray-700 text-white rounded px-2 h-7 flex items-center"
                  style={{ fontSize: 14 }}
                >
                  {selectedIds.includes(serie.id) ? "☑️" : "⬜"}
                </button>
              </div>
              <div className="flex gap-1 mt-1">
                <button
                  type="button"
                  aria-label="Supprimer"
                  className="flex-1 bg-red-700 hover:bg-red-800 text-white rounded px-1 py-1 text-xs"
                  onClick={() => onAction && onAction("delete", serie)}
                >
                  🗑️
                </button>
                <button
                  type="button"
                  aria-label="Saisons"
                  className="flex-1 bg-purple-700 hover:bg-purple-800 text-white rounded px-1 py-1 text-xs"
                  onClick={() => onAction && onAction("expand", serie)}
                >
                  📚
                </button>
                <button
                  type="button"
                  aria-label="Actions"
                  className="flex-1 bg-gray-700 hover:bg-gray-800 text-white rounded px-1 py-1 text-xs"
                  onClick={() => onAction && onAction("edit", serie)}
                >
                  ✏️
                </button>
              </div>
            </div>
          ))
        )}
      </div>
      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-wrap justify-center items-center gap-2 mt-6">
          <button
            className="px-2 py-1 rounded bg-gray-700 text-white"
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1 || loading}
            aria-label="Page précédente"
          >
            &larr;
          </button>
          <span className="text-xs text-gray-400 mx-2">
            Page {page} sur {totalPages}
          </span>
          <button
            className="px-2 py-1 rounded bg-gray-700 text-white"
            onClick={() => setPage(Math.min(totalPages, page + 1))}
            disabled={page === totalPages || loading}
            aria-label="Page suivante"
          >
            &rarr;
          </button>
        </div>
      )}
    </>
  );
}