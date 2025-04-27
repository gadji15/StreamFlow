'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Film, Search, Filter, SlidersHorizontal, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import LoadingScreen from '@/components/loading-screen';
import { getMovieGenres } from '@/lib/firebase/firestore/movies';
import { getMovies, searchMovies, Movie, Genre } from '@/lib/firebase/firestore/films';
import { useAuth } from '@/hooks/use-auth';

export default function FilmsPage() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
  const [showVIP, setShowVIP] = useState<boolean | null>(null);
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isVIP } = useAuth();
  
  // Initialiser les filtres à partir des paramètres d'URL
  useEffect(() => {
    const genre = searchParams?.get('genre');
    const search = searchParams?.get('q');
    const vip = searchParams?.get('vip');
    
    if (genre) setSelectedGenre(genre);
    if (search) setSearchTerm(search);
    if (vip) setShowVIP(vip === 'true');
  }, [searchParams]);
  
  // Charger les genres
  useEffect(() => {
    const loadGenres = async () => {
      try {
        const genresList = await getMovieGenres();
        setGenres(genresList);
      } catch (err) {
        console.error('Error loading genres:', err);
      }
    };
    
    loadGenres();
  }, []);
  
  // Charger les films
  useEffect(() => {
    const loadMovies = async () => {
      setLoading(true);
      setError(null);
      
      try {
        let result;
        
        // Utiliser searchMovies si un terme de recherche est fourni
        if (searchTerm && searchTerm.trim() !== '') {
          result = await searchMovies(searchTerm, {
            isPublished: true,
            isVIP: showVIP === null ? undefined : showVIP,
            genres: selectedGenre ? [selectedGenre] : undefined,
            pageSize: 50
          });
        } else {
          // Sinon utiliser getMovies pour le filtrage standard
          result = await getMovies({
            isPublished: true,
            isVIP: showVIP === null ? undefined : showVIP,
            genres: selectedGenre ? [selectedGenre] : undefined,
            pageSize: 50
          });
        }
        
        setMovies(result.movies);
      } catch (err) {
        console.error('Error loading movies:', err);
        setError('Erreur lors du chargement des films. Veuillez réessayer.');
      } finally {
        setLoading(false);
      }
    };
    
    loadMovies();
  }, [selectedGenre, showVIP, searchTerm]);
  
  // Mettre à jour les paramètres d'URL lorsque les filtres changent
  useEffect(() => {
    const params = new URLSearchParams();
    
    if (selectedGenre) params.set('genre', selectedGenre);
    if (searchTerm) params.set('q', searchTerm);
    if (showVIP !== null) params.set('vip', showVIP.toString());
    
    const queryString = params.toString();
    const url = queryString ? `/films?${queryString}` : '/films';
    
    // Ne pas recharger la page, juste mettre à jour l'URL
    window.history.replaceState({}, '', url);
  }, [selectedGenre, searchTerm, showVIP]);
  
  // Gérer la soumission du formulaire de recherche
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // La recherche est déjà gérée par l'effet
  };
  
  // Réinitialiser les filtres
  const resetFilters = () => {
    setSelectedGenre(null);
    setSearchTerm('');
    setShowVIP(null);
  };
  
  // Afficher l'écran de chargement
  if (loading) {
    return <LoadingScreen />;
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Catalogue des Films</h1>
      
      <div className="bg-gray-800 rounded-lg p-4 mb-6">
        <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Input
              type="search"
              placeholder="Rechercher un film..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2">
            <select
              value={selectedGenre || ''}
              onChange={(e) => setSelectedGenre(e.target.value || null)}
              className="bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-sm"
            >
              <option value="">Tous les genres</option>
              {genres.map((genre) => (
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
            
            {(selectedGenre || searchTerm || showVIP !== null) && (
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
      
      {!loading && movies.length === 0 ? (
        <div className="text-center py-12">
          <Film className="h-12 w-12 mx-auto mb-4 text-gray-500" />
          <h2 className="text-xl font-semibold mb-2">Aucun film trouvé</h2>
          <p className="text-gray-400 mb-6">
            Aucun film ne correspond à vos critères de recherche.
          </p>
          <Button onClick={resetFilters}>
            Voir tous les films
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {movies.map((movie) => (
            <FilmCard 
              key={movie.id} 
              movie={movie} 
              isUserVIP={isVIP}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface FilmCardProps {
  movie: Movie;
  isUserVIP: boolean;
}

function FilmCard({ movie, isUserVIP }: FilmCardProps) {
  // Adapter l'accès aux propriétés en fonction de la structure de l'objet Movie de films.ts
  const { id, title, poster, releaseYear, rating, isVIP } = movie;
  
  // Fallback pour le poster
  const posterSrc = poster || '/placeholder-poster.png';
  
  return (
    <Link 
      href={`/films/${id}`}
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
          <div className="absolute top-2 right-2 bg-gradient-to-r from-amber-400 to-yellow-600 text-black px-1.5 py-0.5 rounded-full text-xs font-bold">
            VIP
          </div>
        )}
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <Film className="h-12 w-12 text-white" />
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
        <p className="text-xs text-gray-400">{releaseYear}</p>
      </div>
    </Link>
  );
}