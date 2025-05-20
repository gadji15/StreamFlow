'use client';

import { useState } from 'react';
import { Play, Lock, Clock, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { VipBadge } from '@/components/vip-badge';
import { formatDuration } from '@/lib/utils';
// Aligné avec la table Supabase "episodes"
/**
 * Affiche dynamiquement la liste des épisodes d'une saison d'une série.
 * Gère l'affichage VIP, le feedback utilisateur, l'accessibilité et le responsive.
 * Ajoute la gestion de la progression utilisateur (épisodes vus).
 */
export type Episode = {
  id: string;
  title: string;
  description: string;
  season: number;
  episode_number: number;
  duration?: number;
  is_vip?: boolean;
  published?: boolean;
  thumbnail_url?: string;
};

import { useToast } from '@/components/ui/use-toast';
import { useRouter } from 'next/navigation';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useWatchedEpisodes } from '@/hooks/useWatchedEpisodes';

interface SeasonEpisodeListProps {
  episodes: Episode[];
  seriesId: string;
  isVIP: boolean;
}

export default function SeasonEpisodeList({ episodes, seriesId, isVIP }: SeasonEpisodeListProps) {
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useCurrentUser();

  // Progression utilisateur
  const {
    watchedIds,
    loading: loadingWatched,
    markWatched,
    unmarkWatched,
    isWatched,
  } = useWatchedEpisodes(seriesId, user?.id);

  if (episodes.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-400">Aucun épisode disponible pour cette saison.</p>
      </div>
    );
  }

  // Progression
  const watchedCount = episodes.filter((ep) => isWatched(ep.id)).length;

  const handleEpisodeClick = (episode: Episode) => {
    if (episode.is_vip && !isVIP) {
      toast({
        title: "Contenu VIP",
        description: "Cet épisode est réservé aux membres VIP. Abonnez-vous pour le regarder.",
        variant: "destructive",
      });
    } else {
      router.push(`/series/${seriesId}/watch/${episode.id}`);
    }
  };

  return (
    <div>
      {/* Affichage progression */}
      {user && (
        <div className="mb-2 flex items-center gap-3 text-xs text-gray-400">
          <Eye className="w-4 h-4" />
          {watchedCount}/{episodes.length} épisode{episodes.length > 1 ? "s" : ""} vu{watchedCount > 1 ? "s" : ""}
        </div>
      )}
      <div className="space-y-4">
        {episodes.map((episode) => {
          const watched = isWatched(episode.id);
          return (
            <div
              key={episode.id}
              className={`flex flex-col sm:flex-row gap-4 p-4 rounded-lg ${
                episode.is_vip && !isVIP
                  ? "bg-gray-700 opacity-80"
                  : watched
                  ? "bg-green-900/40 border-l-4 border-green-400"
                  : "bg-gray-700 hover:bg-gray-600"
              } transition-colors`}
            >
              {/* Thumbnail ou placeholder */}
              <div className="w-full sm:w-48 h-28 flex-shrink-0 rounded overflow-hidden relative">
                {episode.thumbnail_url ? (
                  <img
                    src={episode.thumbnail_url}
                    alt={`Vignette de ${episode.title}`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                    <Play className="h-8 w-8 text-gray-600" />
                  </div>
                )}

                {/* Overlay VIP pour les épisodes réservés */}
                {episode.is_vip && !isVIP && (
                  <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center">
                    <Lock className="h-8 w-8 text-yellow-500 mb-1" />
                    <VipBadge size="small" variant="subtle" />
                  </div>
                )}
              </div>

              {/* Informations de l'épisode */}
              <div className="flex-1 flex flex-col">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">
                    {episode.season}x{String(episode.episode_number).padStart(2, "0")} : {episode.title}
                  </h3>

                  {episode.is_vip && (
                    <div className="ml-2">
                      <VipBadge size="small" variant="subtle" />
                    </div>
                  )}
                </div>

                <p className="text-sm text-gray-300 mt-1 line-clamp-2">{episode.description}</p>

                <div className="flex items-center mt-auto pt-2 text-xs text-gray-400 gap-4">
                  <span className="flex items-center">
                    <Clock className="mr-1 h-3 w-3" />
                    {episode.duration ? formatDuration(episode.duration) : "Durée inconnue"}
                  </span>
                  {/* Marquer comme vu */}
                  {user && !(episode.is_vip && !isVIP) && (
                    <button
                      type="button"
                      className={`ml-2 text-xs rounded px-2 py-1 border ${
                        watched
                          ? "bg-green-700/40 border-green-500 text-green-300"
                          : "bg-gray-800 border-gray-700 text-gray-400 hover:bg-green-900/30 hover:text-green-200"
                      } transition`}
                      disabled={loadingWatched}
                      aria-label={
                        watched
                          ? "Marquer comme non vu"
                          : "Marquer comme vu"
                      }
                      onClick={() =>
                        watched
                          ? unmarkWatched(episode.id)
                          : markWatched(episode.id)
                      }
                    >
                      {watched ? "Vu ✔" : "Marquer comme vu"}
                    </button>
                  )}
                </div>
              </div>

              {/* Bouton de lecture */}
              <div className="flex sm:flex-col justify-end items-center gap-2 mt-2 sm:mt-0">
                <Button
                  size="sm"
                  className="w-full sm:w-auto"
                  onClick={() => handleEpisodeClick(episode)}
                  disabled={episode.is_vip && !isVIP}
                  aria-label={
                    episode.is_vip && !isVIP
                      ? "Episode réservé aux VIP"
                      : `Regarder ${episode.title}`
                  }
                >
                  <Play className="h-4 w-4 mr-2" />
                  Regarder
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}