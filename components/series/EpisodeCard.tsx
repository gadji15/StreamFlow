'use client';

import { useState } from 'react';
import { Play, Lock, Clock, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { VipBadge } from '@/components/vip-badge';
import { formatDuration } from '@/lib/utils';
import * as Popover from '@radix-ui/react-popover';

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
  const [open, setOpen] = useState(false);
  const [showFullDescription, setShowFullDescription] = useState(false);

  return (
    <div
      className={`flex flex-col sm:flex-row gap-4 p-4 rounded-lg shadow ${
        episode.is_vip && !isVIP
          ? "bg-gray-700 opacity-80"
          : watched
          ? "bg-green-900/40 border-l-4 border-green-400"
          : "bg-gray-700 hover:bg-gray-600"
      } transition-colors`}
    >
      {/* Poster spécifique ou placeholder */}
      <div className="w-full sm:w-48 h-28 flex-shrink-0 rounded overflow-hidden relative aspect-video bg-gray-800">
        {episode.thumbnail_url ? (
          <img
            src={episode.thumbnail_url}
            alt={`Poster de ${episode.title}`}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Play className="h-8 w-8 text-gray-600" />
          </div>
        )}
        {/* Overlay VIP */}
        {episode.is_vip && !isVIP && (
          <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center">
            <Lock className="h-8 w-8 text-yellow-500 mb-1" />
            <VipBadge size="small" variant="subtle" />
          </div>
        )}
      </div>

      {/* Infos */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="flex items-center justify-between gap-2">
          <h3 className="font-semibold truncate">
            {episode.season}x{String(episode.episode_number).padStart(2, "0")} : {episode.title}
          </h3>
          {episode.is_vip && (
            <div className="ml-2">
              <VipBadge size="small" variant="subtle" />
            </div>
          )}
        </div>

        {/* Description dynamique */}
        <div className="text-sm text-gray-300 mt-1">
          <span className="line-clamp-2">
            {episode.description}
          </span>
          {episode.description.length > 100 && (
            <Popover.Root open={open} onOpenChange={setOpen}>
              <Popover.Trigger asChild>
                <button
                  type="button"
                  className="ml-2 text-blue-400 underline text-xs focus:outline-none"
                  onClick={() => setOpen(true)}
                  aria-label="Afficher la description complète"
                >
                  Afficher plus
                </button>
              </Popover.Trigger>
              <Popover.Portal>
                <Popover.Content
                  className="max-w-xs sm:max-w-md bg-gray-800 text-white rounded-lg shadow-lg p-4 z-50"
                  sideOffset={8}
                  side="bottom"
                >
                  <div className="text-sm whitespace-pre-line">
                    {episode.description}
                  </div>
                  <Popover.Close
                    className="mt-3 text-blue-400 underline text-xs cursor-pointer"
                    aria-label="Fermer"
                  >
                    Fermer
                  </Popover.Close>
                </Popover.Content>
              </Popover.Portal>
            </Popover.Root>
          )}
        </div>

        <div className="flex items-center mt-auto pt-2 text-xs text-gray-400 gap-4 flex-wrap">
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
                  ? onUnmarkWatched(episode.id)
                  : onMarkWatched(episode.id)
              }
            >
              {watched ? "Vu ✔" : "Marquer comme vu"}
            </button>
          )}
        </div>
      </div>
      
      {/* Bouton lecture */}
      <div className="flex sm:flex-col justify-end items-center gap-2 mt-2 sm:mt-0">
        <Button
          size="sm"
          className="w-full sm:w-auto"
          onClick={() => onWatch(episode)}
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
}