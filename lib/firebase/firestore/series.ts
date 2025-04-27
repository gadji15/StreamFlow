import { firestore } from "../config";
import { 
  collection, doc, getDoc, getDocs, addDoc, updateDoc, deleteDoc, 
  query, where, orderBy, limit, startAfter, DocumentSnapshot, 
  increment, serverTimestamp 
} from "firebase/firestore";
import { logActivity } from "./activity-logs";
import { getMovieGenres } from "./movies";

// Interface pour le type Serie
export interface Series {
  id: string;
  title: string;
  description: string;
  startYear: number;
  endYear?: number;
  creator: string;
  cast: string[];
  genre: string[];
  seasons: number;
  episodes: number;
  rating?: number;
  posterUrl?: string;
  backdropUrl?: string;
  trailerUrl?: string;
  isVIP: boolean;
  isPublished: boolean;
  views: number;
  createdAt: Date;
  updatedAt: Date;
}

// Options pour getAllSeries
export interface GetSeriesOptions {
  limit?: number;
  startAfter?: DocumentSnapshot<any>;
  onlyPublished?: boolean;
  genreFilter?: string;
  isVIP?: boolean;
}

/**
 * Récupère la liste des séries avec pagination et filtres
 */
export async function getAllSeries(options: GetSeriesOptions = {}) {
  const { 
    limit: limitCount = 10, 
    startAfter: startAfterDoc,
    onlyPublished = false,
    genreFilter,
    isVIP
  } = options;

  try {
    // Commencer avec une référence à la collection
    let seriesRef = collection(firestore, "series");
    
    // Construire la requête
    let constraints = [];
    
    // Filtre pour les séries publiées uniquement
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
    let seriesQuery = query(seriesRef, ...constraints);
    
    // Ajouter la pagination si un point de départ est fourni
    if (startAfterDoc) {
      seriesQuery = query(seriesQuery, startAfter(startAfterDoc));
    }
    
    // Limiter le nombre de résultats
    seriesQuery = query(seriesQuery, limit(limitCount));
    
    // Exécuter la requête
    const snapshot = await getDocs(seriesQuery);
    
    // Extraire les données des documents
    const series = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate()
    } as Series));
    
    // Renvoyer les résultats et le dernier document pour la pagination
    return {
      series,
      lastVisible: snapshot.docs.length > 0 ? snapshot.docs[snapshot.docs.length - 1] : null
    };
  } catch (error) {
    console.error("Erreur lors de la récupération des séries:", error);
    throw error;
  }
}

/**
 * Récupère une série par son ID
 */
export async function getSeriesById(id: string): Promise<Series | null> {
  try {
    const seriesDoc = await getDoc(doc(firestore, "series", id));
    
    if (!seriesDoc.exists()) {
      return null;
    }
    
    return {
      id: seriesDoc.id,
      ...seriesDoc.data(),
      createdAt: seriesDoc.data().createdAt?.toDate(),
      updatedAt: seriesDoc.data().updatedAt?.toDate()
    } as Series;
  } catch (error) {
    console.error(`Erreur lors de la récupération de la série ${id}:`, error);
    throw error;
  }
}

/**
 * Ajoute une nouvelle série
 */
export async function addSeries(seriesData: Omit<Series, 'id' | 'createdAt' | 'updatedAt' | 'views'>, userId: string): Promise<string> {
  try {
    const timestamp = serverTimestamp();
    
    const seriesRef = await addDoc(collection(firestore, "series"), {
      ...seriesData,
      views: 0,
      createdAt: timestamp,
      updatedAt: timestamp
    });
    
    // Enregistrer l'activité
    await logActivity(
      userId,
      'series_created',
      'series',
      seriesRef.id,
      { title: seriesData.title }
    );
    
    return seriesRef.id;
  } catch (error) {
    console.error("Erreur lors de l'ajout de la série:", error);
    throw error;
  }
}

/**
 * Met à jour une série existante
 */
export async function updateSeries(id: string, seriesData: Partial<Omit<Series, 'id' | 'createdAt' | 'updatedAt'>>, userId: string): Promise<boolean> {
  try {
    await updateDoc(doc(firestore, "series", id), {
      ...seriesData,
      updatedAt: serverTimestamp()
    });
    
    // Enregistrer l'activité
    await logActivity(
      userId,
      'series_updated',
      'series',
      id,
      { title: seriesData.title }
    );
    
    return true;
  } catch (error) {
    console.error(`Erreur lors de la mise à jour de la série ${id}:`, error);
    throw error;
  }
}

/**
 * Supprime une série
 */
export async function deleteSeries(id: string, userId: string): Promise<boolean> {
  try {
    // Récupérer d'abord les données de la série pour l'enregistrement d'activité
    const seriesDoc = await getDoc(doc(firestore, "series", id));
    if (!seriesDoc.exists()) {
      throw new Error(`La série ${id} n'existe pas`);
    }
    
    const seriesData = seriesDoc.data();
    
    // Supprimer la série
    await deleteDoc(doc(firestore, "series", id));
    
    // Enregistrer l'activité
    await logActivity(
      userId,
      'series_deleted',
      'series',
      id,
      { title: seriesData.title }
    );
    
    return true;
  } catch (error) {
    console.error(`Erreur lors de la suppression de la série ${id}:`, error);
    throw error;
  }
}

/**
 * Incrémente le compteur de vues d'une série
 */
export async function incrementSeriesViews(id: string): Promise<boolean> {
  try {
    await updateDoc(doc(firestore, "series", id), {
      views: increment(1),
      updatedAt: serverTimestamp()
    });
    
    return true;
  } catch (error) {
    console.error(`Erreur lors de l'incrémentation des vues pour la série ${id}:`, error);
    return false;
  }
}

// Exporter la fonction getMovieGenres depuis ce module aussi
export { getMovieGenres };