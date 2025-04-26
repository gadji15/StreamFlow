'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Tv, Search, Filter, Star, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { VipBadge } from '@/components/vip-badge';
import { getAllSeries, Series } from '@/lib/firebase/firestore/series';
import { useAuth } from '@/hooks/use-auth';
import { DocumentData, QueryDocumentSnapshot } from 'firebase/firestore';

export default function SeriesPage() {
  const [seriesList, setSeriesList] = useState<Series[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [genreFilter, setGenreFilter] = useState<string | null>(null);
  const [lastVisible, setLastVisible] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [availableGenres, setAvailableGenres] = useState<{id: string, name: string}[]>([]);
  
  const { isVIP } = useAuth();
  
  // Fonction pour charger la liste des séries
  const loadSeries = async (loadMore = false) => {
    try {
      setLoading(true);
      
      const result = await getAllSeries({
        limit: 12,
        startAfter: loadMore ? lastVisible : undefined,
        onlyPublished: true,
        genreFilter: genreFilter || undefined,
        isVIP: isVIP ? undefined : false // Si l'utilisateur n'est pas VIP, filtrer les contenus non-VIP
      });
      
      // Filtrer par recherche côté client (si nécessaire)
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
  }, [genreFilter, isVIP]);
  
  // Gérer la recherche
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadSeries();
  };
  
  // Gérer le chargement de plus de séries
  const handleLoadMore = () => {
    if (!loading && hasMore) {
      loadSeries(true);
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Catalogue des Séries</h1>

      {/* Barre de recherche et filtres */}
      <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <Input
            type="search"
            placeholder="Rechercher une série..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
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
        
        <Button type="submit" variant="outline">
          <Filter className="mr-2 h-4 w-4" /> Filtrer
        </Button>
      </form>

      {/* Affichage des résultats */}
      {loading && seriesList.length === 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
          {[...Array(12)].map((_, i) => (
            <div key={i} className="bg-gray-800 rounded-lg animate-shimmer aspect-[2/3]"></div>
          ))}
        </div>
      ) : seriesList.length > 0 ? (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {seriesList.map((series) => (
              <Link 
                key={series.id} 
                href={`/series/${series.id}`} 
                className="group block bg-gray-800 rounded-lg overflow-hidden transition-transform duration-300 hover:scale-105 hover:shadow-lg"
              >
                <div className="relative aspect-[2/3]">
                  <img
                    src={series.posterUrl || '/placeholder-poster.png'}
                    alt={`Affiche de ${series.title}`}
                    className="w-full h-full object-cover"
                  />
                  {series.isVIP && (
                    <div className="absolute top-2 right-2">
                      <VipBadge />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <Tv className="h-12 w-12 text-white" />
                  </div>
                </div>
                <div className="p-3">
                  <h3 className="font-semibold truncate text-sm">{series.title}</h3>
                  <div className="flex justify-between items-center mt-1 text-xs text-gray-400">
                    <span>{series.startYear}{series.endYear ? ` - ${series.endYear}` : ''}</span>
                    {series.rating && (
                      <span className="flex items-center">
                        <Star className="h-3 w-3 text-yellow-500 mr-1 fill-current" />
                        {series.rating.toFixed(1)}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
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
      ) : (
        <div className="text-center py-16 bg-gray-800 rounded-lg">
          <Tv className="h-16 w-16 mx-auto mb-6 text-gray-600" />
          <h2 className="text-2xl font-semibold mb-2">Aucune série trouvée</h2>
          <p className="text-gray-400 mb-6 max-w-md mx-auto">
            {searchTerm 
              ? `Aucune série ne correspond à votre recherche "${searchTerm}".`
              : genreFilter 
                ? "Aucune série trouvée pour ce genre."
                : "Aucune série disponible pour le moment."
            }
          </p>
          {(searchTerm || genreFilter) && (
            <Button 
              onClick={() => {
                setSearchTerm('');
                setGenreFilter(null);
                loadSeries();
              }}
            >
              Réinitialiser les filtres
            </Button>
          )}
        </div>
      )}
    </div>
  );
}