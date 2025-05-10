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
  Timestamp,
  DocumentData,
  QueryDocumentSnapshot,
  QueryConstraint,
  runTransaction,
  serverTimestamp
} from "firebase/firestore";
import { firestore } from "../config";
import { addActivityLog } from "./activity-logs";
// (Cloudinary supprimé, migrer upload/delete vers Supabase Storage si besoin)
import { updateStatistics } from "./statistics";

// Types
export interface Movie {
  id?: string;
  title: string;
  originalTitle?: string;
  description: string;
  poster?: string;
  backdrop?: string;
  posterPublicId?: string;
  backdropPublicId?: string;
  trailer?: string;
  releaseYear: number;
  duration: number; // en minutes
  director?: string;
  cast?: string[];
  genres?: string[];
  rating?: number;
  isVIP: boolean;
  isPublished: boolean;
  views: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  createdBy?: string;
  updatedBy?: string;
}

// Ajouter un film
export async function addMovie(
  movieData: Omit<Movie, 'id' | 'views' | 'createdAt' | 'updatedAt'>,
  posterFile?: File,
  backdropFile?: File,
  adminId?: string,
  adminEmail?: string
): Promise<{ success: boolean; id?: string; error?: string }> {
  try {
    // Upload du poster si fourni
    let posterUrl = movieData.poster || '';
    let posterPublicId = movieData.posterPublicId || '';
    
    if (posterFile) {
      const result = await uploadImage(posterFile);
      posterUrl = result.secure_url;
      posterPublicId = result.public_id;
    }
    
    // Upload du backdrop si fourni
    let backdropUrl = movieData.backdrop || '';
    let backdropPublicId = movieData.backdropPublicId || '';
    
    if (backdropFile) {
      const result = await uploadImage(backdropFile);
      backdropUrl = result.secure_url;
      backdropPublicId = result.public_id;
    }
    
    // Préparer les données du film
    const movie: Omit<Movie, 'id'> = {
      ...movieData,
      poster: posterUrl,
      backdrop: backdropUrl,
      posterPublicId,
      backdropPublicId,
      views: 0,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      createdBy: adminId,
      updatedBy: adminId
    };
    
    // Ajouter le document à Firestore
    const docRef = await addDoc(collection(firestore, "movies"), movie);
    
    // Mise à jour des statistiques
    await updateStatistics({
      totalMovies: increment(1),
      publishedMovies: movie.isPublished ? increment(1) : increment(0)
    });
    
    // Ajouter l'activité
    await addActivityLog({
      type: 'movie',
      action: 'create',
      entityId: docRef.id,
      entityType: 'movie',
      adminId,
      adminEmail,
      details: { title: movie.title, isPublished: movie.isPublished, isVIP: movie.isVIP }
    });
    
    return { success: true, id: docRef.id };
  } catch (error: any) {
    console.error("Error adding movie:", error);
    return { success: false, error: error.message || "Erreur lors de la création du film" };
  }
}

// Obtenir un film par ID
export async function getMovie(id: string): Promise<Movie | null> {
  try {
    const movieDoc = await getDoc(doc(firestore, "movies", id));
    
    if (movieDoc.exists()) {
      return { id: movieDoc.id, ...movieDoc.data() } as Movie;
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error getting movie:", error);
    return null;
  }
}

// Mettre à jour un film
export async function updateMovie(
  id: string,
  movieData: Partial<Movie>,
  posterFile?: File,
  backdropFile?: File,
  adminId?: string,
  adminEmail?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Récupérer l'état initial du film pour les statistiques et la suppression d'images
    const movieDoc = await getDoc(doc(firestore, "movies", id));
    
    if (!movieDoc.exists()) {
      return { success: false, error: "Film non trouvé" };
    }
    
    const currentMovie = movieDoc.data() as Movie;
    const updateData: Partial<Movie> = { ...movieData };
    
    // Gérer les changements de publication pour les statistiques
    let publishedChange = 0;
    if (movieData.isPublished !== undefined && currentMovie.isPublished !== movieData.isPublished) {
      publishedChange = movieData.isPublished ? 1 : -1;
    }
    
    // Upload du poster si fourni
    if (posterFile) {
      const result = await uploadImage(posterFile);
      updateData.poster = result.secure_url;
      updateData.posterPublicId = result.public_id;
      
      // Supprimer l'ancien poster si existant
      if (currentMovie.posterPublicId) {
        await deleteImage(currentMovie.posterPublicId);
      }
    }
    
    // Upload du backdrop si fourni
    if (backdropFile) {
      const result = await uploadImage(backdropFile);
      updateData.backdrop = result.secure_url;
      updateData.backdropPublicId = result.public_id;
      
      // Supprimer l'ancien backdrop si existant
      if (currentMovie.backdropPublicId) {
        await deleteImage(currentMovie.backdropPublicId);
      }
    }
    
    // Mettre à jour les timestamps
    updateData.updatedAt = Timestamp.now();
    updateData.updatedBy = adminId;
    
    // Mettre à jour le document Firestore
    await updateDoc(doc(firestore, "movies", id), updateData);
    
    // Mettre à jour les statistiques si nécessaire
    if (publishedChange !== 0) {
      await updateStatistics({
        publishedMovies: increment(publishedChange)
      });
    }
    
    // Ajouter l'activité
    await addActivityLog({
      type: 'movie',
      action: 'update',
      entityId: id,
      entityType: 'movie',
      adminId,
      adminEmail,
      details: { 
        title: currentMovie.title,
        updatedFields: Object.keys(movieData),
        isPublished: updateData.isPublished || currentMovie.isPublished
      }
    });
    
    return { success: true };
  } catch (error: any) {
    console.error("Error updating movie:", error);
    return { success: false, error: error.message || "Erreur lors de la mise à jour du film" };
  }
}

// Supprimer un film
export async function deleteMovie(
  id: string,
  adminId?: string,
  adminEmail?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Récupérer les données du film pour les statistiques et les images à supprimer
    const movieDoc = await getDoc(doc(firestore, "movies", id));
    
    if (!movieDoc.exists()) {
      return { success: false, error: "Film non trouvé" };
    }
    
    const movie = movieDoc.data() as Movie;
    
    // Supprimer les images de Cloudinary si elles existent
    if (movie.posterPublicId) {
      await deleteImage(movie.posterPublicId);
    }
    
    if (movie.backdropPublicId) {
      await deleteImage(movie.backdropPublicId);
    }
    
    // Supprimer les commentaires associés (ajouter cette fonctionnalité plus tard)
    // await deleteCommentsForEntity(id, 'movie');
    
    // Supprimer le document du film
    await deleteDoc(doc(firestore, "movies", id));
    
    // Mettre à jour les statistiques
    await updateStatistics({
      totalMovies: increment(-1),
      publishedMovies: movie.isPublished ? increment(-1) : increment(0)
    });
    
    // Ajouter l'activité
    await addActivityLog({
      type: 'movie',
      action: 'delete',
      entityId: id,
      entityType: 'movie',
      adminId,
      adminEmail,
      details: { title: movie.title, wasPublished: movie.isPublished }
    });
    
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting movie:", error);
    return { success: false, error: error.message || "Erreur lors de la suppression du film" };
  }
}

// Obtenir tous les films avec filtrage et pagination
export async function getMovies(
  options: {
    isPublished?: boolean;
    isVIP?: boolean;
    genres?: string[];
    searchTerm?: string;
    orderField?: keyof Movie;
    orderDirection?: 'asc' | 'desc';
    pageSize?: number;
    lastVisible?: QueryDocumentSnapshot<DocumentData>;
  } = {}
): Promise<{ movies: Movie[]; lastVisible: QueryDocumentSnapshot<DocumentData> | null }> {
  try {
    const {
      isPublished,
      isVIP,
      genres,
      searchTerm,
      orderField = 'createdAt',
      orderDirection = 'desc',
      pageSize = 10,
      lastVisible
    } = options;
    
    const constraints: QueryConstraint[] = [];
    
    // Filtres
    if (isPublished !== undefined) {
      constraints.push(where("isPublished", "==", isPublished));
    }
    
    if (isVIP !== undefined) {
      constraints.push(where("isVIP", "==", isVIP));
    }
    
    if (genres && genres.length > 0) {
      // Firestore ne supporte pas directement les requêtes "array-contains-any" avec d'autres filtres
      // Pour les cas complexes, utiliser une structure différente ou filtrer côté client
      constraints.push(where("genres", "array-contains-any", genres));
    }
    
    // Tri
    constraints.push(orderBy(orderField as string, orderDirection));
    
    // Pagination
    constraints.push(limit(pageSize));
    
    if (lastVisible) {
      constraints.push(startAfter(lastVisible));
    }
    
    const q = query(collection(firestore, "movies"), ...constraints);
    const querySnapshot = await getDocs(q);
    
    const movies: Movie[] = [];
    let newLastVisible = null;
    
    if (!querySnapshot.empty) {
      // Filtrer pour la recherche textuelle (Firestore n'a pas de recherche texte native)
      querySnapshot.forEach((doc) => {
        const movieData = doc.data() as Omit<Movie, 'id'>;
        const movie = { id: doc.id, ...movieData } as Movie;
        
        // Appliquer le filtre de recherche côté client si nécessaire
        if (searchTerm && searchTerm.trim() !== '') {
          const searchLower = searchTerm.toLowerCase();
          if (
            movie.title.toLowerCase().includes(searchLower) ||
            (movie.originalTitle && movie.originalTitle.toLowerCase().includes(searchLower)) ||
            movie.description.toLowerCase().includes(searchLower) ||
            (movie.director && movie.director.toLowerCase().includes(searchLower)) ||
            (movie.cast && movie.cast.some(actor => actor.toLowerCase().includes(searchLower)))
          ) {
            movies.push(movie);
          }
        } else {
          movies.push(movie);
        }
      });
      
      // Conserver le dernier document visible pour la pagination
      newLastVisible = querySnapshot.docs[querySnapshot.docs.length - 1];
    }
    
    return { movies, lastVisible: newLastVisible };
  } catch (error) {
    console.error("Error getting movies:", error);
    return { movies: [], lastVisible: null };
  }
}

// Incrémenter le compteur de vues
export async function incrementMovieViews(id: string): Promise<boolean> {
  try {
    await updateDoc(doc(firestore, "movies", id), {
      views: increment(1)
    });
    
    // Mettre à jour les statistiques totales de vues
    await updateStatistics({
      totalViews: increment(1)
    });
    
    return true;
  } catch (error) {
    console.error("Error incrementing movie views:", error);
    return false;
  }
}

// Obtenir les films populaires
export async function getPopularMovies(
  limit_: number = 10,
  isVIPOnly: boolean = false
): Promise<Movie[]> {
  try {
    let q;
    
    if (isVIPOnly) {
      q = query(
        collection(firestore, "movies"),
        where("isPublished", "==", true),
        where("isVIP", "==", true),
        orderBy("views", "desc"),
        limit(limit_)
      );
    } else {
      q = query(
        collection(firestore, "movies"),
        where("isPublished", "==", true),
        orderBy("views", "desc"),
        limit(limit_)
      );
    }
    
    const querySnapshot = await getDocs(q);
    
    const movies: Movie[] = [];
    
    querySnapshot.forEach((doc) => {
      movies.push({ id: doc.id, ...doc.data() } as Movie);
    });
    
    return movies;
  } catch (error) {
    console.error("Error getting popular movies:", error);
    return [];
  }
}

// Obtenir les films par genre
export async function getMoviesByGenre(
  genre: string,
  pageSize: number = 10,
  lastVisible?: QueryDocumentSnapshot<DocumentData>
): Promise<{ movies: Movie[]; lastVisible: QueryDocumentSnapshot<DocumentData> | null }> {
  try {
    const constraints: QueryConstraint[] = [
      where("isPublished", "==", true),
      where("genres", "array-contains", genre),
      orderBy("createdAt", "desc"),
      limit(pageSize)
    ];
    
    if (lastVisible) {
      constraints.push(startAfter(lastVisible));
    }
    
    const q = query(collection(firestore, "movies"), ...constraints);
    const querySnapshot = await getDocs(q);
    
    const movies: Movie[] = [];
    let newLastVisible = null;
    
    if (!querySnapshot.empty) {
      querySnapshot.forEach((doc) => {
        movies.push({ id: doc.id, ...doc.data() } as Movie);
      });
      
      newLastVisible = querySnapshot.docs[querySnapshot.docs.length - 1];
    }
    
    return { movies, lastVisible: newLastVisible };
  } catch (error) {
    console.error("Error getting movies by genre:", error);
    return { movies: [], lastVisible: null };
  }
}

// Rechercher des films (plus avancé que le filtre dans getMovies)
export async function searchMovies(
  query_: string,
  options: {
    isPublished?: boolean;
    isVIP?: boolean;
    genres?: string[];
    pageSize?: number;
    lastVisible?: QueryDocumentSnapshot<DocumentData>;
  } = {}
): Promise<{ movies: Movie[]; lastVisible: QueryDocumentSnapshot<DocumentData> | null }> {
  // Note: Firestore n'a pas de recherche texte avancée native
  // Pour une recherche avancée, envisager d'utiliser Algolia, Elasticsearch, etc.
  // Ceci est une implémentation simplifiée qui recherche dans le titre uniquement
  
  try {
    const {
      isPublished = true,
      isVIP,
      genres,
      pageSize = 10,
      lastVisible
    } = options;
    
    const constraints: QueryConstraint[] = [];
    
    // Filtres
    if (isPublished !== undefined) {
      constraints.push(where("isPublished", "==", isPublished));
    }
    
    if (isVIP !== undefined) {
      constraints.push(where("isVIP", "==", isVIP));
    }
    
    if (genres && genres.length > 0) {
      constraints.push(where("genres", "array-contains-any", genres));
    }
    
    // Tri (pour la pagination)
    constraints.push(orderBy("title", "asc"));
    
    // Pagination
    constraints.push(limit(pageSize));
    
    if (lastVisible) {
      constraints.push(startAfter(lastVisible));
    }
    
    const q = query(collection(firestore, "movies"), ...constraints);
    const querySnapshot = await getDocs(q);
    
    const searchTerms = query_.toLowerCase().split(' ').filter(term => term.length > 0);
    const movies: Movie[] = [];
    let newLastVisible = null;
    
    if (!querySnapshot.empty) {
      // Recherche côté client basée sur le titre, le titre original et la description
      querySnapshot.forEach((doc) => {
        const movieData = doc.data() as Omit<Movie, 'id'>;
        const movie = { id: doc.id, ...movieData } as Movie;
        
        const title = movie.title.toLowerCase();
        const originalTitle = movie.originalTitle?.toLowerCase() || '';
        const description = movie.description.toLowerCase();
        const director = movie.director?.toLowerCase() || '';
        const cast = movie.cast?.map(actor => actor.toLowerCase()) || [];
        
        // Vérifier si tous les termes de recherche sont présents
        const matchesAllTerms = searchTerms.every(term => 
          title.includes(term) || 
          originalTitle.includes(term) || 
          description.includes(term) ||
          director.includes(term) ||
          cast.some(actor => actor.includes(term))
        );
        
        if (matchesAllTerms) {
          movies.push(movie);
        }
      });
      
      // Conserver le dernier document visible pour la pagination
      newLastVisible = querySnapshot.docs[querySnapshot.docs.length - 1];
    }
    
    return { movies, lastVisible: newLastVisible };
  } catch (error) {
    console.error("Error searching movies:", error);
    return { movies: [], lastVisible: null };
  }
}