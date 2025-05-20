import React from "react";
import { Play, Eye, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";

// TypeScript type for Episode (à harmoniser avec les types utilisés côté page)
export type Episode = {
  id: string;
  title: string;
  description: string;
  season: number;
  episode_number: number;
  is_vip?: boolean;
  published?: boolean;
  duration?: number; // minutes
  thumbnail_url?: string;
};

interface SeasonEpisodeListProps {
  episodes: Episode[];
  seriesId: string;
  isVIP: boolean;
}

const SeasonEpisodeList: React.FC<SeasonEpisodeListProps> = ({ episodes, seriesId, isVIP }) => {
  const router = useRouter();

  if (!episodes || episodes.length === 0) {
    return (
      <div className="text-center text-gray-400 py-8">
        Aucun épisode disponible pour cette saison.
      </div>
    );
  }

  return (
    <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
      {episodes
        .sort((a, b) => a.episode_number - b.episode_number)
        .map((ep) => (
        <div
          key={ep.id}
          className="bg-gray-900/70 rounded-lg shadow-lg flex flex-col overflow-hidden border border-gray-800 hover:shadow-xl transition-shadow"
        >
          {/* Thumbnail */}
          <div className="relative h-40 w-full bg-gray-800 overflow-hidden">
            <img
              src={ep.thumbnail_url || "/placeholder-poster.png"}
              alt={ep.title}
              className="w-full h-full object-cover"
            />
            {ep.is_vip && (
              <Badge className="absolute top-2 left-2 bg-amber-700 text-amber-200 text-xs">
                VIP <Lock className="inline-block ml-1 w-3 h-3" />
              </Badge>
            )}
          </div>
          {/* Infos */}
          <div className="flex-1 flex flex-col p-4">
            <div className="flex items-center justify-between mb-1">
              <span className="font-semibold text-indigo-300 text-sm">Épisode {ep.episode_number}</span>
              {ep.duration && (
                <span className="flex items-center gap-1 text-gray-400 text-xs">
                  <Eye className="w-4 h-4" />
                  {ep.duration} min
                </span>
              )}
            </div>
            <h3 className="font-bold text-base text-white mb-1 line-clamp-1">{ep.title}</h3>
            <p className="text-gray-300 text-sm mb-4 line-clamp-2">{ep.description}</p>
            <Button
              size="sm"
              className="mt-auto w-full gap-2"
              onClick={() => router.push(`/series/${seriesId}/watch/${ep.id}`)}
              disabled={ep.is_vip && !isVIP}
            >
              <Play className="h-4 w-4" />
              Regarder
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default SeasonEpisodeList;