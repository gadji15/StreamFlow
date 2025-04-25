import { db } from "../config";
import { getRecentActivity } from "./activity-logs";
import { getCommentsStatistics } from "./comments";
import { getPopularMovies } from "./movies";
import { getPopularSeries } from "./series";
import { getUserStatistics } from "./users";
import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  limit
} from "firebase/firestore";

// Get dashboard statistics
export const getDashboardStatistics = async (): Promise<{
  users: {
    total: number;
    active: number;
    vip: number;
    newLast30Days: number;
  };
  content: {
    totalMovies: number;
    publishedMovies: number;
    totalSeries: number;
    publishedSeries: number;
    totalEpisodes: number;
  };
  comments: {
    total: number;
    approved: number;
    pending: number;
    rejected: number;
    reported: number;
  };
  popular: {
    movies: any[];
    series: any[];
  };
  recentActivity: any[];
}> => {
  try {
    // Get user statistics
    const userStats = await getUserStatistics();
    
    // Get comments statistics
    const commentStats = await getCommentsStatistics();
    
    // Count movies
    const moviesQuery = query(collection(db, "movies"));
    const moviesSnapshot = await getDocs(moviesQuery);
    const totalMovies = moviesSnapshot.size;
    
    // Count published movies
    const publishedMoviesQuery = query(
      collection(db, "movies"),
      where("status", "==", "published")
    );
    const publishedMoviesSnapshot = await getDocs(publishedMoviesQuery);
    const publishedMovies = publishedMoviesSnapshot.size;
    
    // Count series
    const seriesQuery = query(collection(db, "series"));
    const seriesSnapshot = await getDocs(seriesQuery);
    const totalSeries = seriesSnapshot.size;
    
    // Count published series
    const publishedSeriesQuery = query(
      collection(db, "series"),
      where("status", "==", "published")
    );
    const publishedSeriesSnapshot = await getDocs(publishedSeriesQuery);
    const publishedSeries = publishedSeriesSnapshot.size;
    
    // Count episodes
    const episodesQuery = query(collection(db, "episodes"));
    const episodesSnapshot = await getDocs(episodesQuery);
    const totalEpisodes = episodesSnapshot.size;
    
    // Get popular movies and series
    const popularMovies = await getPopularMovies(5);
    const popularSeries = await getPopularSeries(5);
    
    // Get recent activity
    const recentActivity = await getRecentActivity(10);
    
    return {
      users: userStats,
      content: {
        totalMovies,
        publishedMovies,
        totalSeries,
        publishedSeries,
        totalEpisodes,
      },
      comments: commentStats,
      popular: {
        movies: popularMovies,
        series: popularSeries,
      },
      recentActivity,
    };
  } catch (error) {
    console.error("Error getting dashboard statistics:", error);
    throw error;
  }
};

// Get content distribution statistics
export const getContentDistributionStatistics = async (): Promise<{
  genreDistribution: {
    genre: string;
    count: number;
  }[];
  movieYearDistribution: {
    year: string;
    count: number;
  }[];
  seriesYearDistribution: {
    year: string;
    count: number;
  }[];
  vipContentPercentage: number;
}> => {
  try {
    // Get all movies and series to analyze
    const moviesQuery = query(collection(db, "movies"));
    const moviesSnapshot = await getDocs(moviesQuery);
    
    const seriesQuery = query(collection(db, "series"));
    const seriesSnapshot = await getDocs(seriesQuery);
    
    // Genre distribution
    const genreCounts: Record<string, number> = {};
    let totalVipContent = 0;
    
    // Process movies
    const movies: any[] = [];
    moviesSnapshot.forEach(doc => {
      const movie = { id: doc.id, ...doc.data() };
      movies.push(movie);
      
      // Count genres
      if (movie.genres && Array.isArray(movie.genres)) {
        movie.genres.forEach((genre: string) => {
          genreCounts[genre] = (genreCounts[genre] || 0) + 1;
        });
      }
      
      // Count VIP content
      if (movie.vipOnly) {
        totalVipContent++;
      }
    });
    
    // Process series
    const series: any[] = [];
    seriesSnapshot.forEach(doc => {
      const seriesItem = { id: doc.id, ...doc.data() };
      series.push(seriesItem);
      
      // Count genres
      if (seriesItem.genres && Array.isArray(seriesItem.genres)) {
        seriesItem.genres.forEach((genre: string) => {
          genreCounts[genre] = (genreCounts[genre] || 0) + 1;
        });
      }
      
      // Count VIP content
      if (seriesItem.vipOnly) {
        totalVipContent++;
      }
    });
    
    // Year distribution for movies
    const movieYearCounts: Record<string, number> = {};
    movies.forEach(movie => {
      if (movie.releaseDate) {
        const year = new Date(movie.releaseDate.seconds * 1000).getFullYear().toString();
        movieYearCounts[year] = (movieYearCounts[year] || 0) + 1;
      }
    });
    
    // Year distribution for series
    const seriesYearCounts: Record<string, number> = {};
    series.forEach(seriesItem => {
      if (seriesItem.releaseDate) {
        const year = new Date(seriesItem.releaseDate.seconds * 1000).getFullYear().toString();
        seriesYearCounts[year] = (seriesYearCounts[year] || 0) + 1;
      }
    });
    
    // Calculate VIP content percentage
    const totalContent = movies.length + series.length;
    const vipContentPercentage = totalContent > 0 ? (totalVipContent / totalContent) * 100 : 0;
    
    // Format genre distribution
    const genreDistribution = Object.entries(genreCounts)
      .map(([genre, count]) => ({ genre, count }))
      .sort((a, b) => b.count - a.count);
    
    // Format movie year distribution
    const movieYearDistribution = Object.entries(movieYearCounts)
      .map(([year, count]) => ({ year, count }))
      .sort((a, b) => a.year.localeCompare(b.year));
    
    // Format series year distribution
    const seriesYearDistribution = Object.entries(seriesYearCounts)
      .map(([year, count]) => ({ year, count }))
      .sort((a, b) => a.year.localeCompare(b.year));
    
    return {
      genreDistribution,
      movieYearDistribution,
      seriesYearDistribution,
      vipContentPercentage,
    };
  } catch (error) {
    console.error("Error getting content distribution statistics:", error);
    throw error;
  }
};

// Get subscription statistics
export const getSubscriptionStatistics = async (): Promise<{
  totalSubscriptions: number;
  activeSubscriptions: number;
  subscriptionsByPlan: {
    plan: string;
    count: number;
  }[];
  subscriptionsOverTime: {
    month: string;
    count: number;
  }[];
}> => {
  try {
    const subscriptionsQuery = query(collection(db, "subscriptions"));
    const subscriptionsSnapshot = await getDocs(subscriptionsQuery);
    
    let totalSubscriptions = 0;
    let activeSubscriptions = 0;
    const planCounts: Record<string, number> = {
      'basic': 0,
      'premium': 0,
      'vip': 0
    };
    const monthCounts: Record<string, number> = {};
    
    subscriptionsSnapshot.forEach(doc => {
      const subscription = doc.data();
      totalSubscriptions++;
      
      // Count active subscriptions
      if (subscription.status === "active") {
        activeSubscriptions++;
      }
      
      // Count by plan
      if (subscription.plan) {
        planCounts[subscription.plan] = (planCounts[subscription.plan] || 0) + 1;
      }
      
      // Count by month
      if (subscription.createdAt) {
        const date = new Date(subscription.createdAt.seconds * 1000);
        const month = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
        monthCounts[month] = (monthCounts[month] || 0) + 1;
      }
    });
    
    // Format plan distribution
    const subscriptionsByPlan = Object.entries(planCounts)
      .map(([plan, count]) => ({ plan, count }))
      .sort((a, b) => b.count - a.count);
    
    // Format subscriptions over time
    const subscriptionsOverTime = Object.entries(monthCounts)
      .map(([month, count]) => ({ month, count }))
      .sort((a, b) => a.month.localeCompare(b.month));
    
    return {
      totalSubscriptions,
      activeSubscriptions,
      subscriptionsByPlan,
      subscriptionsOverTime,
    };
  } catch (error) {
    console.error("Error getting subscription statistics:", error);
    throw error;
  }
};

// Get user engagement statistics
export const getUserEngagementStatistics = async (): Promise<{
  totalViews: number;
  viewsBreakdown: {
    movies: number;
    series: number;
    episodes: number;
  };
  activeUsersOverTime: {
    day: string;
    count: number;
  }[];
  popularContentByDemographic: {
    demographic: string;
    content: any[];
  }[];
}> => {
  try {
    // This would normally involve complex queries and data processing
    // For now, we'll return mock data
    return {
      totalViews: 123456,
      viewsBreakdown: {
        movies: 56789,
        series: 45678,
        episodes: 21000,
      },
      activeUsersOverTime: [
        { day: "2023-01-01", count: 1200 },
        { day: "2023-01-02", count: 1250 },
        { day: "2023-01-03", count: 1300 },
        { day: "2023-01-04", count: 1350 },
        { day: "2023-01-05", count: 1400 },
      ],
      popularContentByDemographic: [
        {
          demographic: "18-24",
          content: [
            { id: "1", title: "Stranger Things", type: "series", views: 5000 },
            { id: "2", title: "The Matrix", type: "movie", views: 4500 },
          ],
        },
        {
          demographic: "25-34",
          content: [
            { id: "3", title: "Breaking Bad", type: "series", views: 6000 },
            { id: "4", title: "Inception", type: "movie", views: 5500 },
          ],
        },
        {
          demographic: "35-44",
          content: [
            { id: "5", title: "The Crown", type: "series", views: 4000 },
            { id: "6", title: "Interstellar", type: "movie", views: 3500 },
          ],
        },
      ],
    };
  } catch (error) {
    console.error("Error getting user engagement statistics:", error);
    throw error;
  }
};