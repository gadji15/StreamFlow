'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronRight, Film, Tv, PlayCircle } from 'lucide-react';
import { getPopularMovies, getMoviesByGenre, Movie } from '@/lib/supabaseFilms';
import { getPopularSeries, getSeriesByGenre, Series } from '@/lib/supabaseSeries';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { useWatchHistory } from '@/hooks/use-watch-history';
import FilmCard from '@/components/FilmCard';
import SeriesCard from '@/components/SeriesCard';

function useResponsiveCount() {
  const [count, setCount] = useState(7);
  useEffect(() => {
    function handleResize() {
      if (window.innerWidth < 400) setCount(2);
      else if (window.innerWidth < 600) setCount(3);
      else if (window.innerWidth < 900) setCount(4);
      else if (window.innerWidth < 1080) setCount(6);
      else if (window.innerWidth < 1400) setCount(7);
      else if (window.innerWidth < 1800) setCount(8);
      else setCount(9);
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
                year: (() => {
                  // Robust: handle startYear/endYear, start_year/end_year, or fallback to ''
                  const sy = (item as any).startYear ?? (item as any).start_year;
                  const ey = (item as any).endYear ?? (item as any).end_year;
                  if (sy && ey) return `${sy} - ${ey}`;
                  if (sy) return String(sy);
                  if (ey) return String(ey);
                  return (item as any).year ?? "";
                })(),
                isVIP: (item as any).isVIP ?? false
              }}
            />
          )
        )}
      </div>
    );
  };

  const { user } = useSupabaseAuth();
  const { history, loading: historyLoading } = useWatchHistory();
  const [resumeItems, setResumeItems] = useState<any[]>([]);
  const [loadingResume, setLoadingResume] = useState(false);

  // Récupère les contenus à reprendre (en cours, non completed, max 12)
  useEffect(() => {
    async function fetchResumeContent() {
      if (!user || !history || history.length === 0) {
        setResumeItems([]);
        return;
      }
      setLoadingResume(true);
      const itemsInProgress = history.filter(h => !h.completed && ((h.progress ?? 0) > 0));
      const filmIds = itemsInProgress.filter(h => h.film_id).map(h => h.film_id as string);
      const episodeIds = itemsInProgress.filter(h => h.episode_id).map(h => h.episode_id as string);

      // Batch fetch films/episodes (backdrop, title etc.)
      const [filmsRes, episodesRes] = await Promise.all([
        filmIds.length
          ? fetch(`/api/fetch-multiple?table=films&ids=${filmIds.join(",")}`).then(r => r.json())
          : [],
        episodeIds.length
          ? fetch(`/api/fetch-multiple?table=episodes&ids=${episodeIds.join(",")}`).then(r => r.json())
          : [],
      ]);

      // Map pour accès rapide par id
      const filmsMap: { [key: string]: any } = {};
      if (Array.isArray(filmsRes)) for (const f of filmsRes) filmsMap[f.id] = f;
      const episodesMap: { [key: string]: any } = {};
      if (Array.isArray(episodesRes)) for (const e of episodesRes) episodesMap[e.id] = e;

      // Compose list: {id, type, title, backdrop, progress, link}
      const results = [];
      for (const h of itemsInProgress.slice(0, 12)) {
        if (h.film_id && filmsMap[h.film_id]) {
          const film = filmsMap[h.film_id];
          results.push({
            id: h.film_id,
            type: "film",
            title: film.title,
            backdrop: film.backdrop || film.backdrop_url || film.poster,
            progress: h.progress,
            link: `/films/${film.id}`,
          });
        } else if (h.episode_id && episodesMap[h.episode_id]) {
          const ep = episodesMap[h.episode_id];
          results.push({
            id: h.episode_id,
            type: "episode",
            title: ep.title ?? `Épisode ${ep.episode_number}`,
            backdrop: ep.backdrop || ep.thumbnail_url || ep.poster,
            progress: h.progress,
            link: `/series/${ep.series_id}/watch/${ep.id}`,
          });
        }
      }
      setResumeItems(results);
      setLoadingResume(false);
    }
    fetchResumeContent();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, history]);

  return (
    <section className={`mb-8 ${className}`}>
      {/* Section Reprendre ma lecture */}
      {user && (loadingResume || resumeItems.length > 0) && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-bold flex items-center gap-2">Reprendre ma lecture</h3>
            <Link
              href="/mon-compte/historique"
              className="text-xs font-medium text-violet-400 hover:underline hover:text-violet-300 transition"
            >
              Voir tout
            </Link>
          </div>
          <div className="flex space-x-3 overflow-x-auto pb-2">
            {loadingResume
              ? [...Array(4)].map((_, i) => (
                  <div
                    key={i}
                    className="w-44 h-24 rounded-lg bg-gray-800 animate-pulse flex-shrink-0"
                  />
                ))
              : resumeItems.map(item => (
                  <Link
                    key={item.type + ":" + item.id}
                    href={item.link}
                    className="relative w-44 h-24 rounded-lg overflow-hidden flex-shrink-0 group transition-all hover:scale-105 focus-visible:ring-2 ring-violet-400"
                  >
                    <img
                      src={item.backdrop || "/placeholder-backdrop.jpg"}
                      alt={item.title}
                      className="absolute inset-0 w-full h-full object-cover object-center"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                    <div className="absolute bottom-2 left-2 right-2 z-10">
                      <span className="block text-white text-xs font-semibold truncate drop-shadow-sm">{item.title}</span>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 h-2 bg-gray-700/60">
                      <div
                        className="h-full bg-gradient-to-r from-purple-500 to-violet-500 rounded-full"
                        style={{ width: `${Math.min(item.progress ?? 0, 100)}%` }}
                      />
                    </div>
                    <div className="absolute top-2 left-2">
                      {item.type === "film" ? (
                        <Film className="h-4 w-4 text-white" />
                      ) : (
                        <PlayCircle className="h-4 w-4 text-white" />
                      )}
                    </div>
                  </Link>
                ))}
          </div>
        </div>
      )}

      {/* Section principale */}
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