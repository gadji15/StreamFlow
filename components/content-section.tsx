'use client';

import React, { useState, useEffect } from 'react';

// Responsive hook pour choisir dynamiquement le nombre de contenus à afficher selon la largeur d'écran
function useResponsiveCount() {
  const [count, setCount] = useState(7);
  useEffect(() => {
    function handleResize() {
      if (window.innerWidth < 400) setCount(1);
      else if (window.innerWidth < 600) setCount(2);
      else if (window.innerWidth < 900) setCount(3);
      else if (window.innerWidth < 1080) setCount(4);
      else if (window.innerWidth < 1400) setCount(5);
      else if (window.innerWidth < 1800) setCount(6);
      else setCount(7);
    }
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  return count;
}
import Link from 'next/link';
import { ChevronRight, Film, Tv } from 'lucide-react';
import { getPopularMovies, getMoviesByGenre, Movie } from '@/lib/supabaseFilms';
import { getPopularSeries, getSeriesByGenre, Series } from '@/lib/supabaseSeries';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';

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
}: ContentSectionProps) {
  // Utilise un count responsive si le composant n'est pas en mode custom
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
      // Affichage classique en ligne unique, sans scroll horizontal
      return (
        <div className="flex gap-4 flex-nowrap w-full">
          {children}
        </div>
      );
    }

    if (loading) {
      // Skeletons responsives sur une seule ligne
      return (
        <div className="flex gap-4 flex-nowrap w-full">
          {[...Array(count)].map((_, i) => (
            <div
              key={i}
              className={`bg-gray-800 rounded-lg animate-pulse`}
              style={{
                width: '100%',
                minWidth: 100,
                height: 180,
                maxWidth: 160,
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

    // Affichage en une seule ligne, responsive, sans scroll
    return (
      <div
        className={`
          w-full
          flex flex-row flex-nowrap gap-4
          overflow-hidden
        `}
      >
        {items.slice(0, count).map((item, idx) => (
          <Link
            key={item.id}
            href={`/${isMovie ? 'films' : 'series'}/${item.id}`}
            className="block bg-gray-800 overflow-hidden transition-transform hover:scale-105 group w-full"
            style={{
              minWidth: count <= 2 ? 160 : 100,
              maxWidth: count <= 2 ? 260 : 130,
            }}
          >
            <div className="relative aspect-[2/3]">
              <img
                src={
                  (item as Movie | Series).poster ||
                  (item as any).posterUrl ||
                  '/placeholder-poster.png'
                }
                alt={item.title}
                className={`w-full h-full object-cover transition-all duration-300 ${count <= 2 ? 'rounded-xl' : 'rounded-lg'}`}
                onError={e => {
                  (e.target as HTMLImageElement).src = '/placeholder-poster.png';
                }}
                loading="lazy"
                style={{
                  maxHeight: count <= 2 ? 320 : count === 3 ? 260 : count === 4 ? 200 : 180,
                  minHeight: count <= 2 ? 180 : 130,
                }}
              />
              {'isVIP' in item && item.isVIP && (
                <div className="absolute top-2 right-2 bg-gradient-to-r from-amber-400 to-yellow-600 text-black px-1.5 py-0.5 rounded-full text-xs font-bold">
                  VIP
                </div>
              )}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                {isMovie ? (
                  <Film className="w-7 h-7 text-white" />
                ) : (
                  <Tv className="w-7 h-7 text-white" />
                )}
              </div>
            </div>
            <div className="p-2">
              <h3 className={`truncate font-medium ${count <= 2 ? 'text-base' : count === 3 ? 'text-sm' : 'text-xs'}`}>{item.title}</h3>
              <p className="text-[11px] text-gray-400">
                {isMovie
                  ? (item as Movie).year
                  : `${(item as Series).startYear ?? ''}${
                      (item as Series).endYear ? ` - ${(item as Series).endYear}` : ''
                    }`}
              </p>
            </div>
          </Link>
        ))}
      </div>
    );
  };

  return (
    <section className={`mb-8 ${className}`}>
      {/* Header section avec bouton "Voir plus" positionné intelligemment */}
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
            className="
              text-sm flex items-center underline underline-offset-4 text-fuchsia-400 font-medium transition-colors bg-clip-text
              sm:static sm:order-none
              absolute right-0 top-0 order-2
              sm:relative sm:right-auto sm:top-auto
            "
            style={{ background: "transparent", padding: 0, border: "none" }}
            onMouseEnter={e => {
              e.currentTarget.classList.add('gradient-text');
            }}
            onMouseLeave={e => {
              e.currentTarget.classList.remove('gradient-text');
            }}
          >
            <span className="voir-tout-gradient">
              Voir tout
            </span>
            <ChevronRight className="h-4 w-4 ml-1 voir-tout-gradient" />
          </Link>
        )}
      </div>
      {renderContent()}
    </section>
  );
}

export default ContentSection;