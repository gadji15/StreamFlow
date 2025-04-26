'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Film, 
  Tv, 
  Eye, 
  Star,
  Clock
} from 'lucide-react';
import { getStatistics } from '@/lib/firebase/firestore/statistics';
import { getRecentActivities } from '@/lib/firebase/firestore/activity-logs';
import { getPopularMovies } from '@/lib/firebase/firestore/movies';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [activities, setActivities] = useState<any[]>([]);
  const [popularMovies, setPopularMovies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Charger les statistiques
        const statsData = await getStatistics();
        setStats(statsData);
        
        // Charger les activités récentes
        const activitiesData = await getRecentActivities(10);
        setActivities(activitiesData);
        
        // Charger les films populaires
        const moviesData = await getPopularMovies(5);
        setPopularMovies(moviesData);
      } catch (error) {
        console.error('Erreur lors du chargement des données du tableau de bord:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);
  
  // Chargement
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }
  
  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold mb-6">Tableau de bord</h1>
      
      {/* Statistiques */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Utilisateurs"
          value={stats?.totalUsers || 0}
          icon={Users}
          description={`dont ${stats?.vipUsers || 0} VIP`}
          color="blue"
          link="/admin/users"
        />
        
        <StatCard 
          title="Films"
          value={stats?.totalMovies || 0}
          icon={Film}
          description={`${stats?.publishedMovies || 0} publiés`}
          color="green"
          link="/admin/films"
        />
        
        <StatCard 
          title="Séries"
          value={stats?.totalSeries || 0}
          icon={Tv}
          description={`${stats?.publishedSeries || 0} publiées`}
          color="purple"
          link="/admin/series"
        />
        
        <StatCard 
          title="Vues totales"
          value={stats?.totalViews || 0}
          icon={Eye}
          description="Contenus visionnés"
          color="orange"
          link="/admin/stats"
        />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Films populaires */}
        <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-700 flex items-center justify-between">
            <h2 className="font-semibold flex items-center">
              <TrendingUp className="h-5 w-5 mr-2 text-yellow-500" />
              Films populaires
            </h2>
            <Link 
              href="/admin/films" 
              className="text-sm text-indigo-400 hover:text-indigo-300"
            >
              Voir tous
            </Link>
          </div>
          <div className="p-6">
            {popularMovies.length > 0 ? (
              <div className="divide-y divide-gray-700">
                {popularMovies.map((movie) => (
                  <div key={movie.id} className="py-3 flex items-center">
                    <div className="h-12 w-12 overflow-hidden rounded mr-3 flex-shrink-0">
                      {movie.posterUrl ? (
                        <img 
                          src={movie.posterUrl} 
                          alt={movie.title}
                          className="h-full w-full object-cover" 
                        />
                      ) : (
                        <div className="h-full w-full bg-gray-700 flex items-center justify-center">
                          <Film className="h-6 w-6 text-gray-500" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <Link 
                        href={`/admin/films/${movie.id}`}
                        className="font-medium text-sm hover:text-indigo-400 truncate block"
                      >
                        {movie.title}
                      </Link>
                      <div className="flex items-center text-xs text-gray-400 mt-0.5">
                        <Clock className="h-3 w-3 mr-1" />
                        <span>{movie.year}</span>
                        {movie.rating && (
                          <>
                            <span className="mx-1">•</span>
                            <Star className="h-3 w-3 mr-1 text-yellow-500" />
                            <span>{movie.rating.toFixed(1)}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="ml-2 flex-shrink-0">
                      <div className="flex items-center bg-gray-700 px-2 py-1 rounded text-xs">
                        <Eye className="h-3 w-3 mr-1" />
                        {movie.views}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-400 py-4">
                Aucun film disponible
              </p>
            )}
          </div>
        </div>
        
        {/* Activités récentes */}
        <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-700 flex items-center justify-between">
            <h2 className="font-semibold flex items-center">
              <BarChart3 className="h-5 w-5 mr-2 text-indigo-500" />
              Activités récentes
            </h2>
            <Link 
              href="/admin/activity" 
              className="text-sm text-indigo-400 hover:text-indigo-300"
            >
              Voir toutes
            </Link>
          </div>
          <div className="p-6">
            {activities.length > 0 ? (
              <div className="divide-y divide-gray-700">
                {activities.map((activity) => (
                  <div key={activity.id} className="py-3">
                    <div className="flex items-start">
                      <div className="flex-shrink-0">
                        <ActivityIcon activity={activity} />
                      </div>
                      <div className="ml-3 flex-1">
                        <p className="text-sm">
                          <ActivityDescription activity={activity} />
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {activity.timestamp && formatDistanceToNow(activity.timestamp.toDate(), {
                            addSuffix: true,
                            locale: fr
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-400 py-4">
                Aucune activité récente
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ 
  title, 
  value, 
  icon: Icon, 
  description, 
  color,
  link
}: { 
  title: string; 
  value: number; 
  icon: React.ElementType;
  description: string;
  color: 'blue' | 'green' | 'purple' | 'orange' | 'red';
  link?: string;
}) {
  const colors = {
    blue: 'bg-blue-500/20 text-blue-500',
    green: 'bg-green-500/20 text-green-500',
    purple: 'bg-purple-500/20 text-purple-500',
    orange: 'bg-orange-500/20 text-orange-500',
    red: 'bg-red-500/20 text-red-500',
  };
  
  const iconClass = colors[color];
  
  return (
    <div className="bg-gray-800 rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-medium text-gray-300">{title}</h3>
        <div className={`p-2 rounded-lg ${iconClass}`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
      <div className="space-y-1">
        <p className="text-3xl font-bold">{value.toLocaleString()}</p>
        <p className="text-sm text-gray-400">{description}</p>
      </div>
      {link && (
        <div className="mt-4">
          <Link 
            href={link}
            className="text-xs text-indigo-400 hover:text-indigo-300"
          >
            Voir les détails →
          </Link>
        </div>
      )}
    </div>
  );
}

function ActivityIcon({ activity }: { activity: any }) {
  // Définir l'icône en fonction du type d'activité
  switch (activity.action) {
    case 'content_create':
      return <div className="p-1.5 bg-green-500/20 text-green-500 rounded-full"><Film className="h-4 w-4" /></div>;
    case 'content_update':
      return <div className="p-1.5 bg-blue-500/20 text-blue-500 rounded-full"><Film className="h-4 w-4" /></div>;
    case 'content_delete':
      return <div className="p-1.5 bg-red-500/20 text-red-500 rounded-full"><Film className="h-4 w-4" /></div>;
    case 'login':
      return <div className="p-1.5 bg-purple-500/20 text-purple-500 rounded-full"><Users className="h-4 w-4" /></div>;
    default:
      return <div className="p-1.5 bg-gray-500/20 text-gray-500 rounded-full"><Eye className="h-4 w-4" /></div>;
  }
}

function ActivityDescription({ activity }: { activity: any }) {
  // Générer une description en fonction du type d'activité
  switch (activity.action) {
    case 'content_create':
      return (
        <>
          <span className="font-medium">{activity.userEmail || 'Un administrateur'}</span> a ajouté {activity.entityType === 'movie' ? 'un film' : 'une série'} : <span className="font-medium">{activity.details?.title || 'Sans titre'}</span>
        </>
      );
    case 'content_update':
      return (
        <>
          <span className="font-medium">{activity.userEmail || 'Un administrateur'}</span> a modifié {activity.entityType === 'movie' ? 'le film' : 'la série'} : <span className="font-medium">{activity.details?.title || 'Sans titre'}</span>
        </>
      );
    case 'content_delete':
      return (
        <>
          <span className="font-medium">{activity.userEmail || 'Un administrateur'}</span> a supprimé {activity.entityType === 'movie' ? 'le film' : 'la série'} : <span className="font-medium">{activity.details?.title || 'Sans titre'}</span>
        </>
      );
    case 'login':
      return (
        <>
          <span className="font-medium">{activity.userEmail || 'Un administrateur'}</span> s'est connecté à l'interface d'administration
        </>
      );
    default:
      return (
        <>
          <span className="font-medium">{activity.userEmail || 'Un administrateur'}</span> a effectué une action de type {activity.action}
        </>
      );
  }
}