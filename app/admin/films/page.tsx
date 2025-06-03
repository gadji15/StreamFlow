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
import dynamic from 'next/dynamic';

const FilmModal = dynamic(() => import('@/components/admin/films/FilmModal'), { ssr: false });

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

  // FilmModal state
  const [filmModalOpen, setFilmModalOpen] = useState(false);
  const [filmModalLoading, setFilmModalLoading] = useState(false);

  // Nouveaux états pour l'édition
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editModalMovie, setEditModalMovie] = useState<MovieDB | null>(null);

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
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-primary drop-shadow-sm flex items-center gap-3 hidden sm:flex">
            <Film className="h-8 w-8 text-indigo-400" />
            Gestion des Films
          </h1>
          <p className="text-gray-400 text-sm mt-1 hidden sm:block">
            Recherchez, gérez et structurez tous vos films et leur publication.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            aria-label="Rafraîchir"
            onClick={handleRefresh}
            className="hover:bg-indigo-50/10 border border-transparent hover:border-indigo-400 transition"
          >
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
            className="border-indigo-400 text-indigo-300 hover:bg-indigo-900/20"
          >
            Export CSV
          </Button>
          <Button
            className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold shadow-md hover:scale-105 transition-transform flex items-center"
            onClick={() => setFilmModalOpen(true)}
            aria-label="Ajouter un film"
          >
            <Plus className="h-5 w-5 sm:mr-2" />
            <span className="hidden sm:inline">Ajouter un film</span>
          </Button>
        </div>
      </div>
      {/* FILTERS / SEARCH */}
      <div className="bg-gray-900/80 rounded-xl shadow-xl p-6 border border-gray-700">
        {/* Recherche rapide et avancée */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative w-full max-w-[180px] sm:max-w-xs flex-1">
            <Input
              type="search"
              placeholder="🔍 Recherche rapide (titre film)..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
              className="pl-10 bg-gray-800 border-2 border-gray-700 focus:border-indigo-500 shadow w-full"
              aria-label="Recherche de film"
            />
            <span className="absolute left-3 top-2.5 text-gray-400 pointer-events-none">
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="8" cy="8" r="7" /><path d="m16 16-3.5-3.5" /></svg>
            </span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleRefresh()}
            className="hidden sm:block border-indigo-400 text-indigo-300 hover:bg-indigo-900/20"
          >
            Réinitialiser
          </Button>
        </div>
        {/* Recherche avancée supprimée */}
        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          <select
            value={genreFilter}
            onChange={e => { setGenreFilter(e.target.value); setPage(1); }}
            className="bg-gray-800 border border-indigo-400 rounded-md px-3 py-2 text-sm text-indigo-200"
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
            className="bg-gray-800 border border-indigo-400 rounded-md px-3 py-2 text-sm text-indigo-200"
            aria-label="Filtrer par statut"
          >
            <option value="all">Tous les statuts</option>
            <option value="published">Publiés</option>
            <option value="draft">Brouillons</option>
          </select>
        </div>
        {/* Table et actions */}
      {loading ? (
          <div className="py-24 flex flex-col items-center justify-center">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-400 border-t-transparent mb-6"></div>
            <span className="text-indigo-300 font-medium">Chargement des films…</span>
          </div>
        ) : movies.length === 0 ? (
          <div className="text-center py-16 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-xl shadow-lg border-2 border-dashed border-indigo-400">
            <Film className="h-16 w-16 mx-auto mb-6 text-indigo-500/60 drop-shadow" />
            <h2 className="text-2xl font-bold mb-2 text-indigo-200">Aucun film trouvé</h2>
            <p className="text-gray-400 mb-8">
              {searchTerm
                ? `Aucun film ne correspond à votre recherche « ${searchTerm} »`
                : statusFilter !== 'all'
                ? `Aucun film avec le statut « ${statusFilter === 'published' ? 'Publié' : 'Brouillon'} »`
                : "Commencez par ajouter votre premier film pour enrichir votre catalogue."
              }
            </p>
            <Button
              className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold shadow-md hover:scale-105 transition-transform"
              onClick={() => setFilmModalOpen(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Ajouter un film
            </Button>
          </div>
        ) : (
          <>
            {/* Responsive card view for mobile devices */}
            <div className="sm:hidden flex flex-col gap-2 w-full max-w-full min-w-0 overflow-x-hidden">
              {paginatedMovies.map((movie) => {
                const posterUrl = movie.poster || '/placeholder-backdrop.jpg';
                const genres = movie.genre ? movie.genre.split(',').map(g => g.trim()) : [];
                return (
                  <div
                    key={movie.id}
                    className="bg-gray-800 rounded-xl shadow-lg border border-gray-700 px-1 py-1 flex flex-col w-full max-w-full min-w-0 overflow-x-hidden"
                  >
                    <div className="flex items-center gap-1 w-full max-w-full min-w-0">
                      <img
                        src={posterUrl}
                        alt={movie.title}
                        className="h-12 w-9 rounded-lg object-cover border border-gray-700 bg-gray-700 flex-shrink-0"
                        onError={e => { (e.target as HTMLImageElement).src = '/placeholder-backdrop.jpg'; }}
                      />
                      <div className="flex-1 min-w-0 max-w-full">
                        <div className="font-bold truncate text-xs max-w-[56vw]">{movie.title}</div>
                        <div className="text-[11px] text-gray-400 mt-0.5 flex flex-wrap gap-0.5">
                          {genres.slice(0, 2).map(g => (
                            <span key={g} className="px-1 bg-gray-700/60 rounded">{g}</span>
                          ))}
                          {genres.length > 2 && <span>…</span>}
                        </div>
                        <div className="flex items-center gap-1 mt-0.5">
                          <span className="text-[11px] text-gray-400">{movie.year}</span>
                          {movie.isvip && (
                            <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-500 text-[10px] font-semibold">VIP</span>
                          )}
                          <span className="px-2 py-0.5 rounded-full bg-gray-500/20 text-[10px] font-semibold text-gray-400">
                            {movie.published ? 'Publié' : 'Brouillon'}
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        aria-label={isChecked(movie.id) ? "Désélectionner" : "Sélectionner"}
                        onClick={() => toggleSelect(movie.id)}
                        className="ml-1 bg-transparent border-none focus:outline-none flex-shrink-0"
                      >
                        {isChecked(movie.id) ? (
                          <CheckSquare className="h-4 w-4 text-indigo-500" />
                        ) : (
                          <Square className="h-4 w-4 text-gray-400" />
                        )}
                      </button>
                    </div>
                    <div className="flex gap-1 mt-1 justify-end w-full max-w-full min-w-0">
                      <Button
                        variant="outline"
                        size="icon"
                        aria-label="Aperçu"
                        onClick={() => setSelectedMovie(movie)}
                        className="h-7 w-7"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label="Actions"
                        onClick={() => setActionMenuMovie(movie)}
                        className="h-7 w-7"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
              {/* Actions groupées (mobile) */}
              {selectedIds.length > 0 && (
                <div className="mb-4 flex flex-wrap items-center gap-3 bg-red-900/30 border border-red-500 rounded-lg px-4 py-2 animate-pulse">
                  <span className="font-semibold text-red-300">
                    {selectedIds.length} film{selectedIds.length > 1 ? "s" : ""} sélectionné{selectedIds.length > 1 ? "s" : ""}
                  </span>
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
            </div>
            {/* Table view for desktop/tablet */}
            <div className="hidden sm:block overflow-x-auto">
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
                      className="pb-3 font-medium cursor-pointer select-none min-w-[180px]"
                      onClick={() => {
                        setSortField('title');
                        setSortOrder(o => (sortField === 'title' && o === 'asc') ? 'desc' : 'asc');
                      }}
                    >
                      Film {sortField === 'title' && (sortOrder === 'asc' ? '▲' : '▼')}
                    </th>
                    <th
                      className="pb-3 font-medium cursor-pointer select-none w-20 hidden md:table-cell"
                      onClick={() => {
                        setSortField('year');
                        setSortOrder(o => (sortField === 'year' && o === 'asc') ? 'desc' : 'asc');
                      }}
                    >
                      Année {sortField === 'year' && (sortOrder === 'asc' ? '▲' : '▼')}
                    </th>
                    <th
                      className="pb-3 font-medium text-center cursor-pointer select-none w-24 hidden md:table-cell"
                      onClick={() => {
                        setSortField('vote_average');
                        setSortOrder(o => (sortField === 'vote_average' && o === 'asc') ? 'desc' : 'asc');
                      }}
                    >
                      Note {sortField === 'vote_average' && (sortOrder === 'asc' ? '▲' : '▼')}
                    </th>
                    <th className="pb-3 font-medium text-center w-16 hidden md:table-cell">Votes</th>
                    <th className="pb-3 font-medium text-center w-24 hidden sm:table-cell">Statut</th>
                    <th className="pb-3 font-medium text-center w-16 hidden sm:table-cell">VIP</th>
                    <th className="pb-3 font-medium text-right w-32">Actions</th>
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
                        <td className="py-4 min-w-[180px]">
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
                        <td className="py-4 hidden md:table-cell">{movie.year}</td>
                        <td className="py-4 text-center hidden md:table-cell">
                          {movie.vote_average ? (
                            <div className="flex items-center justify-center">
                              <Star className="h-4 w-4 text-yellow-500 mr-1 fill-current" />
                              <span>{Number(movie.vote_average).toFixed(1)}</span>
                            </div>
                          ) : (
                            <span className="text-gray-500">-</span>
                          )}
                        </td>
                        <td className="py-4 text-center hidden md:table-cell">
                          {movie.vote_count ?? <span className="text-gray-500">-</span>}
                        </td>
                        <td className="py-4 text-center hidden sm:table-cell">
                          <Button
                            type="button"
                            variant={movie.published ? "default" : "ghost"}
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
                        <td className="py-4 text-center hidden sm:table-cell">
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
                                <DialogHeader>
                                  <DialogTitle>Actions film</DialogTitle>
                                </DialogHeader>
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
                                      setEditModalMovie(movie);
                                      setEditModalOpen(true);
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
                <div className="mb-4 flex items-center gap-3 bg-red-900/30 border border-red-500 rounded-lg px-4 py-2 animate-pulse">
                  <span className="font-semibold text-red-300">
                    {selectedIds.length} film{selectedIds.length > 1 ? "s" : ""} sélectionné{selectedIds.length > 1 ? "s" : ""}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleBulkPublish(true)}
                    disabled={isDeleting}
                    className="ml-2"
                  >
                    Publier
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleBulkPublish(false)}
                    disabled={isDeleting}
                    className="ml-2"
                  >
                    Dépublier
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleDeleteSelected}
                    disabled={isDeleting}
                    className="ml-2"
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Supprimer
                  </Button>
                </div>
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
          </>
        )}
      </div>
      {/* Aperçu rapide */}
      <Dialog open={!!selectedMovie} onOpenChange={open => { if (!open) setSelectedMovie(null); }}>
        <DialogContent className="max-w-lg bg-gray-900/95 backdrop-blur-lg rounded-2xl border-0 p-0">
          <DialogHeader>
            <DialogTitle>Aperçu du film</DialogTitle>
          </DialogHeader>
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
    {/* FilmModal pour ajouter un film */}
      <FilmModal
        open={filmModalOpen}
        onClose={() => setFilmModalOpen(false)}
        onSave={async (newFilm: MovieDB) => {
          setFilmModalLoading(true);
          try {
            // Ajoute le film dans la base et dans la liste locale
            const { data, error } = await supabase.from('films').insert([newFilm]).select();
            if (error) throw error;
            if (data && data.length > 0) {
              setMovies((prev) => [data[0], ...prev]);
              toast({
                title: "Film ajouté",
                description: `Le film "${data[0].title}" a été ajouté.`,
              });
            }
            setFilmModalOpen(false);
          } catch (e) {
            toast({ title: "Erreur", description: String(e), variant: "destructive" });
          }
          setFilmModalLoading(false);
        }}
        initialData={{}}
      />

      {/* FilmModal pour édition d'un film */}
      <FilmModal
        open={editModalOpen}
        onClose={() => {
          setEditModalOpen(false);
          setEditModalMovie(null);
        }}
        initialData={editModalMovie || {}}
        onSave={async (updatedFilm: MovieDB) => {
          if (!editModalMovie) return;
          setFilmModalLoading(true);
          try {
            // Update du film dans la base
            const { data, error } = await supabase
              .from('films')
              .update(updatedFilm)
              .eq('id', editModalMovie.id)
              .select();
            if (error) throw error;
            if (data && data.length > 0) {
              setMovies((prev) =>
                prev.map((movie) =>
                  movie.id === editModalMovie.id ? { ...movie, ...data[0] } : movie
                )
              );
              toast({
                title: "Film modifié",
                description: `Le film "${data[0].title}" a été modifié.`,
              });
            }
            setEditModalOpen(false);
            setEditModalMovie(null);
          } catch (e) {
            toast({ title: "Erreur", description: String(e), variant: "destructive" });
          }
          setFilmModalLoading(false);
        }}
      />
    </div>
  );
}