import { createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "./firebase/config";

export type UserData = {
  id: string;
  email: string;
  displayName: string;
  photoURL?: string;
  isVIP: boolean;
  createdAt: Date;
  subscription?: {
    plan: string;
    status: string;
    expiresAt: Date;
  };
};

// Register a new user
export const registerUser = async (
  email: string,
  password: string,
  displayName: string
): Promise<UserData> => {
  try {
    // Create the user in Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Create the user document in Firestore
    const userData = {
      email: user.email,
      displayName,
      isVIP: false,
      createdAt: serverTimestamp(),
      photoURL: null,
      favorites: [],
      watchHistory: [],
    };
    
    await setDoc(doc(db, "users", user.uid), userData);
    
    return {
      id: user.uid,
      email: user.email || email,
      displayName,
      isVIP: false,
      createdAt: new Date(),
    };
  } catch (error: any) {
    console.error("Error in registerUser:", error);
    throw new Error(error.message);
  }
};

// Sign in a user
export const signInUser = async (email: string, password: string): Promise<UserData> => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Get the user data from Firestore
    const userDoc = await getDoc(doc(db, "users", user.uid));
    
    if (!userDoc.exists()) {
      throw new Error("User document does not exist");
    }
    
    const userData = userDoc.data();
    
    return {
      id: user.uid,
      email: user.email || email,
      displayName: userData.displayName,
      photoURL: userData.photoURL,
      isVIP: userData.isVIP || false,
      createdAt: userData.createdAt.toDate(),
      subscription: userData.subscription ? {
        plan: userData.subscription.plan,
        status: userData.subscription.status,
        expiresAt: userData.subscription.expiresAt.toDate(),
      } : undefined,
    };
  } catch (error: any) {
    console.error("Error in signInUser:", error);
    throw new Error(error.message);
  }
};

// Reset password
export const resetPassword = async (email: string): Promise<void> => {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error: any) {
    console.error("Error in resetPassword:", error);
    throw new Error(error.message);
  }
};

// Get current user data
export const getCurrentUserData = async (): Promise<UserData | null> => {
  try {
    const user = auth.currentUser;
    
    if (!user) {
      return null;
    }
    
    const userDoc = await getDoc(doc(db, "users", user.uid));
    
    if (!userDoc.exists()) {
      return null;
    }
    
    const userData = userDoc.data();
    
    return {
      id: user.uid,
      email: user.email || "",
      displayName: userData.displayName,
      photoURL: userData.photoURL,
      isVIP: userData.isVIP || false,
      createdAt: userData.createdAt.toDate(),
      subscription: userData.subscription ? {
        plan: userData.subscription.plan,
        status: userData.subscription.status,
        expiresAt: userData.subscription.expiresAt.toDate(),
      } : undefined,
    };
  } catch (error: any) {
    console.error("Error in getCurrentUserData:", error);
    return null;
  }
};

// Upgrade to VIP
export const upgradeToVIP = async (
  userId: string,
  plan: string,
  paymentInfo: any
): Promise<void> => {
  try {
    // Create a subscription expiration date
    const now = new Date();
    const expiresAt = new Date(now.setMonth(now.getMonth() + 1)); // One month from now
    
    // Update the user document
    await setDoc(doc(db, "users", userId), {
      isVIP: true,
      subscription: {
        plan,
        status: "active",
        startedAt: serverTimestamp(),
        expiresAt,
        paymentInfo,
      },
    }, { merge: true });
    
    // Record the payment
    await setDoc(doc(db, "payments", `${userId}_${Date.now()}`), {
      userId,
      amount: plan === "monthly" ? 9.99 : 99.99,
      currency: "EUR",
      planType: plan,
      status: "completed",
      date: serverTimestamp(),
      paymentMethod: paymentInfo.method,
      paymentId: paymentInfo.id,
    });
    
  } catch (error: any) {
    console.error("Error in upgradeToVIP:", error);
    throw new Error(error.message);
  }
};

// Check if content is accessible by user
export const canAccessContent = async (
  contentId: string,
  contentType: "movie" | "series"
): Promise<boolean> => {
  try {
    const user = auth.currentUser;
    
    if (!user) {
      return false; // Not logged in
    }
    
    // Get content details
    const contentDoc = await getDoc(doc(db, contentType === "movie" ? "movies" : "series", contentId));
    
    if (!contentDoc.exists()) {
      return false; // Content doesn't exist
    }
    
    const contentData = contentDoc.data();
    
    // If content is not VIP-only, anyone can access
    if (!contentData.vipOnly) {
      return true;
    }
    
    // Check if user is VIP
    const userDoc = await getDoc(doc(db, "users", user.uid));
    
    if (!userDoc.exists()) {
      return false;
    }
    
    const userData = userDoc.data();
    
    return userData.isVIP === true;
  } catch (error: any) {
    console.error("Error in canAccessContent:", error);
    return false;
  }
};