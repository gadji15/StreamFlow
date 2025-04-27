import { firestore } from "../config";
import { collection, addDoc, serverTimestamp, query, where, orderBy, limit, getDocs } from "firebase/firestore";

/**
 * Enregistre une activité dans les logs
 */
export async function logActivity(
  userId: string,
  action: string,
  contentType: 'movie' | 'series' | 'episode',
  contentId: string,
  details?: Record<string, any>
) {
  try {
    const logRef = collection(firestore, "activityLogs");
    
    await addDoc(logRef, {
      userId,
      action,
      contentType,
      contentId,
      details: details || {},
      timestamp: serverTimestamp()
    });
    
    return true;
  } catch (error) {
    console.error("Erreur lors de l'enregistrement de l'activité:", error);
    return false;
  }
}

/**
 * Récupère les dernières activités d'un utilisateur
 */
export async function getUserActivities(userId: string, maxResults = 20) {
  try {
    const activitiesQuery = query(
      collection(firestore, "activityLogs"),
      where("userId", "==", userId),
      orderBy("timestamp", "desc"),
      limit(maxResults)
    );
    
    const snapshot = await getDocs(activitiesQuery);
    
    const activities = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      timestamp: doc.data().timestamp?.toDate()
    }));
    
    return activities;
  } catch (error) {
    console.error("Erreur lors de la récupération des activités:", error);
    return [];
  }
}