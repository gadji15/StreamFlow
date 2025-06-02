'use client';

import { useState } from 'react';
import { Eye } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useRouter } from 'next/navigation';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useWatchedEpisodes } from '@/hooks/useWatchedEpisodes';
import EpisodeCard from './EpisodeCard';

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
        {episodes.map((episode) => (
          <EpisodeCard
            key={episode.id}
            episode={episode}
            watched={isWatched(episode.id)}
            loadingWatched={loadingWatched}
            isVIP={isVIP}
            user={user}
            onMarkWatched={markWatched}
            onUnmarkWatched={unmarkWatched}
            onWatch={handleEpisodeClick}
          />
        ))}
      </div>
    </div>
  );
}