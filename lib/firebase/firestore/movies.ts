import { 
  collection, 
  addDoc, 
  doc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  startAfter,
  increment,
  DocumentData,
  QueryDocumentSnapshot,
  serverTimestamp
} from 'firebase/firestore';
import { deleteObject, ref } from 'firebase/storage';
import { firestore as db, storage } from '@/lib/firebase/config';
import { addActivityLog } from './activity-logs';

// Types
export interface Movie {
  id?: string;
  title: string;
  originalTitle?: string;
  description: string;
  year: number;
  duration: number;
  genres: string[];
  director?: string;
  posterUrl?: string;
  backdropUrl?: string;
  trailerUrl?: string;
  rating?: number;
  isVIP: boolean;
  isPublished: boolean;
  views: number;
  cast?: { name: string; role?: string }[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Genre {
  id: string;
  name: string;
}

// Liste temporaire des genres (en attendant qu'ils soient gérés dans une collection)
const genres: Genre[] = [
  { id: 'action', name: 'Action' },
  { id: 'adventure', name: 'Aventure' },
  { id: 'animation', name: 'Animation' },
  { id: 'comedy', name: 'Comédie' },
  { id: 'crime', name: 'Crime' },
  { id: 'documentary', name: 'Documentaire' },
  { id: 'drama', name: 'Drame' },
  { id: 'family', name: 'Famille' },
  { id: 'fantasy', name: 'Fantaisie' },
  { id: 'history', name: 'Histoire' },
  { id: 'horror', name: 'Horreur' },
  { id: 'music', name: 'Musique' },
  { id: 'mystery', name: 'Mystère' },
  { id: 'romance', name: 'Romance' },
  { id: 'sci-fi', name: 'Science-Fiction' },
  { id: 'thriller', name: 'Thriller' },
  { id: 'war', name: 'Guerre' },
  { id: 'western', name: 'Western' }
];

// Fonction pour récupérer tous les genres
export async function getMovieGenres(): Promise<Genre[]> {
  // Dans le futur, cette fonction pourrait récupérer les genres depuis Firestore
  // Pour l'instant, on retourne simplement la liste statique
  return genres;
}

// Fonction pour ajouter un film
export async function addMovie(movieData: Omit<Movie, 'id' | 'views' | 'createdAt' | 'updatedAt'>, adminId: string): Promise<string> {
  try {
    const movieRef = collection(db, 'movies');
    
    const movie = {
      ...movieData,
      views: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    const docRef = await addDoc(movieRef, movie);
    
    // Mettre à jour les statistiques
    await updateMovieStatistics(true, movieData.isPublished);
    
    // Ajouter une entrée dans les logs d'activité
    await addActivityLog({
      adminId,
      action: 'create',
      entityType: 'movie',
      entityId: docRef.id,
      details: `Film "${movieData.title}" créé`,
    });
    
    return docRef.id;
  } catch (error) {
    console.error('Erreur lors de l\'ajout du film:', error);
    throw error;
  }
}

// Fonction pour récupérer un film par son ID
export async function getMovie(movieId: string): Promise<Movie | null> {
  try {
    const movieDoc = await getDoc(doc(db, 'movies', movieId));
    
    if (!movieDoc.exists()) {
      return null;
    }
    
    const data = movieDoc.data();
    
    return {
      id: movieDoc.id,
      ...data,
      createdAt: data.createdAt?.toDate(),
      updatedAt: data.updatedAt?.toDate(),
    } as Movie;
  } catch (error) {
    console.error('Erreur lors de la récupération du film:', error);
    throw error;
  }
}

// Interface pour les options de récupération des films
interface GetMoviesOptions {
  limit?: number;
  startAfter?: QueryDocumentSnapshot<DocumentData>;
  onlyPublished?: boolean;
  genreFilter?: string;
  isVIP?: boolean;
}

// Fonction pour récupérer une liste de films avec pagination
export async function getMovies(options: GetMoviesOptions = {}): Promise<{
  movies: Movie[];
  lastVisible: QueryDocumentSnapshot<DocumentData> | null;
}> {
  try {
    const {
      limit: limitCount = 10,
      startAfter: startAfterDoc,
      onlyPublished = false,
      genreFilter,
      isVIP,
    } = options;
    
    let q = query(collection(db, 'movies'), orderBy('createdAt', 'desc'));
    
    // Filtrer les films publiés si demandé
    if (onlyPublished) {
      q = query(q, where('isPublished', '==', true));
    }
    
    // Filtrer par genre si spécifié
    if (genreFilter) {
      q = query(q, where('genres', 'array-contains', genreFilter));
    }
    
    // Filtrer par statut VIP si spécifié
    if (isVIP !== undefined) {
      q = query(q, where('isVIP', '==', isVIP));
    }
    
    // Appliquer la pagination
    q = query(q, limit(limitCount));
    
    if (startAfterDoc) {
      q = query(q, startAfter(startAfterDoc));
    }
    
    const snapshot = await getDocs(q);
    const movies: Movie[] = [];
    
    snapshot.forEach((doc) => {
      const data = doc.data();
      movies.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate(),
      } as Movie);
    });
    
    const lastVisible = snapshot.docs.length > 0 ? snapshot.docs[snapshot.docs.length - 1] : null;
    
    return { movies, lastVisible };
  } catch (error) {
    console.error('Erreur lors de la récupération des films:', error);
    throw error;
  }
}

// Fonction pour récupérer les films populaires
export async function getPopularMovies(limitCount: number = 10, onlyPublished: boolean = true, includeVIP: boolean = false): Promise<Movie[]> {
  try {
    let q = query(collection(db, 'movies'), orderBy('views', 'desc'), limit(limitCount));
    
    if (onlyPublished) {
      q = query(q, where('isPublished', '==', true));
    }
    
    if (!includeVIP) {
      q = query(q, where('isVIP', '==', false));
    }
    
    const snapshot = await getDocs(q);
    const movies: Movie[] = [];
    
    snapshot.forEach((doc) => {
      const data = doc.data();
      movies.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate(),
      } as Movie);
    });
    
    return movies;
  } catch (error) {
    console.error('Erreur lors de la récupération des films populaires:', error);
    throw error;
  }
}

// Fonction pour mettre à jour un film
export async function updateMovie(
  movieId: string,
  movieData: Partial<Movie>,
  adminId: string
): Promise<void> {
  try {
    const movieRef = doc(db, 'movies', movieId);
    const movieSnapshot = await getDoc(movieRef);
    
    if (!movieSnapshot.exists()) {
      throw new Error('Film non trouvé');
    }
    
    const oldData = movieSnapshot.data() as Movie;
    const isPublishStatusChanged = 
      movieData.isPublished !== undefined && 
      movieData.isPublished !== oldData.isPublished;
    
    await updateDoc(movieRef, {
      ...movieData,
      updatedAt: serverTimestamp()
    });
    
    // Si le statut de publication a changé, mettre à jour les statistiques
    if (isPublishStatusChanged) {
      await updateMovieStatistics(false, movieData.isPublished);
    }
    
    // Ajouter une entrée dans les logs d'activité
    await addActivityLog({
      adminId,
      action: 'update',
      entityType: 'movie',
      entityId: movieId,
      details: `Film "${oldData.title}" mis à jour`,
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour du film:', error);
    throw error;
  }
}

// Fonction pour supprimer un film
export async function deleteMovie(movieId: string, adminId: string): Promise<void> {
  try {
    const movieRef = doc(db, 'movies', movieId);
    const movieSnapshot = await getDoc(movieRef);
    
    if (!movieSnapshot.exists()) {
      throw new Error('Film non trouvé');
    }
    
    const movieData = movieSnapshot.data() as Movie;
    
    // Supprimer les images de Firebase Storage si elles existent
    if (movieData.posterUrl) {
      // Extraction du nom du fichier à partir de l'URL
      const posterName = movieData.posterUrl.split('/').pop();
      if (posterName) {
        const posterRef = ref(storage, `movie_posters/${posterName}`);
        try {
          await deleteObject(posterRef);
        } catch (error) {
          console.error('Erreur lors de la suppression du poster:', error);
        }
      }
    }
    
    if (movieData.backdropUrl) {
      // Extraction du nom du fichier à partir de l'URL
      const backdropName = movieData.backdropUrl.split('/').pop();
      if (backdropName) {
        const backdropRef = ref(storage, `movie_backdrops/${backdropName}`);
        try {
          await deleteObject(backdropRef);
        } catch (error) {
          console.error('Erreur lors de la suppression du backdrop:', error);
        }
      }
    }
    
    // Supprimer le document
    await deleteDoc(movieRef);
    
    // Mettre à jour les statistiques
    await updateMovieStatistics(false, movieData.isPublished, true);
    
    // Ajouter une entrée dans les logs d'activité
    await addActivityLog({
      adminId,
      action: 'delete',
      entityType: 'movie',
      entityId: movieId,
      details: `Film "${movieData.title}" supprimé`,
    });
  } catch (error) {
    console.error('Erreur lors de la suppression du film:', error);
    throw error;
  }
}

// Fonction pour incrémenter le nombre de vues d'un film
export async function incrementMovieViews(movieId: string): Promise<void> {
  try {
    const movieRef = doc(db, 'movies', movieId);
    
    await updateDoc(movieRef, {
      views: increment(1),
      updatedAt: serverTimestamp()
    });
    
    // Mettre à jour les statistiques globales
    const statisticsRef = doc(db, 'statistics', 'content_stats');
    await updateDoc(statisticsRef, {
      totalViews: increment(1),
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Erreur lors de l\'incrémentation des vues:', error);
    // Non fatal, on peut ignorer cette erreur
  }
}

// Fonction interne pour mettre à jour les statistiques liées aux films
async function updateMovieStatistics(
  isNew: boolean = false,
  isPublished: boolean = false,
  isDeleted: boolean = false
): Promise<void> {
  try {
    const statsRef = doc(db, 'statistics', 'content_stats');
    const updateData: {[key: string]: any} = {
      updatedAt: serverTimestamp()
    };
    
    if (isNew) {
      updateData.totalMovies = increment(1);
      
      if (isPublished) {
        updateData.publishedMovies = increment(1);
      }
    } else if (isDeleted) {
      updateData.totalMovies = increment(-1);
      
      if (isPublished) {
        updateData.publishedMovies = increment(-1);
      }
    } else if (isPublished !== undefined) {
      // Changement de statut de publication
      updateData.publishedMovies = increment(isPublished ? 1 : -1);
    }
    
    await updateDoc(statsRef, updateData);
  } catch (error) {
    console.error('Erreur lors de la mise à jour des statistiques:', error);
    // Non fatal, on peut ignorer cette erreur
  }
}