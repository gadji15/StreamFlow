'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Tv, Search, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { VipBadge } from '@/components/vip-badge';
import LoadingScreen from '@/components/loading-screen';
import { getSeries, Series } from '@/lib/supabaseSeries';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';

export default function SeriesPage() {
  const [seriesList, setSeriesList] = useState<Series[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [genreFilter, setGenreFilter] = useState<string | null>(null);
  const [showVIP, setShowVIP] = useState<boolean | null>(null);
  const [availableGenres, setAvailableGenres] = useState<{ id: string; name: string }[]>([
    { id: 'thriller', name: 'Thriller' },
    { id: 'sci-fi', name: 'Science-Fiction' },
    { id: 'comedy', name: 'Comédie' },
    { id: 'drama', name: 'Drame' },
    { id: 'animation', name: 'Animation' },
    { id: 'family', name: 'Famille' },
    { id: 'adventure', name: 'Aventure' },
    { id: 'documentary', name: 'Documentaire' },
  ]);
  const { isVIP } = useSupabaseAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const genre = searchParams?.get('genre');
    const search = searchParams?.get('q');
    const vip = searchParams?.get('vip');
    if (genre) setGenreFilter(genre);
    if (search) setSearchTerm(search);
    if (vip) setShowVIP(vip === 'true');
  }, [searchParams]);

  useEffect(() => {
    const loadSeries = async () => {
      setLoading(true);
      setError(null);

      try {
        let results: Series[] = await getSeries();

        if (genreFilter) {
          results = results.filter(s =>
            (s.genre || '').toLowerCase().includes(genreFilter.toLowerCase())
          );
        }
        if (showVIP !== null) {
          results = results.filter(s => !!s.isVIP === showVIP);
        }
        if (searchTerm.trim() !== '') {
          const term = searchTerm.trim().toLowerCase();
          results = results.filter(s => s.title.toLowerCase().includes(term));
        }

        setSeriesList(results);
      } catch (err) {
        console.error('Erreur lors du chargement des séries:', err);
        setError('Erreur lors du chargement des séries. Veuillez réessayer.');
      } finally {
        setLoading(false);
      }
    };

    loadSeries();
  }, [genreFilter, showVIP, searchTerm]);

  useEffect(() => {
    const params = new URLSearchParams();
    if (genreFilter) params.set('genre', genreFilter);
    if (searchTerm) params.set('q', searchTerm);
    if (showVIP !== null) params.set('vip', showVIP.toString());
    const queryString = params.toString();
    const url = queryString ? `/series?${queryString}` : '/series';
    window.history.replaceState({}, '', url);
  }, [genreFilter, searchTerm, showVIP]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  };

  const resetFilters = () => {
    setSearchTerm('');
    setGenreFilter(null);
    setShowVIP(null);
  };

  // Animated skeleton for loading
  const SkeletonCard = () => (
    <div className="rounded-lg bg-gradient-to-br from-gray-800/80 to-gray-900/80 animate-pulse shadow-inner h-80 relative overflow-hidden">
      <div className="absolute inset-0 flex flex-col justify-end p-3">
        <div className="h-6 w-2/3 bg-gray-700 rounded mb-2"></div>
        <div className="h-4 w-1/3 bg-gray-700 rounded"></div>
      </div>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-2 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
        <h1 className="text-3xl font-bold mb-2 md:mb-0 tracking-tight flex items-center gap-2">
          <Tv className="w-7 h-7 text-indigo-400" />
          Catalogue des Séries
        </h1>
        <div className="text-sm text-gray-400 font-medium">
          {seriesList.length > 0 && (
            <span>
              {seriesList.length} résultat{seriesList.length > 1 ? 's' : ''}
            </span>
          )}
        </div>
      </div>

      {/* Barre de recherche et filtres améliorée */}
      <div className="bg-gradient-to-r from-gray-800/90 via-gray-900/80 to-gray-950/90 rounded-xl p-4 mb-8 shadow-lg">
        <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-4 items-stretch">
          <div className="relative flex-1">
            <Input
              type="search"
              placeholder="Rechercher une série…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-gray-800/90 rounded-lg"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-indigo-400" />
          </div>
          <div className="flex flex-col sm:flex-row gap-2 items-stretch">
            <select
              value={genreFilter || ''}
              onChange={(e) => setGenreFilter(e.target.value || null)}
              className="bg-gray-800/90 border border-gray-700 rounded-lg px-3 py-2 text-sm transition focus:ring-2 focus:ring-indigo-500"
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
              className="bg-gray-800/90 border border-gray-700 rounded-lg px-3 py-2 text-sm transition focus:ring-2 focus:ring-indigo-500"
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
        <div className="bg-red-900/60 border border-red-700 rounded-lg p-4 mb-6 text-center">
          {error}
        </div>
      )}

      {/* Affichage des résultats */}
      {loading && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      )}

      {!loading && seriesList.length === 0 ? (
        <div className="text-center py-16">
          <img src="/empty-state.svg" alt="" className="mx-auto mb-6 w-32 h-32 opacity-60" />
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
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {seriesList.map((series, idx) => (
            <SeriesCard 
              key={series.id} 
              series={series} 
              isUserVIP={isVIP}
              animate={true}
              idx={idx}
              genreList={availableGenres}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// Composant carte série
interface SeriesCardProps {
  series: Series;
  isUserVIP: boolean;
  animate?: boolean;
  idx?: number;
  genreList?: { id: string; name: string }[];
}

function SeriesCard({ series, isUserVIP, animate = false, idx = 0, genreList = [] }: SeriesCardProps) {
  const { id, title, poster, startYear, endYear, isVIP, genre } = series;
  const posterSrc = poster || '/placeholder-poster.png';

  // Format les genres en badges
  const genreBadges = (genre || '')
    .split(',')
    .map(g => g.trim())
    .filter(Boolean)
    .map(g => {
      const found = genreList.find(gg => gg.id.toLowerCase() === g.toLowerCase());
      return found ? found.name : g;
    });

  return (
    <Link 
      href={`/series/${id}`}
      className={
        `group block bg-gradient-to-br from-gray-800/90 to-gray-900/95 rounded-2xl overflow-hidden shadow-lg transition-all duration-300 hover:scale-[1.025] hover:shadow-2xl relative
        ${isVIP && !isUserVIP ? 'opacity-60 grayscale' : ''} 
        ${animate ? `animate-fadein` : ''}`
      }
      style={animate ? { animationDelay: `${idx * 40}ms` } : undefined}
    >
      <div className="relative aspect-[2/3]">
        <img
          src={posterSrc}
          alt={`Affiche de ${title}`}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {isVIP && (
          <div className="absolute top-2 right-2 z-10 animate-bounce">
            <VipBadge />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <Tv className="h-10 w-10 text-white/80" />
        </div>
        {genreBadges.length > 0 && (
          <div className="absolute bottom-2 left-2 flex flex-wrap gap-2 z-10">
            {genreBadges.map((g, i) => (
              <span key={i} className="bg-indigo-700/80 text-xs text-white px-2 py-0.5 rounded font-semibold shadow hover:bg-indigo-500/80 transition">{g}</span>
            ))}
          </div>
        )}
      </div>
      <div className="p-3 flex flex-col gap-1">
        <div className="flex items-baseline justify-between gap-2">
          <h3 className="font-semibold truncate text-sm flex-1">{title}</h3>
          <span className="text-xs text-gray-400">{startYear}{endYear ? ` - ${endYear}` : ''}</span>
        </div>
      </div>
    </Link>
  );
}
