'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronRight, Film, Tv } from 'lucide-react';
import { getPopularMovies, getMoviesByGenre, Movie } from '@/lib/supabaseFilms';
import { getPopularSeries, getSeriesByGenre, Series } from '@/lib/supabaseSeries';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';

type SectionType = 'popular_movies' | 'popular_series' | 'movies_by_genre' | 'series_by_genre' | 'custom';

interface ContentSectionProps {
  title: string;
  viewAllLink?: string;
  className?: string;
  children?: React.ReactNode;
  type?: SectionType;
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
  const [items, setItems] = useState<(Movie | Series)[]>([]);
  const [loading, setLoading] = useState(false);
  const { isVIP } = useSupabaseAuth();

  useEffect(() => {
    if (type === 'custom') return;

    const loadContent = async () => {
      setLoading(true);
      try {
        let data: Movie[] | Series[] = [];
        switch (type) {
          case 'popular_movies':
            data = await getPopularMovies(count);
            break;
          case 'popular_series':
            data = await getPopularSeries(count);
            break;
          case 'movies_by_genre':
            if (genreId) {
              data = await getMoviesByGenre(genreId, count);
            }
            break;
          case 'series_by_genre':
            if (genreId) {
              data = await getSeriesByGenre(genreId, count);
            }
            break;
        }
        setItems(data || []);
      } catch (error) {
        console.error('Erreur lors du chargement du contenu:', error);
        setItems([]);
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
        <div className="flex gap-4 overflow-x-auto pb-2 hide-scrollbar">
          {[...Array(count)].map((_, i) => (
            <div key={i} className="bg-gray-800 rounded-lg animate-pulse h-64 min-w-[160px] md:min-w-[180px]"></div>
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
      <div className="flex gap-4 overflow-x-auto pb-2 hide-scrollbar">
        {items.map((item) => {
          const isMovie = type === 'popular_movies' || type === 'movies_by_genre';
          return (
            <Link
              key={item.id}
              href={`/${isMovie ? 'films' : 'series'}/${item.id}`}
              className="flex-shrink-0 bg-gray-800 rounded-lg overflow-hidden transition-transform hover:scale-105 group min-w-[160px] md:min-w-[180px]"
            >
              <div className="relative aspect-[2/3]">
                <img
                  src={
                    (item as Movie | Series).poster ||
                    (item as any).posterUrl ||
                    '/placeholder-poster.png'
                  }
                  alt={item.title}
                  className="w-full h-full object-cover"
                />
                {'isVIP' in item && item.isVIP && (
                  <div className="absolute top-2 right-2 bg-gradient-to-r from-amber-400 to-yellow-600 text-black px-1.5 py-0.5 rounded-full text-xs font-bold">
                    VIP
                  </div>
                )}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  {isMovie ? (
                    <Film className="w-10 h-10 text-white" />
                  ) : (
                    <Tv className="w-10 h-10 text-white" />
                  )}
                </div>
              </div>
              <div className="p-2">
                <h3 className="text-sm font-medium truncate">{item.title}</h3>
                <p className="text-xs text-gray-400">
                  {isMovie
                    ? (item as Movie).year
                    : `${(item as Series).startYear ?? ''}${
                        (item as Series).endYear ? ` - ${(item as Series).endYear}` : ''
                      }`}
                </p>
              </div>
            </Link>
          );
        })}
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