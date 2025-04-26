// Importation de Cloudinary au lieu de Firebase Storage
import { uploadMoviePoster, uploadMovieBackdrop } from "@/lib/cloudinary";
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
  limit
} from "firebase/firestore";
import { firestore } from "../config";

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
    
    return {
      id: docRef.id,
      ...movieData
    };
  } catch (error) {
    console.error("Erreur lors de l'ajout du film:", error);
    throw error;
  }
};

// Télécharger une image de poster en utilisant Cloudinary
export const uploadPoster = async (file: File, movieId: string): Promise<string> => {
  try {
    // Utiliser Cloudinary au lieu de Firebase Storage
    const downloadURL = await uploadMoviePoster(file, movieId);
    return downloadURL;
  } catch (error) {
    console.error("Erreur lors du téléchargement du poster:", error);
    throw error;
  }
};

// Télécharger une image de fond en utilisant Cloudinary
export const uploadBackdrop = async (file: File, movieId: string): Promise<string> => {
  try {
    // Utiliser Cloudinary au lieu de Firebase Storage
    const downloadURL = await uploadMovieBackdrop(file, movieId);
    return downloadURL;
  } catch (error) {
    console.error("Erreur lors du téléchargement de l'image de fond:", error);
    throw error;
  }
};

// ... Le reste du code reste inchangé ...