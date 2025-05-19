'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Film, Search, Star, Loader2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { getFilms, Movie } from '@/lib/supabaseFilms';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';

const GENRES = [
  { value: '', label: 'Tous les genres' },
  { value: 'action', label: 'Action' },
  { value: 'comedy', label: 'Comédie' },
  { value: 'drama', label: 'Drame' },
  { value: 'animation', label: 'Animation' },
  { value: 'family', label: 'Famille' },
  { value: 'sci-fi', label: 'Science-Fiction' },
  { value: 'adventure', label: 'Aventure' },
  { value: 'documentary', label: 'Documentaire' }
  // Ajoutez d'autres genres selon votre base
];

export default function FilmsPage() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGenre, setSelectedGenre] = useState<string>('');
  const [showVIP, setShowVIP] = useState<string>(''); // '', 'true', 'false'
  const [debouncedTerm, setDebouncedTerm] = useState('');
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const searchParams = useSearchParams();
  const { isVIP } = useSupabaseAuth();

  // Init filters from URL
  useEffect(() => {
    const genre = searchParams?.get('genre') || '';
    const search = searchParams?.get('q') || '';
    const vip = searchParams?.get('vip') || '';
    setSelectedGenre(genre);
    setSearchTerm(search);
    setShowVIP(vip);
  }, [searchParams]);

  // Debounce search input for real-time experience
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    setSearching(true);
    debounceRef.current = setTimeout(() => {
      setDebouncedTerm(searchTerm.trim());
      setSearching(false);
    }, 400);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [searchTerm]);

  // Fetch movies from Supabase, filtered server-side if possible
  useEffect(() => {
    const fetchMovies = async () => {
      setLoading(true);
      setError(null);
      try {
        let query = getFilms();
        let results = await query;

        // Filtrage côté client pour l'instant (ajoutez côté serveur si vous souhaitez)
        if (selectedGenre) {
          results = results.filter(m => (m.genre || '').toLowerCase().includes(selectedGenre.toLowerCase()));
        }
        if (showVIP === 'true') {
          results = results.filter(m => !!m.isVIP);
        } else if (showVIP === 'false') {
          results = results.filter(m => !m.isVIP);
        }
        if (debouncedTerm) {
          const term = debouncedTerm.toLowerCase();
          results = results.filter(m => m.title.toLowerCase().includes(term));
        }

        setMovies(results);
      } catch (err) {
        setError("Erreur lors du chargement des films. Veuillez réessayer.");
        setMovies([]);
      } finally {
        setLoading(false);
      }
    };
    fetchMovies();
  }, [selectedGenre, showVIP, debouncedTerm]);

  // Update URL
  useEffect(() => {
    const params = new URLSearchParams();
    if (selectedGenre) params.set('genre', selectedGenre);
    if (searchTerm) params.set('q', searchTerm);
    if (showVIP) params.set('vip', showVIP);
    const url = params.toString() ? `/films?${params.toString()}` : '/films';
    window.history.replaceState({}, '', url);
  }, [selectedGenre, searchTerm, showVIP]);

  const resetFilters = () => {
    setSelectedGenre('');
    setSearchTerm('');
    setShowVIP('');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 flex items-center gap-2">
        <Film className="w-7 h-7 text-primary" /> Catalogue des Films
      </h1>

      <div className="bg-gray-800 rounded-lg p-4 mb-6 shadow">
        <form
          onSubmit={e => e.preventDefault()}
          className="flex flex-col md:flex-row gap-4"
        >
          <div className="relative flex-1">
            <Input
              type="search"
              placeholder="Rechercher un film..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-10"
              autoFocus
            />
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400"
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <select
              value={selectedGenre}
              onChange={e => setSelectedGenre(e.target.value)}
              className="bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-sm"
            >
              {GENRES.map(g => (
                <option key={g.value} value={g.value}>{g.label}</option>
              ))}
            </select>
            <select
              value={showVIP}
              onChange={e => setShowVIP(e.target.value)}
              className="bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-sm"
            >
              <option value="">Tous les contenus</option>
              <option value="false">Contenus gratuits</option>
              <option value="true">Contenus VIP</option>
            </select>
            {(selectedGenre || searchTerm || showVIP) && (
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
        {searching && (
          <div className="flex items-center gap-2 mt-2 text-gray-400 text-sm">
            <Loader2 className="animate-spin h-4 w-4" /> Recherche...
          </div>
        )}
      </div>

      {error && (
        <div className="bg-red-900/50 border border-red-700 rounded-lg p-4 mb-6 text-center">
          {error}
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="bg-gray-800 rounded-lg animate-pulse h-72"></div>
          ))}
        </div>
      ) : movies.length === 0 ? (
        <div className="text-center py-16">
          <Sparkles className="h-10 w-10 mx-auto mb-4 text-gray-500" />
          <h2 className="text-xl font-semibold mb-2">Aucun film trouvé</h2>
          <p className="text-gray-400 mb-6">
            {debouncedTerm || selectedGenre || showVIP
              ? "Aucun film ne correspond à vos critères."
              : "Aucun film disponible pour le moment."}
          </p>
          {(selectedGenre || searchTerm || showVIP) && (
            <Button onClick={resetFilters}>
              Voir tous les films
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {movies.map((movie) => (
            <FilmCard key={movie.id} movie={movie} isUserVIP={isVIP ?? false} />
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
  const { id, title, poster, year, popularity, isVIP } = movie;
  const posterSrc = poster || '/placeholder-poster.png';

  return (
    <Link
      href={`/films/${id}`}
      className={`group block bg-gray-800 rounded-lg overflow-hidden transition-transform duration-300 hover:scale-105 hover:shadow-lg ${
        isVIP && !isUserVIP ? 'opacity-70' : ''
      }`}
      tabIndex={0}
      aria-label={title}
    >
      <div className="relative aspect-[2/3]">
        <img
          src={posterSrc}
          alt={`Affiche de ${title}`}
          className="w-full h-full object-cover transition group-hover:brightness-90"
          loading="lazy"
        />
        {isVIP && (
          <div className="absolute top-2 right-2 bg-gradient-to-r from-amber-400 to-yellow-600 text-black px-1.5 py-0.5 rounded-full text-xs font-bold shadow">
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
          {popularity && (
            <div className="flex items-center ml-2">
              <Star className="h-3 w-3 text-yellow-400 fill-current" />
              <span className="text-xs ml-0.5">{popularity}</span>
            </div>
          )}
        </div>
        <p className="text-xs text-gray-400">{year}</p>
      </div>
    </Link>
  );
}
