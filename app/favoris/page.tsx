"use client";

import { useEffect, useState } from "react";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { supabase } from "@/lib/supabaseClient";
import FilmCard from "@/components/FilmCard";
import SeriesCard from "@/components/SeriesCard";
import LoadingScreen from "@/components/loading-screen";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Film, Tv, Heart, Sparkles, Clapperboard } from "lucide-react";

type ItemType = "film" | "serie" | "episode";
type FavItem = { type: ItemType; data: any };

export default function FavorisPage() {
  const { user } = useCurrentUser();
  const [loading, setLoading] = useState(true);
  const [filmFavorites, setFilmFavorites] = useState<any[]>([]);
  const [seriesFavorites, setSeriesFavorites] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"tout" | "films" | "series" | "episodes">("tout");
  const [episodeFavorites, setEpisodeFavorites] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);

    // Fetch favorites for films, series, and episodes (nouvelle logique universelle)
    const fetchFavorites = async () => {
      try {
        const { data: favorites, error: favError } = await supabase
          .from("favorites")
          .select("content_id, type, created_at")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (favError) throw favError;

        const filmIds = favorites
          .filter((f: any) => f.type === "film")
          .map((f: any) => f.content_id);
        const seriesIds = favorites
          .filter((f: any) => f.type === "serie")
          .map((f: any) => f.content_id);
        const episodeIds = favorites
          .filter((f: any) => f.type === "episode")
          .map((f: any) => f.content_id);

        let films: any[] = [];
        let series: any[] = [];
        let episodes: any[] = [];

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

        if (episodeIds.length > 0) {
          const { data: episodeData, error: episodeError } = await supabase
            .from("episodes")
            .select("*, season:season_id(season_number), series:series_id(title, poster)")
            .in("id", episodeIds);
          if (episodeError) throw episodeError;
          episodes = episodeIds
            .map((id: string) => episodeData.find((e: any) => e.id === id))
            .filter(Boolean);
        }

        setFilmFavorites(films);
        setSeriesFavorites(series);
        setEpisodeFavorites(episodes);
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
    ...episodeFavorites.map((e) => ({ type: "episode" as const, data: e })),
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
        <button
          className={`px-3 py-1.5 sm:px-6 sm:py-2 rounded-t-lg font-semibold border-b-2 transition-all flex items-center gap-1.5 sm:gap-2 text-sm sm:text-base ${
            activeTab === 'episodes'
              ? 'bg-gray-900 border-blue-400 text-blue-400 shadow'
              : 'bg-gray-800 border-transparent text-gray-400 hover:text-blue-400'
          }`}
          onClick={() => setActiveTab('episodes')}
          aria-selected={activeTab === 'episodes'}
        >
          <Clapperboard className={`inline-block h-4 w-4 sm:h-5 sm:w-5 transition-colors duration-200 ${
            activeTab === 'episodes' ? 'text-blue-400' : 'text-gray-400'
          }`} />
          Épisodes
        </button>
      </div>

      {/* Content */}
      <div className="mt-8">
        

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
                  gridTemplateColumns: "repeat(auto-fit, minmax(140px, 180px))"
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
                  gridTemplateColumns: "repeat(auto-fit, minmax(140px, 180px))"
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

        {activeTab === 'episodes' && (
          <>
            <h2 className="text-base sm:text-2xl font-semibold mb-6 text-center">Épisodes favoris</h2>
            {episodeFavorites.length === 0 ? (
              <div className="text-gray-400 text-lg py-12 text-center">
                Aucun épisode favori pour l’instant.
              </div>
            ) : (
              <div
                className="grid gap-4"
                style={{
                  gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))"
                }}
              >
                {episodeFavorites.map((ep) => (
                  <div
                    key={ep.id}
                    className="w-[160px] bg-gray-900/70 rounded-xl p-3 flex flex-col items-center justify-between shadow transition"
                  >
                    <div className="flex flex-col items-center gap-2 w-full">
                      <span className="text-xs text-blue-400 font-semibold mb-1">Épisode favori</span>
                      <img
                        src={ep.thumbnail_url || "/placeholder-poster.png"}
                        alt={ep.title || "Épisode"}
                        className="w-28 h-16 object-cover rounded-lg mb-2"
                      />
                      <div className="text-center">
                        <div className="font-semibold text-sm text-white truncate">
                          {ep.title}
                        </div>
                        <div className="text-xs text-gray-400">
                          S{ep.season?.season_number ?? "?"} • Ep {ep.episode_number ?? "?"}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {ep.series?.title ?? ""}
                        </div>
                      </div>
                    </div>
                    <a
                      href={`/series/${ep.series_id}/watch/${ep.id}`}
                      className="mt-2 text-xs bg-blue-600/80 hover:bg-blue-700 transition-colors text-white font-bold px-3 py-1 rounded shadow"
                    >
                      Regarder l’épisode
                    </a>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}