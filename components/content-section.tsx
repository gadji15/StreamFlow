'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronRight, Film, Tv } from 'lucide-react';
import { getPopularMovies, getMoviesByGenre, Movie } from '@/lib/supabaseFilms';
import { getPopularSeries, getSeriesByGenre, Series } from '@/lib/supabaseSeries';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import CarouselRail from '@/components/ui/carousel-rail';

type SectionType = 'popular_movies' | 'popular_series' | 'movies_by_genre' | 'series_by_genre' | 'custom';

interface ContentSectionProps {
  title: string;
  viewAllLink?: string;
  className?: string;
  children?: React.ReactNode;
  type?: SectionType;
  genreId?: string;
  count?: number;
  hideViewAllButton?: boolean;
}

/**
 * Section de contenu responsive qui adapte dynamiquement le nombre de contenus
 * affichés selon la taille de la plateforme et le carrousel, pour une UX ultra professionnelle.
 */
export function ContentSection({
  title,
  viewAllLink,
  className = '',
  children,
  type = 'custom',
  genreId = '',
  count = 6,
  hideViewAllButton = false,
  ...props
}: ContentSectionProps & { [key:string]: any }) {
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
      // Affichage d'un nombre de skeletons égal au count (responsive)
      return (
        <div className="flex gap-3 xs:gap-4 overflow-x-auto pb-2 px-2 xs:px-3 sm:px-0">
          {[...Array(count)].map((_, i) => (
            <div
              key={i}
              className="bg-gray-800 rounded-lg animate-pulse aspect-[2/3]"
              style={{
                height: 160,
                minWidth: 100,
                maxWidth: 130,
                width: window?.innerWidth && window.innerWidth < 480 ? '48vw' : 110
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
      <CarouselRail
        items={items}
        slidesToShow={count}
        minSlideWidth={110}
        maxSlideWidth={130}
        ariaLabel={title}
        renderItem={(item, idx) => (
          <Link
            key={item.id}
            href={`/${isMovie ? 'films' : 'series'}/${item.id}`}
            className="block bg-gray-800 rounded-lg overflow-hidden transition-transform hover:scale-105 group w-full"
            style={{ minWidth: 100, maxWidth: 130 }}
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
                onError={e => {
                  (e.target as HTMLImageElement).src = '/placeholder-poster.png';
                }}
                loading="lazy"
                style={{ maxHeight: 180, minHeight: 130 }}
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
              <h3 className="text-xs font-medium truncate">{item.title}</h3>
              <p className="text-[11px] text-gray-400">
                {isMovie
                  ? (item as Movie).year
                  : `${(item as Series).startYear ?? ''}${
                      (item as Series).endYear ? ` - ${(item as Series).endYear}` : ''
                    }`}
              </p>
            </div>
          </Link>
        )}
      />
    );
  };

  return (
    <section
      className={`mb-6 xs:mb-7 sm:mb-8 px-2 xs:px-3 sm:px-0 w-full ${className}`}
    >
      <div className="flex flex-col gap-2 xs:flex-row xs:gap-0 xs:justify-between xs:items-center mb-3 xs:mb-4">
        <h2 className="text-lg xs:text-xl font-bold">{title}</h2>
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
            className="text-xs xs:text-sm flex items-center underline underline-offset-4 text-fuchsia-400 font-medium transition-colors bg-clip-text mt-1 xs:mt-0"
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
            <ChevronRight className="h-3 w-3 xs:h-4 xs:w-4 ml-0.5 xs:ml-1 voir-tout-gradient" />
          </Link>
        )}
      </div>
      {renderContent()}
    </section>
  );
}

export default ContentSection;