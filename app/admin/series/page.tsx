'use client';

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ListVideo, // Remplace "Series" par une icône existante pour illustrer une série/playlist
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
  const router = useRouter(); // <-- S'assurer qu'on a UNE SEULE déclaration ici, et accessible partout
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

  const { toast } = useToast();

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
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="search"
              placeholder="Recherche rapide (titre série)..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
              className="pl-10"
              aria-label="Recherche de série"
            />
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              setAdvancedSearch({
                title: '',
                creator: '',
                year: '',
                tmdb: '',
              })
            }
            className="hidden sm:block"
          >
            Réinitialiser
          </Button>
        </div>
        {/* Formulaire recherche avancée */}
        <form
          className="grid grid-cols-1 sm:grid-cols-4 gap-2 mb-4"
          onSubmit={e => { e.preventDefault(); setPage(1); }}
        >
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
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-sm"
            aria-label="Filtrer par statut"
          >
            <option value="all">Tous les statuts</option>
            <option value="published">Publiées</option>
            <option value="draft">Brouillons</option>
          </select>
        </div>
        {loading ? (
          <div className="py-12 flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        ) : series.length === 0 ? (
          <div className="text-center py-12 bg-gray-800 rounded-lg">
            <Series className="h-12 w-12 mx-auto mb-4 text-gray-600" />
            <h2 className="text-xl font-semibold mb-2">Aucune série trouvée</h2>
            <p className="text-gray-400 mb-6">
              {searchTerm 
                ? `Aucune série ne correspond à votre recherche "${searchTerm}"`
                : statusFilter !== 'all'
                  ? `Aucune série avec le statut "${statusFilter === 'published' ? 'Publiée' : 'Brouillon'}"`
                  : "Commencez par ajouter votre première série"
              }
            </p>
            <Link href="/admin/series/add">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Ajouter une série
              </Button>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="pb-3 font-medium w-5">
                    <button
                      type="button"
                      aria-label="Tout sélectionner"
                      onClick={toggleSelectAll}
                      className="bg-transparent border-none focus:outline-none"
                    >
                      {allSelected(paginatedSeries) ? (
                        <CheckSquare className="h-5 w-5 text-indigo-500" />
                      ) : (
                        <Square className="h-5 w-5 text-gray-400" />
                      )}
                    </button>
                  </th>
                  <th
                    className="pb-3 font-medium cursor-pointer select-none"
                    onClick={() => {
                      setSortField('title');
                      setSortOrder(o => (sortField === 'title' && o === 'asc') ? 'desc' : 'asc');
                    }}
                  >
                    Série {sortField === 'title' && (sortOrder === 'asc' ? '▲' : '▼')}
                  </th>
                  <th className="pb-3 font-medium text-center">Début</th>
                  <th className="pb-3 font-medium text-center">Fin</th>
                  <th className="pb-3 font-medium text-center">Saisons</th>
                  <th className="pb-3 font-medium text-center">Créateur</th>
                  <th
                    className="pb-3 font-medium text-center cursor-pointer select-none"
                    onClick={() => {
                      setSortField('vote_average');
                      setSortOrder(o => (sortField === 'vote_average' && o === 'asc') ? 'desc' : 'asc');
                    }}
                  >
                    Note {sortField === 'vote_average' && (sortOrder === 'asc' ? '▲' : '▼')}
                  </th>
                  <th className="pb-3 font-medium text-center">Statut</th>
                  <th className="pb-3 font-medium text-center">VIP</th>
                  <th className="pb-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedSeries.map((serie) => {
                  const posterUrl = serie.poster || '/placeholder-backdrop.jpg';
                  const genres = serie.genre ? serie.genre.split(',').map(g => g.trim()) : [];
                  return (
                  <tr key={serie.id} className="border-b border-gray-700 group hover:bg-gray-700/10 transition">
                    <td className="py-4 px-2 align-middle">
                      <button
                        type="button"
                        aria-label={isChecked(serie.id) ? "Désélectionner" : "Sélectionner"}
                        onClick={() => toggleSelect(serie.id)}
                        className="bg-transparent border-none focus:outline-none"
                      >
                        {isChecked(serie.id) ? (
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
                            {genres.slice(0, 2).map(g => (
                              <span key={g} className="px-1 bg-gray-700/60 rounded">{g}</span>
                            ))}
                            {genres.length > 2 && <span>…</span>}
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
                        {seasonCounts[serie.id] ?? "-"}
                      </span>
                    </td>
                    <td className="py-4 text-center">{serie.creator ?? "-"}</td>
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
                      <Button
                        type="button"
                        variant={serie.published ? "success" : "ghost"}
                        aria-label={serie.published ? "Dépublier" : "Publier"}
                        className={cn(
                          "px-2 py-1 rounded-full text-xs font-semibold",
                          serie.published
                            ? "bg-green-500/20 text-green-500"
                            : "bg-gray-500/20 text-gray-400"
                        )}
                        onClick={() => handleTogglePublished(serie.id, !!serie.published)}
                      >
                        {serie.published ? 'Publiée' : 'Brouillon'}
                      </Button>
                    </td>
                    <td className="py-4 text-center">
                      <span className={cn(
                        "px-2 py-1 rounded-full text-xs font-semibold",
                        serie.isvip
                          ? "bg-amber-500/20 text-amber-500"
                          : "bg-gray-500/20 text-gray-400"
                      )}>
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
                          onClick={() => setSelectedSeries(serie)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {/* Accès rapide aux saisons */}
                        <Button
                          variant="outline"
                          size="icon"
                          aria-label="Gérer les saisons"
                          asChild
                        >
                          <Link href={`/admin/series/${serie.id}/seasons`}>
                            <Layers className="h-4 w-4" />
                          </Link>
                        </Button>
                        {/* Menu hamburger actions */}
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label="Actions"
                          onClick={() => setActionMenuSeries(serie)}
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                        {/* Menu modal d'actions amélioré */}
                        <Dialog open={actionMenuSeries?.id === serie.id} onOpenChange={open => { if (!open) setActionMenuSeries(null); }}>
                          <DialogContent
                            className="max-w-xs p-0 bg-gray-900/90 backdrop-blur-lg rounded-2xl shadow-xl border-0"
                            style={{
                              minWidth: 0,
                              width: "94vw",
                              maxWidth: "340px",
                              backgroundColor: "rgba(17,24,39,0.95)",
                              boxShadow: "0 6px 32px 0 rgb(0 0 0 / 0.22)"
                            }}
                          >
                            {/* Aperçu série */}
                            <div className="flex items-center gap-3 px-4 pt-4 pb-2 border-b border-gray-800">
                              <div className="h-16 w-11 flex-shrink-0 rounded-md overflow-hidden border border-gray-700 bg-gray-800 shadow-inner">
                                <img
                                  src={serie.poster || '/placeholder-backdrop.jpg'}
                                  alt={serie.title}
                                  className="w-full h-full object-cover"
                                  style={{ background: "#222" }}
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="font-semibold truncate">{serie.title}</div>
                                <div className="text-xs text-gray-400 truncate">
                                  {serie.start_year ?? "-"} {serie.end_year ? "— "+serie.end_year : ""} &middot; {(serie.genre || '').split(',').map(g => g.trim()).filter(Boolean).slice(0,2).join(', ')}{serie.genre && serie.genre.split(',').length > 2 ? '…' : ''}
                                </div>
                                <div className="flex gap-1 mt-1">
                                  {serie.published
                                    ? <span className="bg-green-600/20 text-green-400 px-2 py-0.5 rounded-full text-xs font-semibold">Publiée</span>
                                    : <span className="bg-gray-500/20 text-gray-400 px-2 py-0.5 rounded-full text-xs font-semibold">Brouillon</span>
                                  }
                                  {serie.isvip &&
                                    <span className="bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full text-xs font-semibold">VIP</span>
                                  }
                                </div>
                              </div>
                            </div>
                            <div className="flex flex-col gap-2 px-4 py-4">
                              <Button asChild variant="outline" className="justify-start bg-white/5 hover:bg-indigo-500/80 hover:text-white transition duration-150">
                                <Link href={`/series/${serie.id}`} target="_blank">
                                  <Eye className="h-4 w-4 mr-2" />
                                  Voir la fiche publique
                                </Link>
                              </Button>
                              <Button
                                variant="outline"
                                className="justify-start bg-white/5 hover:bg-indigo-500/80 hover:text-white transition duration-150"
                                onClick={() => {
                                  setActionMenuSeries(null);
                                  router.push(`/admin/series/${serie.id}/edit`);
                                }}
                              >
                                <Edit className="h-4 w-4 mr-2" />
                                Modifier
                              </Button>
                              <Button
                                variant="outline"
                                className="justify-start bg-white/5 hover:bg-indigo-500/70 hover:text-white transition duration-150"
                                onClick={() => {
                                  setActionMenuSeries(null);
                                  router.push(`/admin/series/${serie.id}/seasons`);
                                }}
                              >
                                <Layers className="h-4 w-4 mr-2" />
                                Gérer les saisons
                              </Button>
                              <Button
                                variant="destructive"
                                className="justify-start bg-white/5 hover:bg-red-600/80 hover:text-white transition duration-150"
                                onClick={() => {
                                  setActionMenuSeries(null);
                                  openDeleteDialog(serie);
                                }}
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Supprimer
                              </Button>
                            </div>
                            <DialogFooter className="px-4 pb-3 pt-0">
                              <Button variant="outline" size="sm" onClick={() => setActionMenuSeries(null)} className="w-full mt-2 bg-white/10 hover:bg-white/20 transition">
                                Annuler
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </td>
                  </tr>
                )})}
              </tbody>
            </table>
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
