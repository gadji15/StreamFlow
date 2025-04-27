import { firestore, storage } from "../config";
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
  increment,
  serverTimestamp,
  Timestamp,
  DocumentData,
  QueryDocumentSnapshot,
  runTransaction
} from "firebase/firestore";
import { ref, uploadString, getDownloadURL, deleteObject } from "firebase/storage";
import { logActivity } from "./activity-logs";
import { updateStatistics } from "./statistics";

export interface Movie {
  id?: string;
  title: string;
  description: string;
  year: number;
  duration: number;
  genres: string[];
  director?: string;
  cast?: {
    name: string;
    role: string;
    photoUrl?: string;
  }[];
  posterUrl?: string;
  backdropUrl?: string;
  trailerUrl?: string;
  videoUrl?: string;
  rating?: number;
  isVIP: boolean;
  isPublished: boolean;
  publishedAt?: Timestamp;
  views: number;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export interface Genre {
  id: string;
  name: string;
  description?: string;
}

/**
 * Récupérer tous les genres de films
 */
export async function getMovieGenres(): Promise<Genre[]> {
  try {
    const genresSnapshot = await getDocs(collection(firestore, "genres"));
    const genres: Genre[] = [];
    
    genresSnapshot.forEach((doc) => {
      genres.push({ id: doc.id, ...doc.data() } as Genre);
    });
    
    return genres;
  } catch (error) {
    console.error("Erreur lors de la récupération des genres:", error);
    throw error;
  }
}

/**
 * Récupérer les films populaires
 */
export async function getPopularMovies(limitCount: number = 10, onlyPublished: boolean = true, includeVIP: boolean = true) {
  try {
    let q = query(
      collection(firestore, "movies"),
      orderBy("views", "desc"),
      limit(limitCount)
    );
    
    if (onlyPublished) {
      q = query(q, where("isPublished", "==", true));
    }
    
    if (!includeVIP) {
      q = query(q, where("isVIP", "==", false));
    }
    
    const querySnapshot = await getDocs(q);
    const movies: Movie[] = [];
    
    querySnapshot.forEach((doc) => {
      movies.push({ id: doc.id, ...doc.data() } as Movie);
    });
    
    return movies;
  } catch (error) {
    console.error("Erreur lors de la récupération des films populaires:", error);
    throw error;
  }
}

/**
 * Récupérer les films par genre
 */
export async function getMoviesByGenre(genreId: string, limitCount: number = 10, onlyPublished: boolean = true, includeVIP: boolean = true) {
  try {
    let q = query(
      collection(firestore, "movies"),
      where("genres", "array-contains", genreId),
      orderBy("views", "desc"),
      limit(limitCount)
    );
    
    if (onlyPublished) {
      q = query(q, where("isPublished", "==", true));
    }
    
    if (!includeVIP) {
      q = query(q, where("isVIP", "==", false));
    }
    
    const querySnapshot = await getDocs(q);
    const movies: Movie[] = [];
    
    querySnapshot.forEach((doc) => {
      movies.push({ id: doc.id, ...doc.data() } as Movie);
    });
    
    return movies;
  } catch (error) {
    console.error(`Erreur lors de la récupération des films du genre ${genreId}:`, error);
    throw error;
  }
}

/**
 * Récupérer les films récents
 */
export async function getRecentMovies(limitCount: number = 10, onlyPublished: boolean = true) {
  try {
    let q = query(
      collection(firestore, "movies"),
      orderBy("createdAt", "desc"),
      limit(limitCount)
    );
    
    if (onlyPublished) {
      q = query(q, where("isPublished", "==", true));
    }
    
    const querySnapshot = await getDocs(q);
    const movies: Movie[] = [];
    
    querySnapshot.forEach((doc) => {
      movies.push({ id: doc.id, ...doc.data() } as Movie);
    });
    
    return movies;
  } catch (error) {
    console.error("Erreur lors de la récupération des films récents:", error);
    throw error;
  }
}

/**
 * Récupérer un film par ID
 */
export async function getMovie(movieId: string) {
  try {
    const movieDoc = await getDoc(doc(firestore, "movies", movieId));
    
    if (!movieDoc.exists()) {
      return null;
    }
    
    return { id: movieDoc.id, ...movieDoc.data() } as Movie;
  } catch (error) {
    console.error(`Erreur lors de la récupération du film ${movieId}:`, error);
    throw error;
  }
}

/**
 * Incrémenter le nombre de vues d'un film
 */
export async function incrementMovieViews(movieId: string) {
  try {
    const movieRef = doc(firestore, "movies", movieId);
    await updateDoc(movieRef, {
      views: increment(1)
    });
    
    // Mettre à jour les statistiques globales de vues
    await updateStatistics({
      totalViews: increment(1)
    });
    
    return true;
  } catch (error) {
    console.error(`Erreur lors de l'incrémentation des vues du film ${movieId}:`, error);
    return false;
  }
}

/**
 * Rechercher des films par titre
 */
export async function searchMovies(searchTerm: string, limitCount: number = 20, onlyPublished: boolean = true, includeVIP: boolean = true) {
  try {
    // Pour une recherche avancée, envisager d'utiliser Algolia, Elasticsearch, etc.
    // Cette implémentation est basique et effectue une recherche côté client
    
    // Récupérer tous les films publiés
    let q = query(
      collection(firestore, "movies"),
      orderBy("title")
    );
    
    if (onlyPublished) {
      q = query(q, where("isPublished", "==", true));
    }
    
    if (!includeVIP) {
      q = query(q, where("isVIP", "==", false));
    }
    
    const querySnapshot = await getDocs(q);
    const movies: Movie[] = [];
    
    // Filtrer les résultats côté client
    const normalizedSearchTerm = searchTerm.toLowerCase().trim();
    
    querySnapshot.forEach((doc) => {
      const movie = { id: doc.id, ...doc.data() } as Movie;
      
      if (movie.title.toLowerCase().includes(normalizedSearchTerm)) {
        movies.push(movie);
      }
    });
    
    // Limiter les résultats
    return movies.slice(0, limitCount);
  } catch (error) {
    console.error(`Erreur lors de la recherche de films avec le terme "${searchTerm}":`, error);
    throw error;
  }
}

/**
 * Ajouter un nouveau film
 */
export async function addMovie(movieData: Omit<Movie, 'id' | 'views' | 'createdAt' | 'updatedAt'>, posterBase64?: string, backdropBase64?: string) {
  try {
    // Préparer les données du film
    const movie = {
      ...movieData,
      views: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    // Ajouter le document dans Firestore
    const docRef = await addDoc(collection(firestore, "movies"), movie);
    const movieId = docRef.id;
    
    // Uploader le poster si fourni
    if (posterBase64) {
      const posterUrl = await uploadMoviePoster(movieId, posterBase64);
      if (posterUrl) {
        await updateDoc(docRef, { posterUrl });
        movie.posterUrl = posterUrl;
      }
    }
    
    // Uploader le backdrop si fourni
    if (backdropBase64) {
      const backdropUrl = await uploadMovieBackdrop(movieId, backdropBase64);
      if (backdropUrl) {
        await updateDoc(docRef, { backdropUrl });
        movie.backdropUrl = backdropUrl;
      }
    }
    
    // Mettre à jour les statistiques
    await updateStatistics({
      totalMovies: increment(1),
      publishedMovies: movie.isPublished ? increment(1) : increment(0)
    });
    
    // Journaliser l'activité
    logActivity({
      action: "content_create",
      entityType: "movie",
      entityId: movieId,
      details: { 
        title: movie.title,
        isVIP: movie.isVIP,
        isPublished: movie.isPublished
      }
    });
    
    return { id: movieId, ...movie };
  } catch (error) {
    console.error("Erreur lors de l'ajout du film:", error);
    throw error;
  }
}

/**
 * Uploader un poster de film
 */
async function uploadMoviePoster(movieId: string, posterBase64: string): Promise<string | null> {
  if (!posterBase64) return null;
  
  try {
    // Retirer le préfixe data URL
    const base64Content = posterBase64.includes('base64')
      ? posterBase64.split(',')[1]
      : posterBase64;
    
    // Créer une référence dans Firebase Storage
    const posterRef = ref(storage, `movies/posters/${movieId}_${Date.now()}`);
    
    // Uploader l'image
    const snapshot = await uploadString(posterRef, base64Content, 'base64');
    
    // Récupérer l'URL téléchargeable
    const downloadURL = await getDownloadURL(snapshot.ref);
    
    return downloadURL;
  } catch (error) {
    console.error(`Erreur lors de l'upload du poster pour le film ${movieId}:`, error);
    return null;
  }
}

/**
 * Uploader un backdrop de film
 */
async function uploadMovieBackdrop(movieId: string, backdropBase64: string): Promise<string | null> {
  if (!backdropBase64) return null;
  
  try {
    // Retirer le préfixe data URL
    const base64Content = backdropBase64.includes('base64')
      ? backdropBase64.split(',')[1]
      : backdropBase64;
    
    // Créer une référence dans Firebase Storage
    const backdropRef = ref(storage, `movies/backdrops/${movieId}_${Date.now()}`);
    
    // Uploader l'image
    const snapshot = await uploadString(backdropRef, base64Content, 'base64');
    
    // Récupérer l'URL téléchargeable
    const downloadURL = await getDownloadURL(snapshot.ref);
    
    return downloadURL;
  } catch (error) {
    console.error(`Erreur lors de l'upload du backdrop pour le film ${movieId}:`, error);
    return null;
  }
}