'use client';

import { Play, Lock, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { VipBadge } from '@/components/vip-badge';

type Episode = {
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

interface EpisodeCardProps {
  episode: Episode;
  watched: boolean;
  loadingWatched: boolean;
  isVIP: boolean;
  user: any;
  onMarkWatched: (id: string) => void;
  onUnmarkWatched: (id: string) => void;
  onWatch: (ep: Episode) => void;
}

export default function EpisodeCard({
  episode,
  watched,
  loadingWatched,
  isVIP,
  user,
  onMarkWatched,
  onUnmarkWatched,
  onWatch,
}: EpisodeCardProps) {
  return (
    <div
      className="relative w-full aspect-[2/3] rounded-md overflow-hidden shadow-sm group cursor-pointer bg-gray-800"
    >
      {/* Poster spécifique ou placeholder */}
      {episode.thumbnail_url ? (
        <img
          src={episode.thumbnail_url}
          alt={`Poster de ${episode.title}`}
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-gray-900">
          <Play className="h-10 w-10 text-gray-600" />
        </div>
      )}

      {/* Overlay infos/interactions */}
      {/* Fond sombre en hover/focus pour lisibilité */}
      <div className="absolute inset-0 flex flex-col justify-between opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 bg-black/50 transition-opacity">
        {/* En haut : badges VIP et vu */}
        <div className="flex justify-between items-start p-1">
          {episode.is_vip && (
            <VipBadge size="small" variant="subtle" />
          )}
          {watched && (
            <span className="ml-auto text-green-400 bg-black/60 rounded-full px-1 py-0.5 flex items-center text-xs gap-1">
              <Check className="h-4 w-4" /> Vu
            </span>
          )}
        </div>
        {/* En bas : titre, numéro, actions */}
        <div className="flex flex-col items-stretch px-1 pb-1">
          <div className="flex items-center gap-1 justify-between">
            <span className="text-xs font-bold text-white bg-black/50 rounded px-1 py-0.5">
              S{episode.season}E{String(episode.episode_number).padStart(2, "0")}
            </span>
            {user && !(episode.is_vip && !isVIP) && (
              <button
                type="button"
                className={`rounded-full border border-white/30 text-white bg-black/40 p-1 text-xs hover:bg-green-700/60 focus:outline-none`}
                disabled={loadingWatched}
                aria-label={
                  watched
                    ? "Marquer comme non vu"
                    : "Marquer comme vu"
                }
                onClick={e => {
                  e.stopPropagation();
                  watched
                    ? onUnmarkWatched(episode.id)
                    : onMarkWatched(episode.id);
                }}
              >
                {watched ? <Check className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            )}
            <Button
              size="icon"
              className="ml-1 h-7 w-7 p-0 bg-primary/90 text-white rounded-full hover:bg-primary focus:outline-none"
              onClick={e => {
                e.stopPropagation();
                onWatch(episode);
              }}
              disabled={episode.is_vip && !isVIP}
              aria-label={
                episode.is_vip && !isVIP
                  ? "Episode réservé aux VIP"
                  : `Regarder ${episode.title}`
              }
            >
              <Play className="h-4 w-4" />
            </Button>
          </div>
          <div className="mt-1 text-xs text-white text-center line-clamp-1 font-medium drop-shadow-sm w-full px-1">
            {episode.title}
          </div>
        </div>
      </div>
      {/* Overlay pour accès direct au clic partout sur la carte */}
      <button
        type="button"
        className="absolute inset-0 w-full h-full outline-none focus:ring-2 focus:ring-primary/70"
        tabIndex={0}
        aria-label={
          episode.is_vip && !isVIP
            ? "Episode réservé aux VIP"
            : `Regarder ${episode.title}`
        }
        onClick={e => {
          e.stopPropagation();
          onWatch(episode);
        }}
      />
      {/* Overlay VIP lock si non VIP */}
      {episode.is_vip && !isVIP && (
        <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center z-10">
          <Lock className="h-8 w-8 text-yellow-500 mb-1" />
          <VipBadge size="small" variant="subtle" />
        </div>
      )}
    </div>
  );
}