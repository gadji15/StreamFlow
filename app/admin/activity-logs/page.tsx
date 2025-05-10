'use client';

import { useState, useEffect } from 'react';
import { 
  Calendar, 
  Search, 
  Filter, 
  Film, 
  Tv, 
  Play, 
  Heart, 
  Eye, 
  Trash, 
  Pencil,
  RefreshCcw
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from '@/components/ui/badge';
import { getUserActivities } from '@/lib/firebase/firestore/activity-logs';
import { Card, CardContent } from '@/components/ui/card';
import AdminSidebar from '@/components/admin/admin-sidebar';
import AdminHeader from '@/components/admin/admin-header';

// Interface pour le type d'activité
interface Activity {
  id: string;
  userId: string;
  action: string;
  contentType: 'movie' | 'series' | 'episode';
  contentId: string;
  details: Record<string, any>;
  timestamp: Date;
}

export default function ActivityLogsPage() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  useEffect(() => {
    fetchActivities();
  }, []);
  
  const fetchActivities = async () => {
    setLoading(true);
    try {
      // Récupérer toutes les activités
      // Cette fonction doit être adaptée pour récupérer les activités de tous les utilisateurs
      const allActivities = await getUserActivities('all', 100);
      setActivities(allActivities);
    } catch (error) {
      console.error('Erreur lors de la récupération des activités:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Filtrer les activités
  const filteredActivities = activities.filter(activity => {
    // Filtrer par type de contenu
    if (filter !== 'all' && activity.contentType !== filter) {
      return false;
    }
    
    // Filtrer par terme de recherche
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const detailsString = JSON.stringify(activity.details).toLowerCase();
      return (
        activity.userId.toLowerCase().includes(searchLower) ||
        activity.action.toLowerCase().includes(searchLower) ||
        activity.contentId.toLowerCase().includes(searchLower) ||
        detailsString.includes(searchLower)
      );
    }
    
    return true;
  });
  
  // Obtenir l'icône en fonction de l'action
  const getActionIcon = (action: string) => {
    switch (action) {
      case 'movie_view':
      case 'series_view':
      case 'episode_view':
        return <Eye className="h-4 w-4" />;
      case 'movie_created':
      case 'series_created':
      case 'episode_created':
        return <Play className="h-4 w-4" />;
      case 'movie_updated':
      case 'series_updated':
      case 'episode_updated':
        return <Pencil className="h-4 w-4" />;
      case 'movie_deleted':
      case 'series_deleted':
      case 'episode_deleted':
        return <Trash className="h-4 w-4" />;
      case 'favorite_added':
      case 'favorite_removed':
        return <Heart className="h-4 w-4" />;
      default:
        return null;
    }
  };
  
  // Formater l'action pour l'affichage
  const formatAction = (action: string) => {
    return action.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase());
  };
  
  return (
    <div className="min-h-screen flex bg-gray-950">
      <AdminSidebar />
      <div className="flex-1 flex flex-col">
        <AdminHeader title="Journaux d'activité" />
        <main className="flex-1 p-6">
          <div className="flex flex-col space-y-4 mb-6">
            <div className="flex flex-wrap gap-4 items-center">
              <div className="flex-1 min-w-[300px]">
                <div className="relative">
                  <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                  <Input
                    placeholder="Rechercher dans les journaux..."
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="flex gap-3 items-center">
                <Select value={filter} onValueChange={setFilter}>
                  <SelectTrigger className="w-[180px]">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Type de contenu" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les types</SelectItem>
                    <SelectItem value="movie">Films</SelectItem>
                    <SelectItem value="series">Séries</SelectItem>
                    <SelectItem value="episode">Épisodes</SelectItem>
                  </SelectContent>
                </Select>
                
                <Button variant="outline" onClick={fetchActivities}>
                  <RefreshCcw className="h-4 w-4 mr-2" />
                  Actualiser
                </Button>
              </div>
            </div>
          </div>
          
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : filteredActivities.length === 0 ? (
            <div className="text-center p-12 border border-dashed rounded-lg">
              <p className="text-gray-500">Aucune activité trouvée</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredActivities.map(activity => (
                <Card key={activity.id} className="overflow-hidden">
                  <CardContent className="p-4">
                    <div className="flex items-start">
                      <div className="bg-gray-800 p-2 rounded-full mr-4">
                        {activity.contentType === 'movie' ? (
                          <Film className="h-6 w-6 text-primary" />
                        ) : activity.contentType === 'series' ? (
                          <Tv className="h-6 w-6 text-primary" />
                        ) : (
                          <Play className="h-6 w-6 text-primary" />
                        )}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center mb-1">
                          <h3 className="font-medium">
                            {activity.details?.title || activity.contentId}
                          </h3>
                          <Badge className="ml-2 flex items-center" variant="outline">
                            {getActionIcon(activity.action)}
                            <span className="ml-1">{formatAction(activity.action)}</span>
                          </Badge>
                        </div>
                        
                        <div className="text-sm text-gray-400 flex items-center mb-2">
                          <span className="font-mono mr-2">ID: {activity.userId.substring(0, 8)}...</span>
                          <span className="flex items-center ml-2">
                            <Calendar className="h-3 w-3 mr-1" />
                            {activity.timestamp.toLocaleString()}
                          </span>
                        </div>
                        
                        {activity.details && Object.keys(activity.details).length > 0 && (
                          <div className="text-xs bg-gray-900 p-2 rounded mt-2 overflow-x-auto">
                            <pre className="whitespace-pre-wrap">
                              {JSON.stringify(activity.details, null, 2)}
                            </pre>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}