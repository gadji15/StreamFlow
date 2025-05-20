"use client";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import LoadingScreen from "@/components/loading-screen";
import { Button } from "@/components/ui/button";

export default function EpisodeWatchPage() {
  const { id, episodeId } = useParams();
  const [episode, setEpisode] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchEpisode() {
      setIsLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from("episodes")
        .select("*")
        .eq("id", episodeId)
        .single();

      if (error || !data) {
        setError("Épisode introuvable.");
        setIsLoading(false);
        return;
      }

      setEpisode(data);
      setIsLoading(false);
    }
    if (episodeId) fetchEpisode();
  }, [episodeId]);

  if (isLoading) return <LoadingScreen />;
  if (error || !episode) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <div className="bg-red-900/50 border border-red-700 rounded-lg p-6">
          <h2 className="text-2xl font-bold mb-2">Erreur</h2>
          <p className="text-gray-300">{error || "Épisode introuvable"}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex items-center gap-4">
        <h1 className="text-2xl font-bold text-primary">
          Épisode {episode.episode_number}
        </h1>
        <span className="text-lg font-semibold text-gray-100">
          {episode.title}
        </span>
      </div>
      {episode.poster || episode.thumbnail_url ? (
        <img
          src={episode.poster || episode.thumbnail_url}
          alt={`Affiche de l'épisode ${episode.episode_number}`}
          className="w-full max-w-md rounded-lg shadow mb-6"
        />
      ) : null}
      <div className="bg-gray-800 p-4 rounded-lg mb-4">
        <p className="text-gray-200">{episode.description}</p>
      </div>
      <div className="flex gap-4 items-center">
        {episode.runtime && (
          <span className="text-gray-400 text-sm">
            Durée : {episode.runtime} min
          </span>
        )}
        {episode.video_url && (
          <Button
            asChild
            size="lg"
            className="bg-primary text-white"
          >
            <a href={episode.video_url} target="_blank" rel="noopener noreferrer">
              Voir la vidéo
            </a>
          </Button>
        )}
      </div>
    </div>
  );
}