"use client";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Series as SeriesIcon, Plus, RefreshCw, ListTree } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabaseClient";
import { useToast } from "@/components/ui/use-toast";
import SeriesTable from "@/components/admin/series/SeriesTable";
import SeriesModal from "@/components/admin/series/SeriesModal";
import SeriesHierarchyTree from "@/components/admin/series/SeriesHierarchyTree";
import SeasonModal from "@/components/admin/series/SeasonModal";
import EpisodeModal from "@/components/admin/series/EpisodeModal";

export default function AdminSeriesPage() {
  // --- State principal
  const [series, setSeries] = useState([]);
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
          serie.genre?.split(',').map(g => g.trim().toLowerCase()).includes(genreFilter.toLowerCase())
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
  const handleSelect = (id: string) => {
    setSelectedIds(ids => ids.includes(id) ? ids.filter(i => i !== id) : [...ids, id]);
  };
  const handleSelectAll = () => {
    if (allSelected) {
      setSelectedIds([]);
      setAllSelected(false);
    } else {
      setSelectedIds(paginatedSeries.map(s => s.id));
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
  const fetchEpisodesForSeason = useCallback(async (seasonId: string) => {
    setSeasonEpisodesLoading((prev) => ({ ...prev, [seasonId]: true }));
    try {
      const { data, error } = await supabase
        .from('episodes')
        .select('*')
        .eq('season_id', seasonId)
        .order('episode_number', { ascending: true });
      if (error) throw error;
      setSeasonEpisodes((prev) => ({
        ...prev,
        [seasonId]: data || [],
      }));
    } catch (error: any) {
      toast({ title: 'Erreur', description: 'Impossible de charger les épisodes.', variant: 'destructive' });
    } finally {
      setSeasonEpisodesLoading((prev) => ({ ...prev, [seasonId]: false }));
    }
  }, [toast]);

  return (
    <div className="space-y-6">
      {/* Header + Boutons globaux */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold">Séries</h1>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            aria-label="Rafraîchir"
            title="Rafraîchir la liste"
            onClick={handleRefresh}
          >
            <RefreshCw className="h-5 w-5" />
          </Button>
          <Button
            variant={showTree ? "outline" : "ghost"}
            aria-label="Vue arborescente"
            title="Afficher la vue arborescente"
            onClick={() => setShowTree(v => !v)}
          >
            <ListTree className="h-5 w-5" />
          </Button>
          <Button
            onClick={() => setSeriesModal({ open: true })}
            aria-label="Ajouter une série"
            title="Ajouter une nouvelle série"
          >
            <Plus className="h-4 w-4 mr-2" />
            Ajouter une série
          </Button>
        </div>
      </div>

      {/* Filtres/recherche */}
      <div className="bg-gray-800 rounded-lg p-6">
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <Input
            type="search"
            placeholder="Recherche rapide (titre série)..."
            value={searchTerm}
            onChange={e => { setSearchTerm(e.target.value); setPage(1); }}
            className="pl-10"
            aria-label="Recherche de série"
          />
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            className="hidden sm:block"
            aria-label="Réinitialiser les filtres"
            title="Réinitialiser les filtres"
          >
            Réinitialiser
          </Button>
        </div>
        <form className="grid grid-cols-1 sm:grid-cols-4 gap-2 mb-4"
          onSubmit={e => { e.preventDefault(); setPage(1); }}>
          <Input
            type="text"
            placeholder="Titre..."
            value={advancedSearch.title}
            onChange={e => setAdvancedSearch(a => ({ ...a, title: e.target.value }))}
            className="w-full"
            aria-label="Recherche par titre"
          />
          <Input
            type="text"
            placeholder="Créateur..."
            value={advancedSearch.creator}
            onChange={e => setAdvancedSearch(a => ({ ...a, creator: e.target.value }))}
            className="w-full"
            aria-label="Recherche par créateur"
          />
          <Input
            type="number"
            placeholder="Année début..."
            value={advancedSearch.year}
            onChange={e => setAdvancedSearch(a => ({ ...a, year: e.target.value }))}
            className="w-full"
            aria-label="Recherche par année"
          />
          <Input
            type="number"
            placeholder="TMDB ID..."
            value={advancedSearch.tmdb}
            onChange={e => setAdvancedSearch(a => ({ ...a, tmdb: e.target.value }))}
            className="w-full"
            aria-label="Recherche par TMDB ID"
          />
        </form>
        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          <select
            value={genreFilter}
            onChange={e => { setGenreFilter(e.target.value); setPage(1); }}
            className="bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-sm"
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
            className="bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-sm"
            aria-label="Filtrer par statut"
          >
            <option value="all">Tous les statuts</option>
            <option value="published">Publiées</option>
            <option value="draft">Brouillons</option>
          </select>
        </div>

        {/* Bulk actions */}
        {selectedIds.length > 0 && (
          <div className="mb-4">
            <Button
              onClick={handleBulkDelete}
              variant="destructive"
              aria-label="Supprimer la sélection"
              title="Supprimer toutes les séries sélectionnées"
            >
              Supprimer la sélection ({selectedIds.length})
            </Button>
          </div>
        )}

        {/* Vue listing ou arborescence */}
        {loading ? (
          <div className="py-12 flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        ) : series.length === 0 ? (
          <div className="text-center py-12 bg-gray-800 rounded-lg">
            <SeriesIcon className="h-12 w-12 mx-auto mb-4 text-gray-600" />
            <h2 className="text-xl font-semibold mb-2">Aucune série trouvée</h2>
            <p className="text-gray-400 mb-6">
              {searchTerm
                ? `Aucune série ne correspond à votre recherche "${searchTerm}"`
                : statusFilter !== 'all'
                  ? `Aucune série avec le statut "${statusFilter === 'published' ? 'Publiée' : 'Brouillon'}"`
                  : "Commencez par ajouter votre première série"
              }
            </p>
            <Button onClick={() => setSeriesModal({ open: true })}>
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
            onAction={async (action, serie) => {
              // Aperçu (œil) : redirige vers la fiche publique ou admin de la série
              if (action === "preview") {
                window.open(`/series/${serie.id}`, "_blank");
                return;
              }
              // Arborescence (livres) : redirige vers la fiche admin série (liste saisons/épisodes)
              if (action === "expand" || action === "seasons") {
                window.location.href = `/admin/series/${serie.id}`;
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
          <div className="flex justify-center items-center gap-2 mt-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
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
              disabled={page === totalPages}
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
        tmdbSearch={async (query) => {
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
              genres: data.genres ? data.genres.map((g) => g.name) : [],
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
        onSave={async (values) => {
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
            if (updateObj[k] === "" || updateObj[k] === undefined) updateObj[k] = null;
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
        initial={modal.payload}
        seriesId={modal.parentId}
      />
      <SeasonModal
        open={modal.open && modal.type === "add-season"}
        onClose={() => setModal({ open: false, type: "" })}
        onSave={async (values) => {
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
            if (insertObj[k] === "" || insertObj[k] === undefined) insertObj[k] = null;
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
        onSubmit={async (values) => {
          await supabase.from("episodes").update(values).eq("id", values.id);
          if (modal.parentId) {/* refresh episodes */}
        }}
        initial={modal.payload}
        seasonId={modal.parentId}
      />
      <EpisodeModal
        open={modal.open && modal.type === "add-episode"}
        onClose={() => setModal({ open: false, type: "" })}
        onSubmit={async (values) => {
          // S'assurer que series_id est injecté dans l'épisode ajouté
          const series_id = modal.payload && modal.payload.seriesId
            ? modal.payload.seriesId
            : (modal.seriesId || null);

          if (!series_id) {
            alert("Erreur : series_id manquant pour l'ajout d'un épisode !");
            return;
          }
          await supabase.from("episodes").insert([{ ...values, series_id }]);
          if (modal.parentId) {/* refresh episodes */}
        }}
        seasonId={modal.parentId}
      />
    </div>
  );
}