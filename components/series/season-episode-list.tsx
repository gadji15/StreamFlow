'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Play, Lock, Clock, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { VipBadge } from '@/components/vip-badge';
import { formatDuration } from '@/lib/utils';
import { Episode } from '@/lib/firebase/firestore/series';
import { useToast } from '@/components/ui/use-toast';
import { useRouter } from 'next/navigation';

interface SeasonEpisodeListProps {
  episodes: Episode[];
  seriesId: string;
  isVIP: boolean;
}

export default function SeasonEpisodeList({ episodes, seriesId, isVIP }: SeasonEpisodeListProps) {
  const router = useRouter();
  const { toast } = useToast();
  
  if (episodes.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-400">Aucun épisode disponible pour cette saison.</p>
      </div>
    );
  }
  
  const handleEpisodeClick = (episode: Episode) => {
    if (episode.isVIP && !isVIP) {
      // L'utilisateur n'est pas VIP et l'épisode est réservé aux VIP
      toast({
        title: "Contenu VIP",
        description: "Cet épisode est réservé aux membres VIP. Abonnez-vous pour le regarder.",
        variant: "destructive",
      });
    } else {
      // Rediriger vers la page de visionnage de l'épisode
      router.push(`/series/${seriesId}/watch/${episode.id}`);
    }
  };
  
  return (
    <div className="space-y-4">
      {episodes.map((episode) => (
        <div 
          key={episode.id} 
          className={`flex flex-col sm:flex-row gap-4 p-4 rounded-lg ${
            episode.isVIP && !isVIP ? 'bg-gray-700 opacity-80' : 'bg-gray-700 hover:bg-gray-600'
          } transition-colors`}
        >
          {/* Thumbnail ou placeholder */}
          <div className="w-full sm:w-48 h-28 flex-shrink-0 rounded overflow-hidden relative">
            {episode.thumbnailUrl ? (
              <img
                src={episode.thumbnailUrl}
                alt={`Vignette de ${episode.title}`}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                <Play className="h-8 w-8 text-gray-600" />
              </div>
            )}
            
            {/* Overlay VIP pour les épisodes réservés */}
            {episode.isVIP && !isVIP && (
              <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center">
                <Lock className="h-8 w-8 text-yellow-500 mb-1" />
                <VipBadge />
              </div>
            )}
          </div>
          
          {/* Informations de l'épisode */}
          <div className="flex-1 flex flex-col">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">
                {episode.season}x{String(episode.episodeNumber).padStart(2, '0')} : {episode.title}
              </h3>
              
              {episode.isVIP && (
                <div className="ml-2">
                  <VipBadge />
                </div>
              )}
            </div>
            
            <p className="text-sm text-gray-300 mt-1 line-clamp-2">{episode.description}</p>
            
            <div className="flex items-center mt-auto pt-2 text-xs text-gray-400">
              <span className="flex items-center">
                <Clock className="mr-1 h-3 w-3" /> 
                {formatDuration(episode.duration)}
              </span>
            </div>
          </div>
          
          {/* Bouton de lecture */}
          <div className="flex sm:flex-col justify-end items-center gap-2 mt-2 sm:mt-0">
            <Button
              size="sm"
              className="w-full sm:w-auto"
              onClick={() => handleEpisodeClick(episode)}
              disabled={episode.isVIP && !isVIP}
            >
              <Play className="h-4 w-4 mr-2" /> 
              Regarder
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}