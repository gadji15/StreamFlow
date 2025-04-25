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
  DocumentData,
  serverTimestamp,
  Timestamp,
  setDoc
} from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from "firebase/storage";
import { db, storage } from "../config";
import { logActivity } from "./activity-logs";

// Collection name
const ADMINS_COLLECTION = "admins";

// Admin roles
export type AdminRole = "super_admin" | "content_manager" | "moderator";

// Admin interface
export interface Admin {
  id: string;
  email: string;
  name: string;
  role: AdminRole;
  avatar?: string;
  createdAt: Date | Timestamp;
  updatedAt?: Date | Timestamp;
  lastLoginAt?: Date | Timestamp;
  createdBy?: string;
  isActive: boolean;
  permissions?: {
    canManageMovies: boolean;
    canManageSeries: boolean;
    canManageUsers: boolean;
    canManageAdmins: boolean;
    canManageSettings: boolean;
    canViewStats: boolean;
    canManageComments: boolean;
  };
}

// Get all admins
export const getAllAdmins = async (): Promise<Admin[]> => {
  try {
    const adminsSnapshot = await getDocs(collection(db, ADMINS_COLLECTION));
    const admins: Admin[] = [];
    
    adminsSnapshot.forEach((doc) => {
      const data = doc.data();
      admins.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate(),
        lastLoginAt: data.lastLoginAt?.toDate(),
      } as Admin);
    });
    
    return admins;
  } catch (error) {
    console.error("Error getting admins:", error);
    throw error;
  }
};

// Get an admin by ID
export const getAdminById = async (id: string): Promise<Admin | null> => {
  try {
    const adminDoc = await getDoc(doc(db, ADMINS_COLLECTION, id));
    
    if (!adminDoc.exists()) {
      return null;
    }
    
    const data = adminDoc.data();
    return {
      id: adminDoc.id,
      ...data,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate(),
      lastLoginAt: data.lastLoginAt?.toDate(),
    } as Admin;
  } catch (error) {
    console.error(`Error getting admin with ID ${id}:`, error);
    throw error;
  }
};

// Get an admin by email
export const getAdminByEmail = async (email: string): Promise<Admin | null> => {
  try {
    const adminsQuery = query(
      collection(db, ADMINS_COLLECTION),
      where("email", "==", email),
      limit(1)
    );
    
    const adminsSnapshot = await getDocs(adminsQuery);
    
    if (adminsSnapshot.empty) {
      return null;
    }
    
    const adminDoc = adminsSnapshot.docs[0];
    const data = adminDoc.data();
    
    return {
      id: adminDoc.id,
      ...data,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate(),
      lastLoginAt: data.lastLoginAt?.toDate(),
    } as Admin;
  } catch (error) {
    console.error(`Error getting admin with email ${email}:`, error);
    throw error;
  }
};

// Create a new admin
export const createAdmin = async (
  admin: Omit<Admin, "id" | "createdAt" | "updatedAt">,
  creatorId: string,
  creatorName: string,
  avatarFile?: File
): Promise<Admin> => {
  try {
    // Check if admin with this email already exists
    const existingAdmin = await getAdminByEmail(admin.email);
    
    if (existingAdmin) {
      throw new Error(`Admin with email ${admin.email} already exists`);
    }
    
    let avatarUrl = admin.avatar || "";
    
    // Upload avatar if provided
    if (avatarFile) {
      const avatarStorageRef = ref(storage, `admins/${admin.email}/${Date.now()}_${avatarFile.name}`);
      const avatarUploadTask = await uploadBytesResumable(avatarStorageRef, avatarFile);
      avatarUrl = await getDownloadURL(avatarUploadTask.ref);
    }
    
    // Set default permissions based on role
    let permissions = admin.permissions;
    if (!permissions) {
      switch (admin.role) {
        case "super_admin":
          permissions = {
            canManageMovies: true,
            canManageSeries: true,
            canManageUsers: true,
            canManageAdmins: true,
            canManageSettings: true,
            canViewStats: true,
            canManageComments: true,
          };
          break;
        case "content_manager":
          permissions = {
            canManageMovies: true,
            canManageSeries: true,
            canManageUsers: false,
            canManageAdmins: false,
            canManageSettings: true,
            canViewStats: true,
            canManageComments: true,
          };
          break;
        case "moderator":
          permissions = {
            canManageMovies: false,
            canManageSeries: false,
            canManageUsers: true,
            canManageAdmins: false,
            canManageSettings: false,
            canViewStats: true,
            canManageComments: true,
          };
          break;
      }
    }
    
    // Prepare admin data for Firestore
    const adminData = {
      ...admin,
      avatar: avatarUrl,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      createdBy: creatorId,
      permissions,
    };
    
    // Use the UID as the document ID if provided, else let Firestore generate one
    let adminRef;
    if (admin.id) {
      adminRef = doc(db, ADMINS_COLLECTION, admin.id);
      await setDoc(adminRef, adminData);
    } else {
      adminRef = await addDoc(collection(db, ADMINS_COLLECTION), adminData);
    }
    
    // Log activity
    await logActivity({
      adminId: creatorId,
      adminName: creatorName,
      action: "CREATE",
      entityType: "ADMIN",
      entityId: adminRef.id,
      entityName: admin.name,
      timestamp: new Date(),
      details: { adminData }
    });
    
    // Get the created admin
    const createdAdminSnap = await getDoc(adminRef);
    const createdAdminData = createdAdminSnap.data();
    
    return {
      id: adminRef.id,
      ...createdAdminData,
      createdAt: createdAdminData?.createdAt?.toDate() || new Date(),
      updatedAt: createdAdminData?.updatedAt?.toDate(),
      lastLoginAt: createdAdminData?.lastLoginAt?.toDate(),
    } as Admin;
  } catch (error) {
    console.error("Error creating admin:", error);
    throw error;
  }
};

// Update an admin
export const updateAdmin = async (
  id: string,
  adminUpdates: Partial<Admin>,
  updaterId: string,
  updaterName: string,
  avatarFile?: File
): Promise<Admin> => {
  try {
    // Get current admin data for comparison and logging
    const currentAdminSnap = await getDoc(doc(db, ADMINS_COLLECTION, id));
    
    if (!currentAdminSnap.exists()) {
      throw new Error(`Admin with ID ${id} not found`);
    }
    
    const currentAdmin = currentAdminSnap.data() as Admin;
    
    // Check if updating email and if it's already in use
    if (adminUpdates.email && adminUpdates.email !== currentAdmin.email) {
      const existingAdmin = await getAdminByEmail(adminUpdates.email);
      
      if (existingAdmin && existingAdmin.id !== id) {
        throw new Error(`Admin with email ${adminUpdates.email} already exists`);
      }
    }
    
    let avatarUrl = adminUpdates.avatar || currentAdmin.avatar || "";
    
    // Upload new avatar if provided
    if (avatarFile) {
      // Delete old avatar if it exists and is not a placeholder
      if (currentAdmin.avatar && currentAdmin.avatar.includes("firebase")) {
        try {
          const oldAvatarRef = ref(storage, currentAdmin.avatar);
          await deleteObject(oldAvatarRef);
        } catch (error) {
          console.warn("Could not delete old avatar:", error);
        }
      }
      
      // Upload new avatar
      const avatarStorageRef = ref(storage, `admins/${adminUpdates.email || currentAdmin.email}/${Date.now()}_${avatarFile.name}`);
      const avatarUploadTask = await uploadBytesResumable(avatarStorageRef, avatarFile);
      avatarUrl = await getDownloadURL(avatarUploadTask.ref);
    }
    
    // Prepare update data
    const updateData = {
      ...adminUpdates,
      avatar: avatarUrl,
      updatedAt: serverTimestamp(),
    };
    
    // If role is updated, update permissions too
    if (adminUpdates.role && !adminUpdates.permissions) {
      let permissions;
      switch (adminUpdates.role) {
        case "super_admin":
          permissions = {
            canManageMovies: true,
            canManageSeries: true,
            canManageUsers: true,
            canManageAdmins: true,
            canManageSettings: true,
            canViewStats: true,
            canManageComments: true,
          };
          break;
        case "content_manager":
          permissions = {
            canManageMovies: true,
            canManageSeries: true,
            canManageUsers: false,
            canManageAdmins: false,
            canManageSettings: true,
            canViewStats: true,
            canManageComments: true,
          };
          break;
        case "moderator":
          permissions = {
            canManageMovies: false,
            canManageSeries: false,
            canManageUsers: true,
            canManageAdmins: false,
            canManageSettings: false,
            canViewStats: true,
            canManageComments: true,
          };
          break;
      }
      updateData.permissions = permissions;
    }
    
    // Update admin in Firestore
    await updateDoc(doc(db, ADMINS_COLLECTION, id), updateData);
    
    // Log activity
    await logActivity({
      adminId: updaterId,
      adminName: updaterName,
      action: "UPDATE",
      entityType: "ADMIN",
      entityId: id,
      entityName: currentAdmin.name,
      timestamp: new Date(),
      details: {
        before: currentAdmin,
        after: { ...currentAdmin, ...updateData }
      }
    });
    
    // Get the updated admin
    const updatedAdminSnap = await getDoc(doc(db, ADMINS_COLLECTION, id));
    const updatedAdminData = updatedAdminSnap.data();
    
    return {
      id,
      ...updatedAdminData,
      createdAt: updatedAdminData?.createdAt?.toDate() || new Date(),
      updatedAt: updatedAdminData?.updatedAt?.toDate(),
      lastLoginAt: updatedAdminData?.lastLoginAt?.toDate(),
    } as Admin;
  } catch (error) {
    console.error(`Error updating admin with ID ${id}:`, error);
    throw error;
  }
};

// Delete an admin
export const deleteAdmin = async (
  id: string,
  deleterId: string,
  deleterName: string
): Promise<void> => {
  try {
    // Get admin data for logging and cleaning up storage
    const adminSnap = await getDoc(doc(db, ADMINS_COLLECTION, id));
    
    if (!adminSnap.exists()) {
      throw new Error(`Admin with ID ${id} not found`);
    }
    
    const adminData = adminSnap.data() as Admin;
    
    // Check if trying to delete the only super admin
    if (adminData.role === "super_admin") {
      const allAdmins = await getAllAdmins();
      const superAdmins = allAdmins.filter(admin => admin.role === "super_admin");
      
      if (superAdmins.length === 1 && superAdmins[0].id === id) {
        throw new Error("Cannot delete the only super admin");
      }
    }
    
    // Delete admin from Firestore
    await deleteDoc(doc(db, ADMINS_COLLECTION, id));
    
    // Delete avatar from storage if it exists and is not a placeholder
    if (adminData.avatar && adminData.avatar.includes("firebase")) {
      try {
        const avatarRef = ref(storage, adminData.avatar);
        await deleteObject(avatarRef);
      } catch (error) {
        console.warn("Could not delete avatar:", error);
      }
    }
    
    // Log activity
    await logActivity({
      adminId: deleterId,
      adminName: deleterName,
      action: "DELETE",
      entityType: "ADMIN",
      entityId: id,
      entityName: adminData.name,
      timestamp: new Date(),
      details: { deletedAdmin: adminData }
    });
  } catch (error) {
    console.error(`Error deleting admin with ID ${id}:`, error);
    throw error;
  }
};

// Update admin's last login
export const updateAdminLastLogin = async (id: string): Promise<void> => {
  try {
    await updateDoc(doc(db, ADMINS_COLLECTION, id), {
      lastLoginAt: serverTimestamp(),
    });
  } catch (error) {
    console.error(`Error updating last login for admin ${id}:`, error);
    throw error;
  }
};

// Verify if a user is an admin
export const verifyAdmin = async (uid: string): Promise<{
  isAdmin: boolean;
  role?: AdminRole;
  permissions?: Admin["permissions"];
}> => {
  try {
    const adminDoc = await getDoc(doc(db, ADMINS_COLLECTION, uid));
    
    if (!adminDoc.exists()) {
      return { isAdmin: false };
    }
    
    const adminData = adminDoc.data() as Admin;
    
    // Check if admin is active
    if (!adminData.isActive) {
      return { isAdmin: false };
    }
    
    return {
      isAdmin: true,
      role: adminData.role,
      permissions: adminData.permissions,
    };
  } catch (error) {
    console.error(`Error verifying admin status for ${uid}:`, error);
    return { isAdmin: false };
  }
};