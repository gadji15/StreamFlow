"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Film } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FilmIcon } from "@heroicons/react/outline";
import { useToast } from "@/components/ui/use-toast";

const fakeMovies = [
  { id: 1, title: "Inception" },
  { id: 2, title: "The Matrix" },
  // Add more fake movies here for testing
];

export default function FilmsPage() {
  const [title, setTitle] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredMovies, setFilteredMovies] = useState(fakeMovies);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { toast } = useToast();

  // Simulates loading movie list
  useEffect(() => {
    const fetchMovies = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Simulate API call
        const fakeResponse = [...fakeMovies];

        // Apply search filtering
        const filteredMovies = fakeResponse.filter((movie) =>
          movie.title.toLowerCase().includes(searchQuery.toLowerCase())
        );

        setFilteredMovies(filteredMovies);
      } catch (error: any) {
        console.error("Erreur lors de la récupération des films:", error);
        setError("Erreur de récupération des films. Veuillez réessayer.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchMovies();
  }, [searchQuery]);

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleMovieClick = (id: number) => {
    router.push(`/films/${id}`);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-500 to-blue-500 text-transparent bg-clip-text">
          Liste des films
        </h1>
        <div className="flex items-center space-x-2">
          <Input
            type="text"
            value={searchQuery}
            onChange={handleSearchInputChange}
            placeholder="Rechercher un film..."
            className="bg-gray-800 border-gray-700 p-2 max-w-xs"
          />
        </div>
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {isLoading ? (
            <>
              <div className="animate-pulse bg-gray-800 h-48 rounded-lg" />
              <div className="animate-pulse bg-gray-800 h-48 rounded-lg" />
              <div className="animate-pulse bg-gray-800 h-48 rounded-lg" />
              <div className="animate-pulse bg-gray-800 h-48 rounded-lg" />
            </>
          ) : error ? (
            <div className="text-red-500 text-center w-full">
              {error}
              <button
                className="bg-red-600 text-white px-4 py-2 rounded-lg mt-2"
                onClick={() => setError(null)}
              >
                Réessayer
              </button>
            </div>
          ) : (
            filteredMovies.map((movie) => (
              <div
                key={movie.id}
                className="bg-gray-900 p-4 rounded-lg text-center cursor-pointer hover:bg-indigo-500 hover:text-white hover:shadow-lg transition duration-300 ease-in-out"
                onClick={() => handleMovieClick(movie.id)}
              >
                <FilmIcon className="h-12 w-12 text-indigo-500 mx-auto mb-2" />
                <p>{movie.title}</p>
              </div>
            ))
          )}
        </div>

        {filteredMovies.length === 0 && !isLoading && (
          <div className="text-gray-500 text-center w-full">
            Aucun film trouvé pour "{searchQuery}"
          </div>
        )}
      </div>
    </div>
  );
}