"use client";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Clapperboard as SeriesIcon, Plus, RefreshCw, ListTree } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabaseClient";
import { useToast } from "@/components/ui/use-toast";
import SeriesTable from "@/components/admin/series/SeriesTable";
import SeriesModal from "@/components/admin/series/SeriesModal";
import SeriesHierarchyTree from "@/components/admin/series/SeriesHierarchyTree";
import SeasonModal from "@/components/admin/series/SeasonModal";
import EpisodeModal from "@/components/admin/series/EpisodeModal";

import { useRouter } from "next/navigation";

interface SeasonFormValues {
  id?: string;
  season_number?: number | string | null;
  tmdb_id?: number | string | null;
  episode_count?: number | string | null;
  [key: string]: any; // for other dynamic fields, add specifics as needed
}

export default function AdminSeriesPage() {
  const router = useRouter();
  // --- State principal
  const [series, setSeries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [genres, setGenres] = useState<string[]>([]);
  const [seasonCounts, setSeasonCounts] = useState<{ [seriesId: string]: number }>({});

  // Pagination & sélection
  const [page, setPage] = useState(1);
  const pageSize = 20;
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [allSelected, setAllSelected] = useState(false);

  // Loader suppression
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [bulkDeleting, setBulkDeleting] = useState(false);

  // Filtres/recherche
  const [searchTerm, setSearchTerm] = useState('');
  const [advancedSearch, setAdvancedSearch] = useState({ title: '', creator: '', year: '', tmdb: '' });
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [genreFilter, setGenreFilter] = useState<string>('all');

  // Modals
  const [modal, setModal] = useState<{ open: boolean, type: string, parentId?: string, payload?: any }>({ open: false, type: "" });
  const [seriesModal, setSeriesModal] = useState<{ open: boolean, serie?: any }>({ open: false });

  // Affichage
  const [showTree, setShowTree] = useState(false);

  const { toast } = useToast();

  // --- Chargement genres pour filtre
  useEffect(() => {
    async function fetchGenres() {
      const { data } = await supabase.from('genres').select('name');
      if (data) setGenres(data.map(g => g.name));
    }
    fetchGenres();
  }, []);

  // --- Chargement séries/filtres
  const fetchSeries = useCallback(async () => {
    setLoading(true);
    try {
      let query = supabase.from('series').select('*').order('created_at', { ascending: false }).limit(1000);
      if (statusFilter === 'published') query = query.eq('published', true);
      if (statusFilter === 'draft') query = query.eq('published', false);
      if (advancedSearch.title.trim()) query = query.ilike('title', `%${advancedSearch.title.trim()}%`);
      if (advancedSearch.creator.trim()) query = query.ilike('creator', `%${advancedSearch.creator.trim()}%`);
      if (advancedSearch.year.trim()) query = query.eq('start_year', Number(advancedSearch.year));
      if (advancedSearch.tmdb.trim()) query = query.eq('tmdb_id', Number(advancedSearch.tmdb));
      if (searchTerm && !advancedSearch.title && !advancedSearch.creator && !advancedSearch.year && !advancedSearch.tmdb)
        query = query.ilike('title', `%${searchTerm}%`);
      const { data, error } = await query;
      if (error) throw error;
      let filteredSeries: any[] = data || [];
      if (genreFilter !== 'all') {
        filteredSeries = filteredSeries.filter((serie: any) =>
          serie.genre?.split(',').map((g: string) => g.trim().toLowerCase()).includes(genreFilter.toLowerCase())
        );
      }
      setSeries(filteredSeries);

      // --- Charger le nombre de saisons par série
      if (filteredSeries.length > 0) {
        const seriesIds = filteredSeries.map((s) => s.id);
        // Récupérer les saisons groupées par série_id et compter
        const { data: seasonData, error: seasonError } = await supabase
          .from('seasons')
          .select('series_id, id');
        if (!seasonError && Array.isArray(seasonData)) {
          const counts: { [seriesId: string]: number } = {};
          for (const s of seriesIds) {
            counts[s] = seasonData.filter((seas) => seas.series_id === s).length;
          }
          setSeasonCounts(counts);
        }
      } else {
        setSeasonCounts({});
      }
    } catch (error: any) {
      toast({ title: 'Erreur', description: 'Impossible de charger la liste des séries.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [searchTerm, advancedSearch, statusFilter, genreFilter, toast]);

  useEffect(() => { fetchSeries(); }, [fetchSeries]);

  // Pagination
  const paginatedSeries = series.slice((page - 1) * pageSize, page * pageSize);
  const totalPages = Math.ceil(series.length / pageSize);

  // Sélection
  const handleSelect = (id: string | number) => {
    const idStr = String(id);
    setSelectedIds(ids => ids.includes(idStr) ? ids.filter(i => i !== idStr) : [...ids, idStr]);
  };
  const handleSelectAll = () => {
    if (allSelected) {
      setSelectedIds([]);
      setAllSelected(false);
      setSelectedIds(paginatedSeries.map(s => String(s.id)));
      setAllSelected(true);
      setAllSelected(true);
    }
  };

  // Action groupée
  const handleBulkDelete = async () => {
    if (!window.confirm(`Supprimer ${selectedIds.length} séries sélectionnées ?`)) return;
    setBulkDeleting(true);
    try {
      const { error } = await supabase.from("series").delete().in("id", selectedIds);
      if (error) throw error;
      toast({ title: "Séries supprimées" });
      setSelectedIds([]);
      setAllSelected(false);
      fetchSeries();
    } catch (e: any) {
      toast({ title: "Erreur", description: e.message || String(e), variant: "destructive" });
    } finally {
      setBulkDeleting(false);
    }
  };

  // --- Gestion modale d'ajout/édition série
  const handleSeriesModalSave = async (form: any) => {
    if (seriesModal.serie) {
      await supabase.from("series").update(form).eq("id", seriesModal.serie.id);
    } else {
      await supabase.from("series").insert([form]);
    }
    setSeriesModal({ open: false });
    fetchSeries();
  };

  // --- Rafraîchir la liste
  const handleRefresh = () => {
    setPage(1);
    setSearchTerm('');
    setStatusFilter('all');
    setGenreFilter('all');
    setAdvancedSearch({ title: '', creator: '', year: '', tmdb: '' });
    fetchSeries();
  };

  // --- Gestion arborescence (fetchSeasonsForSeries, fetchEpisodesForSeason, etc.)

  // State: Map seriesId -> array of seasons
  const [seriesSeasons, setSeriesSeasons] = useState<{ [seriesId: string]: any[] }>({});
  // State: Map seasonId -> array of episodes
  const [seasonEpisodes, setSeasonEpisodes] = useState<{ [seasonId: string]: any[] }>({});
  // State: Loading indicator for episodes fetch
  const [seasonEpisodesLoading, setSeasonEpisodesLoading] = useState<{ [seasonId: string]: boolean }>({});

  // Fetch seasons for a particular series
  const fetchSeasonsForSeries = useCallback(async (seriesId: string) => {
    try {
      const { data, error } = await supabase
        .from('seasons')
        .select('*')
        .eq('series_id', seriesId)
        .order('season_number', { ascending: true });
      if (error) throw error;
      setSeriesSeasons((prev) => ({
        ...prev,
        [seriesId]: data || [],
      }));
    } catch (error: any) {
      toast({ title: 'Erreur', description: 'Impossible de charger les saisons.', variant: 'destructive' });
    }
  }, [toast]);

  // Fetch episodes for a particular season
  const fetchEpisodesForSeason = useCallback(async (seasonId: string | number) => {
    const seasonIdStr = String(seasonId);
    setSeasonEpisodesLoading((prev) => ({ ...prev, [seasonIdStr]: true }));
    try {
      const { data, error } = await supabase
        .from('episodes')
        .select('*')
        .eq('season_id', seasonId)
        .order('episode_number', { ascending: true });
      if (error) throw error;
      setSeasonEpisodes((prev) => ({
        ...prev,
        [seasonIdStr]: data || [],
      }));
    } catch (error: any) {
      toast({ title: 'Erreur', description: 'Impossible de charger les épisodes.', variant: 'destructive' });
    } finally {
      setSeasonEpisodesLoading((prev) => ({ ...prev, [seasonIdStr]: false }));
    }
  }, [toast]);

  return (
    <div className="space-y-6">
      {/* Header + Boutons globaux */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-primary drop-shadow-sm flex items-center gap-3">
            <SeriesIcon className="h-8 w-8 text-indigo-400" />
            Gestion des Séries
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Visualisez, recherchez, gérez et structurez toutes vos séries et saisons.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            aria-label="Rafraîchir"
            title="Rafraîchir la liste"
            onClick={handleRefresh}
            className="hover:bg-indigo-50/10 border border-transparent hover:border-indigo-400 transition"
          >
            <RefreshCw className="h-5 w-5" />
          </Button>
          <Button
            variant={showTree ? "outline" : "ghost"}
            aria-label="Vue arborescente"
            title={showTree ? "Vue tableau" : "Vue arborescente"}
            onClick={() => setShowTree(v => !v)}
            className={showTree
              ? "border-indigo-400 bg-indigo-900/30 text-indigo-200"
              : "hover:bg-indigo-50/10 border border-transparent hover:border-indigo-400 transition"
            }
          >
            <ListTree className="h-5 w-5" />
          </Button>
          <Button
            onClick={() => setSeriesModal({ open: true })}
            aria-label="Ajouter une série"
            title="Ajouter une nouvelle série"
            className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold shadow-md hover:scale-105 transition-transform"
          >
            <Plus className="h-4 w-4 mr-2" />
            Ajouter une série
          </Button>
        </div>
      </div>

      {/* Filtres/recherche */}
      <div className="bg-gray-900/80 rounded-xl shadow-xl p-6 border border-gray-700">
        <div className="flex flex-col gap-4 sm:flex-row sm:gap-4 mb-6 w-full">
          <div className="relative flex-1 w-full">
            <Input
              type="search"
              placeholder="🔍 Recherche rapide (titre série)..."
              value={searchTerm}
              onChange={e => { setSearchTerm(e.target.value); setPage(1); }}
              className="pl-10 bg-gray-800 border-2 border-gray-700 focus:border-indigo-500 shadow w-full"
              aria-label="Recherche de série"
            />
            <span className="absolute left-3 top-2.5 text-gray-400 pointer-events-none">
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="8" cy="8" r="7" /><path d="m16 16-3.5-3.5" /></svg>
            </span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            className="sm:ml-2 border-indigo-400 text-indigo-300 hover:bg-indigo-900/20 w-full sm:w-auto"
            aria-label="Réinitialiser les filtres"
            title="Réinitialiser les filtres"
          >
            Réinitialiser
          </Button>
        </div>
        <div className="flex flex-col gap-4 sm:flex-row sm:gap-4 mb-4 w-full">
          <select
            value={genreFilter}
            onChange={e => { setGenreFilter(e.target.value); setPage(1); }}
            className="bg-gray-800 border border-indigo-400 rounded-md px-3 py-2 text-sm text-indigo-200 w-full sm:w-auto"
            aria-label="Filtrer par genre"
          >
            <option value="all">Tous les genres</option>
            {genres.map(g => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
            className="bg-gray-800 border border-indigo-400 rounded-md px-3 py-2 text-sm text-indigo-200 w-full sm:w-auto"
            aria-label="Filtrer par statut"
          >
            <option value="all">Tous les statuts</option>
            <option value="published">Publiées</option>
            <option value="draft">Brouillons</option>
          </select>
        </div>

        {/* Bulk actions */}
        {selectedIds.length > 0 && (
          <div className="mb-4 flex items-center gap-3 bg-red-900/30 border border-red-500 rounded-lg px-4 py-2 animate-pulse">
            <span className="font-semibold text-red-300">
              {selectedIds.length} série{selectedIds.length > 1 ? "s" : ""} sélectionnée{selectedIds.length > 1 ? "s" : ""}
            </span>
            <Button
              onClick={handleBulkDelete}
              variant="destructive"
              aria-label="Supprimer la sélection"
              title="Supprimer toutes les séries sélectionnées"
              className="ml-auto"
            >
              Supprimer la sélection
            </Button>
          </div>
        )}

        {/* Vue listing ou arborescence */}
        {loading ? (
          <div className="py-24 flex flex-col items-center justify-center">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-400 border-t-transparent mb-6"></div>
            <span className="text-indigo-300 font-medium">Chargement des séries…</span>
          </div>
        ) : series.length === 0 ? (
          <div className="text-center py-16 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-xl shadow-lg border-2 border-dashed border-indigo-400">
            <SeriesIcon className="h-16 w-16 mx-auto mb-6 text-indigo-500/60 drop-shadow" />
            <h2 className="text-2xl font-bold mb-2 text-indigo-200">Aucune série trouvée</h2>
            <p className="text-gray-400 mb-8">
              {searchTerm
                ? `Aucune série ne correspond à votre recherche « ${searchTerm} »`
                : statusFilter !== 'all'
                  ? `Aucune série avec le statut « ${statusFilter === 'published' ? 'Publiée' : 'Brouillon'} »`
                  : "Commencez par ajouter votre première série pour enrichir votre catalogue."
              }
            </p>
            <Button 
              onClick={() => setSeriesModal({ open: true })}
              className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold shadow-md hover:scale-105 transition-transform"
            >
              <Plus className="h-4 w-4 mr-2" />
              Ajouter une série
            </Button>
          </div>
        ) : showTree ? (
          <SeriesHierarchyTree
            series={paginatedSeries}
            seriesSeasons={seriesSeasons}
            fetchSeasonsForSeries={fetchSeasonsForSeries}
            fetchEpisodesForSeason={fetchEpisodesForSeason}
            seasonEpisodes={seasonEpisodes}
            seasonEpisodesLoading={seasonEpisodesLoading}
            setModal={setModal}
          />
        ) : (
          <SeriesTable
            series={paginatedSeries}
            selectedIds={selectedIds}
            onSelect={handleSelect}
            onSelectAll={handleSelectAll}
            allSelected={allSelected}
            onAction={async (action: string, serie: any) => {
              console.log("[AdminSeriesPage] ACTION:", action, serie && serie.id);
              if (action === "preview") {
                window.open(`/series/${serie.id}`, "_blank");
                return;
              }
              if (action === "expand" || action === "seasons") {
                const dest = `/admin/series/${serie.id}`;
                console.log("[AdminSeriesPage] NAVIGATION:", dest);
                try {
                  router.push(dest);
                } catch (e) {
                  console.error("[AdminSeriesPage] router.push error:", e);
                }
                return;
              }
              if (action === "edit") setSeriesModal({ open: true, serie });
              if (action === "delete") {
                if (window.confirm(`Supprimer la série "${serie.title}" ?`)) {
                  setDeletingId(serie.id);
                  try {
                    const { error } = await supabase.from("series").delete().eq("id", serie.id);
                    if (error) throw error;
                    toast({ title: "Série supprimée" });
                    fetchSeries();
                  } catch (e: any) {
                    toast({ title: "Erreur", description: e.message || String(e), variant: "destructive" });
                  } finally {
                    setDeletingId(null);
                  }
                }
              }
            }}
            page={page}
            totalPages={totalPages}
            setPage={setPage}
            loading={loading}
            seasonCounts={seasonCounts}
            genres={genres}
            deletingId={deletingId}
            bulkDeleting={bulkDeleting}
          />
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-8">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="hover:bg-indigo-900/20"
              aria-label="Page précédente"
            >
              &larr;
            </Button>
            <span className="text-xs px-4 py-1 rounded bg-gray-800 text-indigo-300 border border-gray-700 shadow">
              Page {page} sur {totalPages}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="hover:bg-indigo-900/20"
              aria-label="Page suivante"
            >
              &rarr;
            </Button>
          </div>
        )}
      </div>

      {/* Modals series CRUD */}
      <SeriesModal
        open={seriesModal.open}
        onClose={() => setSeriesModal({ open: false })}
        onSave={handleSeriesModalSave}
        initialData={seriesModal.serie}
        tmdbSearch={async (query: string) => {
          if (!query) return null;
          // Si query est numérique, on tente par ID, sinon par recherche texte
          if (/^\d+$/.test(query.trim())) {
            // Recherche par ID
            const res = await fetch(`/api/tmdb/tv/${encodeURIComponent(query.trim())}`);
            if (!res.ok) return null;
            const data = await res.json();
            return {
              title: data.name,
              poster: data.poster_path ? `https://image.tmdb.org/t/p/w500${data.poster_path}` : "",
              start_year: data.first_air_date ? data.first_air_date.slice(0, 4) : "",
              end_year: data.last_air_date ? data.last_air_date.slice(0, 4) : "",
              genres: data.genres ? data.genres.map((g: { name: string }) => g.name) : [],
              tmdb_id: data.id,
            };
          } else {
            // Recherche par titre
            const res = await fetch(`/api/tmdb/tv-search?query=${encodeURIComponent(query.trim())}`);
            if (!res.ok) return null;
            const data = await res.json();
            if (data.results && data.results.length > 0) {
              const serie = data.results[0];
              return {
                title: serie.name,
                poster: serie.poster_path ? `https://image.tmdb.org/t/p/w500${serie.poster_path}` : "",
                start_year: serie.first_air_date ? serie.first_air_date.slice(0, 4) : "",
                end_year: serie.last_air_date ? serie.last_air_date.slice(0, 4) : "",
                genres: serie.genre_ids || [],
                tmdb_id: serie.id,
              };
            }
            return null;
          }
        }}
      />

      {/* Modals saisons/épisodes */}
      <SeasonModal
        open={modal.open && modal.type === "edit-season"}
        onClose={() => setModal({ open: false, type: "" })}
        onSave={async (values: SeasonFormValues) => {
          // Correction : typage strict et nettoyage pour l'édition
          const season_number = values.season_number ? Number(values.season_number) : null;
          const series_id = modal.parentId;
          if (!series_id || !season_number) {
            alert("Erreur : series_id ou season_number manquant !");
            return;
          }
          const updateObj = {
            ...values,
            series_id,
            season_number,
            tmdb_id: values.tmdb_id ? Number(values.tmdb_id) : null,
            episode_count: values.episode_count ? Number(values.episode_count) : null,
          };
          Object.keys(updateObj).forEach(k => {
            const obj = updateObj as Record<string, any>;
            if (obj[k] === "" || obj[k] === undefined) obj[k] = null;
          });
          console.log('Payload envoyé à Supabase (update):', updateObj);
          const { error } = await supabase.from("seasons").update(updateObj).eq("id", values.id);
          if (error) {
            console.error("Erreur Supabase:", error);
            alert("SUPABASE ERROR : " + JSON.stringify(error));
          } else {
            // Rafraîchir ici la hiérarchie/arborescence si nécessaire
            if (series_id) {
              await fetchSeasonsForSeries(series_id);
            }
          }
        }}
        initialData={modal.payload}
        seriesId={modal.parentId}
      />
      <SeasonModal
        open={modal.open && modal.type === "add-season"}
        onClose={() => setModal({ open: false, type: "" })}
        onSave={async (values: SeasonFormValues) => {
          // Correction : typage strict et nettoyage pour l'ajout
          const season_number = values.season_number ? Number(values.season_number) : null;
          const series_id = modal.parentId;
          if (!series_id || !season_number) {
            alert("Erreur : series_id ou season_number manquant !");
            return;
          }
          const insertObj = {
            ...values,
            series_id,
            season_number,
            tmdb_id: values.tmdb_id ? Number(values.tmdb_id) : null,
            episode_count: values.episode_count ? Number(values.episode_count) : null,
          };
          Object.keys(insertObj).forEach(k => {
            const obj = insertObj as Record<string, any>;
            if (obj[k] === "" || obj[k] === undefined) obj[k] = null;
          });
          console.log('Payload envoyé à Supabase (insert):', insertObj);
          const { error } = await supabase.from("seasons").insert([insertObj]);
          if (error) {
            console.error("Erreur Supabase:", error);
            alert("SUPABASE ERROR : " + JSON.stringify(error));
          } else {
            // Rafraîchir ici la hiérarchie/arborescence si nécessaire
            if (series_id) {
              await fetchSeasonsForSeries(series_id);
            }
          }
        }}
        seriesId={modal.parentId}
      />
      <EpisodeModal
        open={modal.open && modal.type === "edit-episode"}
        onClose={() => setModal({ open: false, type: "" })}
        onSave={async (values: any) => {
          await supabase.from("episodes").update(values).eq("id", values.id);
          if (modal.parentId) {/* refresh episodes */}
        }}
        initialData={modal.payload}
        seasonId={modal.parentId}
      />
      <EpisodeModal
        open={modal.open && modal.type === "add-episode"}
        onClose={() => setModal({ open: false, type: "" })}
        onSave={async (values: any) => {
          // S'assurer que series_id est injecté dans l'épisode ajouté
          const series_id = modal.payload && modal.payload.seriesId
            ? modal.payload.seriesId
            : (modal.parentId || null);

          if (!series_id) {
            alert("Erreur : series_id manquant pour l'ajout d'un épisode !");
            return;
          }
          await supabase.from("episodes").insert([{ ...values, series_id }]);
          if (modal.parentId) {/* refresh episodes */}
        }}
        initialData={undefined}
        seasonId={modal.parentId}
      />
    </div>
  );
}