"use client";

import { 
  createContext, 
  useContext, 
  useState, 
  useEffect, 
  ReactNode 
} from "react";
import { User } from "firebase/auth";
import { 
  onAuthStateChanged, 
  signOut as firebaseSignOut,
  getCurrentUser,
  getUserData
} from "@/lib/firebase/auth";

interface AuthContextType {
  user: User | null;
  userData: any | null;
  isLoading: boolean;
  isAdmin: boolean;
  isVIP: boolean;
  signOut: () => Promise<void>;
  refreshUserData: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userData: null,
  isLoading: true,
  isAdmin: false,
  isVIP: false,
  signOut: async () => {},
  refreshUserData: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isVIP, setIsVIP] = useState(false);
  
  // Fonction pour rafraîchir les données utilisateur depuis Firestore
  const refreshUserData = async () => {
    if (user) {
      try {
        const data = await getUserData(user.uid);
        setUserData(data);
        
        // Mise à jour des statuts spéciaux
        if (data) {
          // L'utilisateur est VIP si la propriété isVIP est true dans ses données
          setIsVIP(data.isVIP || false);
          
          // Vous pouvez ajouter d'autres logiques pour déterminer les rôles (isAdmin, etc.)
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    }
  };
  
  // Écouter les changements d'état d'authentification
  useEffect(() => {
    setIsLoading(true);
    
    const unsubscribe = onAuthStateChanged((authUser) => {
      setUser(authUser);
      
      if (authUser) {
        // Si l'utilisateur est authentifié, récupérer ses données
        refreshUserData();
        
        // Vérifier si l'utilisateur est administrateur (à adapter selon votre logique)
        // Par exemple, vérifier une collection "admins" dans Firestore
        fetch('/api/admin/verify', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ uid: authUser.uid }),
        })
          .then(res => res.json())
          .then(data => {
            setIsAdmin(data.isAdmin || false);
          })
          .catch(err => {
            console.error("Error verifying admin status:", err);
            setIsAdmin(false);
          })
          .finally(() => {
            setIsLoading(false);
          });
      } else {
        // Réinitialiser les données si l'utilisateur n'est pas authentifié
        setUserData(null);
        setIsAdmin(false);
        setIsVIP(false);
        setIsLoading(false);
      }
    });
    
    // Nettoyer l'écouteur au démontage
    return () => unsubscribe();
  }, []);
  
  // Fonction de déconnexion
  const signOut = async () => {
    try {
      await firebaseSignOut();
      
      // Supprimer les infos de l'utilisateur du localStorage
      localStorage.removeItem("isLoggedIn");
      localStorage.removeItem("userId");
      localStorage.removeItem("userEmail");
      localStorage.removeItem("isVIP");
      
      // Supprimer les cookies
      document.cookie = "isLoggedIn=; path=/; max-age=0";
      document.cookie = "isVIP=; path=/; max-age=0";
      document.cookie = "isAdmin=; path=/; max-age=0";
      
      // Réinitialiser l'état
      setUser(null);
      setUserData(null);
      setIsAdmin(false);
      setIsVIP(false);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };
  
  return (
    <AuthContext.Provider
      value={{
        user,
        userData,
        isLoading,
        isAdmin,
        isVIP,
        signOut,
        refreshUserData,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
