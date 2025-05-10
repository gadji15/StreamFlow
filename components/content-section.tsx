'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronRight, Film, Tv } from 'lucide-react';
import { getPopularMovies, getMoviesByGenre, Movie } from '@/lib/firebase/firestore/movies';
import { getPopularSeries, Series } from '@/lib/firebase/firestore/series';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';

interface ContentSectionProps {
  title: string;
  viewAllLink?: string;
  className?: string;
  children?: React.ReactNode;
  type?: 'popular_movies' | 'popular_series' | 'movies_by_genre' | 'custom';
  genreId?: string;
  count?: number;
}

export function ContentSection({ 
  title, 
  viewAllLink, 
  className = '', 
  children,
  type = 'custom',
  genreId = '',
  count = 6
}: ContentSectionProps) {
  const [items, setItems] = useState<Movie[] | Series[]>([]);
  const [loading, setLoading] = useState(false);
  const { isVIP } = useAuth();
  
  useEffect(() => {
    // Si c'est un contenu personnalisé, ne pas charger de données
    if (type === 'custom') return;
    
    const loadContent = async () => {
      setLoading(true);
      try {
        switch (type) {
          case 'popular_movies':
            const movies = await getPopularMovies(count);
            setItems(movies);
            break;
          case 'popular_series':
            const series = await getPopularSeries(count);
            setItems(series);
            break;
          case 'movies_by_genre':
            if (genreId) {
              const genreMovies = await getMoviesByGenre(genreId, count);
              setItems(genreMovies);
            }
            break;
        }
      } catch (error) {
        console.error('Erreur lors du chargement du contenu:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadContent();
  }, [type, genreId, count]);
  
  const renderContent = () => {
    if (children) {
      return children;
    }
    
    if (loading) {
      return (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {[...Array(count)].map((_, i) => (
            <div key={i} className="bg-gray-800 rounded-lg animate-pulse h-64"></div>
          ))}
        </div>
      );
    }
    
    if (items.length === 0) {
      return (
        <div className="text-center py-10">
          <p className="text-gray-400">Aucun contenu disponible</p>
        </div>
      );
    }
    
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {items.map((item) => (
          <Link 
            key={item.id} 
            href={`/${type.includes('movie') ? 'films' : 'series'}/${item.id}`}
            className="block bg-gray-800 rounded-lg overflow-hidden transition-transform hover:scale-105 group"
          >
            <div className="relative aspect-[2/3]">
              <img 
                src={item.posterUrl || '/placeholder-poster.png'} 
                alt={item.title}
                className="w-full h-full object-cover"
              />
              {'isVIP' in item && item.isVIP && (
                <div className="absolute top-2 right-2 bg-gradient-to-r from-amber-400 to-yellow-600 text-black px-1.5 py-0.5 rounded-full text-xs font-bold">
                  VIP
                </div>
              )}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                {type.includes('movie') ? 
                  <Film className="w-10 h-10 text-white" /> : 
                  <Tv className="w-10 h-10 text-white" />
                }
              </div>
            </div>
            <div className="p-2">
              <h3 className="text-sm font-medium truncate">{item.title}</h3>
              <p className="text-xs text-gray-400">
                {type.includes('movie') ? 
                  (item as Movie).year : 
                  `${(item as Series).startYear}${(item as Series).endYear ? ` - ${(item as Series).endYear}` : ''}`
                }
              </p>
            </div>
          </Link>
        ))}
      </div>
    );
  };
  
  return (
    <section className={`mb-8 ${className}`}>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">{title}</h2>
        
        {viewAllLink && (
          <Link 
            href={viewAllLink}
            className="text-sm text-gray-400 hover:text-primary flex items-center"
          >
            Voir tout
            <ChevronRight className="h-4 w-4 ml-1" />
          </Link>
        )}
      </div>
      
      {renderContent()}
    </section>
  );
}

export default ContentSection;