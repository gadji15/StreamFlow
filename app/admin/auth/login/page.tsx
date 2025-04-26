"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Eye, EyeOff, Loader2, Mail, Lock } from "lucide-react"
import { signInWithEmailAndPassword, onAuthStateChanged } from "firebase/auth"
import { doc, getDoc, setDoc, Timestamp } from "firebase/firestore"
import { auth, firestore } from "@/lib/firebase/config"
import { useToast } from "@/components/ui/use-toast"
import { verifyAdmin } from "@/lib/firebase/firestore/admins" // Assurez-vous que cette fonction existe
import { updateAdminLastLogin } from "@/lib/firebase/auth" // Assurez-vous que cette fonction existe
import Link from "next/link"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const { toast } = useToast()

  // Vérifier si l'utilisateur est déjà connecté via Firebase
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Si l'utilisateur est connecté via Firebase, vérifier ses droits admin
        const adminStatus = await verifyAdmin(user.uid);
        if (adminStatus.isAdmin) {
          router.push("/admin/dashboard");
        } else {
          // Déconnecter si ce n'est pas un admin
          await auth.signOut();
        }
      }
    });
    
    // Nettoyer l'écouteur lors du démontage
    return () => unsubscribe();
  }, [router]);
  
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      // Tentative de connexion à Firebase
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      const user = userCredential.user

      // Vérifier si l'utilisateur est un administrateur
      const adminStatus = await verifyAdmin(user.uid);
      
      if (adminStatus.isAdmin && adminStatus.adminData) {
        // Mise à jour de la dernière connexion
        await updateAdminLastLogin(user.uid); // Utilisation de la fonction importée

        // Sauvegarder les infos admin dans localStorage (optionnel mais pratique)
        localStorage.setItem("adminId", user.uid)
        localStorage.setItem("adminEmail", user.email || "")
        localStorage.setItem("adminName", adminStatus.adminData.name || "")
        localStorage.setItem("adminRole", adminStatus.adminData.role || "")
        localStorage.setItem("isAdminLoggedIn", "true") // Pour le AuthGuard simple

        // Afficher une notification de succès
        toast({
          title: "Connexion réussie",
          description: "Bienvenue dans l'interface d'administration",
          variant: "default",
        })

        // Attendre un court délai avant de rediriger
        setTimeout(() => {
          // Rediriger vers le tableau de bord admin
          router.push("/admin/dashboard"); // Utilisation de router.push
        }, 500); // Délai plus court
      } else {
        // L'utilisateur n'est pas un administrateur ou les données sont manquantes
        await auth.signOut(); // Déconnecter l'utilisateur
        setError(adminStatus.message || "Vous n'avez pas les droits d'administration nécessaires");
        // Nettoyer le localStorage
        localStorage.removeItem("adminId");
        localStorage.removeItem("adminEmail");
        localStorage.removeItem("adminName");
        localStorage.removeItem("adminRole");
        localStorage.removeItem("isAdminLoggedIn");
      }
    } catch (error: any) {
      console.error("Erreur de connexion:", error)
      
      // Gérer les différents types d'erreurs Firebase
      if (error.code === 'auth/invalid-email') {
        setError("Adresse email invalide")
      } else if (error.code === 'auth/user-disabled') {
        setError("Ce compte a été désactivé")
      } else if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') {
         // Remplacer par 'auth/invalid-credential' si vous utilisez Firebase v9+
        setError("Email ou mot de passe incorrect")
      } else if (error.code === 'auth/wrong-password') {
         // Peut être redondant avec invalid-credential mais laissé pour compatibilité
        setError("Mot de passe incorrect")
      } else if (error.code === 'auth/too-many-requests') {
        setError("Trop de tentatives échouées. Veuillez réessayer plus tard")
      } else {
        setError("Erreur de connexion. Veuillez réessayer")
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900">
      <div className="w-full max-w-md p-8 bg-gray-800 rounded-lg shadow-lg border border-gray-700">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-500 to-blue-500 text-transparent bg-clip-text">
            StreamFlow
          </h1>
          <p className="text-gray-400 mt-2">Interface d'administration</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500 rounded-md p-4 mb-6">
            <p className="text-red-500 text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@streamflow.com"
                className="pl-10 bg-gray-700 border-gray-600"
                required
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="space-y-2">
             <div className="flex items-center justify-between">
               <Label htmlFor="password">Mot de passe</Label>
               <Link href="/admin/auth/forgot-password" className="text-xs text-purple-400 hover:text-purple-300">
                  Mot de passe oublié?
                </Link>
             </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="pl-10 pr-10 bg-gray-700 border-gray-600"
                required
                disabled={isLoading}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1} // Pour ne pas être focusable avec Tab
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Connexion en cours...
              </>
            ) : (
              "Se connecter"
            )}
          </Button>
        </form>
      </div>
    </div>
  )
}