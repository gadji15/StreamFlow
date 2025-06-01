export type Episode = {
  id: string;
  title: string;
  description: string;
  season: number;
  episode_number: number;
  duration: number;
  is_vip?: boolean;
  published?: boolean;
  video_url?: string;
  thumbnail_url: string;
};

export type Season = {
  id: string;
  season_number: number;
  poster?: string;
  title?: string;
  episodes: Episode[];
};

export type Series = {
  id: string;
  title: string;
  poster?: string;
  genre?: string;
  is_vip?: boolean;
};
