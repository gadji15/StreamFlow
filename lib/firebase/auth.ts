import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  updateProfile,
  updateEmail,
  reauthenticateWithCredential,
  EmailAuthProvider,
  User, 
  UserCredential
} from "firebase/auth";
import { doc, setDoc, getDoc, updateDoc, serverTimestamp, Timestamp } from "firebase/firestore";
import { auth, firestore } from "./config";
import { addActivityLog } from "./firestore/activity-logs";

// Types
interface UserData {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  isVIP: boolean;
  createdAt: Timestamp;
  lastLoginAt: Timestamp;
  updatedAt: Timestamp;
}

interface SignUpResult {
  success: boolean;
  user?: User;
  error?: string;
}

interface SignInResult {
  success: boolean;
  user?: User;
  userData?: UserData;
  error?: string;
}

// Fonction pour créer un compte utilisateur
export async function signUp(
  email: string, 
  password: string, 
  displayName?: string
): Promise<SignUpResult> {
  try {
    // Créer un utilisateur dans Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Ajouter le nom d'affichage si fourni
    if (displayName) {
      await updateProfile(user, { displayName });
    }
    
    // Créer un document utilisateur dans Firestore
    const userData: UserData = {
      uid: user.uid,
      email: user.email || email,
      displayName: displayName || null,
      photoURL: user.photoURL || null,
      isVIP: false,
      createdAt: Timestamp.now(),
      lastLoginAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    };
    
    await setDoc(doc(firestore, "users", user.uid), userData);
    
    // Ajouter une entrée de journal d'activité (facultatif)
    await addActivityLog({
      type: 'auth',
      action: 'sign_up',
      userId: user.uid,
      userEmail: email,
      details: { displayName }
    });
    
    return { success: true, user };
  } catch (error: any) {
    console.error("Error signing up:", error);
    
    // Gérer les erreurs courantes avec des messages conviviaux
    let errorMessage = "Une erreur est survenue lors de l'inscription.";
    
    switch (error.code) {
      case 'auth/email-already-in-use':
        errorMessage = "Cette adresse e-mail est déjà utilisée par un autre compte.";
        break;
      case 'auth/weak-password':
        errorMessage = "Le mot de passe est trop faible. Utilisez au moins 6 caractères.";
        break;
      case 'auth/invalid-email':
        errorMessage = "L'adresse e-mail n'est pas valide.";
        break;
      case 'auth/operation-not-allowed':
        errorMessage = "L'inscription par e-mail et mot de passe n'est pas activée.";
        break;
    }
    
    return { success: false, error: errorMessage };
  }
}

// Fonction pour se connecter
export async function signIn(email: string, password: string): Promise<SignInResult> {
  try {
    // Connexion avec Firebase Auth
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Récupérer les données utilisateur depuis Firestore
    const userDoc = await getDoc(doc(firestore, "users", user.uid));
    
    if (userDoc.exists()) {
      const userData = userDoc.data() as UserData;
      
      // Mettre à jour la dernière connexion
      await updateDoc(doc(firestore, "users", user.uid), {
        lastLoginAt: Timestamp.now()
      });
      
      // Ajouter une entrée de journal d'activité
      await addActivityLog({
        type: 'auth',
        action: 'sign_in',
        userId: user.uid,
        userEmail: email
      });
      
      return { success: true, user, userData };
    } else {
      // L'utilisateur existe dans Auth mais pas dans Firestore
      // Créer un document utilisateur dans Firestore
      const userData: UserData = {
        uid: user.uid,
        email: user.email || email,
        displayName: user.displayName || null,
        photoURL: user.photoURL || null,
        isVIP: false,
        createdAt: Timestamp.now(),
        lastLoginAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      };
      
      await setDoc(doc(firestore, "users", user.uid), userData);
      
      return { success: true, user, userData };
    }
  } catch (error: any) {
    console.error("Error signing in:", error);
    
    // Gérer les erreurs courantes avec des messages conviviaux
    let errorMessage = "Une erreur est survenue lors de la connexion.";
    
    switch (error.code) {
      case 'auth/user-not-found':
      case 'auth/wrong-password':
        errorMessage = "Email ou mot de passe incorrect.";
        break;
      case 'auth/too-many-requests':
        errorMessage = "Trop de tentatives de connexion. Veuillez réessayer plus tard.";
        break;
      case 'auth/user-disabled':
        errorMessage = "Ce compte a été désactivé.";
        break;
      case 'auth/invalid-email':
        errorMessage = "L'adresse e-mail n'est pas valide.";
        break;
    }
    
    return { success: false, error: errorMessage };
  }
}

// Fonction pour se déconnecter
export async function signOut(): Promise<{ success: boolean; error?: string }> {
  try {
    const user = auth.currentUser;
    if (user) {
      // Ajouter une entrée de journal d'activité avant la déconnexion
      await addActivityLog({
        type: 'auth',
        action: 'sign_out',
        userId: user.uid,
        userEmail: user.email
      });
    }
    
    await firebaseSignOut(auth);
    return { success: true };
  } catch (error: any) {
    console.error("Error signing out:", error);
    return { success: false, error: "Une erreur est survenue lors de la déconnexion." };
  }
}

// Fonction pour réinitialiser le mot de passe
export async function resetPassword(email: string): Promise<{ success: boolean; error?: string }> {
  try {
    await sendPasswordResetEmail(auth, email);
    return { success: true };
  } catch (error: any) {
    console.error("Error resetting password:", error);
    
    let errorMessage = "Une erreur est survenue lors de la réinitialisation du mot de passe.";
    
    switch (error.code) {
      case 'auth/user-not-found':
        errorMessage = "Aucun compte n'est associé à cette adresse e-mail.";
        break;
      case 'auth/invalid-email':
        errorMessage = "L'adresse e-mail n'est pas valide.";
        break;
      case 'auth/missing-android-pkg-name':
      case 'auth/missing-ios-bundle-id':
      case 'auth/missing-continue-uri':
      case 'auth/invalid-continue-uri':
      case 'auth/unauthorized-continue-uri':
        errorMessage = "Erreur de configuration. Veuillez contacter l'assistance.";
        break;
    }
    
    return { success: false, error: errorMessage };
  }
}

// Fonction pour mettre à jour le profil utilisateur
export async function updateUserProfile(
  displayName?: string, 
  photoURL?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const user = auth.currentUser;
    if (!user) {
      return { success: false, error: "Utilisateur non authentifié." };
    }
    
    const updateData: any = {};
    
    if (displayName !== undefined) updateData.displayName = displayName;
    if (photoURL !== undefined) updateData.photoURL = photoURL;
    
    if (Object.keys(updateData).length > 0) {
      await updateProfile(user, updateData);
      
      // Mettre à jour le document Firestore
      await updateDoc(doc(firestore, "users", user.uid), {
        ...updateData,
        updatedAt: Timestamp.now()
      });
      
      // Ajouter une entrée de journal d'activité
      await addActivityLog({
        type: 'user',
        action: 'update_profile',
        userId: user.uid,
        userEmail: user.email,
        details: updateData
      });
    }
    
    return { success: true };
  } catch (error: any) {
    console.error("Error updating profile:", error);
    return { success: false, error: "Une erreur est survenue lors de la mise à jour du profil." };
  }
}

// Fonction pour mettre à jour l'email
export async function updateUserEmail(
  newEmail: string, 
  password: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const user = auth.currentUser;
    if (!user || !user.email) {
      return { success: false, error: "Utilisateur non authentifié." };
    }
    
    // Réauthentifier l'utilisateur avant de changer l'email
    const credential = EmailAuthProvider.credential(user.email, password);
    await reauthenticateWithCredential(user, credential);
    
    // Mettre à jour l'email dans Firebase Auth
    await updateEmail(user, newEmail);
    
    // Mettre à jour le document Firestore
    await updateDoc(doc(firestore, "users", user.uid), {
      email: newEmail,
      updatedAt: Timestamp.now()
    });
    
    // Ajouter une entrée de journal d'activité
    await addActivityLog({
      type: 'user',
      action: 'update_email',
      userId: user.uid,
      userEmail: newEmail,
      details: { oldEmail: user.email, newEmail }
    });
    
    return { success: true };
  } catch (error: any) {
    console.error("Error updating email:", error);
    
    let errorMessage = "Une erreur est survenue lors de la mise à jour de l'email.";
    
    switch (error.code) {
      case 'auth/requires-recent-login':
        errorMessage = "Cette opération est sensible et nécessite une authentification récente. Veuillez vous reconnecter.";
        break;
      case 'auth/invalid-email':
        errorMessage = "L'adresse e-mail n'est pas valide.";
        break;
      case 'auth/email-already-in-use':
        errorMessage = "Cette adresse e-mail est déjà utilisée par un autre compte.";
        break;
      case 'auth/wrong-password':
        errorMessage = "Mot de passe incorrect.";
        break;
    }
    
    return { success: false, error: errorMessage };
  }
}

// Fonction pour vérifier si l'utilisateur est connecté
export async function getCurrentUser(): Promise<User | null> {
  return new Promise((resolve) => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      unsubscribe();
      resolve(user);
    });
  });
}

// Fonction pour obtenir les données utilisateur depuis Firestore
export async function getUserData(uid: string): Promise<UserData | null> {
  try {
    const userDoc = await getDoc(doc(firestore, "users", uid));
    
    if (userDoc.exists()) {
      return userDoc.data() as UserData;
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error getting user data:", error);
    return null;
  }
}

// Observer pour les changements d'état d'authentification
export function onAuthStateChanged(callback: (user: User | null) => void) {
  return auth.onAuthStateChanged(callback);
}