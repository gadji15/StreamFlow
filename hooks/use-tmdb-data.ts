import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import * as api from "@/lib/api";

// Trending content hook
export const useTrending = (
  mediaType: "all" | "movie" | "tv" = "all",
  timeWindow: "day" | "week" = "week",
  options?: UseQueryOptions<any, Error, any, ["trending", string, string]>
) => {
  return useQuery({
    queryKey: ["trending", mediaType, timeWindow],
    queryFn: () => api.getTrending(mediaType, timeWindow),
    staleTime: 1000 * 60 * 5, // 5 minutes
    ...options,
  });
};

// Search hook
export const useSearch = (
  query: string,
  page: number = 1,
  options?: UseQueryOptions<any, Error, any, ["search", string, number]>
) => {
  return useQuery({
    queryKey: ["search", query, page],
    queryFn: () => api.searchContent(query, page),
    enabled: query.length > 2,
    staleTime: 1000 * 60 * 5, // 5 minutes
    ...options,
  });
};

// Movie details hook
export const useMovieDetails = (
  movieId: number,
  options?: UseQueryOptions<any, Error, any, ["movie", number]>
) => {
  return useQuery({
    queryKey: ["movie", movieId],
    queryFn: () => api.getMovieDetails(movieId),
    staleTime: 1000 * 60 * 30, // 30 minutes
    ...options,
  });
};

// TV show details hook
export const useTVShowDetails = (
  tvId: number,
  options?: UseQueryOptions<any, Error, any, ["tv", number]>
) => {
  return useQuery({
    queryKey: ["tv", tvId],
    queryFn: () => api.getTVShowDetails(tvId),
    staleTime: 1000 * 60 * 30, // 30 minutes
    ...options,
  });
};

// Movies by genre hook
export const useMoviesByGenre = (
  genreId: number,
  page: number = 1,
  options?: UseQueryOptions<any, Error, any, ["moviesByGenre", number, number]>
) => {
  return useQuery({
    queryKey: ["moviesByGenre", genreId, page],
    queryFn: () => api.getMoviesByGenre(genreId, page),
    staleTime: 1000 * 60 * 15, // 15 minutes
    ...options,
  });
};

// TV shows by genre hook
export const useTVShowsByGenre = (
  genreId: number,
  page: number = 1,
  options?: UseQueryOptions<any, Error, any, ["tvShowsByGenre", number, number]>
) => {
  return useQuery({
    queryKey: ["tvShowsByGenre", genreId, page],
    queryFn: () => api.getTVShowsByGenre(genreId, page),
    staleTime: 1000 * 60 * 15, // 15 minutes
    ...options,
  });
};

// Movie genres hook
export const useMovieGenres = (
  options?: UseQueryOptions<any, Error, any, ["movieGenres"]>
) => {
  return useQuery({
    queryKey: ["movieGenres"],
    queryFn: () => api.getMovieGenres(),
    staleTime: 1000 * 60 * 60 * 24, // 24 hours
    ...options,
  });
};

// TV genres hook
export const useTVGenres = (
  options?: UseQueryOptions<any, Error, any, ["tvGenres"]>
) => {
  return useQuery({
    queryKey: ["tvGenres"],
    queryFn: () => api.getTVGenres(),
    staleTime: 1000 * 60 * 60 * 24, // 24 hours
    ...options,
  });
};

// Upcoming movies hook
export const useUpcomingMovies = (
  page: number = 1,
  options?: UseQueryOptions<any, Error, any, ["upcomingMovies", number]>
) => {
  return useQuery({
    queryKey: ["upcomingMovies", page],
    queryFn: () => api.getUpcomingMovies(page),
    staleTime: 1000 * 60 * 60, // 1 hour
    ...options,
  });
};

// Popular movies hook
export const usePopularMovies = (
  page: number = 1,
  options?: UseQueryOptions<any, Error, any, ["popularMovies", number]>
) => {
  return useQuery({
    queryKey: ["popularMovies", page],
    queryFn: () => api.getPopularMovies(page),
    staleTime: 1000 * 60 * 15, // 15 minutes
    ...options,
  });
};

// Popular TV shows hook
export const usePopularTVShows = (
  page: number = 1,
  options?: UseQueryOptions<any, Error, any, ["popularTVShows", number]>
) => {
  return useQuery({
    queryKey: ["popularTVShows", page],
    queryFn: () => api.getPopularTVShows(page),
    staleTime: 1000 * 60 * 15, // 15 minutes
    ...options,
  });
};

// Videos hook
export const useVideos = (
  mediaType: "movie" | "tv",
  id: number,
  options?: UseQueryOptions<any, Error, any, ["videos", string, number]>
) => {
  return useQuery({
    queryKey: ["videos", mediaType, id],
    queryFn: () => api.getVideos(mediaType, id),
    staleTime: 1000 * 60 * 60, // 1 hour
    ...options,
  });
};