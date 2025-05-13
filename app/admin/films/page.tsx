'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Film,
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

type MovieDB = {
  id: string;
  title: string;
  original_title?: string | null;
  year: number;
  poster: string | null;
  backdrop?: string | null;
  genre: string | null;
  vote_average?: number | null;
  vote_count?: number | null;
  views?: number | null;
  published?: boolean;
  isvip?: boolean;
  director?: string | null;
  duration?: number | null;
  tmdb_id?: number | null;
  imdb_id?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  description?: string | null;
  trailer_url?: string | null;
  video_url?: string | null;
};

export default function AdminFilmsPage() {
  const [movies, setMovies] = useState<MovieDB[]>([]);
  const [loading, setLoading] = useState(true);

  // Recherche avancée
  const [searchTerm, setSearchTerm] = useState('');
  const [advancedSearch, setAdvancedSearch] = useState({
    title: '',
    director: '',
    year: '',
    tmdb: '',
  });

  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [genreFilter, setGenreFilter] = useState<string>('all');
  const [genres, setGenres] = useState<string[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const [movieToDelete, setMovieToDelete] = useState<MovieDB | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [actionMenuMovie, setActionMenuMovie] = useState<MovieDB | null>(null);
  const [selectedMovie, setSelectedMovie] = useState<MovieDB | null>(null);
  const [page, setPage] = useState(1);
  const pageSize = 20;

  // Tri dynamique
  const [sortField, setSortField] = useState('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Sélection groupée
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const allSelected = (list: MovieDB[]) => list.length > 0 && list.every(m => selectedIds.includes(m.id));

  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    async function fetchGenres() {
      const { data } = await supabase.from('genres').select('name');
      if (data) setGenres(data.map(g => g.name));
    }
    fetchGenres();
  }, []);

  useEffect(() => {
    const loadMovies = async () => {
      setLoading(true);
      try {
        let query = supabase.from('films').select('*').limit(1000);
        query = query.order(sortField, { ascending: sortOrder === 'asc' });

        if (statusFilter === 'published') query = query.eq('published', true);
        if (statusFilter === 'draft') query = query.eq('published', false);

        if (advancedSearch.title.trim())
          query = query.ilike('title', `%${advancedSearch.title.trim()}%`);
        if (advancedSearch.director.trim())
          query = query.ilike('director', `%${advancedSearch.director.trim()}%`);
        if (advancedSearch.year.trim())
          query = query.eq('year', Number(advancedSearch.year));
        if (advancedSearch.tmdb.trim())
          query = query.eq('tmdb_id', Number(advancedSearch.tmdb));
        if (
          searchTerm &&
          !advancedSearch.title &&
          !advancedSearch.director &&
          !advancedSearch.year &&
          !advancedSearch.tmdb
        )
          query = query.ilike('title', `%${searchTerm}%`);

        const { data, error } = await query;
        if (error) throw error;

        let filteredMovies: MovieDB[] = data || [];
        if (genreFilter !== 'all') {
          filteredMovies = filteredMovies.filter((movie: MovieDB) =>
            movie.genre?.split(',').map(g => g.trim().toLowerCase()).includes(genreFilter.toLowerCase())
          );
        }
        setMovies(filteredMovies);
      } catch (error) {
        toast({
          title: 'Erreur',
          description: 'Impossible de charger la liste des films.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };
    loadMovies();
  }, [searchTerm, advancedSearch, statusFilter, genreFilter, sortField, sortOrder, toast]);

  const paginatedMovies = movies.slice((page - 1) * pageSize, page * pageSize);
  const totalPages = Math.ceil(movies.length / pageSize);

  // Sélection groupée
  const isChecked = (id: string) => selectedIds.includes(id);
  const toggleSelect = (id: string) =>
    setSelectedIds(ids => isChecked(id) ? ids.filter(_id => _id !== id) : [...ids, id]);
  const toggleSelectAll = () => {
    const ids = paginatedMovies.map(m => m.id);
    if (allSelected(paginatedMovies)) {
      setSelectedIds(selectedIds.filter(id => !ids.includes(id)));
    } else {
      setSelectedIds([...selectedIds, ...ids.filter(id => !selectedIds.includes(id))]);
    }
  };

  // Suppression
  const handleDeleteMovie = async () => {
    if (!movieToDelete) return;
    setIsDeleting(true);
    try {
      const { error } = await supabase.from('films').delete().eq('id', movieToDelete.id);
      if (error) throw error;
      setMovies(movies.filter(movie => movie.id !== movieToDelete.id));
      toast({
        title: 'Film supprimé',
        description: `Le film "${movieToDelete.title}" a été supprimé.`,
      });
      setDeleteDialogOpen(false);
      setMovieToDelete(null);
      setSelectedIds(selectedIds.filter(id => id !== movieToDelete.id));
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible de supprimer le film.',
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
      const { error } = await supabase.from('films').delete().in('id', selectedIds);
      if (error) throw error;
      setMovies(movies.filter(movie => !selectedIds.includes(movie.id)));
      toast({
        title: 'Films supprimés',
        description: `${selectedIds.length} film(s) ont été supprimés.`,
      });
      setSelectedIds([]);
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible de supprimer les films sélectionnés.',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  // Publication rapide (toggle)
  const handleTogglePublished = async (id: string, currentValue: boolean) => {
    try {
      const { error } = await supabase.from('films').update({ published: !currentValue }).eq('id', id);
      if (error) throw error;
      setMovies(movies.map(movie =>
        movie.id === id ? { ...movie, published: !currentValue } : movie
      ));
      toast({
        title: !currentValue ? 'Film publié' : 'Film dépublié',
        description: `Le film a été mis à jour.`,
      });
    } catch (error) {
      toast({
        title: 'Erreur',
        description: "Impossible de mettre à jour le statut du film.",
        variant: 'destructive',
      });
    }
  };

  // Publication groupée
  const handleBulkPublish = async (value: boolean) => {
    if (selectedIds.length === 0) return;
    setIsDeleting(true);
    try {
      const { error } = await supabase.from('films').update({ published: value }).in('id', selectedIds);
      if (error) throw error;
      setMovies(movies.map(movie =>
        selectedIds.includes(movie.id) ? { ...movie, published: value } : movie
      ));
      toast({
        title: value ? 'Films publiés' : 'Films dépubliés',
        description: `${selectedIds.length} film(s) mis à jour.`,
      });
      setSelectedIds([]);
    } catch (error) {
      toast({
        title: 'Erreur',
        description: "Impossible de mettre à jour le statut des films sélectionnés.",
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const openDeleteDialog = (movie: MovieDB) => {
    setMovieToDelete(movie);
    setDeleteDialogOpen(true);
  };

  const handleRefresh = () => {
    setPage(1);
    setSearchTerm('');
    setStatusFilter('all');
    setGenreFilter('all');
    setAdvancedSearch({ title: '', director: '', year: '', tmdb: '' });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold">Films</h1>
        <div className="flex gap-2">
          <Button variant="ghost" aria-label="Rafraîchir" onClick={handleRefresh}>
            <RefreshCw className="h-5 w-5" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            aria-label="Exporter CSV"
            onClick={() => {
              const csvRows = [
                [
                  'Titre',
                  'Année',
                  'Genres',
                  'Réalisateur',
                  'Durée',
                  'Note',
                  'Votes',
                  'Statut',
                  'VIP',
                  'TMDB ID',
                  'Publié le',
                  'MAJ le'
                ].join(';')
              ];
              for (const m of movies) {
                csvRows.push([
                  `"${m.title.replace(/"/g, '""')}"`,
                  m.year ?? '',
                  (m.genre || '').replace(/;/g, '|'),
                  m.director ?? '',
                  m.duration ?? '',
                  m.vote_average ?? '',
                  m.vote_count ?? '',
                  m.published ? 'Publié' : 'Brouillon',
                  m.isvip ? 'Oui' : 'Non',
                  m.tmdb_id ?? '',
                  m.created_at ?? '',
                  m.updated_at ?? ''
                ].join(';'));
              }
              const csvContent = csvRows.join('\n');
              const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
              const url = URL.createObjectURL(blob);
              const link = document.createElement('a');
              link.href = url;
              link.setAttribute('download', 'films_export.csv');
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
              URL.revokeObjectURL(url);
            }}
          >
            Export CSV
          </Button>
          <Link href="/admin/films/add">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Ajouter un film
            </Button>
          </Link>
        </div>
      </div>
      <div className="bg-gray-800 rounded-lg p-6">
        {/* Recherche rapide et avancée */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="search"
              placeholder="Recherche rapide (titre film)..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
              className="pl-10"
              aria-label="Recherche de film"
            />
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleRefresh()}
            className="hidden sm:block"
          >
            Réinitialiser
          </Button>
        </div>
        <form
          className="grid grid-cols-1 sm:grid-cols-4 gap-2 mb-4"
          onSubmit={e => { e.preventDefault(); setPage(1); }}
        >
          <Input
            type="text"
            placeholder="Titre…"
            value={advancedSearch.title}
            onChange={e => setAdvancedSearch(a => ({ ...a, title: e.target.value }))}
            className="w-full"
            aria-label="Recherche par titre"
          />
          <Input
            type="text"
            placeholder="Réalisateur…"
            value={advancedSearch.director}
            onChange={e => setAdvancedSearch(a => ({ ...a, director: e.target.value }))}
            className="w-full"
            aria-label="Recherche par réalisateur"
          />
          <Input
            type="number"
            placeholder="Année…"
            value={advancedSearch.year}
            onChange={e => setAdvancedSearch(a => ({ ...a, year: e.target.value }))}
            className="w-full"
            aria-label="Recherche par année"
          />
          <Input
            type="number"
            placeholder="TMDB ID…"
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
            <option value="published">Publiés</option>
            <option value="draft">Brouillons</option>
          </select>
        </div>
        {/* Table et actions */}
        {loading ? (
          <div className="py-12 flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        ) : movies.length === 0 ? (
          <div className="text-center py-12 bg-gray-800 rounded-lg">
            <Film className="h-12 w-12 mx-auto mb-4 text-gray-600" />
            <h2 className="text-xl font-semibold mb-2">Aucun film trouvé</h2>
            <p className="text-gray-400 mb-6">
              {searchTerm
                ? `Aucun film ne correspond à votre recherche "${searchTerm}"`
                : statusFilter !== 'all'
                ? `Aucun film avec le statut "${statusFilter === 'published' ? 'Publié' : 'Brouillon'}"`
                : "Commencez par ajouter votre premier film"
              }
            </p>
            <Link href="/admin/films/add">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Ajouter un film
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
                      {allSelected(paginatedMovies) ? (
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
                    Film {sortField === 'title' && (sortOrder === 'asc' ? '▲' : '▼')}
                  </th>
                  <th
                    className="pb-3 font-medium cursor-pointer select-none"
                    onClick={() => {
                      setSortField('year');
                      setSortOrder(o => (sortField === 'year' && o === 'asc') ? 'desc' : 'asc');
                    }}
                  >
                    Année {sortField === 'year' && (sortOrder === 'asc' ? '▲' : '▼')}
                  </th>
                  <th
                    className="pb-3 font-medium text-center cursor-pointer select-none"
                    onClick={() => {
                      setSortField('vote_average');
                      setSortOrder(o => (sortField === 'vote_average' && o === 'asc') ? 'desc' : 'asc');
                    }}
                  >
                    Note {sortField === 'vote_average' && (sortOrder === 'asc' ? '▲' : '▼')}
                  </th>
                  <th className="pb-3 font-medium text-center">Votes</th>
                  <th className="pb-3 font-medium text-center">Statut</th>
                  <th className="pb-3 font-medium text-center">VIP</th>
                  <th className="pb-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedMovies.map((movie) => {
                  const posterUrl = movie.poster || '/placeholder-backdrop.jpg';
                  const genres = movie.genre ? movie.genre.split(',').map(g => g.trim()) : [];
                  return (
                    <tr key={movie.id} className="border-b border-gray-700 group hover:bg-gray-700/10 transition">
                      <td className="py-4 px-2 align-middle">
                        <button
                          type="button"
                          aria-label={isChecked(movie.id) ? "Désélectionner" : "Sélectionner"}
                          onClick={() => toggleSelect(movie.id)}
                          className="bg-transparent border-none focus:outline-none"
                        >
                          {isChecked(movie.id) ? (
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
                              alt={movie.title}
                              className="h-full w-full object-cover"
                              onError={e => { (e.target as HTMLImageElement).src = '/placeholder-backdrop.jpg'; }}
                            />
                          </div>
                          <div>
                            <div className="font-medium">{movie.title}</div>
                            <div className="text-xs text-gray-400 mt-0.5 flex flex-wrap gap-1">
                              {genres.slice(0, 2).map(g => (
                                <span key={g} className="px-1 bg-gray-700/60 rounded">{g}</span>
                              ))}
                              {genres.length > 2 && <span>…</span>}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4">{movie.year}</td>
                      <td className="py-4 text-center">
                        {movie.vote_average ? (
                          <div className="flex items-center justify-center">
                            <Star className="h-4 w-4 text-yellow-500 mr-1 fill-current" />
                            <span>{Number(movie.vote_average).toFixed(1)}</span>
                          </div>
                        ) : (
                          <span className="text-gray-500">-</span>
                        )}
                      </td>
                      <td className="py-4 text-center">
                        {movie.vote_count ?? <span className="text-gray-500">-</span>}
                      </td>
                      <td className="py-4 text-center">
                        <Button
                          type="button"
                          variant={movie.published ? "success" : "ghost"}
                          aria-label={movie.published ? "Dépublier" : "Publier"}
                          className={cn(
                            "px-2 py-1 rounded-full text-xs font-semibold",
                            movie.published
                              ? "bg-green-500/20 text-green-500"
                              : "bg-gray-500/20 text-gray-400"
                          )}
                          onClick={() => handleTogglePublished(movie.id, !!movie.published)}
                        >
                          {movie.published ? 'Publié' : 'Brouillon'}
                        </Button>
                      </td>
                      <td className="py-4 text-center">
                        <span className={cn(
                          "px-2 py-1 rounded-full text-xs font-semibold",
                          movie.isvip
                            ? "bg-amber-500/20 text-amber-500"
                            : "bg-gray-500/20 text-gray-400"
                        )}>
                          {movie.isvip ? 'VIP' : 'Non'}
                        </span>
                      </td>
                      <td className="py-4 text-right">
                        <div className="flex justify-end items-center space-x-2">
                          {/* Aperçu rapide */}
                          <Button
                            variant="outline"
                            size="icon"
                            aria-label="Aperçu"
                            onClick={() => setSelectedMovie(movie)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {/* Menu hamburger actions */}
                          <Button
                            variant="ghost"
                            size="icon"
                            aria-label="Actions"
                            onClick={() => setActionMenuMovie(movie)}
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                          {/* Menu modal d'actions moderne */}
                          <Dialog open={actionMenuMovie?.id === movie.id} onOpenChange={open => { if (!open) setActionMenuMovie(null); }}>
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
                              {/* Aperçu film (mini header dans la modale) */}
                              <div className="flex items-center gap-3 px-4 pt-4 pb-2 border-b border-gray-800">
                                <div className="h-16 w-11 flex-shrink-0 rounded-md overflow-hidden border border-gray-700 bg-gray-800 shadow-inner">
                                  <img
                                    src={movie.poster || '/placeholder-backdrop.jpg'}
                                    alt={movie.title}
                                    className="w-full h-full object-cover"
                                    style={{ background: "#222" }}
                                  />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="font-semibold truncate">{movie.title}</div>
                                  <div className="text-xs text-gray-400 truncate">{movie.year} &middot; {(movie.genre || '').split(',').map(g => g.trim()).filter(Boolean).slice(0,2).join(', ')}{movie.genre && movie.genre.split(',').length > 2 ? '…' : ''}</div>
                                  <div className="flex gap-1 mt-1">
                                    {movie.published
                                      ? <span className="bg-green-600/20 text-green-400 px-2 py-0.5 rounded-full text-xs font-semibold">Publié</span>
                                      : <span className="bg-gray-500/20 text-gray-400 px-2 py-0.5 rounded-full text-xs font-semibold">Brouillon</span>
                                    }
                                    {movie.isvip &&
                                      <span className="bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full text-xs font-semibold">VIP</span>
                                    }
                                  </div>
                                </div>
                              </div>
                              <div className="flex flex-col gap-2 px-4 py-4">
                                <Button asChild variant="outline" className="justify-start bg-white/5 hover:bg-indigo-500/80 hover:text-white transition duration-150">
                                  <Link href={`/films/${movie.id}`} target="_blank">
                                    <Eye className="h-4 w-4 mr-2" />
                                    Voir la fiche
                                  </Link>
                                </Button>
                                <Button
                                  variant="outline"
                                  className="justify-start bg-white/5 hover:bg-indigo-500/80 hover:text-white transition duration-150"
                                  onClick={() => {
                                    setActionMenuMovie(null);
                                    router.push(`/admin/films/${movie.id}/edit`);
                                  }}
                                >
                                  <Edit className="h-4 w-4 mr-2" />
                                  Modifier
                                </Button>
                                <Button
                                  variant="destructive"
                                  className="justify-start bg-white/5 hover:bg-red-600/80 hover:text-white transition duration-150"
                                  onClick={() => {
                                    setActionMenuMovie(null);
                                    openDeleteDialog(movie);
                                  }}
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Supprimer
                                </Button>
                              </div>
                              <DialogFooter className="px-4 pb-3 pt-0">
                                <Button variant="outline" size="sm" onClick={() => setActionMenuMovie(null)} className="w-full mt-2 bg-white/10 hover:bg-white/20 transition">
                                  Annuler
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {/* Actions groupées */}
            {selectedIds.length > 0 && (
              <div className="flex flex-wrap gap-2 items-center my-2 p-2 bg-gray-900 border border-gray-700 rounded justify-center">
                <span className="text-xs text-gray-400">{selectedIds.length} sélectionné(s)</span>
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
        )}
      </div>
      {/* Aperçu rapide */}
      <Dialog open={!!selectedMovie} onOpenChange={open => { if (!open) setSelectedMovie(null); }}>
        <DialogContent className="max-w-lg bg-gray-900/95 backdrop-blur-lg rounded-2xl border-0 p-0">
          {selectedMovie && (
            <div className="p-5 space-y-4">
              <div className="flex gap-4">
                <div className="flex-shrink-0 h-32 w-24 rounded-lg overflow-hidden border bg-gray-800 shadow">
                  <img
                    src={selectedMovie.poster || '/placeholder-backdrop.jpg'}
                    alt={selectedMovie.title}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-2xl font-bold truncate">{selectedMovie.title}</div>
                  <div className="text-xs text-gray-400 mb-2">
                    {selectedMovie.year ?? '-'}
                  </div>
                  <div className="flex gap-2 flex-wrap mb-1">
                    {(selectedMovie.genre || '').split(',').map(g =>
                      <span key={g} className="inline-block bg-purple-800/20 text-purple-200 px-2 py-0.5 rounded-full text-xs">{g.trim()}</span>
                    )}
                  </div>
                  <div className="flex gap-1 mt-1">
                    {selectedMovie.published
                      ? <span className="bg-green-600/20 text-green-400 px-2 py-0.5 rounded-full text-xs font-semibold">Publié</span>
                      : <span className="bg-gray-500/20 text-gray-400 px-2 py-0.5 rounded-full text-xs font-semibold">Brouillon</span>
                    }
                    {selectedMovie.isvip &&
                      <span className="bg-amber-600/20 text-amber-300 px-2 py-0.5 rounded-full text-xs font-semibold">VIP</span>
                    }
                  </div>
                  <div className="mt-2 text-xs text-gray-400">
                    TMDB ID: <span className="text-gray-300">{selectedMovie.tmdb_id ?? '-'}</span>
                  </div>
                  <div className="mt-1 text-xs text-gray-400">
                    Réalisateur: <span className="text-gray-200">{selectedMovie.director ?? '-'}</span>
                  </div>
                  <div className="mt-1 text-xs text-gray-400">
                    Durée: <span className="text-gray-300">{selectedMovie.duration ? `${selectedMovie.duration} min` : '-'}</span>
                  </div>
                </div>
              </div>
              <div>
                <div className="font-semibold mb-1 text-sm text-gray-300">Description</div>
                <div className="text-sm text-gray-200 leading-relaxed max-h-40 overflow-y-auto">{selectedMovie.description || <span className="text-gray-600 italic">Aucune description.</span>}</div>
              </div>
              {(selectedMovie.trailer_url || selectedMovie.video_url) && (
                <div className="flex flex-col gap-2">
                  {selectedMovie.trailer_url && (
                    <div>
                      <div className="font-semibold text-xs text-gray-300">Bande-annonce :</div>
                      <a href={selectedMovie.trailer_url} target="_blank" rel="noopener" className="text-indigo-400 underline break-all">{selectedMovie.trailer_url}</a>
                    </div>
                  )}
                  {selectedMovie.video_url && (
                    <div>
                      <div className="font-semibold text-xs text-gray-300">Vidéo :</div>
                      <a href={selectedMovie.video_url} target="_blank" rel="noopener" className="text-indigo-400 underline break-all">{selectedMovie.video_url}</a>
                    </div>
                  )}
                </div>
              )}
              {selectedMovie.backdrop && (
                <div className="mt-4">
                  <img
                    src={selectedMovie.backdrop}
                    alt="Backdrop"
                    className="w-full rounded-lg shadow border border-gray-800 object-cover"
                    style={{ maxHeight: 200 }}
                  />
                </div>
              )}
              <div className="flex justify-end mt-2">
                <Button variant="outline" onClick={() => setSelectedMovie(null)}>
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
              Êtes-vous sûr de vouloir supprimer le film "{movieToDelete?.title}" ? Cette action est irréversible.
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
              onClick={handleDeleteMovie}
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