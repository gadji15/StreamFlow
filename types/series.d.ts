export type Episode = {
  id: string;
  title: string;
  description?: string;
  episode_number: number;
  season: number;
  video_url?: string;
  thumbnail_url?: string;
  duration?: number;
  published: boolean;
  streamtape_url?: string;
  uqload_url?: string;
  // ...other properties
};