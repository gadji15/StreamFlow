'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser,
  sendPasswordResetEmail
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { auth, firestore } from '@/lib/firebase/config';

// Types
interface UserData {
  uid: string;
  email: string | null;
  displayName: string | null;
  isVIP: boolean;
  vipExpiry?: Date;
  role?: 'user' | 'admin' | 'super_admin';
  createdAt?: Date;
  lastLoginAt?: Date;
  favoriteMovies?: string[];
  favoriteSeries?: string[];
}

interface AuthContextType {
  user: FirebaseUser | null;
  userData: UserData | null;
  isLoggedIn: boolean;
  isVIP: boolean;
  isLoading: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  refreshUserData: () => Promise<void>;
}

// Créer le contexte
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Hook pour utiliser le contexte
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Provider Component
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // État d'authentification
  const isLoggedIn = !!user;
  
  // Vérifier si l'utilisateur est VIP et si son abonnement est toujours valide
  const isVIP = userData?.isVIP && 
    (userData.vipExpiry ? new Date(userData.vipExpiry) > new Date() : false);
  
  // Vérifier si l'utilisateur est admin
  const isAdmin = userData?.role === 'admin' || userData?.role === 'super_admin';
  
  // Écouter les changements d'état d'authentification
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      
      if (currentUser) {
        try {
          await refreshUserData(currentUser.uid);
        } catch (error) {
          console.error('Erreur lors de la récupération des données utilisateur:', error);
        }
      } else {
        setUserData(null);
      }
      
      setIsLoading(false);
    });
    
    return () => unsubscribe();
  }, []);
  
  // Récupérer/rafraîchir les données utilisateur
  const refreshUserData = async (uid?: string) => {
    try {
      const userUid = uid || user?.uid;
      
      if (!userUid) return;
      
      const userDocRef = doc(firestore, 'users', userUid);
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
        const data = userDoc.data();
        
        setUserData({
          uid: userUid,
          email: user?.email || null,
          displayName: data.displayName || null,
          isVIP: data.isVIP || false,
          vipExpiry: data.vipExpiry ? new Date(data.vipExpiry.toDate()) : undefined,
          role: data.role || 'user',
          createdAt: data.createdAt ? new Date(data.createdAt.toDate()) : undefined,
          lastLoginAt: data.lastLoginAt ? new Date(data.lastLoginAt.toDate()) : undefined,
          favoriteMovies: data.favoriteMovies || [],
          favoriteSeries: data.favoriteSeries || []
        });
        
        // Mettre à jour la date de dernière connexion
        await updateDoc(userDocRef, {
          lastLoginAt: serverTimestamp()
        });
      } else {
        console.log('User doc does not exist, creating...');
        
        // Créer un nouveau document utilisateur
        const newUserData = {
          uid: userUid,
          email: user?.email,
          displayName: user?.displayName || null,
          isVIP: false,
          role: 'user',
          createdAt: serverTimestamp(),
          lastLoginAt: serverTimestamp()
        };
        
        await setDoc(userDocRef, newUserData);
        
        setUserData({
          uid: userUid,
          email: user?.email || null,
          displayName: user?.displayName || null,
          isVIP: false,
          role: 'user'
        });
      }
    } catch (error) {
      console.error('Erreur lors du rafraîchissement des données utilisateur:', error);
    }
  };
  
  // Fonctions d'authentification
  const login = async (email: string, password: string) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      // Récupérer les données utilisateur
      await refreshUserData(userCredential.user.uid);
      
      // Stocker l'état de connexion dans le localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('isLoggedIn', 'true');
      }
      
      return userCredential;
    } catch (error: any) {
      console.error('Erreur de connexion:', error);
      
      let errorMessage = 'Erreur lors de la connexion.';
      
      if (error.code === 'auth/user-not-found') {
        errorMessage = 'Aucun utilisateur trouvé avec cet email.';
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = 'Mot de passe incorrect.';
      } else if (error.code === 'auth/invalid-credential') {
        errorMessage = 'Email ou mot de passe incorrect.';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Trop de tentatives. Veuillez réessayer plus tard.';
      }
      
      throw new Error(errorMessage);
    }
  };
  
  const register = async (email: string, password: string, name: string) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Créer le document utilisateur dans Firestore
      const userDocRef = doc(firestore, 'users', userCredential.user.uid);
      await setDoc(userDocRef, {
        uid: userCredential.user.uid,
        email,
        displayName: name,
        isVIP: false,
        role: 'user',
        createdAt: serverTimestamp(),
        lastLoginAt: serverTimestamp()
      });
      
      // Mettre à jour les données utilisateur locales
      setUserData({
        uid: userCredential.user.uid,
        email: email,
        displayName: name,
        isVIP: false,
        role: 'user'
      });
      
      // Stocker l'état de connexion dans le localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('isLoggedIn', 'true');
      }
      
      return userCredential;
    } catch (error: any) {
      console.error('Erreur d\'inscription:', error);
      
      let errorMessage = 'Erreur lors de l\'inscription.';
      
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'Cet email est déjà utilisé par un autre compte.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Adresse email invalide.';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Le mot de passe est trop faible.';
      }
      
      throw new Error(errorMessage);
    }
  };
  
  const logout = async () => {
    try {
      await firebaseSignOut(auth);
      
      // Effacer l'état de connexion dans le localStorage
      if (typeof window !== 'undefined') {
        localStorage.removeItem('isLoggedIn');
      }
    } catch (error) {
      console.error('Erreur de déconnexion:', error);
      throw error;
    }
  };
  
  const resetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error: any) {
      console.error('Erreur de réinitialisation de mot de passe:', error);
      
      let errorMessage = 'Erreur lors de la réinitialisation du mot de passe.';
      
      if (error.code === 'auth/user-not-found') {
        errorMessage = 'Aucun utilisateur trouvé avec cet email.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Adresse email invalide.';
      }
      
      throw new Error(errorMessage);
    }
  };
  
  // Valeur du contexte
  const value = {
    user,
    userData,
    isLoggedIn,
    isVIP,
    isLoading,
    isAdmin,
    login,
    register,
    logout,
    resetPassword,
    refreshUserData: () => refreshUserData()
  };

  return { Provider: AuthContext.Provider, value, children };
}

// Exporter le Provider comme composant séparé
export function AuthProviderComponent({ children }: { children: ReactNode }) {
  const auth = AuthProvider({ children });
  return (
    <auth.Provider value={auth.value}>
      {auth.children}
    </auth.Provider>
  );
}