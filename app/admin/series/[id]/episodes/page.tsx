'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { 
  Tv, 
  ArrowLeft, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Clock,
  Calendar,
  Film,
  MoreHorizontal,
  Search,
  Filter
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabaseClient';

type Series = {
  id: string;
  title: string;
  start_year?: number;
  // autres champs si besoin
};

type Episode = {
  id: string;
  title: string;
  description: string;
  season: number;
  episode_number: number;
  duration: number;
  is_vip?: boolean;
  published?: boolean;
  thumbnail_url?: string;
};
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
import { formatDuration } from '@/lib/utils';

export default function AdminSeriesEpisodesPage() {
  const router = useRouter();
  const params = useParams();
  const seriesId = params?.id as string;
  
  const [series, setSeries] = useState<Series | null>(null);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [seasonFilter, setSeasonFilter] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [episodeToDelete, setEpisodeToDelete] = useState<Episode | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  
  const { toast } = useToast();
  
  // Charger la série et ses épisodes
  useEffect(() => {
    const loadSeriesAndEpisodes = async () => {
      if (!seriesId) return;
      
      setLoading(true);
      try {
        // Charger la série
        const { data: seriesData, error: seriesError } = await supabase
          .from('series')
          .select('id, title, start_year')
          .eq('id', seriesId)
          .single();

        if (seriesError || !seriesData) {
          setError('Série non trouvée');
          return;
        }
        setSeries(seriesData);

        // Charger les épisodes
        const { data: episodesData, error: episodesError } = await supabase
          .from('episodes')
          .select('*')
          .eq('series_id', seriesId);

        if (episodesError) {
          setEpisodes([]);
        } else {
          setEpisodes(episodesData || []);
        }
      } catch (error) {
        console.error('Erreur lors du chargement de la série et des épisodes:', error);
        setError('Impossible de charger les données de la série et des épisodes');
      } finally {
        setLoading(false);
      }
    };
    
    loadSeriesAndEpisodes();
  }, [seriesId]);
  
  // Filtrer les épisodes
  const filteredEpisodes = episodes
    .filter(episode => {
      // Filtre par saison
      if (seasonFilter !== null && episode.season !== seasonFilter) {
        return false;
      }
      
      // Filtre par recherche
      if (searchTerm && !episode.title.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
      
      return true;
    })
    .sort((a, b) => {
      // Tri par saison puis par numéro d'épisode
      if (a.season !== b.season) {
        return a.season - b.season;
      }
      return a.episodeNumber - b.episodeNumber;
    });
  
  // Récupérer toutes les saisons disponibles
  const availableSeasons = [...new Set(episodes.map(episode => episode.season))]
    .sort((a, b) => a - b);
  
  // Gérer la suppression d'un épisode
  const handleDeleteEpisode = async () => {
    if (!episodeToDelete) return;
    
    setIsDeleting(true);
    try {
      const { error: deleteError } = await supabase
        .from('episodes')
        .delete()
        .eq('id', episodeToDelete.id);

      if (deleteError) {
        throw deleteError;
      }

      // Mettre à jour la liste locale
      setEpisodes(episodes.filter(episode => episode.id !== episodeToDelete.id));

      toast({
        title: 'Épisode supprimé',
        description: `L'épisode "${episodeToDelete.title}" a été supprimé avec succès.`,
      });

      // Fermer le dialogue
      setDeleteDialogOpen(false);
      setEpisodeToDelete(null);
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'épisode:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de supprimer l\'épisode.',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
    }
  };
  
  // Ouvrir le dialogue de confirmation de suppression
  const openDeleteDialog = (episode: Episode) => {
    setEpisodeToDelete(episode);
    setDeleteDialogOpen(true);
  };
  
  // Afficher un message de chargement
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }
  
  // Afficher un message d'erreur
  if (error || !series) {
    return (
      <div className="space-y-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push('/admin/series')}
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Retour à la liste des séries
        </Button>
        
        <div className="bg-red-900/20 border border-red-800 rounded-lg p-6 text-center">
          <h2 className="text-xl font-bold mb-2">Erreur</h2>
          <p className="text-gray-300">{error || 'Série non trouvée'}</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push('/admin/series')}
          className="mr-2"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Retour
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Épisodes</h1>
          <p className="text-gray-400">
            Série : {series.title} {series.startYear && `(${series.startYear})`}
          </p>
        </div>
      </div>
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex-1"></div>
        <Link href={`/admin/series/${seriesId}/episodes/add`}>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Ajouter un épisode
          </Button>
        </Link>
      </div>
      
      <div className="bg-gray-800 rounded-lg p-6">
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="search"
              placeholder="Rechercher un épisode..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <select
            value={seasonFilter === null ? '' : seasonFilter}
            onChange={(e) => {
              const value = e.target.value;
              setSeasonFilter(value === '' ? null : parseInt(value));
            }}
            className="bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-sm"
          >
            <option value="">Toutes les saisons</option>
            {availableSeasons.map((season) => (
              <option key={season} value={season}>
                Saison {season}
              </option>
            ))}
          </select>
        </div>
        
        {episodes.length === 0 ? (
          <div className="text-center py-12">
            <Film className="h-12 w-12 mx-auto mb-4 text-gray-600" />
            <h2 className="text-xl font-semibold mb-2">Aucun épisode trouvé</h2>
            <p className="text-gray-400 mb-6">
              Commencez par ajouter un épisode à cette série.
            </p>
            <Link href={`/admin/series/${seriesId}/episodes/add`}>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Ajouter un épisode
              </Button>
            </Link>
          </div>
        ) : filteredEpisodes.length === 0 ? (
          <div className="text-center py-12">
            <Film className="h-12 w-12 mx-auto mb-4 text-gray-600" />
            <h2 className="text-xl font-semibold mb-2">Aucun épisode ne correspond aux filtres</h2>
            <p className="text-gray-400 mb-6">
              Essayez de modifier vos critères de recherche.
            </p>
            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm('');
                setSeasonFilter(null);
              }}
            >
              Réinitialiser les filtres
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="pb-3 font-medium">Épisode</th>
                  <th className="pb-3 font-medium text-center">Saison</th>
                  <th className="pb-3 font-medium text-center">Numéro</th>
                  <th className="pb-3 font-medium text-center">Durée</th>
                  <th className="pb-3 font-medium text-center">Statut</th>
                  <th className="pb-3 font-medium text-center">VIP</th>
                  <th className="pb-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredEpisodes.map((episode) => (
                  <tr key={episode.id} className="border-b border-gray-700">
                    <td className="py-4">
                      <div className="flex items-center">
                        <div className="h-10 w-16 overflow-hidden rounded mr-3 flex-shrink-0">
                          {episode.thumbnail_url ? (
                            <img 
                              src={episode.thumbnail_url} 
                              alt={episode.title}
                              className="h-full w-full object-cover" 
                            />
                          ) : (
                            <div className="h-full w-full bg-gray-700 flex items-center justify-center">
                              <Film className="h-5 w-5 text-gray-500" />
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="font-medium">{episode.title}</div>
                          <div className="text-xs text-gray-400 mt-0.5 line-clamp-1">
                            {episode.description}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 text-center">
                      <span className="px-2 py-1 rounded-full text-xs bg-gray-700">
                        {episode.season}
                      </span>
                    </td>
                    <td className="py-4 text-center">
                      {episode.episode_number}
                    </td>
                    <td className="py-4 text-center">
                      <div className="flex items-center justify-center text-sm">
                        <Clock className="h-3 w-3 text-gray-400 mr-1" />
                        {formatDuration(episode.duration)}
                      </div>
                    </td>
                    <td className="py-4 text-center">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        episode.published
                          ? 'bg-green-500/20 text-green-500'
                          : 'bg-gray-500/20 text-gray-400'
                      }`}>
                        {episode.published ? 'Publié' : 'Brouillon'}
                      </span>
                    </td>
                    <td className="py-4 text-center">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        episode.is_vip
                          ? 'bg-amber-500/20 text-amber-500'
                          : 'bg-gray-500/20 text-gray-400'
                      }`}>
                        {episode.is_vip ? 'VIP' : 'Non'}
                      </span>
                    </td>
                    <td className="py-4 text-right">
                      <div className="flex justify-end items-center space-x-2">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem asChild>
                              <Link href={`/admin/series/${seriesId}/episodes/${episode.id}/edit`}>
                                <Edit className="h-4 w-4 mr-2" />
                                Modifier
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-red-500 focus:text-red-500"
                              onClick={() => openDeleteDialog(episode)}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Supprimer
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      {/* Dialogue de confirmation de suppression */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmer la suppression</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer l'épisode "{episodeToDelete?.title}" ? Cette action est irréversible.
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
              onClick={handleDeleteEpisode}
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