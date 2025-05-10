'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Film, Tv, Sparkles, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getFilms, Movie } from '@/lib/supabaseFilms';
import { getSeries, Series } from '@/lib/supabaseSeries';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import LoadingScreen from '@/components/loading-screen';
import { VipBadge } from '@/components/vip-badge';

export default function NouveautePage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [series, setSeries] = useState<Series[]>([]);
  const { isVIP } = useSupabaseAuth();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        // On prend les 12 dernières nouveautés de films et séries
        const moviesData = await getFilms();
        const seriesData = await getSeries();

        setMovies(
          moviesData
            .sort((a, b) => new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime())
            .slice(0, 12)
        );
        setSeries(
          seriesData
            .sort((a, b) => new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime())
            .slice(0, 12)
        );
      } catch (e) {
        setError("Impossible de charger les nouveautés. Veuillez réessayer.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <main className="container mx-auto px-4 py-10">
      <h1 className="text-4xl font-bold text-center mb-4 flex items-center justify-center gap-2">
        <Sparkles className="text-yellow-400 w-8 h-8" /> Nouveautés
      </h1>
      <p className="text-center text-gray-400 mb-8 max-w-2xl mx-auto">
        Découvrez les derniers films et séries ajoutés à notre catalogue. Profitez de nouveautés exclusives et des incontournables fraîchement arrivés !
      </p>
      {error && (
        <div className="bg-red-900/50 border border-red-700 rounded-lg p-4 mb-6 text-center">
          {error}
        </div>
      )}

      {(movies.length === 0 && series.length === 0) ? (
        <div className="text-center py-16">
          <Sparkles className="h-10 w-10 mx-auto mb-4 text-gray-500" />
          <h2 className="text-xl font-semibold mb-2">Aucune nouveauté disponible</h2>
          <p className="text-gray-400 mb-6">
            Revenez bientôt pour découvrir les nouveaux contenus ajoutés !
          </p>
        </div>
      ) : (
        <>
          {movies.length > 0 && (
            <>
              <h2 className="text-2xl font-bold mt-8 mb-4 flex items-center gap-2">
                <Film className="w-6 h-6 text-primary" /> Films récents
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                {movies.map((movie) => (
                  <NouveauteCard
                    key={movie.id}
                    item={movie}
                    type="film"
                    isUserVIP={isVIP}
                  />
                ))}
              </div>
            </>
          )}

          {series.length > 0 && (
            <>
              <h2 className="text-2xl font-bold mt-12 mb-4 flex items-center gap-2">
                <Tv className="w-6 h-6 text-purple-400" /> Séries récentes
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                {series.map((serie) => (
                  <NouveauteCard
                    key={serie.id}
                    item={serie}
                    type="serie"
                    isUserVIP={isVIP}
                  />
                ))}
              </div>
            </>
          )}
        </>
      )}
    </main>
  );
}

function NouveauteCard({
  item,
  type,
  isUserVIP,
}: {
  item: Movie | Series;
  type: 'film' | 'serie';
  isUserVIP: boolean;
}) {
  const isVIP = 'isVIP' in item && item.isVIP;
  const poster = (item as Movie | Series).poster || '/placeholder-poster.png';
  const year =
    type === 'film'
      ? (item as Movie).year
      : `${(item as Series).startYear ?? ''}${(item as Series).endYear ? ` - ${(item as Series).endYear}` : ''}`;

  return (
    <Link
      href={`/${type === 'film' ? 'films' : 'series'}/${item.id}`}
      className={`group block bg-gray-800 rounded-lg overflow-hidden transition-transform duration-300 hover:scale-105 hover:shadow-lg ${
        isVIP && !isUserVIP ? 'opacity-70' : ''
      }`}
    >
      <div className="relative aspect-[2/3]">
        <img
          src={poster}
          alt={item.title}
          className="w-full h-full object-cover"
        />
        {isVIP && (
          <div className="absolute top-2 right-2">
            <VipBadge />
          </div>
        )}
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          {type === 'film' ? (
            <Film className="h-10 w-10 text-white" />
          ) : (
            <Tv className="h-10 w-10 text-white" />
          )}
        </div>
      </div>
      <div className="p-3">
        <div className="flex justify-between items-start">
          <h3 className="font-semibold truncate text-sm flex-1">{item.title}</h3>
          {/* Place for future rating or popularity */}
        </div>
        <p className="text-xs text-gray-400">{year}</p>
      </div>
    </Link>
  );
}