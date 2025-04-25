"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { AlertCircle, Eye, EyeOff } from "lucide-react"
import Link from "next/link"

export default function AdminLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email || !password) {
      setError("Veuillez remplir tous les champs")
      return
    }
    
    setIsLoading(true)
    setError(null)
    
    try {
      // Pour les besoins de la démo, nous utilisons des identifiants codés en dur
      // Dans une application réelle, vous utiliseriez Firebase Auth ou un autre service d'authentification
      if (email === "admin@streamflow.com" && password === "Admin123!") {
        // Simuler une authentification
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        // Stocker l'authentification dans le localStorage
        localStorage.setItem("adminAuthenticated", "true")
        localStorage.setItem("adminEmail", email)
        localStorage.setItem("adminRole", "super_admin")
        
        // Rediriger vers le tableau de bord admin
        router.push("/admin")
      } else {
        setError("Identifiants incorrects. Veuillez réessayer.")
      }
    } catch (err) {
      setError("Une erreur s'est produite. Veuillez réessayer.")
    } finally {
      setIsLoading(false)
    }
  }
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div className="w-full max-w-md p-8 bg-gray-900 border border-gray-800 rounded-lg shadow-lg">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-500 to-blue-500 text-transparent bg-clip-text">
            StreamFlow
          </h1>
          <h2 className="text-xl font-semibold mt-2 text-white">Administration</h2>
        </div>
        
        {error && (
          <div className="mb-6 p-3 rounded-lg bg-red-900/30 border border-red-800 flex items-start gap-2">
            <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-red-200 text-sm">{error}</p>
          </div>
        )}
        
        <form onSubmit={handleLogin}>
          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-gray-300">
                Email
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@streamflow.com"
                className="w-full bg-gray-800 border-gray-700 text-white"
                disabled={isLoading}
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-medium text-gray-300">
                Mot de passe
              </label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-gray-800 border-gray-700 text-white pr-10"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            
            <Button
              type="submit"
              className="w-full bg-primary hover:bg-primary/90"
              disabled={isLoading}
            >
              {isLoading ? "Connexion..." : "Se connecter"}
            </Button>
          </div>
        </form>
        
        <div className="mt-6 text-center">
          <Link 
            href="/" 
            className="text-sm text-gray-400 hover:text-white"
          >
            Retour au site
          </Link>
        </div>
        
        <div className="mt-8 pt-6 border-t border-gray-800 text-xs text-gray-500 text-center">
          <p>
            Utilisez admin@streamflow.com / Admin123! pour la démo
          </p>
        </div>
      </div>
    </div>
  )
}