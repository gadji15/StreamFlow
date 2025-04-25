import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  DocumentData,
  QueryDocumentSnapshot,
  serverTimestamp,
  Timestamp
} from "firebase/firestore";
import { db } from "../config";

// Collection name
const ACTIVITY_LOGS_COLLECTION = "activity_logs";

// Activity log interface
export interface ActivityLog {
  id: string;
  adminId: string;
  adminName: string;
  action: "CREATE" | "UPDATE" | "DELETE" | "LOGIN" | "LOGOUT" | "OTHER";
  entityType: "MOVIE" | "SERIES" | "EPISODE" | "USER" | "ADMIN" | "COMMENT" | "SUBSCRIPTION" | "SETTING" | "OTHER";
  entityId: string;
  entityName: string;
  timestamp: Date | Timestamp;
  ip?: string;
  userAgent?: string;
  details?: any;
}

// Log an activity
export const logActivity = async (
  activity: Omit<ActivityLog, "id">
): Promise<string> => {
  try {
    // Prepare activity data for Firestore
    const activityData = {
      ...activity,
      timestamp: activity.timestamp instanceof Date ? 
        Timestamp.fromDate(activity.timestamp) : serverTimestamp(),
    };
    
    // Add activity to Firestore
    const activityRef = await addDoc(collection(db, ACTIVITY_LOGS_COLLECTION), activityData);
    
    return activityRef.id;
  } catch (error) {
    console.error("Error logging activity:", error);
    throw error;
  }
};

// Get all activity logs
export const getAllActivityLogs = async (): Promise<ActivityLog[]> => {
  try {
    const logsSnapshot = await getDocs(
      query(collection(db, ACTIVITY_LOGS_COLLECTION), orderBy("timestamp", "desc"))
    );
    
    const logs: ActivityLog[] = [];
    
    logsSnapshot.forEach((doc) => {
      const data = doc.data();
      logs.push({
        id: doc.id,
        ...data,
        timestamp: data.timestamp?.toDate() || new Date(),
      } as ActivityLog);
    });
    
    return logs;
  } catch (error) {
    console.error("Error getting activity logs:", error);
    throw error;
  }
};

// Get paginated activity logs
export const getPaginatedActivityLogs = async (
  lastVisible: QueryDocumentSnapshot<DocumentData> | null = null,
  itemsPerPage: number = 20,
  filters: {
    adminId?: string;
    action?: "CREATE" | "UPDATE" | "DELETE" | "LOGIN" | "LOGOUT" | "OTHER";
    entityType?: "MOVIE" | "SERIES" | "EPISODE" | "USER" | "ADMIN" | "COMMENT" | "SUBSCRIPTION" | "SETTING" | "OTHER";
    entityId?: string;
    startDate?: Date;
    endDate?: Date;
  } = {}
): Promise<{
  logs: ActivityLog[];
  lastVisible: QueryDocumentSnapshot<DocumentData> | null;
  hasMore: boolean;
}> => {
  try {
    let logsRef = collection(db, ACTIVITY_LOGS_COLLECTION);
    let constraints: any[] = [];
    
    // Add filters
    if (filters.adminId) {
      constraints.push(where("adminId", "==", filters.adminId));
    }
    
    if (filters.action) {
      constraints.push(where("action", "==", filters.action));
    }
    
    if (filters.entityType) {
      constraints.push(where("entityType", "==", filters.entityType));
    }
    
    if (filters.entityId) {
      constraints.push(where("entityId", "==", filters.entityId));
    }
    
    if (filters.startDate) {
      constraints.push(where("timestamp", ">=", Timestamp.fromDate(filters.startDate)));
    }
    
    if (filters.endDate) {
      constraints.push(where("timestamp", "<=", Timestamp.fromDate(filters.endDate)));
    }
    
    // Add orderBy and pagination
    constraints.push(orderBy("timestamp", "desc"));
    
    if (lastVisible) {
      constraints.push(startAfter(lastVisible));
    }
    
    constraints.push(limit(itemsPerPage + 1)); // Get one extra to check if there are more
    
    const q = query(logsRef, ...constraints);
    const logsSnapshot = await getDocs(q);
    
    const logs: ActivityLog[] = [];
    let newLastVisible: QueryDocumentSnapshot<DocumentData> | null = null;
    let hasMore = false;
    
    // Process results
    if (!logsSnapshot.empty) {
      const docs = logsSnapshot.docs;
      
      // Check if we have more results
      if (docs.length > itemsPerPage) {
        hasMore = true;
        docs.pop(); // Remove the extra item
      }
      
      // Get the last visible item for pagination
      newLastVisible = docs[docs.length - 1] || null;
      
      // Map documents to ActivityLog objects
      docs.forEach((doc) => {
        const data = doc.data();
        logs.push({
          id: doc.id,
          ...data,
          timestamp: data.timestamp?.toDate() || new Date(),
        } as ActivityLog);
      });
    }
    
    return {
      logs,
      lastVisible: newLastVisible,
      hasMore,
    };
  } catch (error) {
    console.error("Error getting paginated activity logs:", error);
    throw error;
  }
};

// Get activity log by ID
export const getActivityLogById = async (id: string): Promise<ActivityLog | null> => {
  try {
    const logDoc = await getDoc(doc(db, ACTIVITY_LOGS_COLLECTION, id));
    
    if (!logDoc.exists()) {
      return null;
    }
    
    const data = logDoc.data();
    return {
      id: logDoc.id,
      ...data,
      timestamp: data.timestamp?.toDate() || new Date(),
    } as ActivityLog;
  } catch (error) {
    console.error(`Error getting activity log with ID ${id}:`, error);
    throw error;
  }
};

// Get activity logs by admin
export const getActivityLogsByAdmin = async (
  adminId: string,
  limit: number = 10
): Promise<ActivityLog[]> => {
  try {
    const logsQuery = query(
      collection(db, ACTIVITY_LOGS_COLLECTION),
      where("adminId", "==", adminId),
      orderBy("timestamp", "desc"),
      limit(limit)
    );
    
    const logsSnapshot = await getDocs(logsQuery);
    const logs: ActivityLog[] = [];
    
    logsSnapshot.forEach((doc) => {
      const data = doc.data();
      logs.push({
        id: doc.id,
        ...data,
        timestamp: data.timestamp?.toDate() || new Date(),
      } as ActivityLog);
    });
    
    return logs;
  } catch (error) {
    console.error(`Error getting activity logs for admin ${adminId}:`, error);
    throw error;
  }
};

// Get recent activity
export const getRecentActivity = async (limit: number = 5): Promise<ActivityLog[]> => {
  try {
    const logsQuery = query(
      collection(db, ACTIVITY_LOGS_COLLECTION),
      orderBy("timestamp", "desc"),
      limit(limit)
    );
    
    const logsSnapshot = await getDocs(logsQuery);
    const logs: ActivityLog[] = [];
    
    logsSnapshot.forEach((doc) => {
      const data = doc.data();
      logs.push({
        id: doc.id,
        ...data,
        timestamp: data.timestamp?.toDate() || new Date(),
      } as ActivityLog);
    });
    
    return logs;
  } catch (error) {
    console.error("Error getting recent activity:", error);
    throw error;
  }
};