import axios from "axios";
import { env } from "@/env";

// TMDB API configuration
const TMDB_API_KEY = env.TMDB_API_KEY || "your_api_key_here";
const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const TMDB_IMAGE_BASE_URL = "https://image.tmdb.org/t/p";

// Initialize axios instance
const tmdbApi = axios.create({
  baseURL: TMDB_BASE_URL,
  params: {
    api_key: TMDB_API_KEY,
    language: "fr-FR",
  },
});

// Image URL helper
export const getTMDBImageUrl = (path: string, size: "original" | "w500" | "w780" | "w1280" = "original") => {
  if (!path) return null;
  return `${TMDB_IMAGE_BASE_URL}/${size}${path}`;
};

// Trending movies and shows
export const getTrending = async (mediaType: "all" | "movie" | "tv" = "all", timeWindow: "day" | "week" = "week") => {
  try {
    const response = await tmdbApi.get(`/trending/${mediaType}/${timeWindow}`);
    return response.data.results;
  } catch (error) {
    console.error("Error fetching trending content:", error);
    throw error;
  }
};

// Search movies and shows
export const searchContent = async (query: string, page: number = 1) => {
  try {
    const response = await tmdbApi.get("/search/multi", {
      params: {
        query,
        page,
        include_adult: false,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error searching content:", error);
    throw error;
  }
};

// Get movie details
export const getMovieDetails = async (movieId: number) => {
  try {
    const response = await tmdbApi.get(`/movie/${movieId}`, {
      params: {
        append_to_response: "videos,credits,similar,recommendations",
      },
    });
    return response.data;
  } catch (error) {
    console.error(`Error fetching movie details for ID ${movieId}:`, error);
    throw error;
  }
};

// Get TV show details
export const getTVShowDetails = async (tvId: number) => {
  try {
    const response = await tmdbApi.get(`/tv/${tvId}`, {
      params: {
        append_to_response: "videos,credits,similar,recommendations",
      },
    });
    return response.data;
  } catch (error) {
    console.error(`Error fetching TV show details for ID ${tvId}:`, error);
    throw error;
  }
};

// Get movies by genre
export const getMoviesByGenre = async (genreId: number, page: number = 1) => {
  try {
    const response = await tmdbApi.get("/discover/movie", {
      params: {
        with_genres: genreId,
        page,
        sort_by: "popularity.desc",
      },
    });
    return response.data;
  } catch (error) {
    console.error(`Error fetching movies for genre ID ${genreId}:`, error);
    throw error;
  }
};

// Get TV shows by genre
export const getTVShowsByGenre = async (genreId: number, page: number = 1) => {
  try {
    const response = await tmdbApi.get("/discover/tv", {
      params: {
        with_genres: genreId,
        page,
        sort_by: "popularity.desc",
      },
    });
    return response.data;
  } catch (error) {
    console.error(`Error fetching TV shows for genre ID ${genreId}:`, error);
    throw error;
  }
};

// Get movie genres
export const getMovieGenres = async () => {
  try {
    const response = await tmdbApi.get("/genre/movie/list");
    return response.data.genres;
  } catch (error) {
    console.error("Error fetching movie genres:", error);
    throw error;
  }
};

// Get TV show genres
export const getTVGenres = async () => {
  try {
    const response = await tmdbApi.get("/genre/tv/list");
    return response.data.genres;
  } catch (error) {
    console.error("Error fetching TV genres:", error);
    throw error;
  }
};

// Import content from TMDB to our database
export const importFromTMDB = async (mediaType: "movie" | "tv", tmdbId: number) => {
  try {
    // In a real app, this would fetch from TMDB and then add to your database
    // This is a simplified version
    const response = await axios.post(`/api/admin/import-content`, {
      mediaType,
      tmdbId,
    });
    return response.data;
  } catch (error) {
    console.error(`Error importing ${mediaType} with ID ${tmdbId}:`, error);
    throw error;
  }
};

// Get upcoming movies
export const getUpcomingMovies = async (page: number = 1) => {
  try {
    const response = await tmdbApi.get("/movie/upcoming", {
      params: { page },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching upcoming movies:", error);
    throw error;
  }
};

// Get popular movies
export const getPopularMovies = async (page: number = 1) => {
  try {
    const response = await tmdbApi.get("/movie/popular", {
      params: { page },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching popular movies:", error);
    throw error;
  }
};

// Get popular TV shows
export const getPopularTVShows = async (page: number = 1) => {
  try {
    const response = await tmdbApi.get("/tv/popular", {
      params: { page },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching popular TV shows:", error);
    throw error;
  }
};

// Get movie or TV show videos (trailers, etc.)
export const getVideos = async (mediaType: "movie" | "tv", id: number) => {
  try {
    const response = await tmdbApi.get(`/${mediaType}/${id}/videos`);
    return response.data.results;
  } catch (error) {
    console.error(`Error fetching videos for ${mediaType} ID ${id}:`, error);
    throw error;
  }
};

