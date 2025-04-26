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
  runTransaction,
  writeBatch
} from "firebase/firestore";
import { ref, uploadString, getDownloadURL, deleteObject } from "firebase/storage";
import { logActivity } from "./activity-logs";
import { updateStatistics } from "./statistics";

export interface Series {
  id?: string;
  title: string;
  description: string;
  startYear: number;
  endYear?: number;
  seasons?: number;
  genres: string[];
  posterUrl?: string;
  backdropUrl?: string;
  trailerUrl?: string;
  creator?: string;
  cast?: {
    name: string;
    role: string;
    photoUrl?: string;
  }[];
  rating?: number;
  isVIP: boolean;
  isPublished: boolean;
  publishedAt?: Timestamp;
  views: number;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export interface Episode {
  id?: string;
  seriesId: string;
  title: string;
  description: string;
  season: number;
  episodeNumber: number;
  duration: number; // en minutes
  thumbnailUrl?: string;
  videoUrl?: string;
  releaseDate?: Timestamp;
  views: number;
  isPublished: boolean;
  isVIP: boolean;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

/**
 * Ajouter une nouvelle série
 */
export async function addSeries(seriesData: Omit<Series, 'id' | 'views' | 'createdAt' | 'updatedAt'>, posterBase64?: string, backdropBase64?: string) {
  try {
    // Préparer les données de la série
    const series = {
      ...seriesData,
      views: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    // Ajouter le document dans Firestore
    const docRef = await addDoc(collection(firestore, "series"), series);
    const seriesId = docRef.id;
    
    // Uploader le poster si fourni
    if (posterBase64) {
      const posterUrl = await uploadSeriesPoster(seriesId, posterBase64);
      if (posterUrl) {
        await updateDoc(docRef, { posterUrl });
        series.posterUrl = posterUrl;
      }
    }
    
    // Uploader le backdrop si fourni
    if (backdropBase64) {
      const backdropUrl = await uploadSeriesBackdrop(seriesId, backdropBase64);
      if (backdropUrl) {
        await updateDoc(docRef, { backdropUrl });
        series.backdropUrl = backdropUrl;
      }
    }
    
    // Mettre à jour les statistiques
    await updateStatistics({
      totalSeries: increment(1),
      publishedSeries: series.isPublished ? increment(1) : increment(0)
    });
    
    // Journaliser l'activité
    logActivity({
      action: "content_create",
      entityType: "series",
      entityId: seriesId,
      details: { 
        title: series.title,
        isVIP: series.isVIP,
        isPublished: series.isPublished
      }
    });
    
    return { id: seriesId, ...series };
  } catch (error) {
    console.error("Erreur lors de l'ajout de la série:", error);
    throw error;
  }
}

/**
 * Récupérer une série par ID
 */
export async function getSeries(seriesId: string) {
  try {
    const seriesDoc = await getDoc(doc(firestore, "series", seriesId));
    
    if (!seriesDoc.exists()) {
      return null;
    }
    
    return { id: seriesDoc.id, ...seriesDoc.data() } as Series;
  } catch (error) {
    console.error(`Erreur lors de la récupération de la série ${seriesId}:`, error);
    throw error;
  }
}

/**
 * Mettre à jour une série
 */
export async function updateSeries(
  seriesId: string, 
  seriesData: Partial<Series>,
  posterBase64?: string,
  backdropBase64?: string
) {
  try {
    const seriesRef = doc(firestore, "series", seriesId);
    const seriesDoc = await getDoc(seriesRef);
    
    if (!seriesDoc.exists()) {
      throw new Error(`Série ${seriesId} non trouvée`);
    }
    
    const oldData = seriesDoc.data() as Series;
    
    // Préparer les données de mise à jour
    const updateData = {
      ...seriesData,
      updatedAt: serverTimestamp()
    };
    
    // Si le statut de publication change
    let publishedStatusChanged = false;
    let newPublishedStatus = false;
    
    if (seriesData.isPublished !== undefined && seriesData.isPublished !== oldData.isPublished) {
      publishedStatusChanged = true;
      newPublishedStatus = seriesData.isPublished;
      
      // Si la série est publiée pour la première fois
      if (newPublishedStatus && !oldData.publishedAt) {
        updateData.publishedAt = serverTimestamp();
      }
    }
    
    // Uploader le nouveau poster si fourni
    if (posterBase64) {
      const newPosterUrl = await uploadSeriesPoster(seriesId, posterBase64);
      if (newPosterUrl) {
        updateData.posterUrl = newPosterUrl;
        
        // Supprimer l'ancien poster si existant
        if (oldData.posterUrl) {
          try {
            const oldPosterPath = oldData.posterUrl.split('/').pop()?.split('?')[0];
            if (oldPosterPath) {
              await deleteObject(ref(storage, `series/posters/${oldPosterPath}`));
            }
          } catch (error) {
            console.error("Erreur lors de la suppression de l'ancien poster:", error);
          }
        }
      }
    }
    
    // Uploader le nouveau backdrop si fourni
    if (backdropBase64) {
      const newBackdropUrl = await uploadSeriesBackdrop(seriesId, backdropBase64);
      if (newBackdropUrl) {
        updateData.backdropUrl = newBackdropUrl;
        
        // Supprimer l'ancien backdrop si existant
        if (oldData.backdropUrl) {
          try {
            const oldBackdropPath = oldData.backdropUrl.split('/').pop()?.split('?')[0];
            if (oldBackdropPath) {
              await deleteObject(ref(storage, `series/backdrops/${oldBackdropPath}`));
            }
          } catch (error) {
            console.error("Erreur lors de la suppression de l'ancien backdrop:", error);
          }
        }
      }
    }
    
    // Mettre à jour le document
    await updateDoc(seriesRef, updateData);
    
    // Mettre à jour les statistiques si le statut de publication a changé
    if (publishedStatusChanged) {
      await updateStatistics({
        publishedSeries: newPublishedStatus ? increment(1) : increment(-1)
      });
    }
    
    // Journaliser l'activité
    logActivity({
      action: "content_update",
      entityType: "series",
      entityId: seriesId,
      details: { 
        title: oldData.title,
        updatedFields: Object.keys(seriesData),
        publishStatusChanged: publishedStatusChanged,
        isNowPublished: newPublishedStatus
      }
    });
    
    return { id: seriesId, ...oldData, ...updateData };
  } catch (error) {
    console.error(`Erreur lors de la mise à jour de la série ${seriesId}:`, error);
    throw error;
  }
}

/**
 * Supprimer une série
 */
export async function deleteSeries(seriesId: string) {
  try {
    // Récupérer les informations de la série avant suppression
    const seriesRef = doc(firestore, "series", seriesId);
    const seriesDoc = await getDoc(seriesRef);
    
    if (!seriesDoc.exists()) {
      throw new Error(`Série ${seriesId} non trouvée`);
    }
    
    const seriesData = seriesDoc.data() as Series;
    
    // Supprimer le poster si existant
    if (seriesData.posterUrl) {
      try {
        const posterPath = seriesData.posterUrl.split('/').pop()?.split('?')[0];
        if (posterPath) {
          await deleteObject(ref(storage, `series/posters/${posterPath}`));
        }
      } catch (error) {
        console.error("Erreur lors de la suppression du poster:", error);
      }
    }
    
    // Supprimer le backdrop si existant
    if (seriesData.backdropUrl) {
      try {
        const backdropPath = seriesData.backdropUrl.split('/').pop()?.split('?')[0];
        if (backdropPath) {
          await deleteObject(ref(storage, `series/backdrops/${backdropPath}`));
        }
      } catch (error) {
        console.error("Erreur lors de la suppression du backdrop:", error);
      }
    }
    
    // Supprimer tous les épisodes liés à cette série
    const episodesQuery = query(collection(firestore, "episodes"), where("seriesId", "==", seriesId));
    const episodesSnapshot = await getDocs(episodesQuery);
    
    // Utiliser un batch pour supprimer tous les épisodes
    const batch = writeBatch(firestore);
    let episodeCount = 0;
    
    episodesSnapshot.forEach((doc) => {
      batch.delete(doc.ref);
      episodeCount++;
    });
    
    // Exécuter le batch si des épisodes existent
    if (episodeCount > 0) {
      await batch.commit();
    }
    
    // Supprimer le document de la série
    await deleteDoc(seriesRef);
    
    // Mettre à jour les statistiques
    await updateStatistics({
      totalSeries: increment(-1),
      publishedSeries: seriesData.isPublished ? increment(-1) : increment(0),
      totalEpisodes: increment(-episodeCount)
    });
    
    // Journaliser l'activité
    logActivity({
      action: "content_delete",
      entityType: "series",
      entityId: seriesId,
      details: { 
        title: seriesData.title,
        isVIP: seriesData.isVIP,
        isPublished: seriesData.isPublished,
        episodesDeleted: episodeCount
      }
    });
    
    return { success: true, episodesDeleted: episodeCount };
  } catch (error) {
    console.error(`Erreur lors de la suppression de la série ${seriesId}:`, error);
    throw error;
  }
}

/**
 * Récupérer toutes les séries paginées
 */
export async function getAllSeries(options: {
  limit?: number;
  startAfter?: QueryDocumentSnapshot<DocumentData>;
  orderByField?: keyof Series;
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
      collection(firestore, "series"),
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
    const series: Series[] = [];
    let lastVisible: QueryDocumentSnapshot<DocumentData> | null = null;
    
    querySnapshot.forEach((doc) => {
      // Si un terme de recherche est spécifié, filtrer côté client
      const data = doc.data() as Omit<Series, 'id'>;
      if (searchTerm && !data.title.toLowerCase().includes(searchTerm.toLowerCase())) {
        return;
      }
      
      series.push({ id: doc.id, ...data } as Series);
      lastVisible = doc;
    });
    
    return {
      series,
      lastVisible
    };
  } catch (error) {
    console.error("Erreur lors de la récupération des séries:", error);
    throw error;
  }
}

/**
 * Incrémenter le nombre de vues d'une série
 */
export async function incrementSeriesViews(seriesId: string) {
  try {
    const seriesRef = doc(firestore, "series", seriesId);
    await updateDoc(seriesRef, {
      views: increment(1)
    });
    
    // Mettre à jour les statistiques globales de vues
    await updateStatistics({
      totalViews: increment(1)
    });
    
    return true;
  } catch (error) {
    console.error(`Erreur lors de l'incrémentation des vues de la série ${seriesId}:`, error);
    return false;
  }
}

/**
 * Ajouter un épisode à une série
 */
export async function addEpisode(episodeData: Omit<Episode, 'id' | 'views' | 'createdAt' | 'updatedAt'>, thumbnailBase64?: string) {
  try {
    // Vérifier que la série existe
    const seriesDoc = await getDoc(doc(firestore, "series", episodeData.seriesId));
    if (!seriesDoc.exists()) {
      throw new Error(`Série ${episodeData.seriesId} non trouvée`);
    }
    
    // Préparer les données de l'épisode
    const episode = {
      ...episodeData,
      views: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    // Ajouter le document dans Firestore
    const docRef = await addDoc(collection(firestore, "episodes"), episode);
    const episodeId = docRef.id;
    
    // Uploader la miniature si fournie
    if (thumbnailBase64) {
      const thumbnailUrl = await uploadEpisodeThumbnail(episodeId, thumbnailBase64);
      if (thumbnailUrl) {
        await updateDoc(docRef, { thumbnailUrl });
        episode.thumbnailUrl = thumbnailUrl;
      }
    }
    
    // Mettre à jour le nombre de saisons de la série si nécessaire
    await runTransaction(firestore, async (transaction) => {
      const seriesRef = doc(firestore, "series", episodeData.seriesId);
      const seriesData = (await transaction.get(seriesRef)).data() as Series;
      
      const currentSeasons = seriesData.seasons || 0;
      if (episodeData.season > currentSeasons) {
        transaction.update(seriesRef, {
          seasons: episodeData.season,
          updatedAt: serverTimestamp()
        });
      }
    });
    
    // Mettre à jour les statistiques
    await updateStatistics({
      totalEpisodes: increment(1)
    });
    
    // Journaliser l'activité
    logActivity({
      action: "content_create",
      entityType: "episode",
      entityId: episodeId,
      details: { 
        title: episode.title,
        seriesId: episode.seriesId,
        season: episode.season,
        episodeNumber: episode.episodeNumber,
        isVIP: episode.isVIP,
        isPublished: episode.isPublished
      }
    });
    
    return { id: episodeId, ...episode };
  } catch (error) {
    console.error("Erreur lors de l'ajout de l'épisode:", error);
    throw error;
  }
}

/**
 * Récupérer un épisode par ID
 */
export async function getEpisode(episodeId: string) {
  try {
    const episodeDoc = await getDoc(doc(firestore, "episodes", episodeId));
    
    if (!episodeDoc.exists()) {
      return null;
    }
    
    return { id: episodeDoc.id, ...episodeDoc.data() } as Episode;
  } catch (error) {
    console.error(`Erreur lors de la récupération de l'épisode ${episodeId}:`, error);
    throw error;
  }
}

/**
 * Mettre à jour un épisode
 */
export async function updateEpisode(
  episodeId: string, 
  episodeData: Partial<Episode>,
  thumbnailBase64?: string
) {
  try {
    const episodeRef = doc(firestore, "episodes", episodeId);
    const episodeDoc = await getDoc(episodeRef);
    
    if (!episodeDoc.exists()) {
      throw new Error(`Épisode ${episodeId} non trouvé`);
    }
    
    const oldData = episodeDoc.data() as Episode;
    
    // Préparer les données de mise à jour
    const updateData = {
      ...episodeData,
      updatedAt: serverTimestamp()
    };
    
    // Uploader la nouvelle miniature si fournie
    if (thumbnailBase64) {
      const newThumbnailUrl = await uploadEpisodeThumbnail(episodeId, thumbnailBase64);
      if (newThumbnailUrl) {
        updateData.thumbnailUrl = newThumbnailUrl;
        
        // Supprimer l'ancienne miniature si existante
        if (oldData.thumbnailUrl) {
          try {
            const oldThumbnailPath = oldData.thumbnailUrl.split('/').pop()?.split('?')[0];
            if (oldThumbnailPath) {
              await deleteObject(ref(storage, `episodes/thumbnails/${oldThumbnailPath}`));
            }
          } catch (error) {
            console.error("Erreur lors de la suppression de l'ancienne miniature:", error);
          }
        }
      }
    }
    
    // Mettre à jour le document
    await updateDoc(episodeRef, updateData);
    
    // Si la saison a changé, mettre à jour le nombre de saisons de la série si nécessaire
    if (episodeData.season && episodeData.season !== oldData.season) {
      await runTransaction(firestore, async (transaction) => {
        const seriesRef = doc(firestore, "series", oldData.seriesId);
        const seriesData = (await transaction.get(seriesRef)).data() as Series;
        
        // Vérifier s'il s'agit d'une nouvelle saison plus élevée
        const currentSeasons = seriesData.seasons || 0;
        if (episodeData.season > currentSeasons) {
          transaction.update(seriesRef, {
            seasons: episodeData.season,
            updatedAt: serverTimestamp()
          });
        }
      });
    }
    
    // Journaliser l'activité
    logActivity({
      action: "content_update",
      entityType: "episode",
      entityId: episodeId,
      details: { 
        title: oldData.title,
        seriesId: oldData.seriesId,
        season: oldData.season,
        episodeNumber: oldData.episodeNumber,
        updatedFields: Object.keys(episodeData)
      }
    });
    
    return { id: episodeId, ...oldData, ...updateData };
  } catch (error) {
    console.error(`Erreur lors de la mise à jour de l'épisode ${episodeId}:`, error);
    throw error;
  }
}

/**
 * Supprimer un épisode
 */
export async function deleteEpisode(episodeId: string) {
  try {
    // Récupérer les informations de l'épisode avant suppression
    const episodeRef = doc(firestore, "episodes", episodeId);
    const episodeDoc = await getDoc(episodeRef);
    
    if (!episodeDoc.exists()) {
      throw new Error(`Épisode ${episodeId} non trouvé`);
    }
    
    const episodeData = episodeDoc.data() as Episode;
    
    // Supprimer la miniature si existante
    if (episodeData.thumbnailUrl) {
      try {
        const thumbnailPath = episodeData.thumbnailUrl.split('/').pop()?.split('?')[0];
        if (thumbnailPath) {
          await deleteObject(ref(storage, `episodes/thumbnails/${thumbnailPath}`));
        }
      } catch (error) {
        console.error("Erreur lors de la suppression de la miniature:", error);
      }
    }
    
    // Supprimer le document de l'épisode
    await deleteDoc(episodeRef);
    
    // Mettre à jour les statistiques
    await updateStatistics({
      totalEpisodes: increment(-1)
    });
    
    // Journaliser l'activité
    logActivity({
      action: "content_delete",
      entityType: "episode",
      entityId: episodeId,
      details: { 
        title: episodeData.title,
        seriesId: episodeData.seriesId,
        season: episodeData.season,
        episodeNumber: episodeData.episodeNumber
      }
    });
    
    return { success: true };
  } catch (error) {
    console.error(`Erreur lors de la suppression de l'épisode ${episodeId}:`, error);
    throw error;
  }
}

/**
 * Récupérer tous les épisodes d'une série
 */
export async function getSeriesEpisodes(seriesId: string, options: {
  season?: number;
  onlyPublished?: boolean;
  orderByField?: keyof Episode;
  orderDirection?: 'asc' | 'desc';
} = {}) {
  try {
    const {
      season,
      onlyPublished = false,
      orderByField = 'season',
      orderDirection = 'asc'
    } = options;
    
    // Construire la requête de base
    let q = query(
      collection(firestore, "episodes"),
      where("seriesId", "==", seriesId)
    );
    
    // Filtrer par saison si spécifié
    if (season !== undefined) {
      q = query(q, where("season", "==", season));
    }
    
    // Filtrer par statut de publication
    if (onlyPublished) {
      q = query(q, where("isPublished", "==", true));
    }
    
    // Tri
    q = query(q, orderBy(orderByField, orderDirection));
    
    // Si on trie par saison, ajouter un tri par numéro d'épisode
    if (orderByField === 'season') {
      q = query(q, orderBy('episodeNumber', 'asc'));
    }
    
    // Exécuter la requête
    const querySnapshot = await getDocs(q);
    const episodes: Episode[] = [];
    
    querySnapshot.forEach((doc) => {
      episodes.push({ id: doc.id, ...doc.data() } as Episode);
    });
    
    return episodes;
  } catch (error) {
    console.error(`Erreur lors de la récupération des épisodes de la série ${seriesId}:`, error);
    throw error;
  }
}

/**
 * Uploader un poster de série
 */
async function uploadSeriesPoster(seriesId: string, posterBase64: string): Promise<string | null> {
  if (!posterBase64) return null;
  
  try {
    // Retirer le préfixe data URL
    const base64Content = posterBase64.includes('base64')
      ? posterBase64.split(',')[1]
      : posterBase64;
    
    // Créer une référence dans Firebase Storage
    const posterRef = ref(storage, `series/posters/${seriesId}_${Date.now()}`);
    
    // Uploader l'image
    const snapshot = await uploadString(posterRef, base64Content, 'base64');
    
    // Récupérer l'URL téléchargeable
    const downloadURL = await getDownloadURL(snapshot.ref);
    
    return downloadURL;
  } catch (error) {
    console.error(`Erreur lors de l'upload du poster pour la série ${seriesId}:`, error);
    return null;
  }
}

/**
 * Uploader un backdrop de série
 */
async function uploadSeriesBackdrop(seriesId: string, backdropBase64: string): Promise<string | null> {
  if (!backdropBase64) return null;
  
  try {
    // Retirer le préfixe data URL
    const base64Content = backdropBase64.includes('base64')
      ? backdropBase64.split(',')[1]
      : backdropBase64;
    
    // Créer une référence dans Firebase Storage
    const backdropRef = ref(storage, `series/backdrops/${seriesId}_${Date.now()}`);
    
    // Uploader l'image
    const snapshot = await uploadString(backdropRef, base64Content, 'base64');
    
    // Récupérer l'URL téléchargeable
    const downloadURL = await getDownloadURL(snapshot.ref);
    
    return downloadURL;
  } catch (error) {
    console.error(`Erreur lors de l'upload du backdrop pour la série ${seriesId}:`, error);
    return null;
  }
}

/**
 * Uploader une miniature d'épisode
 */
async function uploadEpisodeThumbnail(episodeId: string, thumbnailBase64: string): Promise<string | null> {
  if (!thumbnailBase64) return null;
  
  try {
    // Retirer le préfixe data URL
    const base64Content = thumbnailBase64.includes('base64')
      ? thumbnailBase64.split(',')[1]
      : thumbnailBase64;
    
    // Créer une référence dans Firebase Storage
    const thumbnailRef = ref(storage, `episodes/thumbnails/${episodeId}_${Date.now()}`);
    
    // Uploader l'image
    const snapshot = await uploadString(thumbnailRef, base64Content, 'base64');
    
    // Récupérer l'URL téléchargeable
    const downloadURL = await getDownloadURL(snapshot.ref);
    
    return downloadURL;
  } catch (error) {
    console.error(`Erreur lors de l'upload de la miniature pour l'épisode ${episodeId}:`, error);
    return null;
  }
}

/**
 * Récupérer les séries populaires
 */
export async function getPopularSeries(limitCount: number = 10, onlyPublished: boolean = true, includeVIP: boolean = true) {
  try {
    let q = query(
      collection(firestore, "series"),
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
    const series: Series[] = [];
    
    querySnapshot.forEach((doc) => {
      series.push({ id: doc.id, ...doc.data() } as Series);
    });
    
    return series;
  } catch (error) {
    console.error("Erreur lors de la récupération des séries populaires:", error);
    throw error;
  }
}

/**
 * Récupérer les séries récemment ajoutées
 */
export async function getRecentSeries(limitCount: number = 10, onlyPublished: boolean = true) {
  try {
    let q = query(
      collection(firestore, "series"),
      orderBy("createdAt", "desc"),
      limit(limitCount)
    );
    
    if (onlyPublished) {
      q = query(q, where("isPublished", "==", true));
    }
    
    const querySnapshot = await getDocs(q);
    const series: Series[] = [];
    
    querySnapshot.forEach((doc) => {
      series.push({ id: doc.id, ...doc.data() } as Series);
    });
    
    return series;
  } catch (error) {
    console.error("Erreur lors de la récupération des séries récentes:", error);
    throw error;
  }
}