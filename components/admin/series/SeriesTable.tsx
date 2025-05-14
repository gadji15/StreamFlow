import React from "react";
import SeriesRow from "./SeriesRow";
import { Button } from "@/components/ui/button";
import { CheckSquare, Square } from "lucide-react";

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
  seasonCounts,
  genres,
  loading
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
                  <CheckSquare className="h-5 w-5 text-indigo-500" />
                ) : (
                  <Square className="h-5 w-5 text-gray-400" />
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
              onAction={onAction}
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
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1 || loading}
            aria-label="Page précédente"
          >
            &larr;
          </Button>
          <span className="text-xs text-gray-400 mx-2">
            Page {page} sur {totalPages}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages || loading}
            aria-label="Page suivante"
          >
            &rarr;
          </Button>
        </div>
      )}
    </div>
  );
}