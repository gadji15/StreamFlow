'use client';

import { Play, Lock, Clock } from 'lucide-react';
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

// Fonction utilitaire locale pour formater la durée en "1h 23min"
function formatDuration(duration: number) {
  if (!duration || isNaN(duration)) return "Durée inconnue";
  const h = Math.floor(duration / 60);
  const m = duration % 60;
  return h > 0 ? `${h}h ${m}min` : `${m}min`;
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
      className={`group flex flex-col items-center sm:items-stretch sm:flex-row gap-2 p-2 rounded-xl shadow-md border border-gray-600 bg-gray-800/80 hover:bg-gray-700 transition-all min-w-[140px] max-w-xs sm:max-w-sm`}
      style={{ width: '100%', maxWidth: 240, minWidth: 140 }}
    >
      {/* Poster spécifique ou placeholder */}
      <div className="w-full max-w-[140px] aspect-[2/3] rounded-lg overflow-hidden relative bg-gray-900 flex-shrink-0 transition-all group-hover:scale-105">
        {episode.thumbnail_url ? (
          <img
            src={episode.thumbnail_url}
            alt={`Poster de ${episode.title}`}
            className="w-full h-full object-cover transition-all"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Play className="h-8 w-8 text-gray-600" />
          </div>
        )}
        {/* Overlay VIP */}
        {episode.is_vip && !isVIP && (
          <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center">
            <Lock className="h-6 w-6 text-yellow-500 mb-1" />
            <VipBadge size="small" variant="subtle" />
          </div>
        )}
      </div>

      {/* Infos */}
      <div className="flex-1 flex flex-col min-w-0 items-center sm:items-start justify-between gap-1">
        <div className="flex items-center justify-between w-full gap-1">
          <h3 className="font-semibold truncate text-xs sm:text-sm">
            {episode.season}x{String(episode.episode_number).padStart(2, "0")} : {episode.title}
          </h3>
          {episode.is_vip && (
            <div className="ml-1">
              <VipBadge size="small" variant="subtle" />
            </div>
          )}
        </div>
        {/* Suppression de la description */}

        <div className="flex items-center mt-1 pt-0.5 text-[11px] sm:text-xs text-gray-400 gap-2 flex-wrap w-full">
          <span className="flex items-center">
            <Clock className="mr-1 h-3 w-3" />
            {episode.duration ? formatDuration(episode.duration) : "Durée inconnue"}
          </span>
          {/* Marquer comme vu */}
          {user && !(episode.is_vip && !isVIP) && (
            <button
              type="button"
              className={`ml-1 text-[11px] sm:text-xs rounded px-1 py-0.5 border ${
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
              onClick={e => {
                e.stopPropagation();
                watched
                  ? onUnmarkWatched(episode.id)
                  : onMarkWatched(episode.id);
              }}
            >
              {watched ? "Vu ✔" : "Vu"}
            </button>
          )}
        </div>

        {/* Bouton lecture */}
        <Button
          size="sm"
          className="mt-2 w-full sm:w-auto h-7 px-2 text-xs flex items-center justify-center"
          onClick={() => onWatch(episode)}
          disabled={episode.is_vip && !isVIP}
          aria-label={
            episode.is_vip && !isVIP
              ? "Episode réservé aux VIP"
              : `Regarder ${episode.title}`
          }
        >
          <Play className="h-4 w-4 mr-1" />
          Regarder
        </Button>
      </div>
    </div>
  );
}