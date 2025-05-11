"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Eye, EyeOff, Loader2 } from "lucide-react"
import { supabase } from "@/lib/supabaseClient"
import { useToast } from "@/components/ui/use-toast"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const { toast } = useToast()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      // Tentative de connexion à Supabase
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      if (signInError || !data?.user) {
        if (signInError?.message?.includes('Invalid login credentials')) {
          setError("Adresse email ou mot de passe incorrect");
        } else if (signInError?.status === 429) {
          setError("Trop de tentatives échouées. Veuillez réessayer plus tard");
        } else {
          setError(signInError?.message || "Erreur de connexion. Veuillez réessayer");
        }
        setIsLoading(false);
        return;
      }

      const user = data.user;

      // Vérifier si l'utilisateur est admin/super_admin via user_roles_flat
      const { data: rolesData, error: rolesError } = await supabase
        .from('user_roles_flat')
        .select('role')
        .eq('user_id', user.id)
        .in('role', ['admin', 'super_admin']);

      if (rolesError) {
        setError("Erreur serveur lors de la vérification du rôle administrateur");
        setIsLoading(false);
        return;
      }
      if (!rolesData || rolesData.length === 0) {
        setError("Vous n'avez pas les droits d'administration nécessaires");
        // Déconnexion
        await supabase.auth.signOut();
        setIsLoading(false);
        return;
      }

      // Sauvegarder l'état de connexion et les infos admin dans localStorage
      localStorage.setItem("adminId", user.id)
      localStorage.setItem("adminEmail", user.email || "")
      localStorage.setItem("adminRole", rolesData[0].role || "")
      localStorage.setItem("isAdminLoggedIn", "true")

      toast({
        title: "Connexion réussie",
        description: "Bienvenue dans l'interface d'administration",
        variant: "default",
      })

      router.push("/admin")
    } catch (error: any) {
      console.error("Erreur de connexion:", error)
      setError("Erreur de connexion. Veuillez réessayer");
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
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@streamflow.com"
              className="bg-gray-700 border-gray-600"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Mot de passe</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="bg-gray-700 border-gray-600 pr-10"
                required
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
                onClick={() => setShowPassword(!showPassword)}
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

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-400">
            Identifiants par défaut:
            <br />
            Email: admin@streamflow.com
            <br />
            Mot de passe: Admin123!
          </p>
        </div>
      </div>
    </div>
  )
}