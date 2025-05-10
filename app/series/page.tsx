'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Tv, Search, Filter, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { VipBadge } from '@/components/vip-badge';
import LoadingScreen from '@/components/loading-screen';
import { getSeries, Series } from '@/lib/supabaseSeries';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
// Supprime les imports liés à Firebase

export default function SeriesPage() {
  const [seriesList, setSeriesList] = useState<Series[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [genreFilter, setGenreFilter] = useState<string | null>(null);
  const [showVIP, setShowVIP] = useState<boolean | null>(null);
  const [lastVisible, setLastVisible] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [availableGenres, setAvailableGenres] = useState<{id: string, name: string}[]>([]);
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isVIP } = useAuth();
  
  // Initialiser les filtres à partir des paramètres d'URL
  useEffect(() => {
    const genre = searchParams?.get('genre');
    const search = searchParams?.get('q');
    const vip = searchParams?.get('vip');
    
    if (genre) setGenreFilter(genre);
    if (search) setSearchTerm(search);
    if (vip) setShowVIP(vip === 'true');
  }, [searchParams]);
  
  // Fonction pour charger la liste des séries
  const loadSeries = async (loadMore = false) => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await getAllSeries({
        limit: 12,
        startAfter: loadMore ? lastVisible : undefined,
        onlyPublished: true,
        genreFilter: genreFilter || undefined,
        isVIP: showVIP === null ? undefined : showVIP
      });
      
      // Filtrer par recherche côté client
      const filteredSeries = searchTerm
        ? result.series.filter(series =>
            series.title.toLowerCase().includes(searchTerm.toLowerCase())
          )
        : result.series;
      
      if (loadMore) {
        setSeriesList(prev => [...prev, ...filteredSeries]);
      } else {
        setSeriesList(filteredSeries);
      }
      
      setLastVisible(result.lastVisible);
      setHasMore(result.series.length === 12); // Supposons que s'il y a exactement 12 résultats, il y en a probablement d'autres
    } catch (error) {
      console.error('Erreur lors du chargement des séries:', error);
      setError('Erreur lors du chargement des séries. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };
  
  // Charger les genres disponibles
  useEffect(() => {
    const fetchGenres = async () => {
      try {
        // Utiliser la même fonction que pour les films
        const genresData = await fetch('/api/genres').then(res => res.json());
        setAvailableGenres(genresData);
      } catch (error) {
        console.error('Erreur lors du chargement des genres:', error);
      }
    };
    
    fetchGenres();
  }, []);
  
  // Charger les séries au chargement de la page et lorsque les filtres changent
  useEffect(() => {
    loadSeries();
  }, [genreFilter, showVIP, isVIP]);
  
  // Mettre à jour les paramètres d'URL lorsque les filtres changent
  useEffect(() => {
    const params = new URLSearchParams();
    
    if (genreFilter) params.set('genre', genreFilter);
    if (searchTerm) params.set('q', searchTerm);
    if (showVIP !== null) params.set('vip', showVIP.toString());
    
    const queryString = params.toString();
    const url = queryString ? `/series?${queryString}` : '/series';
    
    // Ne pas recharger la page, juste mettre à jour l'URL
    window.history.replaceState({}, '', url);
  }, [genreFilter, searchTerm, showVIP]);
  
  // Gérer la recherche
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadSeries(); // Déclencher une nouvelle recherche
  };
  
  // Réinitialiser les filtres
  const resetFilters = () => {
    setSearchTerm('');
    setGenreFilter(null);
    setShowVIP(null);
  };
  
  // Gérer le chargement de plus de séries
  const handleLoadMore = () => {
    if (!loading && hasMore) {
      loadSeries(true);
    }
  };
  
  // Afficher l'écran de chargement initial
  if (loading && seriesList.length === 0) {
    return <LoadingScreen />;
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Catalogue des Séries</h1>

      {/* Barre de recherche et filtres */}
      <div className="bg-gray-800 rounded-lg p-4 mb-6">
        <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Input
              type="search"
              placeholder="Rechercher une série..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2">
            <select
              value={genreFilter || ''}
              onChange={(e) => setGenreFilter(e.target.value || null)}
              className="bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-sm"
            >
              <option value="">Tous les genres</option>
              {availableGenres.map((genre) => (
                <option key={genre.id} value={genre.id}>
                  {genre.name}
                </option>
              ))}
            </select>
            
            <select
              value={showVIP === null ? '' : showVIP.toString()}
              onChange={(e) => {
                const value = e.target.value;
                setShowVIP(value === '' ? null : value === 'true');
              }}
              className="bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-sm"
            >
              <option value="">Tous les contenus</option>
              <option value="false">Contenus gratuits</option>
              <option value="true">Contenus VIP</option>
            </select>
            
            {(genreFilter || searchTerm || showVIP !== null) && (
              <Button 
                variant="ghost" 
                onClick={resetFilters}
                className="text-sm"
              >
                Réinitialiser
              </Button>
            )}
          </div>
        </form>
      </div>

      {error && (
        <div className="bg-red-900/50 border border-red-700 rounded-lg p-4 mb-6 text-center">
          {error}
        </div>
      )}

      {/* Affichage des résultats */}
      {!loading && seriesList.length === 0 ? (
        <div className="text-center py-12">
          <Tv className="h-12 w-12 mx-auto mb-4 text-gray-500" />
          <h2 className="text-xl font-semibold mb-2">Aucune série trouvée</h2>
          <p className="text-gray-400 mb-6">
            {searchTerm 
              ? `Aucune série ne correspond à votre recherche "${searchTerm}".`
              : genreFilter 
                ? "Aucune série trouvée pour ce genre."
                : "Aucune série disponible pour le moment."
            }
          </p>
          <Button onClick={resetFilters}>
            Voir toutes les séries
          </Button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {seriesList.map((series) => (
              <SeriesCard 
                key={series.id} 
                series={series} 
                isUserVIP={isVIP}
              />
            ))}
          </div>
          
          {(loading || hasMore) && (
            <div className="mt-8 text-center">
              <Button 
                onClick={handleLoadMore} 
                disabled={loading || !hasMore}
                variant="outline"
                size="lg"
              >
                {loading ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                    Chargement...
                  </>
                ) : (
                  'Charger plus de séries'
                )}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

interface SeriesCardProps {
  series: Series;
  isUserVIP: boolean;
}

function SeriesCard({ series, isUserVIP }: SeriesCardProps) {
  const { id, title, posterUrl, startYear, endYear, rating, isVIP } = series;
  
  // Fallback pour le poster
  const posterSrc = posterUrl || '/placeholder-poster.png';
  
  return (
    <Link 
      href={`/series/${id}`}
      className={`group block bg-gray-800 rounded-lg overflow-hidden transition-transform duration-300 hover:scale-105 hover:shadow-lg ${
        isVIP && !isUserVIP ? 'opacity-70' : ''
      }`}
    >
      <div className="relative aspect-[2/3]">
        <img
          src={posterSrc}
          alt={`Affiche de ${title}`}
          className="w-full h-full object-cover"
        />
        {isVIP && (
          <div className="absolute top-2 right-2">
            <VipBadge />
          </div>
        )}
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <Tv className="h-12 w-12 text-white" />
        </div>
      </div>
      <div className="p-3">
        <div className="flex justify-between items-start">
          <h3 className="font-semibold truncate text-sm flex-1">{title}</h3>
          {rating && (
            <div className="flex items-center ml-2">
              <Star className="h-3 w-3 text-yellow-400 fill-current" />
              <span className="text-xs ml-0.5">{rating.toFixed(1)}</span>
            </div>
          )}
        </div>
        <p className="text-xs text-gray-400">
          {startYear}{endYear ? ` - ${endYear}` : ''}
        </p>
      </div>
    </Link>
  );
}
