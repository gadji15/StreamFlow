import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  startAfter,
  DocumentData,
  QueryDocumentSnapshot,
  serverTimestamp,
  Timestamp
} from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from "firebase/storage";
import { db, storage } from "../config";
import { logActivity } from "./activity-logs";

// Collection name
const MOVIES_COLLECTION = "movies";

// Movie interface
export interface Movie {
  id?: string;
  title: string;
  description: string;
  poster: string;
  backdrop?: string;
  releaseDate: Date | Timestamp;
  duration: string;
  genres: string[];
  rating: number;
  views: number;
  status: "published" | "draft";
  trailer?: string;
  director?: string;
  cast?: string[];
  vipOnly?: boolean;
  createdAt?: Date | Timestamp;
  updatedAt?: Date | Timestamp;
}

// Get all movies
export const getAllMovies = async (): Promise<Movie[]> => {
  try {
    const moviesSnapshot = await getDocs(collection(db, MOVIES_COLLECTION));
    const movies: Movie[] = [];
    
    moviesSnapshot.forEach((doc) => {
      const data = doc.data();
      movies.push({
        id: doc.id,
        ...data,
        releaseDate: data.releaseDate?.toDate() || new Date(),
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate(),
      } as Movie);
    });
    
    return movies;
  } catch (error) {
    console.error("Error getting movies:", error);
    throw error;
  }
};

// Get paginated movies
export const getPaginatedMovies = async (
  lastVisible: QueryDocumentSnapshot<DocumentData> | null = null,
  itemsPerPage: number = 10,
  filters: {
    status?: "published" | "draft";
    genre?: string;
    search?: string;
    vipOnly?: boolean;
  } = {}
): Promise<{
  movies: Movie[];
  lastVisible: QueryDocumentSnapshot<DocumentData> | null;
  hasMore: boolean;
}> => {
  try {
    let moviesRef = collection(db, MOVIES_COLLECTION);
    let constraints: any[] = [];
    
    // Add filters
    if (filters.status) {
      constraints.push(where("status", "==", filters.status));
    }
    
    if (filters.genre) {
      constraints.push(where("genres", "array-contains", filters.genre));
    }
    
    if (filters.vipOnly !== undefined) {
      constraints.push(where("vipOnly", "==", filters.vipOnly));
    }
    
    // Add orderBy and pagination
    constraints.push(orderBy("releaseDate", "desc"));
    
    if (lastVisible) {
      constraints.push(startAfter(lastVisible));
    }
    
    constraints.push(limit(itemsPerPage + 1)); // Get one extra to check if there are more
    
    const q = query(moviesRef, ...constraints);
    const moviesSnapshot = await getDocs(q);
    
    const movies: Movie[] = [];
    let newLastVisible: QueryDocumentSnapshot<DocumentData> | null = null;
    let hasMore = false;
    
    // Process results
    if (!moviesSnapshot.empty) {
      const docs = moviesSnapshot.docs;
      
      // Check if we have more results
      if (docs.length > itemsPerPage) {
        hasMore = true;
        docs.pop(); // Remove the extra item
      }
      
      // Get the last visible item for pagination
      newLastVisible = docs[docs.length - 1] || null;
      
      // Map documents to Movie objects
      docs.forEach((doc) => {
        const data = doc.data();
        
        // If there's a search filter, apply it client-side
        if (filters.search && !data.title.toLowerCase().includes(filters.search.toLowerCase())) {
          return;
        }
        
        movies.push({
          id: doc.id,
          ...data,
          releaseDate: data.releaseDate?.toDate() || new Date(),
          createdAt: data.createdAt?.toDate(),
          updatedAt: data.updatedAt?.toDate(),
        } as Movie);
      });
    }
    
    return {
      movies,
      lastVisible: newLastVisible,
      hasMore,
    };
  } catch (error) {
    console.error("Error getting paginated movies:", error);
    throw error;
  }
};

// Get a movie by ID
export const getMovieById = async (id: string): Promise<Movie | null> => {
  try {
    const movieDoc = await getDoc(doc(db, MOVIES_COLLECTION, id));
    
    if (!movieDoc.exists()) {
      return null;
    }
    
    const data = movieDoc.data();
    return {
      id: movieDoc.id,
      ...data,
      releaseDate: data.releaseDate?.toDate() || new Date(),
      createdAt: data.createdAt?.toDate(),
      updatedAt: data.updatedAt?.toDate(),
    } as Movie;
  } catch (error) {
    console.error(`Error getting movie with ID ${id}:`, error);
    throw error;
  }
};

// Create a new movie
export const createMovie = async (
  movie: Omit<Movie, "id" | "createdAt" | "updatedAt" | "views">, 
  adminId: string, 
  adminName: string,
  posterFile?: File,
  backdropFile?: File
): Promise<Movie> => {
  try {
    let posterUrl = movie.poster;
    let backdropUrl = movie.backdrop || "";
    
    // Upload poster if provided
    if (posterFile) {
      const posterStorageRef = ref(storage, `movies/posters/${Date.now()}_${posterFile.name}`);
      const posterUploadTask = await uploadBytesResumable(posterStorageRef, posterFile);
      posterUrl = await getDownloadURL(posterUploadTask.ref);
    }
    
    // Upload backdrop if provided
    if (backdropFile) {
      const backdropStorageRef = ref(storage, `movies/backdrops/${Date.now()}_${backdropFile.name}`);
      const backdropUploadTask = await uploadBytesResumable(backdropStorageRef, backdropFile);
      backdropUrl = await getDownloadURL(backdropUploadTask.ref);
    }
    
    // Prepare movie data for Firestore
    const movieData = {
      ...movie,
      poster: posterUrl,
      backdrop: backdropUrl,
      views: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    
    // Add movie to Firestore
    const movieRef = await addDoc(collection(db, MOVIES_COLLECTION), movieData);
    
    // Log activity
    await logActivity({
      adminId,
      adminName,
      action: "CREATE",
      entityType: "MOVIE",
      entityId: movieRef.id,
      entityName: movie.title,
      timestamp: new Date(),
      details: { movieData }
    });
    
    // Get the created movie
    const createdMovieSnap = await getDoc(movieRef);
    const createdMovieData = createdMovieSnap.data();
    
    return {
      id: movieRef.id,
      ...createdMovieData,
      releaseDate: createdMovieData?.releaseDate?.toDate() || new Date(),
      createdAt: createdMovieData?.createdAt?.toDate(),
      updatedAt: createdMovieData?.updatedAt?.toDate(),
    } as Movie;
  } catch (error) {
    console.error("Error creating movie:", error);
    throw error;
  }
};

// Update a movie
export const updateMovie = async (
  id: string, 
  movieUpdates: Partial<Movie>, 
  adminId: string, 
  adminName: string,
  posterFile?: File,
  backdropFile?: File
): Promise<Movie> => {
  try {
    // Get current movie data for comparison and logging
    const currentMovieSnap = await getDoc(doc(db, MOVIES_COLLECTION, id));
    
    if (!currentMovieSnap.exists()) {
      throw new Error(`Movie with ID ${id} not found`);
    }
    
    const currentMovie = currentMovieSnap.data() as Movie;
    let posterUrl = movieUpdates.poster || currentMovie.poster;
    let backdropUrl = movieUpdates.backdrop || currentMovie.backdrop || "";
    
    // Upload new poster if provided
    if (posterFile) {
      // Delete old poster if it exists and is not a placeholder
      if (currentMovie.poster && currentMovie.poster.includes("firebase")) {
        try {
          const oldPosterRef = ref(storage, currentMovie.poster);
          await deleteObject(oldPosterRef);
        } catch (error) {
          console.warn("Could not delete old poster:", error);
        }
      }
      
      // Upload new poster
      const posterStorageRef = ref(storage, `movies/posters/${Date.now()}_${posterFile.name}`);
      const posterUploadTask = await uploadBytesResumable(posterStorageRef, posterFile);
      posterUrl = await getDownloadURL(posterUploadTask.ref);
    }
    
    // Upload new backdrop if provided
    if (backdropFile) {
      // Delete old backdrop if it exists and is not a placeholder
      if (currentMovie.backdrop && currentMovie.backdrop.includes("firebase")) {
        try {
          const oldBackdropRef = ref(storage, currentMovie.backdrop);
          await deleteObject(oldBackdropRef);
        } catch (error) {
          console.warn("Could not delete old backdrop:", error);
        }
      }
      
      // Upload new backdrop
      const backdropStorageRef = ref(storage, `movies/backdrops/${Date.now()}_${backdropFile.name}`);
      const backdropUploadTask = await uploadBytesResumable(backdropStorageRef, backdropFile);
      backdropUrl = await getDownloadURL(backdropUploadTask.ref);
    }
    
    // Prepare update data
    const updateData = {
      ...movieUpdates,
      poster: posterUrl,
      backdrop: backdropUrl,
      updatedAt: serverTimestamp(),
    };
    
    // Update movie in Firestore
    await updateDoc(doc(db, MOVIES_COLLECTION, id), updateData);
    
    // Log activity
    await logActivity({
      adminId,
      adminName,
      action: "UPDATE",
      entityType: "MOVIE",
      entityId: id,
      entityName: currentMovie.title,
      timestamp: new Date(),
      details: { 
        before: currentMovie,
        after: { ...currentMovie, ...updateData }
      }
    });
    
    // Get the updated movie
    const updatedMovieSnap = await getDoc(doc(db, MOVIES_COLLECTION, id));
    const updatedMovieData = updatedMovieSnap.data();
    
    return {
      id,
      ...updatedMovieData,
      releaseDate: updatedMovieData?.releaseDate?.toDate() || new Date(),
      createdAt: updatedMovieData?.createdAt?.toDate(),
      updatedAt: updatedMovieData?.updatedAt?.toDate(),
    } as Movie;
  } catch (error) {
    console.error(`Error updating movie with ID ${id}:`, error);
    throw error;
  }
};

// Delete a movie
export const deleteMovie = async (
  id: string, 
  adminId: string, 
  adminName: string
): Promise<void> => {
  try {
    // Get movie data for logging and cleaning up storage
    const movieSnap = await getDoc(doc(db, MOVIES_COLLECTION, id));
    
    if (!movieSnap.exists()) {
      throw new Error(`Movie with ID ${id} not found`);
    }
    
    const movieData = movieSnap.data() as Movie;
    
    // Delete movie from Firestore
    await deleteDoc(doc(db, MOVIES_COLLECTION, id));
    
    // Delete poster from storage if it exists and is not a placeholder
    if (movieData.poster && movieData.poster.includes("firebase")) {
      try {
        const posterRef = ref(storage, movieData.poster);
        await deleteObject(posterRef);
      } catch (error) {
        console.warn("Could not delete poster:", error);
      }
    }
    
    // Delete backdrop from storage if it exists and is not a placeholder
    if (movieData.backdrop && movieData.backdrop.includes("firebase")) {
      try {
        const backdropRef = ref(storage, movieData.backdrop);
        await deleteObject(backdropRef);
      } catch (error) {
        console.warn("Could not delete backdrop:", error);
      }
    }
    
    // Log activity
    await logActivity({
      adminId,
      adminName,
      action: "DELETE",
      entityType: "MOVIE",
      entityId: id,
      entityName: movieData.title,
      timestamp: new Date(),
      details: { deletedMovie: movieData }
    });
  } catch (error) {
    console.error(`Error deleting movie with ID ${id}:`, error);
    throw error;
  }
};

// Increment movie views
export const incrementMovieViews = async (id: string): Promise<void> => {
  try {
    const movieRef = doc(db, MOVIES_COLLECTION, id);
    
    // Get current views
    const movieSnap = await getDoc(movieRef);
    
    if (!movieSnap.exists()) {
      throw new Error(`Movie with ID ${id} not found`);
    }
    
    const currentViews = movieSnap.data().views || 0;
    
    // Update views
    await updateDoc(movieRef, {
      views: currentViews + 1,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error(`Error incrementing views for movie with ID ${id}:`, error);
    throw error;
  }
};

// Get popular movies
export const getPopularMovies = async (limit: number = 10): Promise<Movie[]> => {
  try {
    const moviesQuery = query(
      collection(db, MOVIES_COLLECTION),
      where("status", "==", "published"),
      orderBy("views", "desc"),
      limit(limit)
    );
    
    const moviesSnapshot = await getDocs(moviesQuery);
    const movies: Movie[] = [];
    
    moviesSnapshot.forEach((doc) => {
      const data = doc.data();
      movies.push({
        id: doc.id,
        ...data,
        releaseDate: data.releaseDate?.toDate() || new Date(),
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate(),
      } as Movie);
    });
    
    return movies;
  } catch (error) {
    console.error("Error getting popular movies:", error);
    throw error;
  }
};

// Get recent movies
export const getRecentMovies = async (limit: number = 10): Promise<Movie[]> => {
  try {
    const moviesQuery = query(
      collection(db, MOVIES_COLLECTION),
      where("status", "==", "published"),
      orderBy("releaseDate", "desc"),
      limit(limit)
    );
    
    const moviesSnapshot = await getDocs(moviesQuery);
    const movies: Movie[] = [];
    
    moviesSnapshot.forEach((doc) => {
      const data = doc.data();
      movies.push({
        id: doc.id,
        ...data,
        releaseDate: data.releaseDate?.toDate() || new Date(),
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate(),
      } as Movie);
    });
    
    return movies;
  } catch (error) {
    console.error("Error getting recent movies:", error);
    throw error;
  }
};

// Get movies by genre
export const getMoviesByGenre = async (genre: string, limit: number = 10): Promise<Movie[]> => {
  try {
    const moviesQuery = query(
      collection(db, MOVIES_COLLECTION),
      where("status", "==", "published"),
      where("genres", "array-contains", genre),
      orderBy("releaseDate", "desc"),
      limit(limit)
    );
    
    const moviesSnapshot = await getDocs(moviesQuery);
    const movies: Movie[] = [];
    
    moviesSnapshot.forEach((doc) => {
      const data = doc.data();
      movies.push({
        id: doc.id,
        ...data,
        releaseDate: data.releaseDate?.toDate() || new Date(),
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate(),
      } as Movie);
    });
    
    return movies;
  } catch (error) {
    console.error(`Error getting movies by genre ${genre}:`, error);
    throw error;
  }
};