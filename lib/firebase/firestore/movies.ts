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
  DocumentData,
  Timestamp,
  increment
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { firestore, storage } from "../config";

// Type pour les films
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
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy?: string;
}

// Nom de la collection
const COLLECTION = "movies";

// ===== OPÉRATIONS CRUD DE BASE =====

// Créer un film
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
    
    // Mettre à jour les statistiques
    updateStatistics(true);
    
    return {
      id: docRef.id,
      ...movieData
    };
  } catch (error) {
    console.error("Erreur lors de l'ajout du film:", error);
    throw error;
  }
};

// Lire un film
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
    
    // Récupérer le film actuel pour combiner les données
    const movieSnap = await getDoc(movieRef);
    if (!movieSnap.exists()) {
      throw new Error(`Film avec l'ID ${id} non trouvé`);
    }
    
    const currentMovie = movieSnap.data() as Movie;
    
    // Si le statut change de draft à published, mettre à jour les statistiques
    if (currentMovie.status === "draft" && movieData.status === "published") {
      updatePublishedStatistics(true);
    }
    
    // Si le statut change de published à draft, mettre à jour les statistiques
    if (currentMovie.status === "published" && movieData.status === "draft") {
      updatePublishedStatistics(false);
    }
    
    const updatedData = {
      ...movieData,
      updatedAt: now,
      updatedBy: adminId
    };
    
    await updateDoc(movieRef, updatedData);
    
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
export const deleteMovie = async (id: string): Promise<void> => {
  try {
    const movieRef = doc(firestore, COLLECTION, id);
    
    // Récupérer les informations du film pour la mise à jour des statistiques
    const movieSnap = await getDoc(movieRef);
    if (!movieSnap.exists()) {
      throw new Error(`Film avec l'ID ${id} non trouvé`);
    }
    
    const movieData = movieSnap.data() as Movie;
    
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
    
    // Mettre à jour les statistiques
    updateStatistics(false);
    
    // Mettre à jour les statistiques publiées si nécessaire
    if (movieData.status === "published") {
      updatePublishedStatistics(false);
    }
  } catch (error) {
    console.error(`Erreur lors de la suppression du film ${id}:`, error);
    throw error;
  }
};

// ===== REQUÊTES SPÉCIFIQUES =====

// Récupérer tous les films
export const getAllMovies = async (): Promise<Movie[]> => {
  try {
    const q = query(collection(firestore, COLLECTION), orderBy("updatedAt", "desc"));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Movie));
  } catch (error) {
    console.error("Erreur lors de la récupération des films:", error);
    throw error;
  }
};

// Récupérer les films publiés
export const getPublishedMovies = async (): Promise<Movie[]> => {
  try {
    const q = query(
      collection(firestore, COLLECTION),
      where("status", "==", "published"),
      orderBy("updatedAt", "desc")
    );
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Movie));
  } catch (error) {
    console.error("Erreur lors de la récupération des films publiés:", error);
    throw error;
  }
};

// Récupérer les films d'un genre spécifique
export const getMoviesByGenre = async (genre: string): Promise<Movie[]> => {
  try {
    const q = query(
      collection(firestore, COLLECTION),
      where("status", "==", "published"),
      where("genres", "array-contains", genre),
      orderBy("updatedAt", "desc")
    );
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Movie));
  } catch (error) {
    console.error(`Erreur lors de la récupération des films du genre ${genre}:`, error);
    throw error;
  }
};

// Récupérer les films VIP
export const getVIPMovies = async (): Promise<Movie[]> => {
  try {
    const q = query(
      collection(firestore, COLLECTION),
      where("status", "==", "published"),
      where("vipOnly", "==", true),
      orderBy("updatedAt", "desc")
    );
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Movie));
  } catch (error) {
    console.error("Erreur lors de la récupération des films VIP:", error);
    throw error;
  }
};

// ===== FONCTIONNALITÉS SPÉCIALES =====

// Incrémenter le nombre de vues d'un film
export const incrementMovieViews = async (id: string): Promise<void> => {
  try {
    const movieRef = doc(firestore, COLLECTION, id);
    
    await updateDoc(movieRef, {
      views: increment(1),
      updatedAt: new Date().toISOString()
    });
    
    // Mettre à jour les statistiques globales de vues
    const statsRef = doc(firestore, "statistics", "global");
    await updateDoc(statsRef, {
      totalViews: increment(1),
      lastUpdated: new Date().toISOString()
    });
  } catch (error) {
    console.error(`Erreur lors de l'incrémentation des vues du film ${id}:`, error);
    throw error;
  }
};

// Télécharger une image de poster
export const uploadPoster = async (file: File, movieId: string): Promise<string> => {
  try {
    // Créer une référence unique pour le fichier
    const fileRef = ref(storage, `movies/${movieId}/poster_${Date.now()}`);
    
    // Télécharger le fichier
    await uploadBytes(fileRef, file);
    
    // Obtenir l'URL de téléchargement
    const downloadURL = await getDownloadURL(fileRef);
    
    return downloadURL;
  } catch (error) {
    console.error("Erreur lors du téléchargement du poster:", error);
    throw error;
  }
};

// Télécharger une image de fond
export const uploadBackdrop = async (file: File, movieId: string): Promise<string> => {
  try {
    // Créer une référence unique pour le fichier
    const fileRef = ref(storage, `movies/${movieId}/backdrop_${Date.now()}`);
    
    // Télécharger le fichier
    await uploadBytes(fileRef, file);
    
    // Obtenir l'URL de téléchargement
    const downloadURL = await getDownloadURL(fileRef);
    
    return downloadURL;
  } catch (error) {
    console.error("Erreur lors du téléchargement de l'image de fond:", error);
    throw error;
  }
};

// ===== FONCTIONS UTILITAIRES =====

// Mettre à jour les statistiques globales des films
const updateStatistics = async (isAddition: boolean): Promise<void> => {
  try {
    const statsRef = doc(firestore, "statistics", "global");
    
    await updateDoc(statsRef, {
      totalMovies: increment(isAddition ? 1 : -1),
      lastUpdated: new Date().toISOString()
    });
  } catch (error) {
    console.error("Erreur lors de la mise à jour des statistiques:", error);
  }
};

// Mettre à jour les statistiques des films publiés
const updatePublishedStatistics = async (isAddition: boolean): Promise<void> => {
  try {
    const statsRef = doc(firestore, "statistics", "global");
    
    await updateDoc(statsRef, {
      publishedMovies: increment(isAddition ? 1 : -1),
      lastUpdated: new Date().toISOString()
    });
  } catch (error) {
    console.error("Erreur lors de la mise à jour des statistiques de films publiés:", error);
  }
};