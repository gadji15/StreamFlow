"use client";
import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import LoadingScreen from "@/components/loading-screen";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import SimilarFilmsGrid from "@/components/films/SimilarFilmsGrid";
import { Play, ArrowLeft, Info, Calendar, Clock, Film as FilmIcon } from "lucide-react";

export default function FilmWatchPage() {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();

  const [film, setFilm] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchFilm() {
      setLoading(true);
      const { data, error } = await supabase
        .from("films")
        .select("*")
        .eq("id", id)
        .single();
      setFilm(data || null);
      setLoading(false);
    }
    if (id) fetchFilm();
  }, [id]);

  if (loading) return <LoadingScreen />;
  if (!film)
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="bg-red-900/70 border border-red-700 rounded-lg px-8 py-6 shadow-xl">
          <h2 className="text-2xl font-bold mb-2">Film introuvable</h2>
          <Button size="xl" className="mt-3 rounded-2xl" onClick={() => router.back()}>
            <ArrowLeft className="mr-2" /> Retour
          </Button>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-gray-950 flex flex-col">
      {/* Header/Meta */}
      <div className="w-full max-w-5xl mx-auto pt-8 px-4 md:px-0 flex flex-col md:flex-row md:items-center gap-6 md:gap-10">
        <Button
          variant="outline"
          size="xl"
          className="rounded-2xl shadow-sm mb-2 md:mb-0"
          onClick={() => router.push(`/films/${film.id}`)}
        >
          <ArrowLeft className="w-5 h-5 mr-1" />
          Retour à la fiche film
        </Button>
        <div className="flex-1 flex flex-col gap-2">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
              <FilmIcon className="w-7 h-7 text-primary" /> {film.title}
              {film.is_vip && (
                <Badge variant="secondary" className="ml-2 text-amber-400 bg-amber-900/60 border-amber-800/80">
                  VIP
                </Badge>
              )}
            </h1>
            <span className="flex items-center gap-1 text-gray-400 text-base">
              <Calendar className="w-4 h-4" /> {film.year}
            </span>
            <span className="flex items-center gap-1 text-gray-400 text-base">
              <Clock className="w-4 h-4" /> {film.duration} min
            </span>
            <span className="flex items-center gap-1 text-gray-400 text-base">
              <Info className="w-4 h-4" /> {film.genre}
            </span>
          </div>
          <p className="text-gray-300 mt-1 text-base">{film.description}</p>
        </div>
      </div>
      {/* Video Player */}
      <div className="w-full flex justify-center items-center my-8 px-2">
        <div className="w-full max-w-4xl aspect-video bg-black/80 rounded-2xl shadow-2xl overflow-hidden flex items-center justify-center relative">
          {film.video_url ? (
            <video
              src={film.video_url}
              controls
              poster={film.poster}
              className="w-full h-full object-contain bg-black"
              style={{ maxHeight: "80vh" }}
              autoPlay
            />
          ) : (
            <span className="text-lg text-gray-400 p-10">Vidéo indisponible.</span>
          )}
        </div>
      </div>
      {/* Similar/recommendations */}
      <div className="w-full max-w-5xl mx-auto px-2 pb-12">
        <h2 className="text-xl font-bold mb-4 mt-6">Films similaires</h2>
        <SimilarFilmsGrid currentMovieId={film.id} tmdbId={film.tmdb_id} />
      </div>
    </div>
  );
}