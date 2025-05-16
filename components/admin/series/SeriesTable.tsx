import React from "react";
import SeriesRow from "./SeriesRow";

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
  seasonCounts,
  genres,
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left">
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
            <th className="pb-3 font-medium text-center">Début</th>
            <th className="pb-3 font-medium text-center">Fin</th>
            <th className="pb-3 font-medium text-center">Saisons</th>
            <th className="pb-3 font-medium text-center">Créateur</th>
            <th className="pb-3 font-medium text-center">Genres</th>
            <th className="pb-3 font-medium text-center">Note</th>
            <th className="pb-3 font-medium text-center">Statut</th>
            <th className="pb-3 font-medium text-center">VIP</th>
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
                console.log("[SeriesTable] onAction", action, serie.id);
                if (onAction) onAction(action, serie);
                else console.warn("[SeriesTable] onAction prop is missing from parent");
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
      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-6">
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
    </div>
  );
}
