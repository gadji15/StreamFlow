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
  DocumentData,
  Timestamp,
  increment,
  writeBatch
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
export interface Series {
  id?: string;
  title: string;
  description: string;
  startYear: number;
  endYear?: number;
  ongoing: boolean;
  seasons: number;
  genre: string;
  genres?: string[];
  creator?: string;
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

export interface Episode {
  id?: string;
  seriesId: string;
  seasonNumber: number;
  episodeNumber: number;
  title: string;
  description: string;
  duration: number;
  thumbnailUrl?: string;
  videoUrl?: string;
  releaseDate?: string;
  views?: number;
  status: "draft" | "published";
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy?: string;
}

// Collections de référence
const SERIES_COLLECTION = "series";
const EPISODES_COLLECTION = "episodes";

// Ajouter une série
export const addSeries = async (series: Omit<Series, "id" | "createdAt" | "updatedAt">, adminId: string): Promise<Series> => {
  try {
    const now = new Date().toISOString();
    
    const seriesData = {
      ...series,
      views: 0,
      rating: 0,
      createdAt: now,
      updatedAt: now,
      createdBy: adminId
    };
    
    const docRef = await addDoc(collection(firestore, SERIES_COLLECTION), seriesData);
    
    // Journaliser l'activité
    await addActivityLog({
      action: "create",
      entityType: "series",
      entityId: docRef.id,
      details: `Création de la série: ${series.title}`,
      performedBy: adminId,
      timestamp: now
    });
    
    return {
      id: docRef.id,
      ...seriesData
    };
  } catch (error) {
    console.error("Erreur lors de l'ajout de la série:", error);
    throw error;
  }
};

// Récupérer une série par ID
export const getSeries = async (id: string): Promise<Series | null> => {
  try {
    const docRef = doc(firestore, SERIES_COLLECTION, id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data()
      } as Series;
    }
    
    return null;
  } catch (error) {
    console.error(`Erreur lors de la récupération de la série ${id}:`, error);
    throw error;
  }
};

// Mettre à jour une série
export const updateSeries = async (id: string, seriesData: Partial<Series>, adminId: string): Promise<Series> => {
  try {
    const now = new Date().toISOString();
    const seriesRef = doc(firestore, SERIES_COLLECTION, id);
    
    // Récupérer la série actuelle pour le log d'activité
    const seriesSnapshot = await getDoc(seriesRef);
    if (!seriesSnapshot.exists()) {
      throw new Error(`Série avec l'ID ${id} non trouvée`);
    }
    
    const currentSeries = seriesSnapshot.data() as Series;
    
    const updatedData = {
      ...seriesData,
      updatedAt: now,
      updatedBy: adminId
    };
    
    await updateDoc(seriesRef, updatedData);
    
    // Journaliser l'activité
    await addActivityLog({
      action: "update",
      entityType: "series",
      entityId: id,
      details: `Mise à jour de la série: ${currentSeries.title}`,
      performedBy: adminId,
      timestamp: now
    });
    
    return {
      id,
      ...currentSeries,
      ...updatedData
    };
  } catch (error) {
    console.error(`Erreur lors de la mise à jour de la série ${id}:`, error);
    throw error;
  }
};

// Supprimer une série et tous ses épisodes
export const deleteSeries = async (id: string, adminId: string): Promise<void> => {
  try {
    const seriesRef = doc(firestore, SERIES_COLLECTION, id);
    
    // Récupérer les informations de la série pour la journalisation et suppression des images
    const seriesSnapshot = await getDoc(seriesRef);
    if (!seriesSnapshot.exists()) {
      throw new Error(`Série avec l'ID ${id} non trouvée`);
    }
    
    const seriesData = seriesSnapshot.data() as Series;
    
    // Commencer un batch pour supprimer la série et ses épisodes
    const batch = writeBatch(firestore);
    
    // Supprimer les épisodes associés
    const episodesQuery = query(
      collection(firestore, EPISODES_COLLECTION),
      where("seriesId", "==", id)
    );
    
    const episodesSnapshot = await getDocs(episodesQuery);
    episodesSnapshot.forEach(doc => {
      batch.delete(doc.ref);
    });
    
    // Supprimer la série
    batch.delete(seriesRef);
    
    // Exécuter le batch
    await batch.commit();
    
    // Supprimer les images associées s'il y en a
    if (seriesData.posterUrl) {
      const posterRef = ref(storage, seriesData.posterUrl);
      await deleteObject(posterRef).catch(err => console.warn("Erreur lors de la suppression du poster:", err));
    }
    
    if (seriesData.backdropUrl) {
      const backdropRef = ref(storage, seriesData.backdropUrl);
      await deleteObject(backdropRef).catch(err => console.warn("Erreur lors de la suppression de l'image de fond:", err));
    }
    
    // Journaliser l'activité
    await addActivityLog({
      action: "delete",
      entityType: "series",
      entityId: id,
      details: `Suppression de la série: ${seriesData.title} et de ses épisodes`,
      performedBy: adminId,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error(`Erreur lors de la suppression de la série ${id}:`, error);
    throw error;
  }
};

// Récupérer une liste de séries avec filtres et pagination
export const getAllSeries = async (
  options: {
    status?: "draft" | "published",
    vipOnly?: boolean,
    genre?: string,
    searchQuery?: string,
    sortBy?: "title" | "startYear" | "createdAt" | "views" | "rating",
    sortDirection?: "asc" | "desc",
    limit?: number,
    startAfterDoc?: QueryDocumentSnapshot<DocumentData>,
  } = {}
): Promise<{series: Series[], lastDoc: QueryDocumentSnapshot<DocumentData> | null}> => {
  try {
    let q = collection(firestore, SERIES_COLLECTION);
    
    const {
      status,
      vipOnly,
      genre,
      searchQuery,
      sortBy = "createdAt",
      sortDirection = "desc",
      limit: limitCount = 20,
      startAfterDoc,
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
      q = query(q, where("title", ">=", searchQuery), where("title", "<=", searchQuery + "\uf8ff"));
    }
    
    // Ajouter le tri
    q = query(q, orderBy(sortBy, sortDirection));
    
    // Ajouter la pagination
    if (startAfterDoc) {
      q = query(q, startAfter(startAfterDoc));
    }
    
    // Limiter le nombre de résultats
    q = query(q, limit(limitCount));
    
    // Exécuter la requête
    const querySnapshot = await getDocs(q);
    
    // Formatage des résultats
    const seriesList = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Series));
    
    return {
      series: seriesList,
      lastDoc: querySnapshot.docs.length > 0 ? querySnapshot.docs[querySnapshot.docs.length - 1] : null
    };
  } catch (error) {
    console.error("Erreur lors de la récupération des séries:", error);
    throw error;
  }
};

// Ajouter un épisode à une série
export const addEpisode = async (episode: Omit<Episode, "id" | "createdAt" | "updatedAt">, adminId: string): Promise<Episode> => {
  try {
    const now = new Date().toISOString();
    
    const episodeData = {
      ...episode,
      views: 0,
      createdAt: now,
      updatedAt: now,
      createdBy: adminId
    };
    
    const docRef = await addDoc(collection(firestore, EPISODES_COLLECTION), episodeData);
    
    // Journaliser l'activité
    await addActivityLog({
      action: "create",
      entityType: "episode",
      entityId: docRef.id,
      details: `Ajout de l'épisode: S${episode.seasonNumber}E${episode.episodeNumber} - ${episode.title} à la série ${episode.seriesId}`,
      performedBy: adminId,
      timestamp: now
    });
    
    return {
      id: docRef.id,
      ...episodeData
    };
  } catch (error) {
    console.error("Erreur lors de l'ajout de l'épisode:", error);
    throw error;
  }
};

// Récupérer les épisodes d'une série
export const getEpisodesBySeries = async (seriesId: string): Promise<Episode[]> => {
  try {
    const q = query(
      collection(firestore, EPISODES_COLLECTION),
      where("seriesId", "==", seriesId),
      orderBy("seasonNumber", "asc"),
      orderBy("episodeNumber", "asc")
    );
    
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Episode));
  } catch (error) {
    console.error(`Erreur lors de la récupération des épisodes de la série ${seriesId}:`, error);
    throw error;
  }
};

// Obtenir les séries populaires
export const getPopularSeries = async (limit: number = 10): Promise<Series[]> => {
  try {
    const q = query(
      collection(firestore, SERIES_COLLECTION),
      where("status", "==", "published"),
      orderBy("views", "desc"),
      limit(limit)
    );
    
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Series));
  } catch (error) {
    console.error("Erreur lors de la récupération des séries populaires:", error);
    throw error;
  }
};

// Télécharger une image pour une série (poster ou backdrop)
export const uploadSeriesImage = async (
  file: File,
  seriesId: string,
  type: "poster" | "backdrop"
): Promise<string> => {
  try {
    // Créer un chemin unique pour l'image
    const extension = file.name.split(".").pop();
    const path = `series/${seriesId}/${type}_${Date.now()}.${extension}`;
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