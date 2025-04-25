import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit,
  startAfter,
  QueryDocumentSnapshot,
  Query,
  DocumentData,
  Timestamp,
  increment
} from "firebase/firestore";
import { 
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject
} from "firebase/storage";
import { firestore, storage } from "../config";
import { addActivityLog } from "./activity-logs";

// Types
export interface Movie {
  id?: string;
  title: string;
  description: string;
  releaseYear: number;
  duration: number;
  genre: string;
  genres?: string[];
  director?: string;
  cast?: string[];
  posterUrl?: string;
  backdropUrl?: string;
  trailerUrl?: string;
  vipOnly: boolean;
  status: "draft" | "published";
  rating?: number;
  views?: number;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy?: string;
}

// Collection de référence
const COLLECTION = "movies";

// Ajouter un film
export const addMovie = async (movie: Omit<Movie, "id" | "createdAt" | "updatedAt">, adminId: string): Promise<Movie> => {
  try {
    const now = new Date().toISOString();
    
    const movieData = {
      ...movie,
      views: 0,
      rating: 0,
      createdAt: now,
      updatedAt: now,
      createdBy: adminId
    };
    
    const docRef = await addDoc(collection(firestore, COLLECTION), movieData);
    
    // Journaliser l'activité
    await addActivityLog({
      action: "create",
      entityType: "movie",
      entityId: docRef.id,
      details: `Création du film: ${movie.title}`,
      performedBy: adminId,
      timestamp: now
    });
    
    return {
      id: docRef.id,
      ...movieData
    };
  } catch (error) {
    console.error("Erreur lors de l'ajout du film:", error);
    throw error;
  }
};

// Récupérer un film par ID
export const getMovie = async (id: string): Promise<Movie | null> => {
  try {
    const docRef = doc(firestore, COLLECTION, id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data()
      } as Movie;
    }
    
    return null;
  } catch (error) {
    console.error(`Erreur lors de la récupération du film ${id}:`, error);
    throw error;
  }
};

// Mettre à jour un film
export const updateMovie = async (id: string, movieData: Partial<Movie>, adminId: string): Promise<Movie> => {
  try {
    const now = new Date().toISOString();
    const movieRef = doc(firestore, COLLECTION, id);
    
    // Récupérer le film actuel pour le log d'activité
    const movieSnapshot = await getDoc(movieRef);
    if (!movieSnapshot.exists()) {
      throw new Error(`Film avec l'ID ${id} non trouvé`);
    }
    
    const currentMovie = movieSnapshot.data() as Movie;
    
    const updatedData = {
      ...movieData,
      updatedAt: now,
      updatedBy: adminId
    };
    
    await updateDoc(movieRef, updatedData);
    
    // Journaliser l'activité
    await addActivityLog({
      action: "update",
      entityType: "movie",
      entityId: id,
      details: `Mise à jour du film: ${currentMovie.title}`,
      performedBy: adminId,
      timestamp: now
    });
    
    return {
      id,
      ...currentMovie,
      ...updatedData
    };
  } catch (error) {
    console.error(`Erreur lors de la mise à jour du film ${id}:`, error);
    throw error;
  }
};

// Supprimer un film
export const deleteMovie = async (id: string, adminId: string): Promise<void> => {
  try {
    const movieRef = doc(firestore, COLLECTION, id);
    
    // Récupérer les informations du film pour la journalisation et suppression des images
    const movieSnapshot = await getDoc(movieRef);
    if (!movieSnapshot.exists()) {
      throw new Error(`Film avec l'ID ${id} non trouvé`);
    }
    
    const movieData = movieSnapshot.data() as Movie;
    
    // Supprimer les images associées s'il y en a
    if (movieData.posterUrl) {
      const posterRef = ref(storage, movieData.posterUrl);
      await deleteObject(posterRef).catch(err => console.warn("Erreur lors de la suppression du poster:", err));
    }
    
    if (movieData.backdropUrl) {
      const backdropRef = ref(storage, movieData.backdropUrl);
      await deleteObject(backdropRef).catch(err => console.warn("Erreur lors de la suppression de l'image de fond:", err));
    }
    
    // Supprimer le document
    await deleteDoc(movieRef);
    
    // Journaliser l'activité
    await addActivityLog({
      action: "delete",
      entityType: "movie",
      entityId: id,
      details: `Suppression du film: ${movieData.title}`,
      performedBy: adminId,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error(`Erreur lors de la suppression du film ${id}:`, error);
    throw error;
  }
};

// Récupérer une liste de films avec filtres et pagination
export const getMovies = async (
  options: {
    status?: "draft" | "published",
    vipOnly?: boolean,
    genre?: string,
    searchQuery?: string,
    sortBy?: "title" | "releaseYear" | "createdAt" | "views" | "rating",
    sortDirection?: "asc" | "desc",
    limit?: number,
    startAfterDoc?: QueryDocumentSnapshot<DocumentData>,
    startAfterTitle?: string
  } = {}
): Promise<{movies: Movie[], lastDoc: QueryDocumentSnapshot<DocumentData> | null}> => {
  try {
    let q: Query<DocumentData> = collection(firestore, COLLECTION);
    
    const {
      status,
      vipOnly,
      genre,
      searchQuery,
      sortBy = "createdAt",
      sortDirection = "desc",
      limit: limitCount = 20,
      startAfterDoc,
      startAfterTitle
    } = options;
    
    // Ajouter les filtres si présents
    if (status) {
      q = query(q, where("status", "==", status));
    }
    
    if (vipOnly !== undefined) {
      q = query(q, where("vipOnly", "==", vipOnly));
    }
    
    if (genre) {
      q = query(q, where("genres", "array-contains", genre));
    }
    
    // Recherche textuelle simple via titre
    if (searchQuery) {
      // Firestore n'a pas de recherche texte native efficace
      // Solution simple: utiliser la recherche par préfixe pour les titres
      // Méthode plus avancée: utiliser une solution de recherche dédiée comme Algolia
      q = query(q, where("title", ">=", searchQuery), where("title", "<=", searchQuery + "\uf8ff"));
    }
    
    // Ajouter le tri
    q = query(q, orderBy(sortBy, sortDirection));
    
    // Ajouter la pagination
    if (startAfterDoc) {
      q = query(q, startAfter(startAfterDoc));
    } else if (startAfterTitle && sortBy === "title") {
      q = query(q, startAfter(startAfterTitle));
    }
    
    // Limiter le nombre de résultats
    q = query(q, limit(limitCount));
    
    // Exécuter la requête
    const querySnapshot = await getDocs(q);
    
    // Formatage des résultats
    const movies = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Movie));
    
    return {
      movies,
      lastDoc: querySnapshot.docs.length > 0 ? querySnapshot.docs[querySnapshot.docs.length - 1] : null
    };
  } catch (error) {
    console.error("Erreur lors de la récupération des films:", error);
    throw error;
  }
};

// Incrémenter le compteur de vues
export const incrementMovieViews = async (id: string): Promise<void> => {
  try {
    const movieRef = doc(firestore, COLLECTION, id);
    await updateDoc(movieRef, {
      views: increment(1),
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error(`Erreur lors de l'incrémentation des vues du film ${id}:`, error);
    throw error;
  }
};

// Télécharger une image pour un film (poster ou backdrop)
export const uploadMovieImage = async (
  file: File,
  movieId: string,
  type: "poster" | "backdrop"
): Promise<string> => {
  try {
    // Créer un chemin unique pour l'image
    const extension = file.name.split(".").pop();
    const path = `movies/${movieId}/${type}_${Date.now()}.${extension}`;
    const storageRef = ref(storage, path);
    
    // Télécharger le fichier
    const uploadTask = uploadBytesResumable(storageRef, file);
    
    // Attendre que le téléchargement soit terminé
    return new Promise((resolve, reject) => {
      uploadTask.on(
        "state_changed",
        (snapshot) => {
          // Progression du téléchargement
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log(`Téléchargement ${type}: ${progress}%`);
        },
        (error) => {
          // Erreur
          console.error(`Erreur lors du téléchargement de l'image ${type}:`, error);
          reject(error);
        },
        async () => {
          // Téléchargement terminé
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          resolve(downloadURL);
        }
      );
    });
  } catch (error) {
    console.error(`Erreur lors du téléchargement de l'image ${type}:`, error);
    throw error;
  }
};

// Obtenir les films populaires
export const getPopularMovies = async (limit: number = 10): Promise<Movie[]> => {
  try {
    const q = query(
      collection(firestore, COLLECTION),
      where("status", "==", "published"),
      orderBy("views", "desc"),
      limit(limit)
    );
    
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Movie));
  } catch (error) {
    console.error("Erreur lors de la récupération des films populaires:", error);
    throw error;
  }
};

// Obtenir les films récents
export const getRecentMovies = async (limit: number = 10): Promise<Movie[]> => {
  try {
    const q = query(
      collection(firestore, COLLECTION),
      where("status", "==", "published"),
      orderBy("createdAt", "desc"),
      limit(limit)
    );
    
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Movie));
  } catch (error) {
    console.error("Erreur lors de la récupération des films récents:", error);
    throw error;
  }
};

// Obtenir les films par genre
export const getMoviesByGenre = async (genre: string, limit: number = 10): Promise<Movie[]> => {
  try {
    const q = query(
      collection(firestore, COLLECTION),
      where("status", "==", "published"),
      where("genres", "array-contains", genre),
      orderBy("createdAt", "desc"),
      limit(limit)
    );
    
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Movie));
  } catch (error) {
    console.error(`Erreur lors de la récupération des films par genre ${genre}:`, error);
    throw error;
  }
};