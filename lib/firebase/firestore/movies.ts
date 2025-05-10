import { firestore } from "../config";
import { 
  collection, doc, getDoc, getDocs, addDoc, updateDoc, deleteDoc, 
  query, where, orderBy, limit, startAfter, DocumentSnapshot, 
  increment, serverTimestamp 
} from "firebase/firestore";
import { logActivity } from "./activity-logs";

// Type pour un film
export interface Movie {
  id: string;
  title: string;
  description: string;
  year: number;
  director: string;
  cast: string[];
  genre: string[];
  duration: number; // durée en minutes
  rating?: number; // note sur 10
  posterUrl?: string;
  backdropUrl?: string;
  trailerUrl?: string;
  isVIP: boolean;
  isPublished: boolean;
  views: number;
  createdAt: Date;
  updatedAt: Date;
}

// Type pour un genre
export interface Genre {
  id: string;
  name: string;
}

// Options pour getMovies
interface GetMoviesOptions {
  limit?: number;
  startAfter?: DocumentSnapshot;
  onlyPublished?: boolean;
  genreFilter?: string;
  isVIP?: boolean;
  searchTerm?: string;
}

/**
 * Récupère la liste des films avec pagination et filtres
 */
export async function getMovies(options: GetMoviesOptions = {}) {
  const { 
    limit: limitCount = 10, 
    startAfter: startAfterDoc,
    onlyPublished = false,
    genreFilter,
    isVIP,
    searchTerm
  } = options;

  try {
    // Commencer avec une référence à la collection
    let moviesRef = collection(firestore, "movies");
    
    // Construire la requête
    let constraints = [];
    
    // Filtre pour les films publiés uniquement
    if (onlyPublished) {
      constraints.push(where("isPublished", "==", true));
    }
    
    // Filtre par genre si spécifié
    if (genreFilter) {
      constraints.push(where("genre", "array-contains", genreFilter));
    }
    
    // Filtre VIP si spécifié
    if (isVIP !== undefined) {
      constraints.push(where("isVIP", "==", isVIP));
    }
    
    // Ajouter le tri par date de création (du plus récent au plus ancien)
    constraints.push(orderBy("createdAt", "desc"));
    
    // Créer la requête avec les contraintes
    let moviesQuery = query(moviesRef, ...constraints);
    
    // Ajouter la pagination si un point de départ est fourni
    if (startAfterDoc) {
      moviesQuery = query(moviesQuery, startAfter(startAfterDoc));
    }
    
    // Limiter le nombre de résultats
    moviesQuery = query(moviesQuery, limit(limitCount));
    
    // Exécuter la requête
    const snapshot = await getDocs(moviesQuery);
    
    // Extraire les données des documents
    let movies = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate()
    } as Movie));
    
    // Filtrer par terme de recherche si spécifié (côté client)
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      movies = movies.filter(movie => 
        movie.title.toLowerCase().includes(searchLower) || 
        movie.description.toLowerCase().includes(searchLower)
      );
    }
    
    // Renvoyer les résultats et le dernier document pour la pagination
    return {
      movies,
      lastVisible: snapshot.docs.length > 0 ? snapshot.docs[snapshot.docs.length - 1] : null
    };
  } catch (error) {
    console.error("Erreur lors de la récupération des films:", error);
    throw error;
  }
}

/**
 * Récupère un film par son ID
 */
export async function getMovieById(id: string): Promise<Movie | null> {
  try {
    const movieDoc = await getDoc(doc(firestore, "movies", id));
    
    if (!movieDoc.exists()) {
      return null;
    }
    
    return {
      id: movieDoc.id,
      ...movieDoc.data(),
      createdAt: movieDoc.data().createdAt?.toDate(),
      updatedAt: movieDoc.data().updatedAt?.toDate()
    } as Movie;
  } catch (error) {
    console.error(`Erreur lors de la récupération du film ${id}:`, error);
    throw error;
  }
}

// Alias pour la compatibilité
export const getMovie = getMovieById;

/**
 * Ajoute un nouveau film
 */
export async function addMovie(movieData: Omit<Movie, 'id' | 'createdAt' | 'updatedAt' | 'views'>, userId: string): Promise<string> {
  try {
    const timestamp = serverTimestamp();
    
    const movieRef = await addDoc(collection(firestore, "movies"), {
      ...movieData,
      views: 0,
      createdAt: timestamp,
      updatedAt: timestamp
    });
    
    // Enregistrer l'activité
    await logActivity(
      userId,
      'movie_created',
      'movie',
      movieRef.id,
      { title: movieData.title }
    );
    
    return movieRef.id;
  } catch (error) {
    console.error("Erreur lors de l'ajout du film:", error);
    throw error;
  }
}

/**
 * Met à jour un film existant
 */
export async function updateMovie(id: string, movieData: Partial<Omit<Movie, 'id' | 'createdAt' | 'updatedAt'>>, userId: string): Promise<boolean> {
  try {
    await updateDoc(doc(firestore, "movies", id), {
      ...movieData,
      updatedAt: serverTimestamp()
    });
    
    // Enregistrer l'activité
    await logActivity(
      userId,
      'movie_updated',
      'movie',
      id,
      { title: movieData.title }
    );
    
    return true;
  } catch (error) {
    console.error(`Erreur lors de la mise à jour du film ${id}:`, error);
    throw error;
  }
}

/**
 * Supprime un film
 */
export async function deleteMovie(id: string, userId: string): Promise<boolean> {
  try {
    // Récupérer d'abord les données du film pour l'enregistrement d'activité
    const movieDoc = await getDoc(doc(firestore, "movies", id));
    if (!movieDoc.exists()) {
      throw new Error(`Le film ${id} n'existe pas`);
    }
    
    const movieData = movieDoc.data();
    
    // Supprimer le film
    await deleteDoc(doc(firestore, "movies", id));
    
    // Enregistrer l'activité
    await logActivity(
      userId,
      'movie_deleted',
      'movie',
      id,
      { title: movieData.title }
    );
    
    return true;
  } catch (error) {
    console.error(`Erreur lors de la suppression du film ${id}:`, error);
    throw error;
  }
}

/**
 * Incrémente le compteur de vues d'un film
 */
export async function incrementMovieViews(id: string): Promise<boolean> {
  try {
    await updateDoc(doc(firestore, "movies", id), {
      views: increment(1),
      updatedAt: serverTimestamp()
    });
    
    return true;
  } catch (error) {
    console.error(`Erreur lors de l'incrémentation des vues pour le film ${id}:`, error);
    return false;
  }
}

/**
 * Récupère tous les genres de films
 */
export async function getMovieGenres(): Promise<Genre[]> {
  try {
    const genresSnapshot = await getDocs(collection(firestore, "genres"));
    
    return genresSnapshot.docs.map(doc => ({
      id: doc.id,
      name: doc.data().name
    }));
  } catch (error) {
    console.error("Erreur lors de la récupération des genres:", error);
    return [];
  }
}

/**
 * Récupère les films populaires (basé sur le nombre de vues)
 */
export async function getPopularMovies(count: number = 10, includeVIP: boolean = true): Promise<Movie[]> {
  try {
    let constraints = [
      where("isPublished", "==", true),
      orderBy("views", "desc"),
      limit(count)
    ];
    
    // Si on ne veut pas inclure les films VIP
    if (!includeVIP) {
      constraints.splice(1, 0, where("isVIP", "==", false));
    }
    
    const popularMoviesQuery = query(
      collection(firestore, "movies"),
      ...constraints
    );
    
    const snapshot = await getDocs(popularMoviesQuery);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate()
    } as Movie));
  } catch (error) {
    console.error("Erreur lors de la récupération des films populaires:", error);
    return [];
  }
}

/**
 * Récupère les films par genre
 */
export async function getMoviesByGenre(genreId: string, count: number = 10, includeVIP: boolean = true): Promise<Movie[]> {
  try {
    let constraints = [
      where("isPublished", "==", true),
      where("genre", "array-contains", genreId),
      orderBy("createdAt", "desc"),
      limit(count)
    ];
    
    // Si on ne veut pas inclure les films VIP
    if (!includeVIP) {
      constraints.splice(2, 0, where("isVIP", "==", false));
    }
    
    const genreMoviesQuery = query(
      collection(firestore, "movies"),
      ...constraints
    );
    
    const snapshot = await getDocs(genreMoviesQuery);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate()
    } as Movie));
  } catch (error) {
    console.error(`Erreur lors de la récupération des films du genre ${genreId}:`, error);
    return [];
  }
}