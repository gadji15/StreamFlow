import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  startAfter,
  QueryDocumentSnapshot,
  DocumentData,
  Timestamp,
  increment,
  runTransaction
} from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from "firebase/storage";
import { firestore, storage } from "../config";
import { addActivityLog } from "./activity-logs";

// Collection name
const COLLECTION = "admins";

// Admin user type
export interface Admin {
  id?: string;
  email: string;
  name: string;
  role: "super_admin" | "admin" | "content_manager";
  isActive: boolean;
  avatarUrl?: string;
  lastLogin?: string;
  createdAt: string;
  updatedAt?: string;
}

// Get admin by ID
export const getAdmin = async (id: string): Promise<Admin | null> => {
  try {
    const docRef = doc(firestore, COLLECTION, id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data()
      } as Admin;
    }
    
    return null;
  } catch (error) {
    console.error(`Error getting admin ${id}:`, error);
    throw error;
  }
};

// Get admin by email
export const getAdminByEmail = async (email: string): Promise<Admin | null> => {
  try {
    const q = query(
      collection(firestore, COLLECTION),
      where("email", "==", email),
      limit(1)
    );
    
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const docSnap = querySnapshot.docs[0];
      return {
        id: docSnap.id,
        ...docSnap.data()
      } as Admin;
    }
    
    return null;
  } catch (error) {
    console.error(`Error getting admin by email ${email}:`, error);
    throw error;
  }
};

// Check if user is an admin
export const isAdmin = async (userId: string): Promise<boolean> => {
  try {
    const admin = await getAdmin(userId);
    return admin !== null && admin.isActive;
  } catch (error) {
    console.error("Error checking admin status:", error);
    return false;
  }
};

// Update admin last login
export const updateAdminLastLogin = async (id: string): Promise<void> => {
  try {
    const adminRef = doc(firestore, COLLECTION, id);
    
    await updateDoc(adminRef, {
      lastLogin: new Date().toISOString()
    });
  } catch (error) {
    console.error(`Error updating admin last login ${id}:`, error);
    throw error;
  }
};

// Create or update admin
export const saveAdmin = async (
  admin: Omit<Admin, "id" | "createdAt" | "updatedAt">,
  currentUserId: string,
  adminId?: string
): Promise<Admin> => {
  try {
    const now = new Date().toISOString();
    const isNewAdmin = !adminId;
    
    let docRef;
    if (isNewAdmin) {
      // New admin, generate ID
      docRef = doc(collection(firestore, COLLECTION));
    } else {
      // Existing admin
      docRef = doc(firestore, COLLECTION, adminId);
    }
    
    const adminData = isNewAdmin
      ? {
          ...admin,
          createdAt: now,
          updatedAt: now
        }
      : {
          ...admin,
          updatedAt: now
        };
    
    if (isNewAdmin) {
      await setDoc(docRef, adminData);
      
      // Log activity
      await addActivityLog({
        action: "create",
        entityType: "admin",
        entityId: docRef.id,
        details: `Admin created: ${admin.name} (${admin.email})`,
        performedBy: currentUserId,
        timestamp: now
      });
    } else {
      await updateDoc(docRef, adminData);
      
      // Log activity
      await addActivityLog({
        action: "update",
        entityType: "admin",
        entityId: docRef.id!,
        details: `Admin updated: ${admin.name} (${admin.email})`,
        performedBy: currentUserId,
        timestamp: now
      });
    }
    
    return {
      id: docRef.id,
      ...adminData
    };
  } catch (error) {
    console.error("Error saving admin:", error);
    throw error;
  }
};

// Get all admins with pagination
export const getAdmins = async (
  options: {
    role?: Admin["role"],
    isActive?: boolean,
    searchQuery?: string,
    sortBy?: "name" | "email" | "role" | "lastLogin" | "createdAt",
    sortDirection?: "asc" | "desc",
    limit?: number,
    startAfterDoc?: QueryDocumentSnapshot<DocumentData>
  } = {}
): Promise<{admins: Admin[], lastDoc: QueryDocumentSnapshot<DocumentData> | null}> => {
  try {
    let q: any = collection(firestore, COLLECTION);
    
    const {
      role,
      isActive,
      searchQuery,
      sortBy = "createdAt",
      sortDirection = "desc",
      limit: limitCount = 20,
      startAfterDoc
    } = options;
    
    // Add filters if present
    if (role) {
      q = query(q, where("role", "==", role));
    }
    
    if (isActive !== undefined) {
      q = query(q, where("isActive", "==", isActive));
    }
    
    // Simple text search via name or email
    if (searchQuery) {
      // Note: This is a simple implementation
      // For production, consider using a dedicated search service
      q = query(
        q, 
        where("email", ">=", searchQuery), 
        where("email", "<=", searchQuery + "\uf8ff")
      );
    }
    
    // Add sorting
    q = query(q, orderBy(sortBy, sortDirection));
    
    // Add pagination
    if (startAfterDoc) {
      q = query(q, startAfter(startAfterDoc));
    }
    
    // Limit results
    q = query(q, limit(limitCount));
    
    // Execute query
    const querySnapshot = await getDocs(q);
    
    // Format results
    const admins = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Admin));
    
    return {
      admins,
      lastDoc: querySnapshot.docs.length > 0 ? querySnapshot.docs[querySnapshot.docs.length - 1] : null
    };
  } catch (error) {
    console.error("Error getting admins:", error);
    throw error;
  }
};

// Delete admin
export const deleteAdmin = async (id: string, currentUserId: string): Promise<void> => {
  try {
    // First check if this is the only super_admin
    const adminRef = doc(firestore, COLLECTION, id);
    const adminSnap = await getDoc(adminRef);
    
    if (!adminSnap.exists()) {
      throw new Error(`Admin with ID ${id} not found`);
    }
    
    const adminData = adminSnap.data() as Admin;
    
    if (adminData.role === "super_admin") {
      // Check if this is the only super_admin
      const superAdminsQuery = query(
        collection(firestore, COLLECTION),
        where("role", "==", "super_admin")
      );
      
      const superAdminsSnapshot = await getDocs(superAdminsQuery);
      
      if (superAdminsSnapshot.size <= 1) {
        throw new Error("Cannot delete the only super admin");
      }
    }
    
    // If we get here, it's safe to delete
    
    // Delete avatar if exists
    if (adminData.avatarUrl) {
      try {
        const avatarRef = ref(storage, adminData.avatarUrl);
        await deleteObject(avatarRef);
      } catch (error) {
        console.warn("Error deleting admin avatar:", error);
      }
    }
    
    // Delete admin document
    await deleteDoc(adminRef);
    
    // Log activity
    await addActivityLog({
      action: "delete",
      entityType: "admin",
      entityId: id,
      details: `Admin deleted: ${adminData.name} (${adminData.email})`,
      performedBy: currentUserId,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error(`Error deleting admin ${id}:`, error);
    throw error;
  }
};

// Upload admin avatar
export const uploadAdminAvatar = async (
  file: File,
  adminId: string
): Promise<string> => {
  try {
    // Create a unique path for the file
    const extension = file.name.split(".").pop();
    const path = `admins/${adminId}/avatar_${Date.now()}.${extension}`;
    const storageRef = ref(storage, path);
    
    // Upload file
    const uploadTask = uploadBytesResumable(storageRef, file);
    
    // Wait for upload to complete
    return new Promise((resolve, reject) => {
      uploadTask.on(
        "state_changed",
        (snapshot) => {
          // Upload progress
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log(`Upload progress: ${progress}%`);
        },
        (error) => {
          // Error
          console.error("Error uploading avatar:", error);
          reject(error);
        },
        async () => {
          // Upload complete
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          resolve(downloadURL);
        }
      );
    });
  } catch (error) {
    console.error("Error uploading admin avatar:", error);
    throw error;
  }
};