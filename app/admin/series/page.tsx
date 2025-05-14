'use client';

import { useState, useEffect } from 'react';
import SeriesHierarchyTree from '@/components/admin/series/SeriesHierarchyTree';
import SeasonModal from '@/components/admin/series/SeasonModal';
import EpisodeModal from '@/components/admin/series/EpisodeModal';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Series,
  Edit,
  Trash2,
  Plus,
  Search,
  Eye,
  Star,
  MoreHorizontal,
  RefreshCw,
  CheckSquare,
  Square,
  Layers,
  User,
  Calendar,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabaseClient';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

type SeriesDB = {
  id: string;
  title: string;
  original_title?: string | null;
  description?: string | null;
  poster: string | null;
  backdrop: string | null;
  language?: string | null;
  genre: string | null;
  popularity?: number | null;
  vote_average?: number | null;
  vote_count?: number | null;
  isvip?: boolean | null;
  tmdb_id?: number | null;
  imdb_id?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  cast?: any;
  homepage_categories?: string[] | null;
  trailer_url?: string | null;
  creator?: string | null;
  start_year?: number | null;
  end_year?: number | null;
  published: boolean;
  duration?: number | null;
  video_url?: string | null;
};

export default function AdminSeriesPage() {
  const [series, setSeries] = useState<SeriesDB[]>([]);
  const [loading, setLoading] = useState(true);

  // Recherche avancée
  const [searchTerm, setSearchTerm] = useState('');
  const [advancedSearch, setAdvancedSearch] = useState({
    title: '',
    creator: '',
    year: '',
    tmdb: '',
  });

  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [genreFilter, setGenreFilter] = useState<string>('all');
  const [genres, setGenres] = useState<string[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const [seriesToDelete, setSeriesToDelete] = useState<SeriesDB | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [actionMenuSeries, setActionMenuSeries] = useState<SeriesDB | null>(null);
  const [selectedSeries, setSelectedSeries] = useState<SeriesDB | null>(null); // Pour aperçu rapide
  const [page, setPage] = useState(1);
  const pageSize = 20;
  // Ajout pour le nombre de saisons par série
  const [seasonCounts, setSeasonCounts] = useState<{ [seriesId: string]: number }>({});

  // Tri dynamique
  const [sortField, setSortField] = useState('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Sélection groupée
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const allSelected = paginatedSeries => paginatedSeries.every(s => selectedIds.includes(s.id));

  // --- NOUVEAU: Gestion arborescente séries > saisons > épisodes ---
  const [expandedSeries, setExpandedSeries] = useState<string | null>(null);
  const [expandedSeason, setExpandedSeason] = useState<string | null>(null);
  // Pour chaque série, on stocke ses saisons et un loading state
  const [seriesSeasons, setSeriesSeasons] = useState<{[seriesId: string]: any[]}>({});
  const [seriesSeasonsLoading, setSeriesSeasonsLoading] = useState<{[seriesId: string]: boolean}>({});
  // Pour chaque saison, on stocke ses épisodes et un loading state
  const [seasonEpisodes, setSeasonEpisodes] = useState<{[seasonId: string]: any[]}>({});
  const [seasonEpisodesLoading, setSeasonEpisodesLoading] = useState<{[seasonId: string]: boolean}>({});
  
  // Gestion des modals pour CRUD
  const [modal, setModal] = useState<{open: boolean, type: string, parentId?: string, payload?: any}>({open: false, type: ""});
  const { toast } = useToast();

  // --- Charger saisons pour une série ---
  const fetchSeasonsForSeries = async (seriesId: string) => {
    setSeriesSeasonsLoading(old => ({...old, [seriesId]: true}));
    const { data, error } = await supabase
      .from('seasons')
      .select('*')
      .eq('series_id', seriesId)
      .order('season_number', {ascending: true});
    if (!error && data) {
      setSeriesSeasons(old => ({...old, [seriesId]: data}));
    } else {
      setSeriesSeasons(old => ({...old, [seriesId]: []}));
    }
    setSeriesSeasonsLoading(old => ({...old, [seriesId]: false}));
  };

  // --- Charger épisodes pour une saison ---
  const fetchEpisodesForSeason = async (seasonId: string) => {
    setSeasonEpisodesLoading(old => ({...old, [seasonId]: true}));
    const { data, error } = await supabase
      .from('episodes')
      .select('*')
      .eq('season_id', seasonId)
      .order('episode_number', {ascending: true});
    if (!error && data) {
      setSeasonEpisodes(old => ({...old, [seasonId]: data}));
    } else {
      setSeasonEpisodes(old => ({...old, [seasonId]: []}));
    }
    setSeasonEpisodesLoading(old => ({...old, [seasonId]: false}));
  };

  // Charger genres pour filtre (au montage)
  useEffect(() => {
    async function fetchGenres() {
      const { data, error } = await supabase.from('genres').select('name');
      if (data) setGenres(data.map(g => g.name));
    }
    fetchGenres();
  }, []);

  // Charger les séries avec tri dynamique
  useEffect(() => {
    const loadSeries = async () => {
      setLoading(true);
      try {
        let query = supabase.from('series').select('*').limit(1000);

        // Tri dynamique
        query = query.order(sortField, { ascending: sortOrder === 'asc' });

        if (statusFilter === 'published') query = query.eq('published', true);
        if (statusFilter === 'draft') query = query.eq('published', false);

        // Recherche avancée multi-champ
        if (advancedSearch.title.trim()) query = query.ilike('title', `%${advancedSearch.title.trim()}%`);
        if (advancedSearch.creator.trim()) query = query.ilike('creator', `%${advancedSearch.creator.trim()}%`);
        if (advancedSearch.year.trim()) query = query.eq('start_year', Number(advancedSearch.year));
        if (advancedSearch.tmdb.trim()) query = query.eq('tmdb_id', Number(advancedSearch.tmdb));
        // Recherche simple (fallback)
        if (searchTerm && !advancedSearch.title && !advancedSearch.creator && !advancedSearch.year && !advancedSearch.tmdb)
          query = query.ilike('title', `%${searchTerm}%`);

        const { data, error } = await query;
        if (error) throw error;

        let filteredSeries: SeriesDB[] = data || [];

        // Filtrer par genre (front car genre est une chaîne)
        if (genreFilter !== 'all') {
          filteredSeries = filteredSeries.filter((serie: SeriesDB) =>
            serie.genre?.split(',').map(g => g.trim().toLowerCase()).includes(genreFilter.toLowerCase())
          );
        }

        setSeries(filteredSeries);

        // Charger le nombre de saisons pour chaque série
        if (filteredSeries.length > 0) {
          const serieIds = filteredSeries.map(s => s.id);
          // On fait une requête groupée pour compter les saisons par serie_id
          const { data: seasonData, error: seasonError } = await supabase
            .from('seasons')
            .select('series_id, count:id')
            .in('series_id', serieIds)
            .group('series_id');
          if (!seasonError && Array.isArray(seasonData)) {
            const counts: { [seriesId: string]: number } = {};
            for (const row of seasonData) {
              counts[row.series_id] = Number(row.count) || 0;
            }
            setSeasonCounts(counts);
          } else {
            setSeasonCounts({});
          }
        } else {
          setSeasonCounts({});
        }

      } catch (error) {
        toast({
          title: 'Erreur',
          description: 'Impossible de charger la liste des séries.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    loadSeries();
  }, [searchTerm, advancedSearch, statusFilter, genreFilter, sortField, sortOrder, toast]);

  // Pagination
  const paginatedSeries = series.slice((page-1)*pageSize, page*pageSize);
  const totalPages = Math.ceil(series.length / pageSize);

  // Sélection groupée
  const isChecked = (id: string) => selectedIds.includes(id);
  const toggleSelect = (id: string) => setSelectedIds(ids => isChecked(id) ? ids.filter(_id => _id !== id) : [...ids, id]);
  const toggleSelectAll = () => {
    const ids = paginatedSeries.map(s => s.id);
    if (allSelected(paginatedSeries)) {
      setSelectedIds(selectedIds.filter(id => !ids.includes(id)));
    } else {
      setSelectedIds([...selectedIds, ...ids.filter(id => !selectedIds.includes(id))]);
    }
  };

  // Suppression
  const handleDeleteSeries = async () => {
    if (!seriesToDelete) return;
    setIsDeleting(true);
    try {
      const { error } = await supabase.from('series').delete().eq('id', seriesToDelete.id);
      if (error) throw error;
      setSeries(series.filter(s => s.id !== seriesToDelete.id));
      toast({
        title: 'Série supprimée',
        description: `La série "${seriesToDelete.title}" a été supprimée.`,
      });
      setDeleteDialogOpen(false);
      setSeriesToDelete(null);
      setSelectedIds(selectedIds.filter(id => id !== seriesToDelete.id));
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible de supprimer la série.',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  // Suppression groupée
  const handleDeleteSelected = async () => {
    if (selectedIds.length === 0) return;
    setIsDeleting(true);
    try {
      const { error } = await supabase.from('series').delete().in('id', selectedIds);
      if (error) throw error;
      setSeries(series.filter(s => !selectedIds.includes(s.id)));
      toast({
        title: 'Séries supprimées',
        description: `${selectedIds.length} série(s) ont été supprimées.`,
      });
      setSelectedIds([]);
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible de supprimer les séries sélectionnées.',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  // Publication rapide (toggle)
  const handleTogglePublished = async (id: string, currentValue: boolean) => {
    try {
      const { error } = await supabase.from('series').update({ published: !currentValue }).eq('id', id);
      if (error) throw error;
      setSeries(series.map(s =>
        s.id === id ? { ...s, published: !currentValue } : s
      ));
      toast({
        title: !currentValue ? 'Série publiée' : 'Série dépubliée',
        description: `La série a été mise à jour.`,
      });
    } catch (error) {
      toast({
        title: 'Erreur',
        description: "Impossible de mettre à jour le statut de la série.",
        variant: 'destructive',
      });
    }
  };

  // Publication groupée
  const handleBulkPublish = async (value: boolean) => {
    if (selectedIds.length === 0) return;
    try {
      const { error } = await supabase.from('series').update({ published: value }).in('id', selectedIds);
      if (error) throw error;
      setSeries(series.map(s =>
        selectedIds.includes(s.id) ? { ...s, published: value } : s
      ));
      toast({
        title: value ? 'Séries publiées' : 'Séries dépubliées',
        description: `${selectedIds.length} série(s) mises à jour.`,
      });
    } catch (error) {
      toast({
        title: 'Erreur',
        description: "Impossible de mettre à jour le statut des séries sélectionnées.",
        variant: 'destructive',
      });
    }
  };

  // Ouvrir le dialogue de confirmation de suppression
  const openDeleteDialog = (serie: SeriesDB) => {
    setSeriesToDelete(serie);
    setDeleteDialogOpen(true);
  };

  // Rafraîchir la liste
  const handleRefresh = () => {
    setPage(1);
    setSearchTerm('');
    setStatusFilter('all');
    setGenreFilter('all');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold">Séries</h1>
        <div className="flex gap-2">
          <Button variant="ghost" aria-label="Rafraîchir" onClick={handleRefresh}>
            <RefreshCw className="h-5 w-5" />
          </Button>
          {/* Export CSV */}
          <Button
            variant="outline"
            size="sm"
            aria-label="Exporter CSV"
            onClick={() => {
              // Génération CSV à partir des séries filtrées
              const csvRows = [
                [
                  'Titre',
                  'Année début',
                  'Année fin',
                  'Nb saisons',
                  'Genres',
                  'Statut',
                  'VIP',
                  'Créateur',
                  'TMDB ID',
                  'Publié le',
                  'MAJ le'
                ].join(';')
              ];
              for (const s of series) {
                csvRows.push([
                  `"${s.title.replace(/"/g, '""')}"`,
                  s.start_year ?? '',
                  s.end_year ?? '',
                  seasonCounts[s.id] ?? '',
                  (s.genre || '').replace(/;/g, '|'),
                  s.published ? 'Publiée' : 'Brouillon',
                  s.isvip ? 'Oui' : 'Non',
                  s.creator ?? '',
                  s.tmdb_id ?? '',
                  s.created_at ?? '',
                  s.updated_at ?? ''
                ].join(';'));
              }
              const csvContent = csvRows.join('\n');
              const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
              const url = URL.createObjectURL(blob);
              const link = document.createElement('a');
              link.href = url;
              link.setAttribute('download', 'series_export.csv');
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
              URL.revokeObjectURL(url);
            }}
          >
            Export CSV
          </Button>
          {/* Accès aux logs d'administration */}
          <Link href="/admin/activity-logs">
            <Button variant="outline" size="sm" aria-label="Logs admin">
              Voir les logs admin
            </Button>
          </Link>
          <Link href="/admin/series/add">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Ajouter une série
            </Button>
          </Link>
        </div>
      </div>
      <div className="bg-gray-800 rounded-lg p-6">
        {/* ...recherche/filtrage conservés... */}
        {loading ? (
          <div className="py-12 flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        ) : series.length === 0 ? (
          <div className="text-center py-12 bg-gray-800 rounded-lg">
            {/* ...pas de résultats... */}
          </div>
        ) : (
          <div>
            <SeriesHierarchyTree
              series={paginatedSeries}
              seriesSeasons={seriesSeasons}
              fetchSeasonsForSeries={fetchSeasonsForSeries}
              fetchEpisodesForSeason={fetchEpisodesForSeason}
              seasonEpisodes={seasonEpisodes}
              seasonEpisodesLoading={seasonEpisodesLoading}
            />
          </div>
        )}
      </div>
                            >
                              + Ajouter une saison
                            </Button>
                          </div>
                          {seriesSeasonsLoading[serie.id] ? (
                            <div className="py-4 flex justify-center">
                              <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-indigo-500"></div>
                            </div>
                          ) : (
                            <table className="w-full text-xs bg-gray-800 rounded"
                              role="table"
                              aria-label="Liste des saisons"
                            >
                              <thead>
                                <tr>
                                  <th className="py-2" scope="col">#</th>
                                  <th className="py-2" scope="col">Titre</th>
                                  <th className="py-2" scope="col">Date</th>
                                  <th className="py-2" scope="col">Épisodes</th>
                                  <th className="py-2" scope="col">Actions</th>
                                </tr>
                              </thead>
                              <tbody>
                                {(seriesSeasons[serie.id] || []).map(season => {
                                  // Inline editing state for this season
                                  const [edit, setEdit] = useState<{[key: string]: any}>({});
                                  const [loadingEdit, setLoadingEdit] = useState(false);

                                  const startEdit = (field: string) => setEdit(e => ({...e, [field]: true}));
                                  const stopEdit = (field: string) => setEdit(e => ({...e, [field]: false}));

                                  // Save inline edit
                                  const saveEdit = async (field: string, value: any) => {
                                    setLoadingEdit(true);
                                    const patch: any = {};
                                    patch[field] = value;
                                    const { error } = await supabase.from("seasons").update(patch).eq('id', season.id);
                                    if (!error) {
                                      toast({ title: "Saison mise à jour" });
                                      // Rafraîchir les saisons du parent
                                      fetchSeasonsForSeries(serie.id);
                                    } else {
                                      toast({ title: "Erreur", description: error.message, variant: "destructive" });
                                    }
                                    setLoadingEdit(false);
                                    stopEdit(field);
                                  };

                                  return (
                                  <>
                                    <tr key={season.id} className="hover:bg-gray-900 transition">
                                      <td className="py-2">
                                        <InlineEdit
                                          value={season.season_number}
                                          type="number"
                                          min={1}
                                          onSave={async (newValue) => {
                                            if (newValue === season.season_number) return false;
                                            const { error } = await supabase.from("seasons")
                                              .update({ season_number: newValue })
                                              .eq('id', season.id);
                                            if (!error) {
                                              toast({ title: "Numéro de saison mis à jour" });
                                              fetchSeasonsForSeries(serie.id);
                                            } else {
                                              toast({ title: "Erreur", description: error.message, variant: "destructive" });
                                              return false;
                                            }
                                          }}
                                        />
                                      </td>
                                      <td className="py-2">
                                        <InlineEdit
                                          value={season.title || ""}
                                          onSave={async (newValue) => {
                                            if (newValue === (season.title || "")) return false;
                                            const { error } = await supabase.from("seasons")
                                              .update({ title: newValue })
                                              .eq('id', season.id);
                                            if (!error) {
                                              toast({ title: "Titre de saison mis à jour" });
                                              fetchSeasonsForSeries(serie.id);
                                            } else {
                                              toast({ title: "Erreur", description: error.message, variant: "destructive" });
                                              return false;
                                            }
                                          }}
                                        />
                                      </td>
                                      <td className="py-2">{season.air_date}</td>
                                      <td className="py-2">
                                        <span className="bg-purple-600/20 text-purple-400 px-2 py-0.5 rounded-full text-xs font-semibold">
                                          {season.episode_count ?? "-"}
                                        </span>
                                      </td>
                                      <td className="py-2 flex flex-wrap gap-1">
                                        <Button
                                          size="xs"
                                          variant={expandedSeason === season.id ? "success" : "outline"}
                                          onClick={() => {
                                            if (expandedSeason === season.id) {
                                              setExpandedSeason(null);
                                            } else {
                                              setExpandedSeason(season.id);
                                              fetchEpisodesForSeason(season.id);
                                            }
                                          }}
                                        >
                                          Episodes
                                        </Button>
                                        <Button
                                          size="xs"
                                          variant="outline"
                                          className="ml-1"
                                          onClick={() => setModal({open: true, type: "edit-season", parentId: serie.id, payload: season})}
                                        >
                                          Modifier
                                        </Button>
                                        <Button
                                          size="xs"
                                          variant="destructive"
                                          className="ml-1"
                                          onClick={async () => {
                                            if (window.confirm("Supprimer définitivement cette saison ?")) {
                                              await supabase.from('seasons').delete().eq('id', season.id);
                                              fetchSeasonsForSeries(serie.id);
                                              toast({title: "Saison supprimée"});
                                            }
                                          }}
                                        >
                                          Supprimer
                                        </Button>
                                        <Button
                                          size="xs"
                                          variant="outline"
                                          className="ml-1"
                                          onClick={() => setModal({open: true, type: "add-episode", parentId: season.id, payload: {
                                            tmdbSeriesId: season.tmdb_series_id,
                                            seasonNumber: season.season_number
                                          }})}
                                        >
                                          + Épisode
                                        </Button>
                                        {/* Import massif TMDB */}
                                        {season.tmdb_series_id && season.season_number && (
                                          <Button
                                            size="xs"
                                            variant="success"
                                            className="ml-1"
                                            onClick={async () => {
                                              if (!window.confirm("Importer tous les épisodes de cette saison via TMDB ?")) return;
                                              const res = await fetch(
                                                `/api/tmdb/season/${encodeURIComponent(season.tmdb_series_id)}/${encodeURIComponent(season.season_number)}`
                                              );
                                              if (!res.ok) {
                                                toast({title: "Erreur TMDB", description: "Impossible de récupérer les épisodes.", variant: "destructive"});
                                                return;
                                              }
                                              const data = await res.json();
                                              if (!data.episodes || !Array.isArray(data.episodes)) {
                                                toast({title: "Erreur TMDB", description: "Aucun épisode trouvé pour cette saison.", variant: "destructive"});
                                                return;
                                              }
                                              const { data: existingEpisodes } = await supabase
                                                .from('episodes')
                                                .select('episode_number')
                                                .eq('season_id', season.id);
                                              const existingNumbers = (existingEpisodes || []).map(e => e.episode_number);
                                              const episodesToInsert = data.episodes.filter((ep: any) => !existingNumbers.includes(ep.episode_number))
                                                .map((ep: any) => ({
                                                  season_id: season.id,
                                                  episode_number: ep.episode_number,
                                                  title: ep.name,
                                                  description: ep.overview ?? "",
                                                  duration: ep.runtime ?? null,
                                                  tmdb_id: ep.id,
                                                  air_date: ep.air_date ?? null,
                                                  thumbnail_url: ep.still_path ? `https://image.tmdb.org/t/p/w500${ep.still_path}` : null,
                                                  is_vip: false,
                                                  published: false,
                                                }));
                                              if (episodesToInsert.length === 0) {
                                                toast({title: "Aucun épisode ajouté", description: "Tous les épisodes existent déjà.", variant: "destructive"});
                                                return;
                                              }
                                              const { error } = await supabase.from("episodes").insert(episodesToInsert);
                                              if (error) {
                                                toast({title: "Erreur import", description: error.message, variant: "destructive"});
                                              } else {
                                                toast({title: "Import réussi", description: `${episodesToInsert.length} épisodes ajoutés.`});
                                                fetchEpisodesForSeason(season.id);
                                              }
                                            }}
                                          >
                                            Importer tous les épisodes TMDB
                                          </Button>
                                        )}
                                      </td>
                                    </tr>
                                    {/* --- EPISODES: Accordéon --- */}
                                  </>
                                  );
                                })}
                                    {expandedSeason === season.id && (
                                      <tr>
                                        <td colSpan={5} className="bg-gray-950 border-t border-b border-gray-800 px-2 py-2">
                                          {seasonEpisodesLoading[season.id] ? (
                                            <div className="py-3 flex justify-center">
                                              <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-indigo-500"></div>
                                            </div>
                                          ) : (
                                            <table className="w-full text-xs bg-gray-950 rounded"
                                              role="table"
                                              aria-label="Liste des épisodes"
                                            >
                                              <thead>
                                                <tr>
                                                  <th className="py-1" scope="col">Numéro</th>
                                                  <th className="py-1" scope="col">Titre</th>
                                                  <th className="py-1" scope="col">Durée</th>
                                                  <th className="py-1" scope="col">Statut</th>
                                                  <th className="py-1" scope="col">VIP</th>
                                                  <th className="py-1" scope="col">Actions</th>
                                                </tr>
                                              </thead>
                                              <tbody>
                                                {/* DRAG & DROP REORDER for episodes */}
                                                {(() => {
                                                  // Simple implementation using HTML5 drag events
                                                  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
                                                  const episodes = seasonEpisodes[season.id] || [];
                                                  const moveEpisode = async (fromIdx: number, toIdx: number) => {
                                                    if (fromIdx === toIdx) return;
                                                    const reordered = [...episodes];
                                                    const [removed] = reordered.splice(fromIdx, 1);
                                                    reordered.splice(toIdx, 0, removed);
                                                    // Update order field in DB (assume field: "order")
                                                    await Promise.all(reordered.map((ep, idx) =>
                                                      supabase.from("episodes").update({ order: idx }).eq('id', ep.id)
                                                    ));
                                                    fetchEpisodesForSeason(season.id);
                                                    toast({ title: "Ordre des épisodes mis à jour" });
                                                  };
                                                  return episodes.map((episode, idx) => (
                                                    <tr
                                                      key={episode.id}
                                                      className={`hover:bg-gray-900 ${draggedIndex === idx ? "bg-indigo-900/20" : ""}`}
                                                      draggable
                                                      onDragStart={() => setDraggedIndex(idx)}
                                                      onDragOver={e => { e.preventDefault(); }}
                                                      onDrop={() => {
                                                        if (draggedIndex !== null && draggedIndex !== idx) {
                                                          moveEpisode(draggedIndex, idx);
                                                        }
                                                        setDraggedIndex(null);
                                                      }}
                                                      onDragEnd={() => setDraggedIndex(null)}
                                                      style={{ cursor: "grab" }}
                                                    >
                                                      {/* ... cells ... */}
                                                    <td className="py-1">
                                                      <InlineEdit
                                                        value={episode.episode_number}
                                                        type="number"
                                                        min={1}
                                                        onSave={async (newValue) => {
                                                          if (newValue === episode.episode_number) return false;
                                                          const { error } = await supabase.from("episodes")
                                                            .update({ episode_number: newValue })
                                                            .eq('id', episode.id);
                                                          if (!error) {
                                                            toast({ title: "Numéro d'épisode mis à jour" });
                                                            fetchEpisodesForSeason(season.id);
                                                          } else {
                                                            toast({ title: "Erreur", description: error.message, variant: "destructive" });
                                                            return false;
                                                          }
                                                        }}
                                                      />
                                                    </td>
                                                    <td className="py-1">
                                                      <InlineEdit
                                                        value={episode.title || ""}
                                                        onSave={async (newValue) => {
                                                          if (newValue === (episode.title || "")) return false;
                                                          const { error } = await supabase.from("episodes")
                                                            .update({ title: newValue })
                                                            .eq('id', episode.id);
                                                          if (!error) {
                                                            toast({ title: "Titre d'épisode mis à jour" });
                                                            fetchEpisodesForSeason(season.id);
                                                          } else {
                                                            toast({ title: "Erreur", description: error.message, variant: "destructive" });
                                                            return false;
                                                          }
                                                        }}
                                                      />
                                                    </td>
                                                    <td className="py-1">
                                                      <InlineEdit
                                                        value={episode.duration ?? ""}
                                                        type="number"
                                                        min={0}
                                                        onSave={async (newValue) => {
                                                          if (newValue === episode.duration) return false;
                                                          const { error } = await supabase.from("episodes")
                                                            .update({ duration: newValue })
                                                            .eq('id', episode.id);
                                                          if (!error) {
                                                            toast({ title: "Durée mise à jour" });
                                                            fetchEpisodesForSeason(season.id);
                                                          } else {
                                                            toast({ title: "Erreur", description: error.message, variant: "destructive" });
                                                            return false;
                                                          }
                                                        }}
                                                      />
                                                      {episode.duration ? " min" : ""}
                                                    </td>
                                                    <td className="py-1">
                                                      {/* Toggle inline pour le statut publié */}
                                                      <button
                                                        aria-label={episode.published ? "Dépublier" : "Publier"}
                                                        className={`px-2 py-0.5 rounded-full text-xs font-semibold focus:outline-none focus:ring-2 ${episode.published ? "bg-green-500/20 text-green-500" : "bg-gray-500/20 text-gray-400"}`}
                                                        onClick={async () => {
                                                          const { error } = await supabase.from("episodes")
                                                            .update({ published: !episode.published })
                                                            .eq('id', episode.id);
                                                          if (!error) {
                                                            toast({ title: episode.published ? "Épisode dépublié" : "Épisode publié" });
                                                            fetchEpisodesForSeason(season.id);
                                                          } else {
                                                            toast({ title: "Erreur", description: error.message, variant: "destructive" });
                                                          }
                                                        }}
                                                        tabIndex={0}
                                                        style={{ minWidth: 70 }}
                                                      >
                                                        {episode.published ? "Publié" : "Brouillon"}
                                                      </button>
                                                    </td>
                                                    <td className="py-1">
                                                      {/* Toggle inline pour VIP */}
                                                      <button
                                                        aria-label={episode.is_vip ? "Retirer VIP" : "Activer VIP"}
                                                        className={`px-2 py-0.5 rounded-full text-xs font-semibold focus:outline-none focus:ring-2 ${episode.is_vip ? "bg-amber-500/20 text-amber-500" : "bg-gray-500/20 text-gray-400"}`}
                                                        onClick={async () => {
                                                          const { error } = await supabase.from("episodes")
                                                            .update({ is_vip: !episode.is_vip })
                                                            .eq('id', episode.id);
                                                          if (!error) {
                                                            toast({ title: episode.is_vip ? "Épisode retiré du VIP" : "Épisode VIP activé" });
                                                            fetchEpisodesForSeason(season.id);
                                                          } else {
                                                            toast({ title: "Erreur", description: error.message, variant: "destructive" });
                                                          }
                                                        }}
                                                        tabIndex={0}
                                                        style={{ minWidth: 50 }}
                                                      >
                                                        {episode.is_vip ? "VIP" : "Non"}
                                                      </button>
                                                    </td>
                                                    <td className="py-1">
                                                      <Button
                                                        size="xs"
                                                        variant="outline"
                                                        onClick={() => setModal({open: true, type: "edit-episode", parentId: season.id, payload: episode})}
                                                      >
                                                        Modifier
                                                      </Button>
                                                      <Button
                                                        size="xs"
                                                        variant="destructive"
                                                        className="ml-1"
                                                        onClick={async () => {
                                                          if (window.confirm("Supprimer définitivement cet épisode ?")) {
                                                            await supabase.from('episodes').delete().eq('id', episode.id);
                                                            fetchEpisodesForSeason(season.id);
                                                            toast({title: "Épisode supprimé"});
                                                          }
                                                        }}
                                                      >
                                                        Supprimer
                                                      </Button>
                                                    </td>
                                                  </tr>
                                                ))}
                                              </tbody>
                                            </table>
                                          )}
                                        </td>
                                      </tr>
                                    )}
                                  </>
                                ))}
                                {(seriesSeasons[serie.id] || []).length === 0 && (
                                  <tr>
                                    <td colSpan={5} className="text-gray-500 text-center py-2">Aucune saison enregistrée.</td>
                                  </tr>
                                )}
                              </tbody>
                            </table>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
            {/* Actions groupées */}
            {selectedIds.length > 0 && (
              <div className="flex flex-wrap gap-2 items-center my-2 p-2 bg-gray-900 border border-gray-700 rounded justify-center">
                <span className="text-xs text-gray-400">{selectedIds.length} sélectionnée(s)</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleBulkPublish(true)}
                  disabled={isDeleting}
                >
                  Publier
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleBulkPublish(false)}
                  disabled={isDeleting}
                >
                  Dépublier
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleDeleteSelected}
                  disabled={isDeleting}
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Supprimer
                </Button>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-6">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setPage(p => Math.max(1, p-1))}
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
                  onClick={() => setPage(p => Math.min(totalPages, p+1))}
                  disabled={page === totalPages}
                  aria-label="Page suivante"
                >
                  &rarr;
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
      {/* Aperçu rapide */}
      <Dialog open={!!selectedSeries} onOpenChange={open => { if (!open) setSelectedSeries(null); }}>
        <DialogContent className="max-w-lg bg-gray-900/95 backdrop-blur-lg rounded-2xl border-0 p-0">
          {selectedSeries && (
            <div className="p-5 space-y-4">
              <div className="flex gap-4">
                <div className="flex-shrink-0 h-32 w-24 rounded-lg overflow-hidden border bg-gray-800 shadow">
                  <img
                    src={selectedSeries.poster || '/placeholder-backdrop.jpg'}
                    alt={selectedSeries.title}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-2xl font-bold truncate">{selectedSeries.title}</div>
                  <div className="text-xs text-gray-400 mb-2">
                    {selectedSeries.start_year ?? "-"}
                    {(!selectedSeries.end_year || selectedSeries.end_year === 0) && (
                      <span className="ml-2 inline-block bg-cyan-700/30 text-cyan-400 px-2 py-0.5 rounded-full text-xs font-semibold align-middle">En cours</span>
                    )}
                    {selectedSeries.end_year ? ` — ${selectedSeries.end_year}` : ""}
                  </div>
                  <div className="flex gap-2 flex-wrap mb-1">
                    {(selectedSeries.genre || '').split(',').map(g =>
                      <span key={g} className="inline-block bg-purple-800/20 text-purple-200 px-2 py-0.5 rounded-full text-xs">{g.trim()}</span>
                    )}
                  </div>
                  <div className="flex gap-1 mt-1">
                    {selectedSeries.published
                      ? <span className="bg-green-600/20 text-green-400 px-2 py-0.5 rounded-full text-xs font-semibold">Publiée</span>
                      : <span className="bg-gray-500/20 text-gray-400 px-2 py-0.5 rounded-full text-xs font-semibold">Brouillon</span>
                    }
                    {selectedSeries.isvip &&
                      <span className="bg-amber-600/20 text-amber-300 px-2 py-0.5 rounded-full text-xs font-semibold">VIP</span>
                    }
                  </div>
                  <div className="mt-2 text-xs text-gray-400">
                    TMDB ID: <span className="text-gray-300">{selectedSeries.tmdb_id ?? '-'}</span>
                  </div>
                  <div className="mt-1 text-xs text-gray-400">
                    Créateur: <span className="text-gray-200">{selectedSeries.creator ?? '-'}</span>
                  </div>
                </div>
              </div>
              <div>
                <div className="font-semibold mb-1 text-sm text-gray-300">Description</div>
                <div className="text-sm text-gray-200 leading-relaxed max-h-40 overflow-y-auto">{selectedSeries.description || <span className="text-gray-600 italic">Aucune description.</span>}</div>
              </div>
              {/* Trailer et vidéo */}
              {(selectedSeries.trailer_url || selectedSeries.video_url) && (
                <div className="flex flex-col gap-2">
                  {selectedSeries.trailer_url && (
                    <div>
                      <div className="font-semibold text-xs text-gray-300">Bande-annonce :</div>
                      <a href={selectedSeries.trailer_url} target="_blank" rel="noopener" className="text-indigo-400 underline break-all">{selectedSeries.trailer_url}</a>
                    </div>
                  )}
                  {selectedSeries.video_url && (
                    <div>
                      <div className="font-semibold text-xs text-gray-300">Vidéo :</div>
                      <a href={selectedSeries.video_url} target="_blank" rel="noopener" className="text-indigo-400 underline break-all">{selectedSeries.video_url}</a>
                    </div>
                  )}
                </div>
              )}
              {/* Cast */}
              {selectedSeries.cast && Array.isArray(selectedSeries.cast) && selectedSeries.cast.length > 0 && (
                <div>
                  <div className="font-semibold text-sm text-gray-300 mb-1">Casting</div>
                  <div className="flex flex-wrap gap-2 text-xs">
                    {selectedSeries.cast.map((member: any, idx: number) => (
                      <span key={idx} className="bg-gray-700/60 text-gray-100 rounded px-2 py-0.5">
                        {member.name}{member.role ? ` (${member.role})` : ''}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {/* Backdrop */}
              {selectedSeries.backdrop && (
                <div className="mt-4">
                  <img
                    src={selectedSeries.backdrop}
                    alt="Backdrop"
                    className="w-full rounded-lg shadow border border-gray-800 object-cover"
                    style={{ maxHeight: 200 }}
                  />
                </div>
              )}
              <div className="flex justify-end mt-2">
                <Button variant="outline" onClick={() => setSelectedSeries(null)}>
                  Fermer
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      {/* Dialogue de confirmation de suppression */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmer la suppression</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer la série "{seriesToDelete?.title}" ? Cette action est irréversible.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={isDeleting}
            >
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteSeries}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                  Suppression...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Supprimer
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
