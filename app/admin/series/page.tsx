'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Tv, 
  Edit, 
  Trash2, 
  Plus, 
  Search, 
  Eye, 
  Star,
  Filter,
  ArrowUpDown,
  MoreHorizontal,
  Calendar
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { 
  getAllSeries, 
  deleteSeries,
  Series
} from '@/lib/firebase/firestore/series';
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
  DialogTrigger,
} from '@/components/ui/dialog';

export default function AdminSeriesPage() {
  const [seriesList, setSeriesList] = useState<Series[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isDeleting, setIsDeleting] = useState(false);
  const [seriesToDelete, setSeriesToDelete] = useState<Series | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  
  const { toast } = useToast();
  
  // Charger les séries
  useEffect(() => {
    const loadSeries = async () => {
      setLoading(true);
      try {
        const result = await getAllSeries({
          limit: 100, // Augmenter la limite pour l'administration
          onlyPublished: statusFilter === 'published' ? true : undefined,
          searchTerm: searchTerm || undefined
        });
        
        let filteredSeries = result.series;
        
        // Filtrer côté client si nécessaire (selon le statut)
        if (statusFilter === 'draft') {
          filteredSeries = filteredSeries.filter(series => !series.isPublished);
        }
        
        setSeriesList(filteredSeries);
      } catch (error) {
        console.error('Erreur lors du chargement des séries:', error);
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
  }, [searchTerm, statusFilter, toast]);
  
  // Gérer la suppression d'une série
  const handleDeleteSeries = async () => {
    if (!seriesToDelete) return;
    
    setIsDeleting(true);
    try {
      const result = await deleteSeries(seriesToDelete.id!);
      
      // Mettre à jour la liste locale
      setSeriesList(seriesList.filter(series => series.id !== seriesToDelete.id));
      
      toast({
        title: 'Série supprimée',
        description: `La série "${seriesToDelete.title}" a été supprimée avec succès. ${result.episodesDeleted} épisode(s) supprimé(s).`,
      });
      
      // Fermer le dialogue
      setDeleteDialogOpen(false);
      setSeriesToDelete(null);
    } catch (error) {
      console.error('Erreur lors de la suppression de la série:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de supprimer la série.',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
    }
  };
  
  // Ouvrir le dialogue de confirmation de suppression
  const openDeleteDialog = (series: Series) => {
    setSeriesToDelete(series);
    setDeleteDialogOpen(true);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold">Séries</h1>
        
        <Link href="/admin/series/add">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Ajouter une série
          </Button>
        </Link>
      </div>
      
      <div className="bg-gray-800 rounded-lg p-6">
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="search"
              placeholder="Rechercher une série..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-sm"
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
        ) : seriesList.length === 0 ? (
          <div className="text-center py-12 bg-gray-800 rounded-lg">
            <Tv className="h-12 w-12 mx-auto mb-4 text-gray-600" />
            <h2 className="text-xl font-semibold mb-2">Aucune série trouvée</h2>
            <p className="text-gray-400 mb-6">
              {searchTerm 
                ? `Aucune série ne correspond à votre recherche "${searchTerm}"`
                : statusFilter !== 'all'
                  ? `Aucune série avec le statut "${statusFilter === 'published' ? 'Publié' : 'Brouillon'}"`
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
                  <th className="pb-3 font-medium">Série</th>
                  <th className="pb-3 font-medium">Années</th>
                  <th className="pb-3 font-medium text-center">Saisons</th>
                  <th className="pb-3 font-medium text-center">Note</th>
                  <th className="pb-3 font-medium text-center">Vues</th>
                  <th className="pb-3 font-medium text-center">Statut</th>
                  <th className="pb-3 font-medium text-center">VIP</th>
                  <th className="pb-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {seriesList.map((series) => (
                  <tr key={series.id} className="border-b border-gray-700">
                    <td className="py-4">
                      <div className="flex items-center">
                        <div className="h-10 w-10 overflow-hidden rounded mr-3 flex-shrink-0">
                          {series.posterUrl ? (
                            <img 
                              src={series.posterUrl} 
                              alt={series.title}
                              className="h-full w-full object-cover" 
                            />
                          ) : (
                            <div className="h-full w-full bg-gray-700 flex items-center justify-center">
                              <Tv className="h-5 w-5 text-gray-500" />
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="font-medium">{series.title}</div>
                          <div className="text-xs text-gray-400 mt-0.5">
                            {series.genres && series.genres.slice(0, 2).join(', ')}
                            {series.genres && series.genres.length > 2 && '...'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4">
                      <div className="flex items-center text-sm">
                        <Calendar className="h-3 w-3 text-gray-400 mr-1" />
                        <span>
                          {series.startYear}
                          {series.endYear ? ` - ${series.endYear}` : ' - Présent'}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 text-center">
                      {series.seasons || 0}
                    </td>
                    <td className="py-4 text-center">
                      {series.rating ? (
                        <div className="flex items-center justify-center">
                          <Star className="h-4 w-4 text-yellow-500 mr-1 fill-current" />
                          <span>{series.rating.toFixed(1)}</span>
                        </div>
                      ) : (
                        <span className="text-gray-500">-</span>
                      )}
                    </td>
                    <td className="py-4 text-center">
                      <div className="flex items-center justify-center">
                        <Eye className="h-4 w-4 text-gray-400 mr-1" />
                        <span>{series.views}</span>
                      </div>
                    </td>
                    <td className="py-4 text-center">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        series.isPublished
                          ? 'bg-green-500/20 text-green-500'
                          : 'bg-gray-500/20 text-gray-400'
                      }`}>
                        {series.isPublished ? 'Publiée' : 'Brouillon'}
                      </span>
                    </td>
                    <td className="py-4 text-center">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        series.isVIP
                          ? 'bg-amber-500/20 text-amber-500'
                          : 'bg-gray-500/20 text-gray-400'
                      }`}>
                        {series.isVIP ? 'VIP' : 'Non'}
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
                              <Link href={`/series/${series.id}`} target="_blank">
                                <Eye className="h-4 w-4 mr-2" />
                                Voir
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link href={`/admin/series/${series.id}/edit`}>
                                <Edit className="h-4 w-4 mr-2" />
                                Modifier
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link href={`/admin/series/${series.id}/episodes`}>
                                <Tv className="h-4 w-4 mr-2" />
                                Épisodes
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-red-500 focus:text-red-500"
                              onClick={() => openDeleteDialog(series)}
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
              Êtes-vous sûr de vouloir supprimer la série "{seriesToDelete?.title}" ? 
              <br /><br />
              <strong>Attention :</strong> Cette action supprimera également tous les épisodes associés à cette série. Cette action est irréversible.
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