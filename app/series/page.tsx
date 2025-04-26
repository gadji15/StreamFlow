"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Tv, Search, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { VipBadge } from '@/components/vip-badge'; // Assurez-vous que ce composant existe

// Simuler une liste de séries (remplacer par vos données réelles)
const mockSeries = [
  { id: '1', title: 'Stranger Things', year: 2016, isVIP: false, posterUrl: '/placeholder-poster.png' },
  { id: '2', title: 'The Mandalorian', year: 2019, isVIP: true, posterUrl: '/placeholder-poster.png' },
  { id: '3', title: 'Breaking Bad', year: 2008, isVIP: false, posterUrl: '/placeholder-poster.png' },
  { id: '4', title: 'Game of Thrones', year: 2011, isVIP: true, posterUrl: '/placeholder-poster.png' },
];

export default function SeriesPage() {
  const [series, setSeries] = useState(mockSeries);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredSeries, setFilteredSeries] = useState(mockSeries);
  const [isLoading, setIsLoading] = useState(false);

  // Filtrer les séries basé sur le terme de recherche
  useEffect(() => {
    const results = series.filter(serie =>
      serie.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredSeries(results);
  }, [searchTerm, series]);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Catalogue des Séries</h1>

      <div className="flex flex-col md:flex-row gap-4 mb-8">
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
        <Button variant="outline">
          <Filter className="mr-2 h-4 w-4" /> Filtrer
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="bg-gray-800 rounded-lg animate-shimmer aspect-[2/3]"></div>
          ))}
        </div>
      ) : filteredSeries.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {filteredSeries.map((serie) => (
            <Link key={serie.id} href={`/series/${serie.id}`} className="group block bg-gray-800 rounded-lg overflow-hidden transition-transform duration-300 hover:scale-105 hover:shadow-lg">
              <div className="relative aspect-[2/3]">
                <img
                  src={serie.posterUrl}
                  alt={`Affiche de ${serie.title}`}
                  className="w-full h-full object-cover"
                />
                {serie.isVIP && (
                  <div className="absolute top-2 right-2">
                    <VipBadge />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <Tv className="h-12 w-12 text-white" />
                </div>
              </div>
              <div className="p-3">
                <h3 className="font-semibold truncate text-sm">{serie.title}</h3>
                <p className="text-xs text-gray-400">{serie.year}</p>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-500 py-10">Aucune série ne correspond à votre recherche.</p>
      )}
    </div>
  );
}