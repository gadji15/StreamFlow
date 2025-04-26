"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

const genres = [
  { id: 1, name: "Action", icon: "🔥", count: 42 },
  { id: 2, name: "Comédie", icon: "😂", count: 38 },
  { id: 3, name: "Drame", icon: "😢", count: 56 },
  { id: 4, name: "Science-Fiction", icon: "🚀", count: 31 },
  { id: 5, name: "Horreur", icon: "👻", count: 27 },
  { id: 6, name: "Romantique", icon: "❤️", count: 34 },
  { id: 7, name: "Thriller", icon: "🔍", count: 29 },
  { id: 8, name: "Documentaire", icon: "📚", count: 18 },
  { id: 9, name: "Animation", icon: "🎬", count: 23 },
  { id: 10, name: "Fantastique", icon: "🧙‍♂️", count: 25 },
  { id: 11, name: "Aventure", icon: "🏝️", count: 30 },
  { id: 12, name: "Crime", icon: "🔪", count: 22 }
];

export default function CategoriesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredGenres, setFilteredGenres] = useState(genres);
  
  useEffect(() => {
    if (searchQuery) {
      setFilteredGenres(
        genres.filter((genre) =>
          genre.name.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    } else {
      setFilteredGenres(genres);
    }
  }, [searchQuery]);
  
  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-500 to-blue-500 text-transparent bg-clip-text mb-8">
        Catégories
      </h1>
      
      <div className="mb-8">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Rechercher une catégorie"
          className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 focus:outline-none focus:border-purple-500"
        />
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filteredGenres.map((genre) => (
          <Link key={genre.id} href={`/categories/${genre.id}`}>
            <Card className="bg-gray-800 border-gray-700 hover:bg-gray-700 transition-colors duration-200">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <span className="text-2xl mr-2">{genre.icon}</span>
                  {genre.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-400">{genre.count} titres</p>
              </CardContent>
              <CardFooter>
                <p className="text-sm text-gray-400">Explorer &rarr;</p>
              </CardFooter>
            </Card>
          </Link>
        ))}
      </div>
      
      {filteredGenres.length === 0 && (
        <div className="text-center text-gray-400 py-12">
          Aucune catégorie trouvée pour "{searchQuery}"
        </div>
      )}
    </div>
  );
}