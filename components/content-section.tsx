'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { ChevronLeft, ChevronRight, Plus, Play, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { VipBadge } from '@/components/vip-badge';
import { useAuth } from '@/hooks/use-auth';
import { getMovieGenres, getPopularMovies } from '@/lib/firebase/firestore/movies';
import { getPopularSeries } from '@/lib/firebase/firestore/series';

interface ContentSectionProps {
  title: string;
  showHeader?: boolean;
  isRow?: boolean;
  animated?: boolean; 
  type: 'movies' | 'series';
  filter: 'popular' | 'recent' | 'genre' | 'vip';
  genreId?: string;
  limit?: number;
}

interface ContentItem {
  id: string;
  title: string;
  posterUrl?: string;
  year: number;
  rating?: number;
  genres?: string[];
  isVIP: boolean;
}

export default function ContentSection({
  title,
  showHeader = true,
  isRow = true,
  animated = false,
  type,
  filter,
  genreId,
  limit = 12
}: ContentSectionProps) {
  const [items, setItems] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  
  const { isVIP } = useAuth();
  const contentRef = useRef<HTMLDivElement>(null);
  
  // Animation pour l'entrée en view
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1
  });
  
  // Charger les films/séries selon le filtre
  useEffect(() => {
    const loadItems = async () => {
      setLoading(true);
      
      try {
        let fetchedItems: ContentItem[] = [];
        
        // Charger les contenus selon le type et le filtre
        if (type === 'movies') {
          // Films
          if (filter === 'popular') {
            const popularMovies = await getPopularMovies(limit, true, isVIP);
            fetchedItems = popularMovies.map(movie => ({
              id: movie.id!,
              title: movie.title,
              posterUrl: movie.posterUrl,
              year: movie.year,
              rating: movie.rating,
              genres: movie.genres,
              isVIP: movie.isVIP
            }));
          } else if (filter === 'genre' && genreId) {
            // TODO: Implémenter la récupération des films par genre
            const genres = await getMovieGenres();
            const genreName = genres.find(g => g.id === genreId)?.name || genreId;
            
            const genreMovies = await getPopularMovies(limit, true, isVIP);
            fetchedItems = genreMovies.map(movie => ({
              id: movie.id!,
              title: movie.title,
              posterUrl: movie.posterUrl,
              year: movie.year,
              rating: movie.rating,
              genres: movie.genres,
              isVIP: movie.isVIP
            }));
          } else if (filter === 'vip') {
            // Films VIP
            const vipMovies = await getPopularMovies(limit, true, true);
            fetchedItems = vipMovies
              .filter(movie => movie.isVIP)
              .map(movie => ({
                id: movie.id!,
                title: movie.title,
                posterUrl: movie.posterUrl,
                year: movie.year,
                rating: movie.rating,
                genres: movie.genres,
                isVIP: movie.isVIP
              }));
          }
        } else if (type === 'series') {
          // Séries
          if (filter === 'popular') {
            const popularSeries = await getPopularSeries(limit, true, isVIP);
            fetchedItems = popularSeries.map(series => ({
              id: series.id!,
              title: series.title,
              posterUrl: series.posterUrl,
              year: series.startYear,
              rating: series.rating,
              genres: series.genres,
              isVIP: series.isVIP
            }));
          } else if (filter === 'vip') {
            // Séries VIP
            const vipSeries = await getPopularSeries(limit, true, true);
            fetchedItems = vipSeries
              .filter(series => series.isVIP)
              .map(series => ({
                id: series.id!,
                title: series.title,
                posterUrl: series.posterUrl,
                year: series.startYear,
                rating: series.rating,
                genres: series.genres,
                isVIP: series.isVIP
              }));
          }
        }
        
        // Filtrer les contenus VIP si l'utilisateur n'est pas VIP
        if (!isVIP && filter !== 'vip') {
          fetchedItems = fetchedItems.filter(item => !item.isVIP);
        }
        
        setItems(fetchedItems);
      } catch (error) {
        console.error(`Erreur lors du chargement des ${type}:`, error);
      } finally {
        setLoading(false);
      }
    };
    
    loadItems();
  }, [type, filter, genreId, limit, isVIP]);
  
  // Vérifier si le contenu peut défiler
  useEffect(() => {
    const checkScroll = () => {
      if (contentRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = contentRef.current;
        setCanScrollLeft(scrollLeft > 0);
        setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 5); // 5px buffer
      }
    };
    
    const contentElement = contentRef.current;
    if (contentElement) {
      contentElement.addEventListener('scroll', checkScroll);
      checkScroll(); // Vérifier initialement
      
      return () => {
        contentElement.removeEventListener('scroll', checkScroll);
      };
    }
  }, [items, loading]);
  
  // Scroll horizontal
  const scroll = (direction: 'left' | 'right') => {
    if (contentRef.current) {
      const { clientWidth } = contentRef.current;
      const scrollAmount = clientWidth * 0.8; // Scroll 80% of the visible width
      
      contentRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };
  
  // Taille des cartes selon la mise en page et le dispositif
  const cardSizeClass = isRow
    ? 'w-[150px] sm:w-[180px] md:w-[200px] flex-shrink-0'
    : 'w-full';
  
  return (
    <motion.section
      ref={animated ? ref : undefined}
      initial={animated ? { opacity: 0, y: 50 } : undefined}
      animate={animated && inView ? { opacity: 1, y: 0 } : undefined}
      transition={{ duration: 0.5 }}
      className="py-8 px-4"
    >
      <div className="container mx-auto">
        {showHeader && (
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">{title}</h2>
            <Link 
              href={type === 'movies' ? '/films' : '/series'} 
              className="text-sm text-indigo-400 hover:text-indigo-300"
            >
              Voir tout
            </Link>
          </div>
        )}
        
        {loading ? (
          <div className={`${isRow ? 'flex' : 'grid grid-cols-2 sm:grid-cols-4'} gap-4`}>
            {[...Array(isRow ? 6 : 4)].map((_, i) => (
              <div 
                key={i} 
                className={`${cardSizeClass} aspect-[2/3] bg-gray-800 rounded-lg animate-shimmer`}
              ></div>
            ))}
          </div>
        ) : items.length > 0 ? (
          <div className="relative">
            {isRow && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className={`absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-gray-900/80 hover:bg-gray-800/80 rounded-full ${
                    canScrollLeft ? 'opacity-100' : 'opacity-0 pointer-events-none'
                  }`}
                  onClick={() => scroll('left')}
                >
                  <ChevronLeft className="h-6 w-6" />
                </Button>
                
                <Button
                  variant="ghost"
                  size="icon"
                  className={`absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-gray-900/80 hover:bg-gray-800/80 rounded-full ${
                    canScrollRight ? 'opacity-100' : 'opacity-0 pointer-events-none'
                  }`}
                  onClick={() => scroll('right')}
                >
                  <ChevronRight className="h-6 w-6" />
                </Button>
              </>
            )}
            
            <div 
              ref={contentRef} 
              className={`
                ${isRow 
                  ? 'flex overflow-x-auto scrollbar-hide pb-4 -mx-2 px-2' 
                  : 'grid grid-cols-2 sm:grid-cols-4 gap-4'
                }
              `}
            >
              {items.map((item) => (
                <Link
                  key={item.id}
                  href={`/${type === 'movies' ? 'films' : 'series'}/${item.id}`}
                  className={`
                    ${cardSizeClass}
                    ${isRow ? 'mx-2' : ''}
                    group block bg-gray-800 rounded-lg overflow-hidden transition-transform duration-300 hover:scale-105 hover:shadow-lg
                  `}
                >
                  <div className="relative aspect-[2/3]">
                    <img
                      src={item.posterUrl || '/placeholder-poster.png'}
                      alt={`Affiche de ${item.title}`}
                      className="w-full h-full object-cover"
                    />
                    {item.isVIP && (
                      <div className="absolute top-2 right-2">
                        <VipBadge />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      {type === 'movies' ? (
                        <Play className="h-12 w-12 text-white" />
                      ) : (
                        <Plus className="h-12 w-12 text-white" />
                      )}
                    </div>
                  </div>
                  <div className="p-3">
                    <h3 className="font-semibold truncate text-sm">{item.title}</h3>
                    <div className="flex justify-between items-center mt-1 text-xs text-gray-400">
                      <span>{item.year}</span>
                      {item.rating && (
                        <span className="flex items-center">
                          <Star className="h-3 w-3 text-yellow-500 mr-1 fill-current" />
                          {item.rating.toFixed(1)}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ) : (
          <p className="text-center text-gray-400 py-8">
            Aucun contenu disponible pour le moment.
          </p>
        )}
      </div>
    </motion.section>
  );
}