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
  
  // Collection name
  const USERS_COLLECTION = "users";
  const SUBSCRIPTIONS_COLLECTION = "subscriptions";
  
  // User interface
  export interface User {
    id: string;
    email: string;
    displayName: string;
    photoURL?: string;
    createdAt: Date | Timestamp;
    updatedAt?: Date | Timestamp;
    lastLoginAt?: Date | Timestamp;
    isVIP: boolean;
    subscription?: {
      plan: "basic" | "premium" | "vip";
      status: "active" | "canceled" | "expired";
      startDate: Date | Timestamp;
      endDate: Date | Timestamp;
      autoRenew: boolean;
      paymentMethod?: string;
    };
    favorites?: string[];
    watchHistory?: {
      id: string;
      type: "movie" | "episode";
      progress: number;
      lastWatchedAt: Date | Timestamp;
    }[];
    settings?: {
      notifications: boolean;
      emailUpdates: boolean;
      language: string;
      autoplay: boolean;
    };
    isActive: boolean;
  }
  
  // Subscription interface
  export interface Subscription {
    id: string;
    userId: string;
    plan: "basic" | "premium" | "vip";
    status: "active" | "canceled" | "expired";
    startDate: Date | Timestamp;
    endDate: Date | Timestamp;
    autoRenew: boolean;
    paymentMethod?: string;
    paymentHistory: {
      id: string;
      amount: number;
      date: Date | Timestamp;
      status: "succeeded" | "failed" | "refunded";
      paymentMethod: string;
    }[];
    createdAt: Date | Timestamp;
    updatedAt?: Date | Timestamp;
  }
  
  // Get all users
  export const getAllUsers = async (): Promise<User[]> => {
    try {
      const usersSnapshot = await getDocs(collection(db, USERS_COLLECTION));
      const users: User[] = [];
      
      usersSnapshot.forEach((doc) => {
        const data = doc.data();
        users.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate(),
          lastLoginAt: data.lastLoginAt?.toDate(),
          subscription: data.subscription ? {
            ...data.subscription,
            startDate: data.subscription.startDate?.toDate() || new Date(),
            endDate: data.subscription.endDate?.toDate() || new Date(),
          } : undefined,
          watchHistory: data.watchHistory ? data.watchHistory.map((item: any) => ({
            ...item,
            lastWatchedAt: item.lastWatchedAt?.toDate() || new Date(),
          })) : [],
        } as User);
      });
      
      return users;
    } catch (error) {
      console.error("Error getting users:", error);
      throw error;
    }
  };
  
  // Get paginated users
  export const getPaginatedUsers = async (
    lastVisible: QueryDocumentSnapshot<DocumentData> | null = null,
    itemsPerPage: number = 10,
    filters: {
      isVIP?: boolean;
      isActive?: boolean;
      search?: string;
    } = {}
  ): Promise<{
    users: User[];
    lastVisible: QueryDocumentSnapshot<DocumentData> | null;
    hasMore: boolean;
  }> => {
    try {
      let usersRef = collection(db, USERS_COLLECTION);
      let constraints: any[] = [];
      
      // Add filters
      if (filters.isVIP !== undefined) {
        constraints.push(where("isVIP", "==", filters.isVIP));
      }
      
      if (filters.isActive !== undefined) {
        constraints.push(where("isActive", "==", filters.isActive));
      }
      
      // Add orderBy and pagination
      constraints.push(orderBy("createdAt", "desc"));
      
      if (lastVisible) {
        constraints.push(startAfter(lastVisible));
      }
      
      constraints.push(limit(itemsPerPage + 1)); // Get one extra to check if there are more
      
      const q = query(usersRef, ...constraints);
      const usersSnapshot = await getDocs(q);
      
      const users: User[] = [];
      let newLastVisible: QueryDocumentSnapshot<DocumentData> | null = null;
      let hasMore = false;
      
      // Process results
      if (!usersSnapshot.empty) {
        const docs = usersSnapshot.docs;
        
        // Check if we have more results
        if (docs.length > itemsPerPage) {
          hasMore = true;
          docs.pop(); // Remove the extra item
        }
        
        // Get the last visible item for pagination
        newLastVisible = docs[docs.length - 1] || null;
        
        // Map documents to User objects
        docs.forEach((doc) => {
          const data = doc.data();
          
          // If there's a search filter, apply it client-side
          if (filters.search && 
              !data.email.toLowerCase().includes(filters.search.toLowerCase()) && 
              !data.displayName.toLowerCase().includes(filters.search.toLowerCase())) {
            return;
          }
          
          users.push({
            id: doc.id,
            ...data,
            createdAt: data.createdAt?.toDate() || new Date(),
            updatedAt: data.updatedAt?.toDate(),
            lastLoginAt: data.lastLoginAt?.toDate(),
            subscription: data.subscription ? {
              ...data.subscription,
              startDate: data.subscription.startDate?.toDate() || new Date(),
              endDate: data.subscription.endDate?.toDate() || new Date(),
            } : undefined,
            watchHistory: data.watchHistory ? data.watchHistory.map((item: any) => ({
              ...item,
              lastWatchedAt: item.lastWatchedAt?.toDate() || new Date(),
            })) : [],
          } as User);
        });
      }
      
      return {
        users,
        lastVisible: newLastVisible,
        hasMore,
      };
    } catch (error) {
      console.error("Error getting paginated users:", error);
      throw error;
    }
  };
  
  // Get a user by ID
  export const getUserById = async (id: string): Promise<User | null> => {
    try {
      const userDoc = await getDoc(doc(db, USERS_COLLECTION, id));
      
      if (!userDoc.exists()) {
        return null;
      }
      
      const data = userDoc.data();
      return {
        id: userDoc.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate(),
        lastLoginAt: data.lastLoginAt?.toDate(),
        subscription: data.subscription ? {
          ...data.subscription,
          startDate: data.subscription.startDate?.toDate() || new Date(),
          endDate: data.subscription.endDate?.toDate() || new Date(),
        } : undefined,
        watchHistory: data.watchHistory ? data.watchHistory.map((item: any) => ({
          ...item,
          lastWatchedAt: item.lastWatchedAt?.toDate() || new Date(),
        })) : [],
      } as User;
    } catch (error) {
      console.error(`Error getting user with ID ${id}:`, error);
      throw error;
    }
  };
  
  // Create a new user
  export const createUser = async (
    userData: Omit<User, "id" | "createdAt" | "updatedAt">,
    adminId: string,
    adminName: string,
    photoFile?: File
  ): Promise<User> => {
    try {
      let photoURL = userData.photoURL || "";
      
      // Upload photo if provided
      if (photoFile) {
        const photoStorageRef = ref(storage, `users/${userData.email}/${Date.now()}_${photoFile.name}`);
        const photoUploadTask = await uploadBytesResumable(photoStorageRef, photoFile);
        photoURL = await getDownloadURL(photoUploadTask.ref);
      }
      
      // Prepare user data for Firestore
      const userDataForFirestore = {
        ...userData,
        photoURL,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        favorites: userData.favorites || [],
        watchHistory: userData.watchHistory || [],
        settings: userData.settings || {
          notifications: true,
          emailUpdates: true,
          language: "fr",
          autoplay: true,
        },
      };
      
      // Check if subscription data is provided
      if (userData.subscription) {
        userDataForFirestore.subscription = {
          ...userData.subscription,
          startDate: userData.subscription.startDate instanceof Date ? 
            Timestamp.fromDate(userData.subscription.startDate) : userData.subscription.startDate,
          endDate: userData.subscription.endDate instanceof Date ? 
            Timestamp.fromDate(userData.subscription.endDate) : userData.subscription.endDate,
        };
      }
      
      // Use the UID from authentication as the document ID
      const userRef = doc(db, USERS_COLLECTION, userData.id);
      await setDoc(userRef, userDataForFirestore);
      
      // Log activity
      await logActivity({
        adminId,
        adminName,
        action: "CREATE",
        entityType: "USER",
        entityId: userData.id,
        entityName: userData.displayName,
        timestamp: new Date(),
        details: { userData: userDataForFirestore }
      });
      
      // Get the created user
      const createdUserSnap = await getDoc(userRef);
      const createdUserData = createdUserSnap.data();
      
      return {
        id: userRef.id,
        ...createdUserData,
        createdAt: createdUserData?.createdAt?.toDate() || new Date(),
        updatedAt: createdUserData?.updatedAt?.toDate(),
        lastLoginAt: createdUserData?.lastLoginAt?.toDate(),
        subscription: createdUserData?.subscription ? {
          ...createdUserData.subscription,
          startDate: createdUserData.subscription.startDate?.toDate() || new Date(),
          endDate: createdUserData.subscription.endDate?.toDate() || new Date(),
        } : undefined,
        watchHistory: createdUserData?.watchHistory ? createdUserData.watchHistory.map((item: any) => ({
          ...item,
          lastWatchedAt: item.lastWatchedAt?.toDate() || new Date(),
        })) : [],
      } as User;
    } catch (error) {
      console.error("Error creating user:", error);
      throw error;
    }
  };
  
  // Update a user
  export const updateUser = async (
    id: string,
    userUpdates: Partial<User>,
    adminId: string,
    adminName: string,
    photoFile?: File
  ): Promise<User> => {
    try {
      // Get current user data for comparison and logging
      const currentUserSnap = await getDoc(doc(db, USERS_COLLECTION, id));
      
      if (!currentUserSnap.exists()) {
        throw new Error(`User with ID ${id} not found`);
      }
      
      const currentUser = currentUserSnap.data() as User;
      let photoURL = userUpdates.photoURL || currentUser.photoURL || "";
      
      // Upload new photo if provided
      if (photoFile) {
        // Delete old photo if it exists and is not a placeholder
        if (currentUser.photoURL && currentUser.photoURL.includes("firebase")) {
          try {
            const oldPhotoRef = ref(storage, currentUser.photoURL);
            await deleteObject(oldPhotoRef);
          } catch (error) {
            console.warn("Could not delete old photo:", error);
          }
        }
        
        // Upload new photo
        const photoStorageRef = ref(storage, `users/${currentUser.email}/${Date.now()}_${photoFile.name}`);
        const photoUploadTask = await uploadBytesResumable(photoStorageRef, photoFile);
        photoURL = await getDownloadURL(photoUploadTask.ref);
      }
      
      // Prepare update data
      const updateData: any = {
        ...userUpdates,
        photoURL,
        updatedAt: serverTimestamp(),
      };
      
      // Handle special fields
      if (userUpdates.subscription) {
        updateData.subscription = {
          ...userUpdates.subscription,
          startDate: userUpdates.subscription.startDate instanceof Date ? 
            Timestamp.fromDate(userUpdates.subscription.startDate) : userUpdates.subscription.startDate,
          endDate: userUpdates.subscription.endDate instanceof Date ? 
            Timestamp.fromDate(userUpdates.subscription.endDate) : userUpdates.subscription.endDate,
        };
      }
      
      // Update user in Firestore
      await updateDoc(doc(db, USERS_COLLECTION, id), updateData);
      
      // Log activity
      await logActivity({
        adminId,
        adminName,
        action: "UPDATE",
        entityType: "USER",
        entityId: id,
        entityName: currentUser.displayName,
        timestamp: new Date(),
        details: {
          before: {
            ...currentUser,
            subscription: currentUser.subscription ? {
              ...currentUser.subscription,
              startDate: currentUser.subscription.startDate instanceof Date ?
                currentUser.subscription.startDate.toISOString() : currentUser.subscription.startDate,
              endDate: currentUser.subscription.endDate instanceof Date ?
                currentUser.subscription.endDate.toISOString() : currentUser.subscription.endDate,
            } : undefined,
          },
          after: {
            ...currentUser,
            ...updateData,
            subscription: updateData.subscription ? {
              ...updateData.subscription,
              startDate: updateData.subscription.startDate instanceof Timestamp ?
                updateData.subscription.startDate.toDate().toISOString() : updateData.subscription.startDate,
              endDate: updateData.subscription.endDate instanceof Timestamp ?
                updateData.subscription.endDate.toDate().toISOString() : updateData.subscription.endDate,
            } : currentUser.subscription ? {
              ...currentUser.subscription,
              startDate: currentUser.subscription.startDate instanceof Date ?
                currentUser.subscription.startDate.toISOString() : currentUser.subscription.startDate,
              endDate: currentUser.subscription.endDate instanceof Date ?
                currentUser.subscription.endDate.toISOString() : currentUser.subscription.endDate,
            } : undefined,
          }
        }
      });
      
      // Get the updated user
      const updatedUserSnap = await getDoc(doc(db, USERS_COLLECTION, id));
      const updatedUserData = updatedUserSnap.data();
      
      return {
        id,
        ...updatedUserData,
        createdAt: updatedUserData?.createdAt?.toDate() || new Date(),
        updatedAt: updatedUserData?.updatedAt?.toDate(),
        lastLoginAt: updatedUserData?.lastLoginAt?.toDate(),
        subscription: updatedUserData?.subscription ? {
          ...updatedUserData.subscription,
          startDate: updatedUserData.subscription.startDate?.toDate() || new Date(),
          endDate: updatedUserData.subscription.endDate?.toDate() || new Date(),
        } : undefined,
        watchHistory: updatedUserData?.watchHistory ? updatedUserData.watchHistory.map((item: any) => ({
          ...item,
          lastWatchedAt: item.lastWatchedAt?.toDate() || new Date(),
        })) : [],
      } as User;
    } catch (error) {
      console.error(`Error updating user with ID ${id}:`, error);
      throw error;
    }
  };
  
  // Delete a user
  export const deleteUser = async (
    id: string,
    adminId: string,
    adminName: string
  ): Promise<void> => {
    try {
      // Get user data for logging and cleaning up storage
      const userSnap = await getDoc(doc(db, USERS_COLLECTION, id));
      
      if (!userSnap.exists()) {
        throw new Error(`User with ID ${id} not found`);
      }
      
      const userData = userSnap.data() as User;
      
      // Delete user from Firestore
      await deleteDoc(doc(db, USERS_COLLECTION, id));
      
      // Delete photo from storage if it exists and is not a placeholder
      if (userData.photoURL && userData.photoURL.includes("firebase")) {
        try {
          const photoRef = ref(storage, userData.photoURL);
          await deleteObject(photoRef);
        } catch (error) {
          console.warn("Could not delete photo:", error);
        }
      }
      
      // Log activity
      await logActivity({
        adminId,
        adminName,
        action: "DELETE",
        entityType: "USER",
        entityId: id,
        entityName: userData.displayName,
        timestamp: new Date(),
        details: { deletedUser: {
          ...userData,
          subscription: userData.subscription ? {
            ...userData.subscription,
            startDate: userData.subscription.startDate instanceof Date ?
              userData.subscription.startDate.toISOString() : userData.subscription.startDate,
            endDate: userData.subscription.endDate instanceof Date ?
              userData.subscription.endDate.toISOString() : userData.subscription.endDate,
          } : undefined,
        }}
      });
    } catch (error) {
      console.error(`Error deleting user with ID ${id}:`, error);
      throw error;
    }
  };
  
  // Get user statistics
  export const getUserStatistics = async (): Promise<{
    total: number;
    active: number;
    vip: number;
    newLast30Days: number;
  }> => {
    try {
      const usersSnapshot = await getDocs(collection(db, USERS_COLLECTION));
      
      const total = usersSnapshot.size;
      let active = 0;
      let vip = 0;
      let newLast30Days = 0;
      
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      usersSnapshot.forEach((doc) => {
        const data = doc.data();
        
        if (data.isActive) {
          active++;
        }
        
        if (data.isVIP) {
          vip++;
        }
        
        const createdAt = data.createdAt?.toDate();
        if (createdAt && createdAt >= thirtyDaysAgo) {
          newLast30Days++;
        }
      });
      
      return {
        total,
        active,
        vip,
        newLast30Days,
      };
    } catch (error) {
      console.error("Error getting user statistics:", error);
      throw error;
    }
  };
  
  // SUBSCRIPTION MANAGEMENT
  
  // Get a user's subscription
  export const getUserSubscription = async (userId: string): Promise<Subscription | null> => {
    try {
      const subscriptionsQuery = query(
        collection(db, SUBSCRIPTIONS_COLLECTION),
        where("userId", "==", userId),
        limit(1)
      );
      
      const subscriptionsSnapshot = await getDocs(subscriptionsQuery);
      
      if (subscriptionsSnapshot.empty) {
        return null;
      }
      
      const subscriptionDoc = subscriptionsSnapshot.docs[0];
      const data = subscriptionDoc.data();
      
      return {
        id: subscriptionDoc.id,
        ...data,
        startDate: data.startDate?.toDate() || new Date(),
        endDate: data.endDate?.toDate() || new Date(),
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate(),
        paymentHistory: data.paymentHistory ? data.paymentHistory.map((payment: any) => ({
          ...payment,
          date: payment.date?.toDate() || new Date(),
        })) : [],
      } as Subscription;
    } catch (error) {
      console.error(`Error getting subscription for user ${userId}:`, error);
      throw error;
    }
  };
  
  // Create or update a user's subscription
  export const updateUserSubscription = async (
    userId: string,
    subscriptionData: Omit<Subscription, "id" | "userId" | "createdAt" | "updatedAt">,
    adminId: string,
    adminName: string
  ): Promise<Subscription> => {
    try {
      // Check if user exists
      const userDoc = await getDoc(doc(db, USERS_COLLECTION, userId));
      
      if (!userDoc.exists()) {
        throw new Error(`User with ID ${userId} not found`);
      }
      
      const userData = userDoc.data();
      
      // Check if subscription already exists
      const subscriptionsQuery = query(
        collection(db, SUBSCRIPTIONS_COLLECTION),
        where("userId", "==", userId),
        limit(1)
      );
      
      const subscriptionsSnapshot = await getDocs(subscriptionsQuery);
      let subscriptionRef;
      let isNewSubscription = false;
      
      if (subscriptionsSnapshot.empty) {
        // Create new subscription
        subscriptionRef = await addDoc(collection(db, SUBSCRIPTIONS_COLLECTION), {
          userId,
          ...subscriptionData,
          startDate: subscriptionData.startDate instanceof Date ? 
            Timestamp.fromDate(subscriptionData.startDate) : subscriptionData.startDate,
          endDate: subscriptionData.endDate instanceof Date ? 
            Timestamp.fromDate(subscriptionData.endDate) : subscriptionData.endDate,
          paymentHistory: subscriptionData.paymentHistory ? subscriptionData.paymentHistory.map(payment => ({
            ...payment,
            date: payment.date instanceof Date ? 
              Timestamp.fromDate(payment.date) : payment.date,
          })) : [],
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        isNewSubscription = true;
      } else {
        // Update existing subscription
        subscriptionRef = doc(db, SUBSCRIPTIONS_COLLECTION, subscriptionsSnapshot.docs[0].id);
        
        await updateDoc(subscriptionRef, {
          ...subscriptionData,
          startDate: subscriptionData.startDate instanceof Date ? 
            Timestamp.fromDate(subscriptionData.startDate) : subscriptionData.startDate,
          endDate: subscriptionData.endDate instanceof Date ? 
            Timestamp.fromDate(subscriptionData.endDate) : subscriptionData.endDate,
          paymentHistory: subscriptionData.paymentHistory ? subscriptionData.paymentHistory.map(payment => ({
            ...payment,
            date: payment.date instanceof Date ? 
              Timestamp.fromDate(payment.date) : payment.date,
          })) : [],
          updatedAt: serverTimestamp(),
        });
      }
      
      // Update user's VIP status and subscription summary
      await updateDoc(doc(db, USERS_COLLECTION, userId), {
        isVIP: subscriptionData.plan === "vip" && subscriptionData.status === "active",
        subscription: {
          plan: subscriptionData.plan,
          status: subscriptionData.status,
          startDate: subscriptionData.startDate instanceof Date ? 
            Timestamp.fromDate(subscriptionData.startDate) : subscriptionData.startDate,
          endDate: subscriptionData.endDate instanceof Date ? 
            Timestamp.fromDate(subscriptionData.endDate) : subscriptionData.endDate,
          autoRenew: subscriptionData.autoRenew,
          paymentMethod: subscriptionData.paymentMethod,
        },
        updatedAt: serverTimestamp(),
      });
      
      // Log activity
      await logActivity({
        adminId,
        adminName,
        action: isNewSubscription ? "CREATE" : "UPDATE",
        entityType: "SUBSCRIPTION",
        entityId: subscriptionRef.id,
        entityName: `Subscription for ${userData.displayName}`,
        timestamp: new Date(),
        details: { 
          subscriptionData,
          userId,
          userName: userData.displayName
        }
      });
      
      // Get the updated subscription
      const updatedSubscriptionSnap = await getDoc(subscriptionRef);
      const updatedSubscriptionData = updatedSubscriptionSnap.data();
      
      return {
        id: subscriptionRef.id,
        ...updatedSubscriptionData,
        startDate: updatedSubscriptionData?.startDate?.toDate() || new Date(),
        endDate: updatedSubscriptionData?.endDate?.toDate() || new Date(),
        createdAt: updatedSubscriptionData?.createdAt?.toDate() || new Date(),
        updatedAt: updatedSubscriptionData?.updatedAt?.toDate(),
        paymentHistory: updatedSubscriptionData?.paymentHistory ? updatedSubscriptionData.paymentHistory.map((payment: any) => ({
          ...payment,
          date: payment.date?.toDate() || new Date(),
        })) : [],
      } as Subscription;
    } catch (error) {
      console.error(`Error updating subscription for user ${userId}:`, error);
      throw error;
    }
  };
  
  // Cancel a subscription
  export const cancelSubscription = async (
    userId: string,
    adminId: string,
    adminName: string
  ): Promise<void> => {
    try {
      // Get user data
      const userDoc = await getDoc(doc(db, USERS_COLLECTION, userId));
      
      if (!userDoc.exists()) {
        throw new Error(`User with ID ${userId} not found`);
      }
      
      const userData = userDoc.data();
      
      // Find subscription
      const subscriptionsQuery = query(
        collection(db, SUBSCRIPTIONS_COLLECTION),
        where("userId", "==", userId),
        limit(1)
      );
      
      const subscriptionsSnapshot = await getDocs(subscriptionsQuery);
      
      if (subscriptionsSnapshot.empty) {
        throw new Error(`No subscription found for user ${userId}`);
      }
      
      const subscriptionDoc = subscriptionsSnapshot.docs[0];
      const subscriptionData = subscriptionDoc.data();
      
      // Update subscription status
      await updateDoc(doc(db, SUBSCRIPTIONS_COLLECTION, subscriptionDoc.id), {
        status: "canceled",
        autoRenew: false,
        updatedAt: serverTimestamp(),
      });
      
      // Update user's subscription summary
      await updateDoc(doc(db, USERS_COLLECTION, userId), {
        subscription: {
          ...subscriptionData,
          status: "canceled",
          autoRenew: false,
        },
        updatedAt: serverTimestamp(),
      });
      
      // Log activity
      await logActivity({
        adminId,
        adminName,
        action: "UPDATE",
        entityType: "SUBSCRIPTION",
        entityId: subscriptionDoc.id,
        entityName: `Subscription for ${userData.displayName}`,
        timestamp: new Date(),
        details: { 
          action: "cancel_subscription",
          userId,
          userName: userData.displayName
        }
      });
    } catch (error) {
      console.error(`Error canceling subscription for user ${userId}:`, error);
      throw error;
    }
  };
  
  // Add a payment to subscription history
  export const addSubscriptionPayment = async (
    userId: string,
    payment: {
      id: string;
      amount: number;
      date: Date;
      status: "succeeded" | "failed" | "refunded";
      paymentMethod: string;
    },
    adminId: string,
    adminName: string
  ): Promise<void> => {
    try {
      // Get user data
      const userDoc = await getDoc(doc(db, USERS_COLLECTION, userId));
      
      if (!userDoc.exists()) {
        throw new Error(`User with ID ${userId} not found`);
      }
      
      const userData = userDoc.data();
      
      // Find subscription
      const subscriptionsQuery = query(
        collection(db, SUBSCRIPTIONS_COLLECTION),
        where("userId", "==", userId),
        limit(1)
      );
      
      const subscriptionsSnapshot = await getDocs(subscriptionsQuery);
      
      if (subscriptionsSnapshot.empty) {
        throw new Error(`No subscription found for user ${userId}`);
      }
      
      const subscriptionDoc = subscriptionsSnapshot.docs[0];
      const subscriptionData = subscriptionDoc.data();
      
      // Format payment for Firestore
      const paymentForFirestore = {
        ...payment,
        date: payment.date instanceof Date ? Timestamp.fromDate(payment.date) : payment.date,
      };
      
      // Update subscription with new payment
      const updatedPaymentHistory = [
        paymentForFirestore,
        ...(subscriptionData.paymentHistory || []),
      ];
      
      await updateDoc(doc(db, SUBSCRIPTIONS_COLLECTION, subscriptionDoc.id), {
        paymentHistory: updatedPaymentHistory,
        updatedAt: serverTimestamp(),
      });
      
      // Log activity
      await logActivity({
        adminId,
        adminName,
        action: "UPDATE",
        entityType: "SUBSCRIPTION",
        entityId: subscriptionDoc.id,
        entityName: `Subscription for ${userData.displayName}`,
        timestamp: new Date(),
        details: { 
          action: "add_payment",
          payment,
          userId,
          userName: userData.displayName
        }
      });
    } catch (error) {
      console.error(`Error adding payment to subscription for user ${userId}:`, error);
      throw error;
    }
  };