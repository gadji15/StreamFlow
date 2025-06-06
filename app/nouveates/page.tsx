'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Film, Tv, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { getFilms, Movie } from '@/lib/supabaseFilms';
import { getSeries, Series } from '@/lib/supabaseSeries';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import LoadingScreen from '@/components/loading-screen';
import { VipBadge } from '@/components/vip-badge';

export default function NouveautePage() {
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [series, setSeries] = useState<Series[]>([]);
  const [moviesError, setMoviesError] = useState<string | null>(null);
  const [seriesError, setSeriesError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredMovies, setFilteredMovies] = useState<Movie[]>([]);
  const [filteredSeries, setFilteredSeries] = useState<Series[]>([]);
  const [activeTab, setActiveTab] = useState<'tout' | 'films' | 'series'>('tout');
  const { isVIP } = useSupabaseAuth();
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Genres pour chaque catégorie
  const GENRES_FILMS = [
    { value: '', label: 'Tous les genres' },
    { value: 'action', label: 'Action' },
    { value: 'comedy', label: 'Comédie' },
    { value: 'drama', label: 'Drame' },
    { value: 'animation', label: 'Animation' },
    { value: 'family', label: 'Famille' },
    { value: 'sci-fi', label: 'Science-Fiction' },
    { value: 'adventure', label: 'Aventure' },
    { value: 'documentary', label: 'Documentaire' }
  ];
  const GENRES_SERIES = [
    { value: '', label: 'Tous les genres' },
    { value: 'action', label: 'Action' },
    { value: 'comedy', label: 'Comédie' },
    { value: 'drama', label: 'Drame' },
    { value: 'animation', label: 'Animation' },
    { value: 'family', label: 'Famille' },
    { value: 'sci-fi', label: 'Science-Fiction' },
    { value: 'adventure', label: 'Aventure' },
    { value: 'documentary', label: 'Documentaire' }
  ];
  const [selectedGenre, setSelectedGenre] = useState<string>('');
  const [showVIP, setShowVIP] = useState<string>(''); // '', 'true', 'false'

  // Initial load
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      setMoviesError(null);
      setSeriesError(null);
      try {
        // Parallélisation des fetchs
        const [moviesDataResult, seriesDataResult] = await Promise.allSettled([
          getFilms(),
          getSeries(),
        ]);

        let moviesSorted: Movie[] = [];
        let seriesSorted: Series[] = [];

        if (moviesDataResult.status === "fulfilled") {
          moviesSorted = moviesDataResult.value
            .sort((a, b) => new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime())
            .slice(0, 30);
          setMovies(moviesSorted);
          setFilteredMovies(moviesSorted);
        } else {
          setMovies([]);
          setFilteredMovies([]);
          setMoviesError("Impossible de charger les films.");
        }

        if (seriesDataResult.status === "fulfilled") {
          seriesSorted = seriesDataResult.value
            .sort((a, b) => new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime())
            .slice(0, 30);
          setSeries(seriesSorted);
          setFilteredSeries(seriesSorted);
        } else {
          setSeries([]);
          setFilteredSeries([]);
          setSeriesError("Impossible de charger les séries.");
        }

        if (
          moviesDataResult.status === "rejected" &&
          seriesDataResult.status === "rejected"
        ) {
          setError("Impossible de charger les nouveautés. Veuillez réessayer.");
        }
      } catch (e) {
        setError("Impossible de charger les nouveautés. Veuillez réessayer.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Debounced search effect adapté à l'onglet actif et aux filtres
  useEffect(() => {
    if (loading) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);

    const filterItems = () => {
      const term = searchTerm.trim().toLowerCase();

      if (activeTab === 'films') {
        let filtered = [...movies];
        if (selectedGenre) {
          filtered = filtered.filter(m => (m.genre || '').toLowerCase().includes(selectedGenre.toLowerCase()));
        }
        if (showVIP === 'true') {
          filtered = filtered.filter(m => !!m.isVIP);
        } else if (showVIP === 'false') {
          filtered = filtered.filter(m => !m.isVIP);
        }
        if (term) {
          filtered = filtered.filter(m => m.title.toLowerCase().includes(term));
        }
        setFilteredMovies(
          filtered.sort(
            (a, b) =>
              new Date(b.created_at || '').getTime() -
              new Date(a.created_at || '').getTime()
          )
        );
      } else {
        let filtered = [...series];
        if (selectedGenre) {
          filtered = filtered.filter(s => (s.genre || '').toLowerCase().includes(selectedGenre.toLowerCase()));
        }
        if (showVIP === 'true') {
          filtered = filtered.filter(s => !!s.isVIP);
        } else if (showVIP === 'false') {
          filtered = filtered.filter(s => !s.isVIP);
        }
        if (term) {
          filtered = filtered.filter(s => s.title.toLowerCase().includes(term));
        }
        setFilteredSeries(
          filtered.sort(
            (a, b) =>
              new Date(b.created_at || '').getTime() -
              new Date(a.created_at || '').getTime()
          )
        );
      }
    };

    if (searchTerm.trim() === '' && !selectedGenre && !showVIP) {
      if (activeTab === 'films') {
        setFilteredMovies(
          [...movies].sort(
            (a, b) =>
              new Date(b.created_at || '').getTime() -
              new Date(a.created_at || '').getTime()
          )
        );
      } else {
        setFilteredSeries(
          [...series].sort(
            (a, b) =>
              new Date(b.created_at || '').getTime() -
              new Date(a.created_at || '').getTime()
          )
        );
      }
      setSearching(false);
      return;
    }

    setSearching(true);

    debounceRef.current = setTimeout(() => {
      filterItems();
      setSearching(false);
    }, 400);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
    // eslint-disable-next-line
  }, [searchTerm, movies, series, loading, activeTab, selectedGenre, showVIP]);

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <main className="container mx-auto px-4 py-10">
      <h1 className="text-4xl font-bold text-center mb-4 flex items-center justify-center gap-2">
        <Sparkles className="text-yellow-400 w-8 h-8" /> Nouveautés
      </h1>
      <p className="text-center text-gray-400 mb-8 max-w-2xl mx-auto">
        Découvrez les derniers films et séries ajoutés à notre catalogue. Profitez de nouveautés exclusives et des incontournables fraîchement arrivés !
      </p>

      {/* Onglets */}
      <div className="flex justify-center mb-6 gap-2">
        <button
          className={`px-6 py-2 rounded-t-lg font-semibold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'tout'
              ? 'bg-gray-900 border-primary text-primary shadow'
              : 'bg-gray-800 border-transparent text-gray-400 hover:text-primary'
          }`}
          onClick={() => setActiveTab('tout')}
          aria-selected={activeTab === 'tout'}
        >
          <Sparkles className={`inline-block h-5 w-5 transition-colors duration-200 ${
            activeTab === 'tout' ? 'text-yellow-400' : 'text-gray-400'
          }`} />
          Tout
        </button>
        <button
          className={`px-6 py-2 rounded-t-lg font-semibold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'films'
              ? 'bg-gray-900 border-primary text-primary shadow'
              : 'bg-gray-800 border-transparent text-gray-400 hover:text-primary'
          }`}
          onClick={() => setActiveTab('films')}
          aria-selected={activeTab === 'films'}
        >
          <Film className={`inline-block h-5 w-5 transition-colors duration-200 ${
            activeTab === 'films' ? 'text-primary' : 'text-gray-400'
          }`} />
          Films
        </button>
        <button
          className={`px-6 py-2 rounded-t-lg font-semibold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'series'
              ? 'bg-gray-900 border-purple-400 text-purple-400 shadow'
              : 'bg-gray-800 border-transparent text-gray-400 hover:text-purple-400'
          }`}
          onClick={() => setActiveTab('series')}
          aria-selected={activeTab === 'series'}
        >
          <Tv className={`inline-block h-5 w-5 transition-colors duration-200 ${
            activeTab === 'series' ? 'text-purple-400' : 'text-gray-400'
          }`} />
          Séries
        </button>
      </div>

      <div className="bg-gray-800 rounded-lg p-4 mb-6 shadow max-w-2xl mx-auto">
        <form
          onSubmit={e => e.preventDefault()}
          className="flex flex-col md:flex-row gap-4"
        >
          <div className="relative flex-1">
            <Input
              type="search"
              placeholder={`Rechercher un ${activeTab === 'films' ? 'film' : 'série'}...`}
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-10"
              autoFocus
              aria-label={`Rechercher un ${activeTab === 'films' ? 'film' : 'série'}`}
              autoComplete="off"
            />
            <svg
              viewBox="0 0 24 24"
              className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                aria-label="Effacer la recherche"
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-400 transition"
              >
                &#10006;
              </button>
            )}
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <label htmlFor="genre-select" className="sr-only">
              Genre
            </label>
            <select
              id="genre-select"
              aria-label="Genre"
              value={selectedGenre}
              onChange={e => setSelectedGenre(e.target.value)}
              className="bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-sm"
            >
              {(activeTab === 'films' ? GENRES_FILMS : GENRES_SERIES).map(g => (
                <option key={g.value} value={g.value}>{g.label}</option>
              ))}
            </select>
            <label htmlFor="vip-select" className="sr-only">
              Filtrer par VIP
            </label>
            <select
              id="vip-select"
              aria-label="Filtrer par VIP"
              value={showVIP}
              onChange={e => setShowVIP(e.target.value)}
              className="bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-sm"
            >
              <option value="">Tous les contenus</option>
              <option value="false">Contenus gratuits</option>
              <option value="true">Contenus VIP</option>
            </select>
            {/* Suppression du bouton Réinitialiser pour harmoniser avec les autres pages */}
          </div>
        </form>
        {searching && (
          <div className="flex items-center gap-2 mt-2 text-gray-400 text-sm">
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v8H4z"
              ></path>
            </svg>
            Recherche...
          </div>
        )}
      </div>
      {error && (
        <div className="bg-red-900/50 border border-red-700 rounded-lg p-4 mb-6 text-center">
          {error}
        </div>
      )}
      {!error && (
        <>
          {moviesError && (
            <div className="bg-red-900/30 border border-red-700 rounded-lg p-2 mb-4 text-center text-sm">
              {moviesError}
            </div>
          )}
          {seriesError && (
            <div className="bg-red-900/30 border border-red-700 rounded-lg p-2 mb-4 text-center text-sm">
              {seriesError}
            </div>
          )}
        </>
      )}

      {/* Affichage contenu selon l'onglet actif */}
      {activeTab === 'films' ? (
        (filteredMovies.length === 0 && !searching) ? (
          <div className="text-center py-16">
            <Film className="h-10 w-10 mx-auto mb-4 text-gray-500" />
            <h2 className="text-xl font-semibold mb-2">Aucun film trouvé</h2>
            <p className="text-gray-400 mb-6">
              {searchTerm
                ? `Aucun résultat pour "${searchTerm}".`
                : `Revenez bientôt pour découvrir les nouveaux films ajoutés !`}
            </p>
          </div>
        ) : (
          <>
            {searching && (
              <div className="text-center text-gray-400 mb-6">Recherche...</div>
            )}
            {filteredMovies.length > 0 && (
              <>
                <h2 className="text-2xl font-bold mt-8 mb-4 flex items-center gap-2">
                  <Film className="w-6 h-6 text-primary" /> Films récents
                </h2>
                <div
                  className="grid gap-3"
                  style={{
                    gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))"
                  }}
                >
                  {filteredMovies.slice(0, 20).map((movie) => (
                    <div key={movie.id} className="w-[140px] mx-auto">
                      <NouveauteCard
                        item={movie}
                        type="film"
                        isUserVIP={!!isVIP}
                      />
                    </div>
                  ))}
                </div>
              </>
            )}
          </>
        )
      ) : activeTab === 'series' ? (
        (filteredSeries.length === 0 && !searching) ? (
          <div className="text-center py-16">
            <Tv className="h-10 w-10 mx-auto mb-4 text-gray-500" />
            <h2 className="text-xl font-semibold mb-2">Aucune série trouvée</h2>
            <p className="text-gray-400 mb-6">
              {searchTerm
                ? `Aucun résultat pour "${searchTerm}".`
                : `Revenez bientôt pour découvrir les nouvelles séries ajoutées !`}
            </p>
          </div>
        ) : (
          <>
            {searching && (
              <div className="text-center text-gray-400 mb-6">Recherche...</div>
            )}
            {filteredSeries.length > 0 && (
              <>
                <h2 className="text-2xl font-bold mt-8 mb-4 flex items-center gap-2">
                  <Tv className="w-6 h-6 text-purple-400" /> Séries récentes
                </h2>
                <div
                  className="grid gap-3"
                  style={{
                    gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))"
                  }}
                >
                  {filteredSeries.slice(0, 20).map((serie) => (
                    <div key={serie.id} className="w-[140px] mx-auto">
                      <NouveauteCard
                        item={serie}
                        type="serie"
                        isUserVIP={!!isVIP}
                      />
                    </div>
                  ))}
                </div>
              </>
            )}
          </>
        )
      ) : (
        // Tab "Tout" : concatène les deux listes, triées par date (création récente en premier)
        (() => {
          const all = [
            ...filteredMovies.map(m => ({...m, _type: "film"})),
            ...filteredSeries.map(s => ({...s, _type: "serie"}))
          ].sort(
            (a, b) =>
              new Date(b.created_at || '').getTime() -
              new Date(a.created_at || '').getTime()
          );
          return all.length === 0 && !searching ? (
            <div className="text-center py-16">
              <Sparkles className="h-10 w-10 mx-auto mb-4 text-gray-500" />
              <h2 className="text-xl font-semibold mb-2">Aucun contenu trouvé</h2>
              <p className="text-gray-400 mb-6">
                {searchTerm
                  ? `Aucun résultat pour "${searchTerm}".`
                  : `Revenez bientôt pour découvrir les nouveaux contenus ajoutés !`}
              </p>
            </div>
          ) : (
            <>
              {searching && (
                <div className="text-center text-gray-400 mb-6">Recherche...</div>
              )}
              {all.length > 0 && (
                <div
                  className="grid gap-3"
                  style={{
                    gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))"
                  }}
                >
                  {all.slice(0, 20).map((item: any) => (
                    <div key={item.id + "_" + item._type} className="w-[140px] mx-auto">
                      <NouveauteCard
                        item={item}
                        type={item._type}
                        isUserVIP={!!isVIP}
                      />
                    </div>
                  ))}
                </div>
              )}
            </>
          );
        })()
      )}
    </main>
  );
}

function NouveauteCard({
  item,
  type,
  isUserVIP,
}: {
  item: Movie | Series;
  type: 'film' | 'serie';
  isUserVIP: boolean;
}) {
  const isVIP = 'isVIP' in item && item.isVIP;
  const poster = (item as Movie | Series).poster || '/placeholder-poster.png';
  const year =
    type === 'film'
      ? (item as Movie).year
      : `${(item as Series).startYear ?? ''}${(item as Series).endYear ? ` - ${(item as Series).endYear}` : ''}`;

  return (
    <Link
      href={`/${type === 'film' ? 'films' : 'series'}/${item.id}`}
      className={`group block bg-gray-800 rounded-lg overflow-hidden transition-transform duration-300 hover:scale-105 hover:shadow-lg ${
        isVIP && !isUserVIP ? 'opacity-70' : ''
      }`}
    >
      <div className="relative aspect-[2/3]">
        <img
          src={poster}
          alt={`Poster ${type === 'film' ? 'du film' : 'de la série'} "${item.title}"`}
          className="w-full h-full object-cover"
          loading="lazy"
        />
        {isVIP && (
          <div className="absolute top-2 right-2">
            <VipBadge />
          </div>
        )}
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          {type === 'film' ? (
            <Film className="h-10 w-10 text-white" />
          ) : (
            <Tv className="h-10 w-10 text-white" />
          )}
        </div>
      </div>
      <div className="p-3">
        <div className="flex justify-between items-start">
          <h3 className="font-semibold truncate text-sm flex-1">{item.title}</h3>
          {/* Place for future rating or popularity */}
        </div>
        <p className="text-xs text-gray-400">{year}</p>
      </div>
    </Link>
  );
}