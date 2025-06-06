"use client";

import { useEffect, useState } from "react";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { supabase } from "@/lib/supabaseClient";
import FilmCard from "@/components/FilmCard";
import SeriesCard from "@/components/SeriesCard";
import LoadingScreen from "@/components/loading-screen";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Film, Tv, Heart, Sparkles } from "lucide-react";

type ItemType = "film" | "serie";
type FavItem = { type: ItemType; data: any };

export default function FavorisPage() {
  const { user } = useCurrentUser();
  const [loading, setLoading] = useState(true);
  const [filmFavorites, setFilmFavorites] = useState<any[]>([]);
  const [seriesFavorites, setSeriesFavorites] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"tout" | "films" | "series">("tout");
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);

    // Fetch favorites for films and series
    const fetchFavorites = async () => {
      try {
        const { data: favorites, error: favError } = await supabase
          .from("favorites")
          .select("film_id, series_id, created_at")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (favError) throw favError;

        const filmIds = favorites
          .filter((f: any) => f.film_id)
          .map((f: any) => f.film_id);
        const seriesIds = favorites
          .filter((f: any) => f.series_id)
          .map((f: any) => f.series_id);

        let films: any[] = [];
        let series: any[] = [];

        if (filmIds.length > 0) {
          const { data: filmData, error: filmError } = await supabase
            .from("films")
            .select("*")
            .in("id", filmIds);
          if (filmError) throw filmError;
          films = filmIds
            .map((id: string) => filmData.find((f: any) => f.id === id))
            .filter(Boolean);
        }

        if (seriesIds.length > 0) {
          const { data: seriesData, error: seriesError } = await supabase
            .from("series")
            .select("*")
            .in("id", seriesIds);
          if (seriesError) throw seriesError;
          series = seriesIds
            .map((id: string) => seriesData.find((s: any) => s.id === id))
            .filter(Boolean);
        }

        setFilmFavorites(films);
        setSeriesFavorites(series);
      } catch (e: any) {
        setError(e.message ?? "Erreur lors du chargement des favoris");
      } finally {
        setLoading(false);
      }
    };

    fetchFavorites();
  }, [user]);

  const allFavs: FavItem[] = [
    ...filmFavorites.map((f) => ({ type: "film" as const, data: f })),
    ...seriesFavorites.map((s) => ({ type: "serie" as const, data: s })),
  ].sort(
    (a, b) =>
      new Date(b.data.created_at ?? 0).getTime() -
      new Date(a.data.created_at ?? 0).getTime()
  );

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-24 text-center">
        <h1 className="text-lg sm:text-4xl font-bold mb-4">Favoris</h1>
        <p className="mb-6 text-sm sm:text-base">Vous devez être connecté pour accéder à vos favoris.</p>
        <Button onClick={() => router.push("/login")}>Se connecter</Button>
      </div>
    );
  }

  if (loading) {
    return <LoadingScreen />;
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-24 text-center">
        <h1 className="text-lg sm:text-4xl font-bold mb-4">Favoris</h1>
        <p className="text-red-400">{error}</p>
      </div>
    );
  }

  // Responsive tabs & grid just like the "nouveautés" page
  return (
    <div className="container mx-auto px-4 py-10">
      <h1 className="text-lg sm:text-4xl font-bold text-center mb-4 flex items-center justify-center gap-2">
        <Heart className="text-pink-500 w-6 h-6 sm:w-8 sm:h-8" /> Vos favoris
      </h1>
      <p className="text-xs sm:text-base text-center text-gray-400 mb-8 max-w-2xl mx-auto">
        Retrouver ici tous vos films et séries favoris sauvegardés sur StreamFlow.
      </p>

      {/* Tabs */}
      <div className="flex justify-center mb-6 gap-1 sm:gap-2">
        <button
          className={`px-3 py-1.5 sm:px-6 sm:py-2 rounded-t-lg font-semibold border-b-2 transition-all flex items-center gap-1.5 sm:gap-2 text-sm sm:text-base ${
            activeTab === 'tout'
              ? 'bg-gray-900 border-yellow-400 text-yellow-400 shadow'
              : 'bg-gray-800 border-transparent text-gray-400 hover:text-yellow-400'
          }`}
          onClick={() => setActiveTab('tout')}
          aria-selected={activeTab === 'tout'}
        >
          <Sparkles className={`inline-block h-4 w-4 sm:h-5 sm:w-5 transition-colors duration-200 ${
            activeTab === 'tout' ? 'text-yellow-400' : 'text-gray-400'
          }`} />
          Tout
        </button>
        <button
          className={`px-3 py-1.5 sm:px-6 sm:py-2 rounded-t-lg font-semibold border-b-2 transition-all flex items-center gap-1.5 sm:gap-2 text-sm sm:text-base ${
            activeTab === 'films'
              ? 'bg-gray-900 border-primary text-primary shadow'
              : 'bg-gray-800 border-transparent text-gray-400 hover:text-primary'
          }`}
          onClick={() => setActiveTab('films')}
          aria-selected={activeTab === 'films'}
        >
          <Film className={`inline-block h-4 w-4 sm:h-5 sm:w-5 transition-colors duration-200 ${
            activeTab === 'films' ? 'text-primary' : 'text-gray-400'
          }`} />
          Films
        </button>
        <button
          className={`px-3 py-1.5 sm:px-6 sm:py-2 rounded-t-lg font-semibold border-b-2 transition-all flex items-center gap-1.5 sm:gap-2 text-sm sm:text-base ${
            activeTab === 'series'
              ? 'bg-gray-900 border-purple-400 text-purple-400 shadow'
              : 'bg-gray-800 border-transparent text-gray-400 hover:text-purple-400'
          }`}
          onClick={() => setActiveTab('series')}
          aria-selected={activeTab === 'series'}
        >
          <Tv className={`inline-block h-4 w-4 sm:h-5 sm:w-5 transition-colors duration-200 ${
            activeTab === 'series' ? 'text-purple-400' : 'text-gray-400'
          }`} />
          Séries
        </button>
      </div>

      {/* Content */}
      <div className="mt-8">
        {activeTab === 'tout' && (
          <>
            {allFavs.length === 0 ? (
              <div className="text-gray-400 text-lg py-12 text-center">
                Aucun favori pour l’instant.
              </div>
            ) : (
              <div
                className="grid gap-3"
                style={{
                  gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))"
                }}
              >
                {allFavs.map((item) =>
                  item.type === "film" ? (
                    <FilmCard
                      key={item.data.id}
                      movie={{
                        id: item.data.id,
                        title: item.data.title,
                        poster: item.data.poster,
                        year: item.data.year,
                        isVIP: item.data.is_vip ?? item.data.isVIP
                      }}
                    />
                  ) : (
                    <SeriesCard
                      key={item.data.id}
                      series={{
                        id: item.data.id,
                        title: item.data.title,
                        poster: item.data.poster,
                        year: item.data.year,
                        isVIP: item.data.is_vip ?? item.data.isVIP
                      }}
                    />
                  )
                )}
              </div>
            )}
          </>
        )}

        {activeTab === 'films' && (
          <>
            <h2 className="text-base sm:text-2xl font-semibold mb-6 text-center">Films favoris</h2>
            {filmFavorites.length === 0 ? (
              <div className="text-gray-400 text-lg py-12 text-center">
                Aucun film favori pour l’instant.
              </div>
            ) : (
              <div
                className="grid gap-3"
                style={{
                  gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))"
                }}
              >
                {filmFavorites.map((film) => (
                  <FilmCard
                    key={film.id}
                    movie={{
                      id: film.id,
                      title: film.title,
                      poster: film.poster,
                      year: film.year,
                      isVIP: film.is_vip ?? film.isVIP
                    }}
                  />
                ))}
              </div>
            )}
          </>
        )}

        {activeTab === 'series' && (
          <>
            <h2 className="text-base sm:text-2xl font-semibold mb-6 text-center">Séries favorites</h2>
            {seriesFavorites.length === 0 ? (
              <div className="text-gray-400 text-lg py-12 text-center">
                Aucune série favorite pour l’instant.
              </div>
            ) : (
              <div
                className="grid gap-3"
                style={{
                  gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))"
                }}
              >
                {seriesFavorites.map((serie) => (
                  <SeriesCard
                    key={serie.id}
                    series={{
                      id: serie.id,
                      title: serie.title,
                      poster: serie.poster,
                      year: serie.year,
                      isVIP: serie.is_vip ?? serie.isVIP
                    }}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}