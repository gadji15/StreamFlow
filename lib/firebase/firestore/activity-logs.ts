import { 
  collection, 
  addDoc, 
  query, 
  orderBy, 
  limit, 
  getDocs,
  where,
  QueryConstraint,
  startAfter,
  QueryDocumentSnapshot,
  DocumentData
} from "firebase/firestore";
import { firestore } from "../config";

// Types
export interface ActivityLog {
  id?: string;
  action: "create" | "update" | "delete" | "login" | "logout" | "view";
  entityType: "movie" | "series" | "episode" | "user" | "admin" | "comment";
  entityId: string;
  details: string;
  performedBy: string;
  timestamp: string;
}

// Collection reference
const COLLECTION = "activity_logs";

// Add activity log
export const addActivityLog = async (log: Omit<ActivityLog, "id">): Promise<ActivityLog> => {
  try {
    const docRef = await addDoc(collection(firestore, COLLECTION), {
      ...log,
      timestamp: log.timestamp || new Date().toISOString()
    });
    
    return {
      id: docRef.id,
      ...log
    };
  } catch (error) {
    console.error("Error adding activity log:", error);
    throw error;
  }
};

// Get recent activity logs
export const getRecentActivityLogs = async (count: number = 10): Promise<ActivityLog[]> => {
  try {
    const q = query(
      collection(firestore, COLLECTION),
      orderBy("timestamp", "desc"),
      limit(count)
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as ActivityLog));
  } catch (error) {
    console.error("Error getting recent activity logs:", error);
    throw error;
  }
};

// Get activity logs with filters and pagination
export const getActivityLogs = async (
  options: {
    action?: ActivityLog["action"],
    entityType?: ActivityLog["entityType"],
    entityId?: string,
    performedBy?: string,
    startDate?: Date,
    endDate?: Date,
    limit?: number,
    page?: number,
    startAfterDoc?: QueryDocumentSnapshot<DocumentData>
  } = {}
): Promise<{logs: ActivityLog[], lastDoc: QueryDocumentSnapshot<DocumentData> | null, total: number}> => {
  try {
    const constraints: QueryConstraint[] = [];
    const {
      action,
      entityType,
      entityId,
      performedBy,
      startDate,
      endDate,
      limit: limitCount = 20,
      page = 1,
      startAfterDoc
    } = options;
    
    // Add filters if present
    if (action) {
      constraints.push(where("action", "==", action));
    }
    
    if (entityType) {
      constraints.push(where("entityType", "==", entityType));
    }
    
    if (entityId) {
      constraints.push(where("entityId", "==", entityId));
    }
    
    if (performedBy) {
      constraints.push(where("performedBy", "==", performedBy));
    }
    
    if (startDate) {
      constraints.push(where("timestamp", ">=", startDate.toISOString()));
    }
    
    if (endDate) {
      constraints.push(where("timestamp", "<=", endDate.toISOString()));
    }
    
    // Add descending sort by timestamp
    constraints.push(orderBy("timestamp", "desc"));
    
    // Calculate offset for pagination
    const offset = (page - 1) * limitCount;
    
    // Get total for pagination
    const totalQuery = query(collection(firestore, COLLECTION), ...constraints);
    const totalSnapshot = await getDocs(totalQuery);
    const total = totalSnapshot.size;
    
    // Add pagination
    if (startAfterDoc) {
      constraints.push(startAfter(startAfterDoc));
    }
    
    // Add limit
    constraints.push(limit(limitCount));
    
    // Build final query
    const q = query(collection(firestore, COLLECTION), ...constraints);
    
    // Execute query
    const querySnapshot = await getDocs(q);
    
    // Transform data
    const logs = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as ActivityLog));
    
    return {
      logs: logs,
      lastDoc: querySnapshot.docs.length > 0 ? querySnapshot.docs[querySnapshot.docs.length - 1] : null,
      total
    };
  } catch (error) {
    console.error("Error getting activity logs:", error);
    throw error;
  }
};

// Get activity logs by admin
export const getActivityLogsByAdmin = async (adminId: string, limitCount: number = 10): Promise<ActivityLog[]> => {
  try {
    const q = query(
      collection(firestore, COLLECTION),
      where("performedBy", "==", adminId),
      orderBy("timestamp", "desc"),
      limit(limitCount)
    );
    
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as ActivityLog));
  } catch (error) {
    console.error(`Error getting activity logs for admin ${adminId}:`, error);
    throw error;
  }
};