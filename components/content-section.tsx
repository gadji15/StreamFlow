'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronRight, Film, Tv } from 'lucide-react';
import { getPopularMovies, getMoviesByGenre, Movie } from '@/lib/supabaseFilms';
import { getPopularSeries, getSeriesByGenre, Series } from '@/lib/supabaseSeries';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';

function useResponsiveCount() {
  const [count, setCount] = useState(7);
  useEffect(() => {
    function handleResize() {
      if (window.innerWidth < 400) setCount(2);
      else if (window.innerWidth < 600) setCount(3);
      else if (window.innerWidth < 900) setCount(4);
      else if (window.innerWidth < 1080) setCount(5);
      else if (window.innerWidth < 1400) setCount(6);
      else if (window.innerWidth < 1800) setCount(7);
      else setCount(8);
    }
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  return count;
}

type SectionType = 'popular_movies' | 'popular_series' | 'movies_by_genre' | 'series_by_genre' | 'custom';

interface ContentSectionProps {
  title: string;
  subtitle?: string;
  viewAllLink?: string;
  className?: string;
  children?: React.ReactNode;
  type?: SectionType;
  genreId?: string;
  count?: number;
  hideViewAllButton?: boolean;
  sortBy?: "created_at" | "popularity" | "vote_average";
}

export function ContentSection({
  title,
  subtitle,
  viewAllLink,
  className = '',
  children,
  type = 'custom',
  genreId = '',
  count: countProp = 6,
  hideViewAllButton = false,
  sortBy = "created_at",
}: ContentSectionProps) {
  const responsiveCount = useResponsiveCount();
  const count = type === 'custom' ? countProp : responsiveCount;

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
              data = await getMoviesByGenre(genreId, count, sortBy);
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
      return (
        <div
          className="w-full grid gap-3"
          style={{
            gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))"
          }}
        >
          {children}
        </div>
      );
    }

    if (loading) {
      return (
        <div
          className={`
            w-full
            [display:grid]
            gap-3
            [grid-template-columns:repeat(auto-fit,minmax(140px,1fr))]
          `}
        >
          {[...Array(count)].map((_, i) => (
            <div
              key={i}
              className="bg-gray-800 rounded-md sm:rounded-lg md:rounded-xl animate-pulse flex flex-col items-center"
              style={{
                height: '210px'
              }}
            ></div>
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

    const isMovie = type === 'popular_movies' || type === 'movies_by_genre';

    return (
      <div
        className="w-full grid gap-3"
        style={{
          gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))"
        }}
      >
        {items.slice(0, count).map((item, idx) =>
          isMovie ? (
            <FilmCard
              key={item.id}
              movie={{
                id: String(item.id),
                title: item.title,
                poster: (item as any).poster || (item as any).posterUrl,
                year: (item as any).year,
                isVIP: (item as any).isVIP ?? false
              }}
            />
          ) : (
            <SeriesCard
              key={item.id}
              series={{
                id: String(item.id),
                title: item.title,
                poster: (item as any).poster || (item as any).posterUrl,
                year:
                  (item as any).startYear !== undefined && (item as any).startYear !== null
                    ? String((item as any).startYear) +
                      ((item as any).endYear !== undefined && (item as any).endYear !== null
                        ? ` - ${String((item as any).endYear)}`
                        : '')
                    : "",
                isVIP: (item as any).isVIP ?? false
              }}
            />
          )
        )}
      </div>
    );
  };

  return (
    <section className={`mb-8 ${className}`}>
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-xl font-bold">{title}</h2>
          {subtitle && (
            <p className="text-gray-400 text-sm mt-1">{subtitle}</p>
          )}
        </div>
        {!hideViewAllButton && (
          <Link
            href={
              viewAllLink ||
              (
                type === "popular_movies" ? "/films"
                : type === "popular_series" ? "/series"
                : type === "movies_by_genre" && genreId ? `/films?genre=${genreId}`
                : type === "series_by_genre" && genreId ? `/series?genre=${genreId}`
                : "/"
              )
            }
            className={`
              text-sm flex items-center font-medium
              bg-gradient-to-r from-fuchsia-400 via-pink-400 to-violet-500
              bg-clip-text text-transparent
              underline underline-offset-4
              transition-all duration-300
              hover:bg-none hover:text-violet-400 hover:scale-105
              focus:outline-none
            `}
            style={{
              WebkitTextFillColor: 'transparent',
              background: 'linear-gradient(90deg, #e879f9, #ec4899, #a78bfa)',
              WebkitBackgroundClip: 'text',
              padding: 0,
              border: "none"
            }}
          >
            <span className="underline underline-offset-4">
              Voir tout
            </span>
            <ChevronRight className="h-4 w-4 ml-1 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        )}
      </div>
      {renderContent()}
    </section>
  );
}

export default ContentSection;