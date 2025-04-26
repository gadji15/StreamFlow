"use client";
import { useEffect, useState } from 'react';
import { useParams, notFound } from 'next/navigation';
import { Play, Star, Calendar, Clock, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { VipBadge } from '@/components/vip-badge'; // Assurez-vous que ce composant existe
import { CommentsSection } from '@/components/comments-section'; // Assurez-vous que ce composant existe

// Simuler une fonction pour récupérer les détails d'un film par ID
async function getMovieById(id: string) {
  // Remplacez ceci par votre appel API réel
  await new Promise(resolve => setTimeout(resolve, 500)); // Simuler la latence
  const mockMovies = [
    { id: '1', title: 'Inception', year: 2010, isVIP: false, posterUrl: '/placeholder-poster.png', description: 'Description détaillée pour Inception...', rating: 4.8, duration: 148, genres: ['Action', 'Sci-Fi'], trailerUrl: 'https://www.youtube.com/watch?v=YoHD9XEInc0' },
    { id: '2', title: 'The Matrix', year: 1999, isVIP: true, posterUrl: '/placeholder-poster.png', description: 'Description détaillée pour The Matrix...', rating: 4.7, duration: 136, genres: ['Action', 'Sci-Fi'], trailerUrl: 'https://www.youtube.com/watch?v=m8e-FF8MsqU' },
  ];
  const movie = mockMovies.find(m => m.id === id);
  return movie;
}

export default function FilmDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const [movie, setMovie] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetchMovie = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const fetchedMovie = await getMovieById(id);
        if (!fetchedMovie) {
          setError("Film non trouvé.");
          notFound(); // Déclenche la page 404 si le film n'est pas trouvé
        } else {
          setMovie(fetchedMovie);
        }
      } catch (err) {
        console.error("Erreur de chargement du film:", err);
        setError("Impossible de charger les détails du film.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchMovie();
  }, [id]);

  if (isLoading) {
    return <div className="container mx-auto px-4 py-8 text-center">Chargement...</div>;
  }

  if (error) {
    // La fonction notFound() redirige vers la page 404, donc ce message ne devrait pas s'afficher si notFound() est appelé.
    return <div className="container mx-auto px-4 py-8 text-center text-red-500">{error}</div>;
  }

  if (!movie) {
    // Ceci est une sécurité supplémentaire au cas où notFound() n'est pas appelé
    return notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Poster */}
        <div className="w-full md:w-1/3 lg:w-1/4 flex-shrink-0">
          <img src={movie.posterUrl} alt={`Affiche de ${movie.title}`} className="w-full rounded-lg shadow-lg" />
          {movie.isVIP && <div className="mt-2"><VipBadge /></div>}
        </div>

        {/* Détails */}
        <div className="flex-1">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">{movie.title}</h1>
          <div className="flex items-center space-x-4 text-gray-400 mb-4">
            <span className="flex items-center"><Calendar className="mr-1 h-4 w-4" /> {movie.year}</span>
            <span className="flex items-center"><Clock className="mr-1 h-4 w-4" /> {Math.floor(movie.duration / 60)}h {movie.duration % 60}min</span>
            <span className="flex items-center"><Star className="mr-1 h-4 w-4 text-yellow-400" /> {movie.rating}/10</span>
          </div>
          <div className="flex flex-wrap gap-2 mb-6">
            {movie.genres.map((genre: string) => (
              <span key={genre} className="px-3 py-1 bg-gray-700 text-xs rounded-full">{genre}</span>
            ))}
          </div>
          <p className="text-gray-300 mb-6">{movie.description}</p>
          <div className="flex flex-wrap gap-4">
            <Button size="lg">
              <Play className="mr-2 h-5 w-5" /> Regarder
            </Button>
            <Button variant="outline" size="lg">
              <Info className="mr-2 h-5 w-5" /> Bande-annonce
            </Button>
          </div>
        </div>
      </div>

      {/* Section Commentaires */}
      <div className="mt-12">
        <h2 className="text-2xl font-semibold mb-6">Commentaires</h2>
        <CommentsSection contentId={id} contentType="movie" />
      </div>
    </div>
  );
}