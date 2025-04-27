import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, firestore } from "./firebase/config";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Mot de passe", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email et mot de passe requis");
        }
        
        try {
          // Authentification Firebase
          const userCredential = await signInWithEmailAndPassword(
            auth,
            credentials.email,
            credentials.password
          );
          const user = userCredential.user;
          
          // Récupérer les données utilisateur depuis Firestore
          const userDoc = await getDoc(doc(firestore, "users", user.uid));
          const userData = userDoc.data();
          
          if (!userData) {
            throw new Error("Données utilisateur non trouvées");
          }
          
          return {
            id: user.uid,
            email: user.email,
            name: userData.displayName,
            image: userData.photoURL,
            role: userData.role || "user",
            isVIP: userData.isVIP || false,
            vipExpiry: userData.vipExpiry ? new Date(userData.vipExpiry).toISOString() : null
          };
        } catch (error: any) {
          console.error("Erreur d'authentification:", error);
          throw new Error(error.message || "Échec de l'authentification");
        }
      }
    }),
    // Décommentez cette partie si vous utilisez l'authentification Google
    /*
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code"
        }
      }
    })
    */
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 jours
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.isVIP = user.isVIP;
        token.vipExpiry = user.vipExpiry;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.isVIP = token.isVIP as boolean;
        session.user.vipExpiry = token.vipExpiry as string | null;
      }
      return session;
    }
  },
  pages: {
    signIn: "/login",
    error: "/auth/error",
    verifyRequest: "/auth/verify-request",
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
};