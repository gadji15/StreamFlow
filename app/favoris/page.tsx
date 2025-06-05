"use client";

import { useEffect, useState } from "react";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { supabase } from "@/lib/supabaseClient";
import FilmCard from "@/components/FilmCard";
import SeriesCard from "@/components/SeriesCard";
import LoadingScreen from "@/components/loading-screen";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function FavorisPage() {
  const { user } = useCurrentUser();
  const [loading, setLoading] = useState(true);
  const [filmFavorites, setFilmFavorites] = useState<any[]>([]);
  const [seriesFavorites, setSeriesFavorites] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
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
        // 1. Fetch all favorites for the user
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

        // 2. Fetch films
        let films: any[] = [];
        let series: any[] = [];

        if (filmIds.length > 0) {
          const { data: filmData, error: filmError } = await supabase
            .from("films")
            .select("*")
            .in("id", filmIds);

          if (filmError) throw filmError;
          // order by favorites order
          films = filmIds
            .map((id: string) => filmData.find((f: any) => f.id === id))
            .filter(Boolean);
        }

        // 3. Fetch series
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

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-24 text-center">
        <h1 className="text-3xl font-bold mb-4">Favoris</h1>
        <p className="mb-6">Vous devez être connecté pour accéder à vos favoris.</p>
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
        <h1 className="text-3xl font-bold mb-4">Favoris</h1>
        <p className="text-red-400">{error}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold mb-10 text-center">Vos favoris</h1>
      <div className="mb-12">
        <h2 className="text-2xl font-semibold mb-6">Films favoris</h2>
        {filmFavorites.length === 0 ? (
          <div className="text-gray-400 text-lg py-12 text-center">
            Aucun film favori pour l’instant.
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
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
      </div>
      <div>
        <h2 className="text-2xl font-semibold mb-6">Séries favorites</h2>
        {seriesFavorites.length === 0 ? (
          <div className="text-gray-400 text-lg py-12 text-center">
            Aucune série favorite pour l’instant.
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
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
      </div>
    </div>
  );
}