'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
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
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabaseClient';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
  year: number;
  poster: string|null;
  genre: string|null;
  vote_average?: number|null;
  vote_count?: number|null;
  views?: number|null;
  published?: boolean;
  isvip?: boolean;
};

export default function AdminFilmsPage() {
  const [movies, setMovies] = useState<MovieDB[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [genreFilter, setGenreFilter] = useState<string>('all');
  const [genres, setGenres] = useState<string[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const [movieToDelete, setMovieToDelete] = useState<MovieDB | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [page, setPage] = useState(1);
  const pageSize = 20;

  const { toast } = useToast();

  // Charger genres pour filtre (au montage)
  useEffect(() => {
    async function fetchGenres() {
      const { data, error } = await supabase.from('genres').select('name');
      if (data) setGenres(data.map(g => g.name));
    }
    fetchGenres();
  }, []);

  // Charger les films
  useEffect(() => {
    const loadMovies = async () => {
      setLoading(true);
      try {
        let query = supabase.from('films').select('*').order('created_at', { ascending: false }).limit(1000);
        if (statusFilter === 'published') query = query.eq('published', true);
        if (statusFilter === 'draft') query = query.eq('published', false);
        if (searchTerm) query = query.ilike('title', `%${searchTerm}%`);
        const { data, error } = await query;
        if (error) throw error;

        let filteredMovies: MovieDB[] = data || [];

        // Filtrer par genre (front car genre est une chaîne)
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
  }, [searchTerm, statusFilter, genreFilter, toast]);

  // Pagination
  const paginatedMovies = movies.slice((page-1)*pageSize, page*pageSize);
  const totalPages = Math.ceil(movies.length / pageSize);

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

  // Ouvrir le dialogue de confirmation de suppression
  const openDeleteDialog = (movie: MovieDB) => {
    setMovieToDelete(movie);
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
        <h1 className="text-3xl font-bold">Films</h1>
        <div className="flex gap-2">
          <Button variant="ghost" aria-label="Rafraîchir" onClick={handleRefresh}>
            <RefreshCw className="h-5 w-5" />
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
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="search"
              placeholder="Rechercher un film..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
              className="pl-10"
              aria-label="Recherche de film"
            />
          </div>
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
                  <th className="pb-3 font-medium">Film</th>
                  <th className="pb-3 font-medium">Année</th>
                  <th className="pb-3 font-medium text-center">Note</th>
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
                      <span className={cn(
                        "px-2 py-1 rounded-full text-xs font-semibold",
                        movie.published
                          ? "bg-green-500/20 text-green-500"
                          : "bg-gray-500/20 text-gray-400"
                      )}>
                        {movie.published ? 'Publié' : 'Brouillon'}
                      </span>
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
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" aria-label="Actions">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem asChild>
                              <Link href={`/films/${movie.id}`} target="_blank">
                                <Eye className="h-4 w-4 mr-2" />
                                Voir
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link href={`/admin/films/${movie.id}/edit`}>
                                <Edit className="h-4 w-4 mr-2" />
                                Modifier
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-red-500 focus:text-red-500"
                              onClick={() => openDeleteDialog(movie)}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Supprimer
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </td>
                  </tr>
                )})}
              </tbody>
            </table>
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