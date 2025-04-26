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
  QueryDocumentSnapshot
} from "firebase/firestore";
import { ref, uploadString, getDownloadURL, deleteObject } from "firebase/storage";
import { logActivity } from "./activity-logs";
import { updateStatistics } from "./statistics";

export interface Genre {
  id: string;
  name: string;
}

export interface MovieCast {
  name: string;
  role: string;
  photoUrl?: string;
}

export interface Movie {
  id?: string;
  title: string;
  description: string;
  year: number;
  duration: number; // en minutes
  genres: string[];
  posterUrl?: string;
  backdropUrl?: string;
  trailerUrl?: string;
  director?: string;
  cast?: MovieCast[];
  rating?: number;
  isVIP: boolean;
  isPublished: boolean;
  publishedAt?: Timestamp;
  views: number;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
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
 * Mettre à jour un film
 */
export async function updateMovie(
  movieId: string, 
  movieData: Partial<Movie>,
  posterBase64?: string,
  backdropBase64?: string
) {
  try {
    const movieRef = doc(firestore, "movies", movieId);
    const movieDoc = await getDoc(movieRef);
    
    if (!movieDoc.exists()) {
      throw new Error(`Film ${movieId} non trouvé`);
    }
    
    const oldData = movieDoc.data() as Movie;
    
    // Préparer les données de mise à jour
    const updateData = {
      ...movieData,
      updatedAt: serverTimestamp()
    };
    
    // Si le statut de publication change
    let publishedStatusChanged = false;
    let newPublishedStatus = false;
    
    if (movieData.isPublished !== undefined && movieData.isPublished !== oldData.isPublished) {
      publishedStatusChanged = true;
      newPublishedStatus = movieData.isPublished;
      
      // Si le film est publié pour la première fois
      if (newPublishedStatus && !oldData.publishedAt) {
        updateData.publishedAt = serverTimestamp();
      }
    }
    
    // Uploader le nouveau poster si fourni
    if (posterBase64) {
      const newPosterUrl = await uploadMoviePoster(movieId, posterBase64);
      if (newPosterUrl) {
        updateData.posterUrl = newPosterUrl;
        
        // Supprimer l'ancien poster si existant
        if (oldData.posterUrl) {
          try {
            const oldPosterPath = oldData.posterUrl.split('/').pop()?.split('?')[0];
            if (oldPosterPath) {
              await deleteObject(ref(storage, `movies/posters/${oldPosterPath}`));
            }
          } catch (error) {
            console.error("Erreur lors de la suppression de l'ancien poster:", error);
          }
        }
      }
    }
    
    // Uploader le nouveau backdrop si fourni
    if (backdropBase64) {
      const newBackdropUrl = await uploadMovieBackdrop(movieId, backdropBase64);
      if (newBackdropUrl) {
        updateData.backdropUrl = newBackdropUrl;
        
        // Supprimer l'ancien backdrop si existant
        if (oldData.backdropUrl) {
          try {
            const oldBackdropPath = oldData.backdropUrl.split('/').pop()?.split('?')[0];
            if (oldBackdropPath) {
              await deleteObject(ref(storage, `movies/backdrops/${oldBackdropPath}`));
            }
          } catch (error) {
            console.error("Erreur lors de la suppression de l'ancien backdrop:", error);
          }
        }
      }
    }
    
    // Mettre à jour le document
    await updateDoc(movieRef, updateData);
    
    // Mettre à jour les statistiques si le statut de publication a changé
    if (publishedStatusChanged) {
      await updateStatistics({
        publishedMovies: newPublishedStatus ? increment(1) : increment(-1)
      });
    }
    
    // Journaliser l'activité
    logActivity({
      action: "content_update",
      entityType: "movie",
      entityId: movieId,
      details: { 
        title: oldData.title,
        updatedFields: Object.keys(movieData),
        publishStatusChanged: publishedStatusChanged,
        isNowPublished: newPublishedStatus
      }
    });
    
    return { id: movieId, ...oldData, ...updateData };
  } catch (error) {
    console.error(`Erreur lors de la mise à jour du film ${movieId}:`, error);
    throw error;
  }
}

/**
 * Supprimer un film
 */
export async function deleteMovie(movieId: string) {
  try {
    // Récupérer les informations du film avant suppression
    const movieRef = doc(firestore, "movies", movieId);
    const movieDoc = await getDoc(movieRef);
    
    if (!movieDoc.exists()) {
      throw new Error(`Film ${movieId} non trouvé`);
    }
    
    const movieData = movieDoc.data() as Movie;
    
    // Supprimer le poster si existant
    if (movieData.posterUrl) {
      try {
        const posterPath = movieData.posterUrl.split('/').pop()?.split('?')[0];
        if (posterPath) {
          await deleteObject(ref(storage, `movies/posters/${posterPath}`));
        }
      } catch (error) {
        console.error("Erreur lors de la suppression du poster:", error);
      }
    }
    
    // Supprimer le backdrop si existant
    if (movieData.backdropUrl) {
      try {
        const backdropPath = movieData.backdropUrl.split('/').pop()?.split('?')[0];
        if (backdropPath) {
          await deleteObject(ref(storage, `movies/backdrops/${backdropPath}`));
        }
      } catch (error) {
        console.error("Erreur lors de la suppression du backdrop:", error);
      }
    }
    
    // Supprimer le document
    await deleteDoc(movieRef);
    
    // Mettre à jour les statistiques
    await updateStatistics({
      totalMovies: increment(-1),
      publishedMovies: movieData.isPublished ? increment(-1) : increment(0)
    });
    
    // Journaliser l'activité
    logActivity({
      action: "content_delete",
      entityType: "movie",
      entityId: movieId,
      details: { 
        title: movieData.title,
        isVIP: movieData.isVIP,
        isPublished: movieData.isPublished
      }
    });
    
    return true;
  } catch (error) {
    console.error(`Erreur lors de la suppression du film ${movieId}:`, error);
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
 * Récupérer tous les films paginés
 */
export async function getMovies(options: {
  limit?: number;
  startAfter?: QueryDocumentSnapshot<DocumentData>;
  orderByField?: keyof Movie;
  orderDirection?: 'asc' | 'desc';
  onlyPublished?: boolean;
  genreFilter?: string;
  isVIP?: boolean;
  searchTerm?: string;
} = {}) {
  try {
    let {
      limit: limitCount = 20,
      startAfter: startAfterDoc,
      orderByField = 'createdAt',
      orderDirection = 'desc',
      onlyPublished = false,
      genreFilter,
      isVIP,
      searchTerm
    } = options;
    
    // Construire la requête de base
    let q = query(
      collection(firestore, "movies"),
      orderBy(orderByField, orderDirection)
    );
    
    // Appliquer le filtre de publication
    if (onlyPublished) {
      q = query(q, where("isPublished", "==", true));
    }
    
    // Appliquer le filtre de genre
    if (genreFilter) {
      q = query(q, where("genres", "array-contains", genreFilter));
    }
    
    // Appliquer le filtre VIP
    if (isVIP !== undefined) {
      q = query(q, where("isVIP", "==", isVIP));
    }
    
    // Appliquer le curseur de pagination
    if (startAfterDoc) {
      q = query(q, startAfter(startAfterDoc));
    }
    
    // Appliquer la limite
    q = query(q, limit(limitCount));
    
    // Exécuter la requête
    const querySnapshot = await getDocs(q);
    const movies: Movie[] = [];
    let lastVisible: QueryDocumentSnapshot<DocumentData> | null = null;
    
    querySnapshot.forEach((doc) => {
      // Si un terme de recherche est spécifié, filtrer côté client
      const data = doc.data() as Omit<Movie, 'id'>;
      if (searchTerm && !data.title.toLowerCase().includes(searchTerm.toLowerCase())) {
        return;
      }
      
      movies.push({ id: doc.id, ...data } as Movie);
      lastVisible = doc;
    });
    
    return {
      movies,
      lastVisible
    };
  } catch (error) {
    console.error("Erreur lors de la récupération des films:", error);
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
 * Récupérer les films récemment ajoutés
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
 * Récupérer les genres de films disponibles
 */
export async function getMovieGenres() {
  try {
    const genres = [
      { id: "action", name: "Action" },
      { id: "adventure", name: "Aventure" },
      { id: "animation", name: "Animation" },
      { id: "comedy", name: "Comédie" },
      { id: "crime", name: "Crime" },
      { id: "documentary", name: "Documentaire" },
      { id: "drama", name: "Drame" },
      { id: "family", name: "Famille" },
      { id: "fantasy", name: "Fantastique" },
      { id: "history", name: "Histoire" },
      { id: "horror", name: "Horreur" },
      { id: "music", name: "Musique" },
      { id: "mystery", name: "Mystère" },
      { id: "romance", name: "Romance" },
      { id: "science_fiction", name: "Science-Fiction" },
      { id: "thriller", name: "Thriller" },
      { id: "war", name: "Guerre" },
      { id: "western", name: "Western" }
    ];
    
    return genres;
  } catch (error) {
    console.error("Erreur lors de la récupération des genres:", error);
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