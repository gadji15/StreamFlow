"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { AlertCircle, Eye, EyeOff } from "lucide-react"
import { motion } from "framer-motion"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validation simple
    if (!email || !password) {
      setError("Veuillez remplir tous les champs")
      return
    }
    
    setIsLoading(true)
    setError(null)
    
    try {
      // Simuler une authentification
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // En production, vous appelleriez votre API d'authentification ici
      
      // Rediriger vers la page d'accueil après connexion
      router.push("/")
    } catch (err) {
      setError("Identifiants incorrects. Veuillez réessayer.")
    } finally {
      setIsLoading(false)
    }
  }
  
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen flex items-center justify-center bg-black"
    >
      <div className="w-full max-w-md">
        <div className="bg-gray-900 shadow-xl border border-gray-800 rounded-xl p-8">
          <div className="mb-8 text-center">
            <Link href="/" className="inline-block">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-500 to-blue-500 text-transparent bg-clip-text">
                StreamFlow
              </h1>
            </Link>
            <h2 className="text-xl font-semibold mt-4 text-white">Connexion</h2>
            <p className="text-gray-400 mt-1">Accédez à votre compte</p>
          </div>
          
          {error && (
            <div className="mb-6 p-3 rounded-lg bg-red-900/30 border border-red-800 flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-red-200 text-sm">{error}</p>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-gray-300">
                Email
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="votre@email.com"
                className="w-full bg-gray-800 border-gray-700 text-white"
                disabled={isLoading}
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="block text-sm font-medium text-gray-300">
                  Mot de passe
                </label>
                <Link href="/reset-password" className="text-xs text-purple-400 hover:text-purple-300">
                  Mot de passe oublié?
                </Link>
              </div>
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
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="remember-me"
                  checked={rememberMe}
                  onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                  disabled={isLoading}
                />
                <label 
                  htmlFor="remember-me" 
                  className="text-sm text-gray-400 cursor-pointer"
                >
                  Se souvenir de moi
                </label>
              </div>
            </div>
            
            <Button
              type="submit"
              className="w-full bg-primary hover:bg-primary/90"
              disabled={isLoading}
            >
              {isLoading ? "Connexion en cours..." : "Se connecter"}
            </Button>
            
            <div className="text-center text-sm text-gray-400">
              Pas encore de compte ?{" "}
              <Link href="/register" className="text-purple-400 hover:text-purple-300">
                S&apos;inscrire
              </Link>
            </div>
          </form>
        </div>
      </div>
    </motion.div>
  )
}