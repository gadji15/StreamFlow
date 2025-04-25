"use client"

import { useState, useEffect } from 'react';
import { getAllMovies, Movie } from '@/lib/firebase/firestore/movies';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Loader2, Edit, Trash2, Film } from 'lucide-react';
import Link from 'next/link';

export default function MoviesList() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        setIsLoading(true);
        const fetchedMovies = await getAllMovies();
        setMovies(fetchedMovies);
        setError(null);
      } catch (err) {
        console.error("Erreur lors du chargement des films:", err);
        setError("Impossible de charger les films. Veuillez réessayer plus tard.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchMovies();
  }, []);

  const getFormattedDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins.toString().padStart(2, '0')}min`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Chargement des films...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500 p-4 rounded-md text-center">
        <p className="text-red-500">{error}</p>
        <Button 
          onClick={() => window.location.reload()} 
          className="mt-4"
          variant="outline"
        >
          Réessayer
        </Button>
      </div>
    );
  }

  if (movies.length === 0) {
    return (
      <div className="text-center p-8 bg-gray-800/30 rounded-lg border border-gray-700">
        <Film className="h-10 w-10 text-gray-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium mb-2">Aucun film trouvé</h3>
        <p className="text-gray-400 mb-4">Commencez par ajouter des films à votre bibliothèque.</p>
        <Link href="/admin/films/add">
          <Button>Ajouter un film</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="rounded-md border border-gray-700 overflow-hidden">
      <Table>
        <TableHeader className="bg-gray-800/50">
          <TableRow>
            <TableHead className="text-white">Titre</TableHead>
            <TableHead className="text-white">Année</TableHead>
            <TableHead className="text-white hidden md:table-cell">Genre</TableHead>
            <TableHead className="text-white hidden md:table-cell">Durée</TableHead>
            <TableHead className="text-white hidden md:table-cell">Statut</TableHead>
            <TableHead className="text-white hidden md:table-cell">Vues</TableHead>
            <TableHead className="text-white">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {movies.map((movie) => (
            <TableRow key={movie.id} className="border-gray-800">
              <TableCell className="font-medium text-white">
                <div className="flex items-center">
                  <div className="h-10 w-10 rounded overflow-hidden bg-gray-700 flex items-center justify-center mr-3">
                    {movie.posterUrl ? (
                      <img 
                        src={movie.posterUrl}
                        alt={movie.title}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <Film className="h-4 w-4 text-gray-400" />
                    )}
                  </div>
                  {movie.title}
                </div>
              </TableCell>
              <TableCell>{movie.releaseYear}</TableCell>
              <TableCell className="hidden md:table-cell">{movie.genre}</TableCell>
              <TableCell className="hidden md:table-cell">
                {movie.duration ? getFormattedDuration(movie.duration) : "--"}
              </TableCell>
              <TableCell className="hidden md:table-cell">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  movie.status === "published" 
                    ? "bg-green-500/20 text-green-500" 
                    : "bg-orange-500/20 text-orange-500"
                }`}>
                  {movie.status === "published" ? "publié" : "brouillon"}
                </span>
              </TableCell>
              <TableCell className="hidden md:table-cell">
                {movie.views || 0}
              </TableCell>
              <TableCell>
                <div className="flex items-center space-x-2">
                  <Link href={`/admin/films/edit/${movie.id}`}>
                    <Button size="icon" variant="ghost" className="text-gray-400 hover:text-white">
                      <Edit className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Button 
                    size="icon" 
                    variant="ghost" 
                    className="text-gray-400 hover:text-red-500"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}