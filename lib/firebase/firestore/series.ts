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
  DocumentData,
  QueryDocumentSnapshot,
  serverTimestamp,
  Timestamp,
  setDoc
} from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from "firebase/storage";
import { db, storage } from "../config";
import { logActivity } from "./activity-logs";

// Collection names
const SERIES_COLLECTION = "series";
const EPISODES_COLLECTION = "episodes";

// Series interface
export interface Series {
  id?: string;
  title: string;
  description: string;
  poster: string;
  backdrop?: string;
  releaseDate: Date | Timestamp;
  seasons: number;
  genres: string[];
  rating: number;
  views: number;
  status: "published" | "draft";
  trailer?: string;
  creator?: string;
  cast?: string[];
  vipOnly?: boolean;
  createdAt?: Date | Timestamp;
  updatedAt?: Date | Timestamp;
}

// Episode interface
export interface Episode {
  id?: string;
  seriesId: string;
  title: string;
  description: string;
  thumbnail?: string;
  season: number;
  episode: number;
  duration: string;
  releaseDate: Date | Timestamp;
  videoUrl?: string;
  status: "published" | "draft";
  views: number;
  vipOnly?: boolean;
  createdAt?: Date | Timestamp;
  updatedAt?: Date | Timestamp;
}

// Get all series
export const getAllSeries = async (): Promise<Series[]> => {
  try {
    const seriesSnapshot = await getDocs(collection(db, SERIES_COLLECTION));
    const allSeries: Series[] = [];
    
    seriesSnapshot.forEach((doc) => {
      const data = doc.data();
      allSeries.push({
        id: doc.id,
        ...data,
        releaseDate: data.releaseDate?.toDate() || new Date(),
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate(),
      } as Series);
    });
    
    return allSeries;
  } catch (error) {
    console.error("Error getting series:", error);
    throw error;
  }
};

// Get paginated series
export const getPaginatedSeries = async (
  lastVisible: QueryDocumentSnapshot<DocumentData> | null = null,
  itemsPerPage: number = 10,
  filters: {
    status?: "published" | "draft";
    genre?: string;
    search?: string;
    vipOnly?: boolean;
  } = {}
): Promise<{
  series: Series[];
  lastVisible: QueryDocumentSnapshot<DocumentData> | null;
  hasMore: boolean;
}> => {
  try {
    let seriesRef = collection(db, SERIES_COLLECTION);
    let constraints: any[] = [];
    
    // Add filters
    if (filters.status) {
      constraints.push(where("status", "==", filters.status));
    }
    
    if (filters.genre) {
      constraints.push(where("genres", "array-contains", filters.genre));
    }
    
    if (filters.vipOnly !== undefined) {
      constraints.push(where("vipOnly", "==", filters.vipOnly));
    }
    
    // Add orderBy and pagination
    constraints.push(orderBy("releaseDate", "desc"));
    
    if (lastVisible) {
      constraints.push(startAfter(lastVisible));
    }
    
    constraints.push(limit(itemsPerPage + 1)); // Get one extra to check if there are more
    
    const q = query(seriesRef, ...constraints);
    const seriesSnapshot = await getDocs(q);
    
    const seriesList: Series[] = [];
    let newLastVisible: QueryDocumentSnapshot<DocumentData> | null = null;
    let hasMore = false;
    
    // Process results
    if (!seriesSnapshot.empty) {
      const docs = seriesSnapshot.docs;
      
      // Check if we have more results
      if (docs.length > itemsPerPage) {
        hasMore = true;
        docs.pop(); // Remove the extra item
      }
      
      // Get the last visible item for pagination
      newLastVisible = docs[docs.length - 1] || null;
      
      // Map documents to Series objects
      docs.forEach((doc) => {
        const data = doc.data();
        
        // If there's a search filter, apply it client-side
        if (filters.search && !data.title.toLowerCase().includes(filters.search.toLowerCase())) {
          return;
        }
        
        seriesList.push({
          id: doc.id,
          ...data,
          releaseDate: data.releaseDate?.toDate() || new Date(),
          createdAt: data.createdAt?.toDate(),
          updatedAt: data.updatedAt?.toDate(),
        } as Series);
      });
    }
    
    return {
      series: seriesList,
      lastVisible: newLastVisible,
      hasMore,
    };
  } catch (error) {
    console.error("Error getting paginated series:", error);
    throw error;
  }
};

// Get a series by ID
export const getSeriesById = async (id: string): Promise<Series | null> => {
  try {
    const seriesDoc = await getDoc(doc(db, SERIES_COLLECTION, id));
    
    if (!seriesDoc.exists()) {
      return null;
    }
    
    const data = seriesDoc.data();
    return {
      id: seriesDoc.id,
      ...data,
      releaseDate: data.releaseDate?.toDate() || new Date(),
      createdAt: data.createdAt?.toDate(),
      updatedAt: data.updatedAt?.toDate(),
    } as Series;
  } catch (error) {
    console.error(`Error getting series with ID ${id}:`, error);
    throw error;
  }
};

// Create a new series
export const createSeries = async (
  series: Omit<Series, "id" | "createdAt" | "updatedAt" | "views">,
  adminId: string,
  adminName: string,
  posterFile?: File,
  backdropFile?: File
): Promise<Series> => {
  try {
    let posterUrl = series.poster;
    let backdropUrl = series.backdrop || "";
    
    // Upload poster if provided
    if (posterFile) {
      const posterStorageRef = ref(storage, `series/posters/${Date.now()}_${posterFile.name}`);
      const posterUploadTask = await uploadBytesResumable(posterStorageRef, posterFile);
      posterUrl = await getDownloadURL(posterUploadTask.ref);
    }
    
    // Upload backdrop if provided
    if (backdropFile) {
      const backdropStorageRef = ref(storage, `series/backdrops/${Date.now()}_${backdropFile.name}`);
      const backdropUploadTask = await uploadBytesResumable(backdropStorageRef, backdropFile);
      backdropUrl = await getDownloadURL(backdropUploadTask.ref);
    }
    
    // Prepare series data for Firestore
    const seriesData = {
      ...series,
      poster: posterUrl,
      backdrop: backdropUrl,
      views: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    
    // Add series to Firestore
    const seriesRef = await addDoc(collection(db, SERIES_COLLECTION), seriesData);
    
    // Log activity
    await logActivity({
      adminId,
      adminName,
      action: "CREATE",
      entityType: "SERIES",
      entityId: seriesRef.id,
      entityName: series.title,
      timestamp: new Date(),
      details: { seriesData }
    });
    
    // Get the created series
    const createdSeriesSnap = await getDoc(seriesRef);
    const createdSeriesData = createdSeriesSnap.data();
    
    return {
      id: seriesRef.id,
      ...createdSeriesData,
      releaseDate: createdSeriesData?.releaseDate?.toDate() || new Date(),
      createdAt: createdSeriesData?.createdAt?.toDate(),
      updatedAt: createdSeriesData?.updatedAt?.toDate(),
    } as Series;
  } catch (error) {
    console.error("Error creating series:", error);
    throw error;
  }
};

// Update a series
export const updateSeries = async (
  id: string,
  seriesUpdates: Partial<Series>,
  adminId: string,
  adminName: string,
  posterFile?: File,
  backdropFile?: File
): Promise<Series> => {
  try {
    // Get current series data for comparison and logging
    const currentSeriesSnap = await getDoc(doc(db, SERIES_COLLECTION, id));
    
    if (!currentSeriesSnap.exists()) {
      throw new Error(`Series with ID ${id} not found`);
    }
    
    const currentSeries = currentSeriesSnap.data() as Series;
    let posterUrl = seriesUpdates.poster || currentSeries.poster;
    let backdropUrl = seriesUpdates.backdrop || currentSeries.backdrop || "";
    
    // Upload new poster if provided
    if (posterFile) {
      // Delete old poster if it exists and is not a placeholder
      if (currentSeries.poster && currentSeries.poster.includes("firebase")) {
        try {
          const oldPosterRef = ref(storage, currentSeries.poster);
          await deleteObject(oldPosterRef);
        } catch (error) {
          console.warn("Could not delete old poster:", error);
        }
      }
      
      // Upload new poster
      const posterStorageRef = ref(storage, `series/posters/${Date.now()}_${posterFile.name}`);
      const posterUploadTask = await uploadBytesResumable(posterStorageRef, posterFile);
      posterUrl = await getDownloadURL(posterUploadTask.ref);
    }
    
    // Upload new backdrop if provided
    if (backdropFile) {
      // Delete old backdrop if it exists and is not a placeholder
      if (currentSeries.backdrop && currentSeries.backdrop.includes("firebase")) {
        try {
          const oldBackdropRef = ref(storage, currentSeries.backdrop);
          await deleteObject(oldBackdropRef);
        } catch (error) {
          console.warn("Could not delete old backdrop:", error);
        }
      }
      
      // Upload new backdrop
      const backdropStorageRef = ref(storage, `series/backdrops/${Date.now()}_${backdropFile.name}`);
      const backdropUploadTask = await uploadBytesResumable(backdropStorageRef, backdropFile);
      backdropUrl = await getDownloadURL(backdropUploadTask.ref);
    }
    
    // Prepare update data
    const updateData = {
      ...seriesUpdates,
      poster: posterUrl,
      backdrop: backdropUrl,
      updatedAt: serverTimestamp(),
    };
    
    // Update series in Firestore
    await updateDoc(doc(db, SERIES_COLLECTION, id), updateData);
    
    // Log activity
    await logActivity({
      adminId,
      adminName,
      action: "UPDATE",
      entityType: "SERIES",
      entityId: id,
      entityName: currentSeries.title,
      timestamp: new Date(),
      details: {
        before: currentSeries,
        after: { ...currentSeries, ...updateData }
      }
    });
    
    // Get the updated series
    const updatedSeriesSnap = await getDoc(doc(db, SERIES_COLLECTION, id));
    const updatedSeriesData = updatedSeriesSnap.data();
    
    return {
      id,
      ...updatedSeriesData,
      releaseDate: updatedSeriesData?.releaseDate?.toDate() || new Date(),
      createdAt: updatedSeriesData?.createdAt?.toDate(),
      updatedAt: updatedSeriesData?.updatedAt?.toDate(),
    } as Series;
  } catch (error) {
    console.error(`Error updating series with ID ${id}:`, error);
    throw error;
  }
};

// Delete a series
export const deleteSeries = async (
  id: string,
  adminId: string,
  adminName: string
): Promise<void> => {
  try {
    // Get series data for logging and cleaning up storage
    const seriesSnap = await getDoc(doc(db, SERIES_COLLECTION, id));
    
    if (!seriesSnap.exists()) {
      throw new Error(`Series with ID ${id} not found`);
    }
    
    const seriesData = seriesSnap.data() as Series;
    
    // Get all episodes for this series to delete them
    const episodesQuery = query(collection(db, EPISODES_COLLECTION), where("seriesId", "==", id));
    const episodesSnapshot = await getDocs(episodesQuery);
    
    // Delete all episodes
    const episodeDeletePromises = episodesSnapshot.docs.map(async (episodeDoc) => {
      const episodeData = episodeDoc.data() as Episode;
      
      // Delete episode thumbnail if exists
      if (episodeData.thumbnail && episodeData.thumbnail.includes("firebase")) {
        try {
          const thumbnailRef = ref(storage, episodeData.thumbnail);
          await deleteObject(thumbnailRef);
        } catch (error) {
          console.warn(`Could not delete thumbnail for episode ${episodeDoc.id}:`, error);
        }
      }
      
      // Delete episode document
      await deleteDoc(doc(db, EPISODES_COLLECTION, episodeDoc.id));
    });
    
    // Wait for all episodes to be deleted
    await Promise.all(episodeDeletePromises);
    
    // Delete series from Firestore
    await deleteDoc(doc(db, SERIES_COLLECTION, id));
    
    // Delete poster from storage if it exists and is not a placeholder
    if (seriesData.poster && seriesData.poster.includes("firebase")) {
      try {
        const posterRef = ref(storage, seriesData.poster);
        await deleteObject(posterRef);
      } catch (error) {
        console.warn("Could not delete poster:", error);
      }
    }
    
    // Delete backdrop from storage if it exists and is not a placeholder
    if (seriesData.backdrop && seriesData.backdrop.includes("firebase")) {
      try {
        const backdropRef = ref(storage, seriesData.backdrop);
        await deleteObject(backdropRef);
      } catch (error) {
        console.warn("Could not delete backdrop:", error);
      }
    }
    
    // Log activity
    await logActivity({
      adminId,
      adminName,
      action: "DELETE",
      entityType: "SERIES",
      entityId: id,
      entityName: seriesData.title,
      timestamp: new Date(),
      details: { deletedSeries: seriesData }
    });
  } catch (error) {
    console.error(`Error deleting series with ID ${id}:`, error);
    throw error;
  }
};

// Increment series views
export const incrementSeriesViews = async (id: string): Promise<void> => {
  try {
    const seriesRef = doc(db, SERIES_COLLECTION, id);
    
    // Get current views
    const seriesSnap = await getDoc(seriesRef);
    
    if (!seriesSnap.exists()) {
      throw new Error(`Series with ID ${id} not found`);
    }
    
    const currentViews = seriesSnap.data().views || 0;
    
    // Update views
    await updateDoc(seriesRef, {
      views: currentViews + 1,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error(`Error incrementing views for series with ID ${id}:`, error);
    throw error;
  }
};

// Get popular series
export const getPopularSeries = async (limit: number = 10): Promise<Series[]> => {
  try {
    const seriesQuery = query(
      collection(db, SERIES_COLLECTION),
      where("status", "==", "published"),
      orderBy("views", "desc"),
      limit(limit)
    );
    
    const seriesSnapshot = await getDocs(seriesQuery);
    const seriesList: Series[] = [];
    
    seriesSnapshot.forEach((doc) => {
      const data = doc.data();
      seriesList.push({
        id: doc.id,
        ...data,
        releaseDate: data.releaseDate?.toDate() || new Date(),
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate(),
      } as Series);
    });
    
    return seriesList;
  } catch (error) {
    console.error("Error getting popular series:", error);
    throw error;
  }
};

// Get recent series
export const getRecentSeries = async (limit: number = 10): Promise<Series[]> => {
  try {
    const seriesQuery = query(
      collection(db, SERIES_COLLECTION),
      where("status", "==", "published"),
      orderBy("releaseDate", "desc"),
      limit(limit)
    );
    
    const seriesSnapshot = await getDocs(seriesQuery);
    const seriesList: Series[] = [];
    
    seriesSnapshot.forEach((doc) => {
      const data = doc.data();
      seriesList.push({
        id: doc.id,
        ...data,
        releaseDate: data.releaseDate?.toDate() || new Date(),
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate(),
      } as Series);
    });
    
    return seriesList;
  } catch (error) {
    console.error("Error getting recent series:", error);
    throw error;
  }
};

// Get series by genre
export const getSeriesByGenre = async (genre: string, limit: number = 10): Promise<Series[]> => {
  try {
    const seriesQuery = query(
      collection(db, SERIES_COLLECTION),
      where("status", "==", "published"),
      where("genres", "array-contains", genre),
      orderBy("releaseDate", "desc"),
      limit(limit)
    );
    
    const seriesSnapshot = await getDocs(seriesQuery);
    const seriesList: Series[] = [];
    
    seriesSnapshot.forEach((doc) => {
      const data = doc.data();
      seriesList.push({
        id: doc.id,
        ...data,
        releaseDate: data.releaseDate?.toDate() || new Date(),
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate(),
      } as Series);
    });
    
    return seriesList;
  } catch (error) {
    console.error(`Error getting series by genre ${genre}:`, error);
    throw error;
  }
};

// EPISODES MANAGEMENT

// Get episodes by series ID
export const getEpisodesBySeriesId = async (seriesId: string): Promise<Episode[]> => {
  try {
    const episodesQuery = query(
      collection(db, EPISODES_COLLECTION),
      where("seriesId", "==", seriesId),
      orderBy("season", "asc"),
      orderBy("episode", "asc")
    );
    
    const episodesSnapshot = await getDocs(episodesQuery);
    const episodes: Episode[] = [];
    
    episodesSnapshot.forEach((doc) => {
      const data = doc.data();
      episodes.push({
        id: doc.id,
        ...data,
        releaseDate: data.releaseDate?.toDate() || new Date(),
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate(),
      } as Episode);
    });
    
    return episodes;
  } catch (error) {
    console.error(`Error getting episodes for series ${seriesId}:`, error);
    throw error;
  }
};

// Get episode by ID
export const getEpisodeById = async (id: string): Promise<Episode | null> => {
  try {
    const episodeDoc = await getDoc(doc(db, EPISODES_COLLECTION, id));
    
    if (!episodeDoc.exists()) {
      return null;
    }
    
    const data = episodeDoc.data();
    return {
      id: episodeDoc.id,
      ...data,
      releaseDate: data.releaseDate?.toDate() || new Date(),
      createdAt: data.createdAt?.toDate(),
      updatedAt: data.updatedAt?.toDate(),
    } as Episode;
  } catch (error) {
    console.error(`Error getting episode with ID ${id}:`, error);
    throw error;
  }
};

// Create a new episode
export const createEpisode = async (
  episode: Omit<Episode, "id" | "createdAt" | "updatedAt" | "views">,
  adminId: string,
  adminName: string,
  thumbnailFile?: File
): Promise<Episode> => {
  try {
    // Check if the series exists
    const seriesDoc = await getDoc(doc(db, SERIES_COLLECTION, episode.seriesId));
    
    if (!seriesDoc.exists()) {
      throw new Error(`Series with ID ${episode.seriesId} not found`);
    }
    
    // Get series data for the activity log
    const seriesData = seriesDoc.data();
    
    let thumbnailUrl = episode.thumbnail || "";
    
    // Upload thumbnail if provided
    if (thumbnailFile) {
      const thumbnailStorageRef = ref(
        storage, 
        `series/episodes/${episode.seriesId}/S${episode.season}E${episode.episode}_${Date.now()}_${thumbnailFile.name}`
      );
      const thumbnailUploadTask = await uploadBytesResumable(thumbnailStorageRef, thumbnailFile);
      thumbnailUrl = await getDownloadURL(thumbnailUploadTask.ref);
    }
    
    // Prepare episode data for Firestore
    const episodeData = {
      ...episode,
      thumbnail: thumbnailUrl,
      views: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    
    // Add episode to Firestore
    const episodeRef = await addDoc(collection(db, EPISODES_COLLECTION), episodeData);
    
    // Log activity
    await logActivity({
      adminId,
      adminName,
      action: "CREATE",
      entityType: "EPISODE",
      entityId: episodeRef.id,
      entityName: `${seriesData.title} - S${episode.season}E${episode.episode}: ${episode.title}`,
      timestamp: new Date(),
      details: { episodeData, seriesTitle: seriesData.title }
    });
    
    // Get the created episode
    const createdEpisodeSnap = await getDoc(episodeRef);
    const createdEpisodeData = createdEpisodeSnap.data();
    
    return {
      id: episodeRef.id,
      ...createdEpisodeData,
      releaseDate: createdEpisodeData?.releaseDate?.toDate() || new Date(),
      createdAt: createdEpisodeData?.createdAt?.toDate(),
      updatedAt: createdEpisodeData?.updatedAt?.toDate(),
    } as Episode;
  } catch (error) {
    console.error("Error creating episode:", error);
    throw error;
  }
};

// Update an episode
export const updateEpisode = async (
  id: string,
  episodeUpdates: Partial<Episode>,
  adminId: string,
  adminName: string,
  thumbnailFile?: File
): Promise<Episode> => {
  try {
    // Get current episode data for comparison and logging
    const currentEpisodeSnap = await getDoc(doc(db, EPISODES_COLLECTION, id));
    
    if (!currentEpisodeSnap.exists()) {
      throw new Error(`Episode with ID ${id} not found`);
    }
    
    const currentEpisode = currentEpisodeSnap.data() as Episode;
    
    // Get series data for the activity log
    const seriesDoc = await getDoc(doc(db, SERIES_COLLECTION, currentEpisode.seriesId));
    if (!seriesDoc.exists()) {
      throw new Error(`Series with ID ${currentEpisode.seriesId} not found`);
    }
    const seriesData = seriesDoc.data();
    
    let thumbnailUrl = episodeUpdates.thumbnail || currentEpisode.thumbnail || "";
    
    // Upload new thumbnail if provided
    if (thumbnailFile) {
      // Delete old thumbnail if it exists and is not a placeholder
      if (currentEpisode.thumbnail && currentEpisode.thumbnail.includes("firebase")) {
        try {
          const oldThumbnailRef = ref(storage, currentEpisode.thumbnail);
          await deleteObject(oldThumbnailRef);
        } catch (error) {
          console.warn("Could not delete old thumbnail:", error);
        }
      }
      
      // Upload new thumbnail
      const thumbnailStorageRef = ref(
        storage, 
        `series/episodes/${currentEpisode.seriesId}/S${currentEpisode.season}E${currentEpisode.episode}_${Date.now()}_${thumbnailFile.name}`
      );
      const thumbnailUploadTask = await uploadBytesResumable(thumbnailStorageRef, thumbnailFile);
      thumbnailUrl = await getDownloadURL(thumbnailUploadTask.ref);
    }
    
    // Prepare update data
    const updateData = {
      ...episodeUpdates,
      thumbnail: thumbnailUrl,
      updatedAt: serverTimestamp(),
    };
    
    // Update episode in Firestore
    await updateDoc(doc(db, EPISODES_COLLECTION, id), updateData);
    
    // Log activity
    await logActivity({
      adminId,
      adminName,
      action: "UPDATE",
      entityType: "EPISODE",
      entityId: id,
      entityName: `${seriesData.title} - S${currentEpisode.season}E${currentEpisode.episode}: ${currentEpisode.title}`,
      timestamp: new Date(),
      details: {
        before: currentEpisode,
        after: { ...currentEpisode, ...updateData },
        seriesTitle: seriesData.title
      }
    });
    
    // Get the updated episode
    const updatedEpisodeSnap = await getDoc(doc(db, EPISODES_COLLECTION, id));
    const updatedEpisodeData = updatedEpisodeSnap.data();
    
    return {
      id,
      ...updatedEpisodeData,
      releaseDate: updatedEpisodeData?.releaseDate?.toDate() || new Date(),
      createdAt: updatedEpisodeData?.createdAt?.toDate(),
      updatedAt: updatedEpisodeData?.updatedAt?.toDate(),
    } as Episode;
  } catch (error) {
    console.error(`Error updating episode with ID ${id}:`, error);
    throw error;
  }
};

// Delete an episode
export const deleteEpisode = async (
  id: string,
  adminId: string,
  adminName: string
): Promise<void> => {
  try {
    // Get episode data for logging and cleaning up storage
    const episodeSnap = await getDoc(doc(db, EPISODES_COLLECTION, id));
    
    if (!episodeSnap.exists()) {
      throw new Error(`Episode with ID ${id} not found`);
    }
    
    const episodeData = episodeSnap.data() as Episode;
    
    // Get series data for the activity log
    const seriesDoc = await getDoc(doc(db, SERIES_COLLECTION, episodeData.seriesId));
    const seriesTitle = seriesDoc.exists() ? seriesDoc.data().title : "Unknown Series";
    
    // Delete episode from Firestore
    await deleteDoc(doc(db, EPISODES_COLLECTION, id));
    
    // Delete thumbnail from storage if it exists and is not a placeholder
    if (episodeData.thumbnail && episodeData.thumbnail.includes("firebase")) {
      try {
        const thumbnailRef = ref(storage, episodeData.thumbnail);
        await deleteObject(thumbnailRef);
      } catch (error) {
        console.warn("Could not delete thumbnail:", error);
      }
    }
    
    // Log activity
    await logActivity({
      adminId,
      adminName,
      action: "DELETE",
      entityType: "EPISODE",
      entityId: id,
      entityName: `${seriesTitle} - S${episodeData.season}E${episodeData.episode}: ${episodeData.title}`,
      timestamp: new Date(),
      details: { 
        deletedEpisode: episodeData,
        seriesTitle 
      }
    });
  } catch (error) {
    console.error(`Error deleting episode with ID ${id}:`, error);
    throw error;
  }
};

// Increment episode views
export const incrementEpisodeViews = async (id: string): Promise<void> => {
  try {
    const episodeRef = doc(db, EPISODES_COLLECTION, id);
    
    // Get current views
    const episodeSnap = await getDoc(episodeRef);
    
    if (!episodeSnap.exists()) {
      throw new Error(`Episode with ID ${id} not found`);
    }
    
    const currentViews = episodeSnap.data().views || 0;
    const seriesId = episodeSnap.data().seriesId;
    
    // Update episode views
    await updateDoc(episodeRef, {
      views: currentViews + 1,
      updatedAt: serverTimestamp(),
    });
    
    // Also increment series views
    await incrementSeriesViews(seriesId);
  } catch (error) {
    console.error(`Error incrementing views for episode with ID ${id}:`, error);
    throw error;
  }
};