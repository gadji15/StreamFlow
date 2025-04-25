"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { LockKeyhole, Mail, Eye, EyeOff } from "lucide-react"
import { signInWithEmail } from "@/lib/firebase/auth"
import { getAdminByEmail } from "@/lib/firebase/firestore/admins"
import { logActivity } from "@/lib/firebase/firestore/activity-logs"

export default function AdminLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  
  // Check if user is already authenticated
  useEffect(() => {
    const adminAuthenticated = localStorage.getItem("adminAuthenticated")
    if (adminAuthenticated === "true") {
      router.push("/admin")
    }
  }, [router])
  
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)
    
    try {
      // Validate inputs
      if (!email || !password) {
        throw new Error("Veuillez remplir tous les champs")
      }
      
      // Check if user is an admin
      const adminUser = await getAdminByEmail(email)
      if (!adminUser) {
        throw new Error("Vous n'avez pas les permissions d'administrateur")
      }
      
      if (!adminUser.isActive) {
        throw new Error("Votre compte administrateur est désactivé")
      }
      
      // Sign in with email and password
      await signInWithEmail(email, password)
      
      // Log activity
      await logActivity({
        adminId: adminUser.id,
        adminName: adminUser.name,
        action: "LOGIN",
        entityType: "ADMIN",
        entityId: adminUser.id,
        entityName: adminUser.name,
        timestamp: new Date(),
        details: { ip: "127.0.0.1", userAgent: navigator.userAgent }
      })
      
      // Redirect to admin dashboard
      router.push("/admin")
    } catch (error: any) {
      console.error("Login error:", error)
      
      // User-friendly error messages
      if (error.message.includes("auth/user-not-found") || error.message.includes("auth/wrong-password")) {
        setError("Adresse e-mail ou mot de passe incorrect")
      } else if (error.message.includes("auth/too-many-requests")) {
        setError("Trop de tentatives de connexion. Veuillez réessayer plus tard")
      } else {
        setError(error.message)
      }
      
      setIsLoading(false)
    }
  }
  
  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-gray-900 border-gray-800 text-white">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            <div className="text-3xl font-bold bg-gradient-to-r from-purple-500 to-blue-500 text-transparent bg-clip-text">
              StreamFlow
            </div>
            <div className="text-gray-400 text-sm">Interface d'administration</div>
          </div>
          <CardTitle className="text-xl">Connexion</CardTitle>
          <CardDescription className="text-gray-400">
            Accédez au panneau d'administration
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleLogin}>
          <CardContent className="space-y-4">
            {error && (
              <div className="p-3 rounded-md bg-red-900/50 border border-red-700 text-red-200 text-sm">
                {error}
              </div>
            )}
            
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-gray-300">
                Adresse e-mail
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@example.com"
                  className="pl-10 bg-gray-800 border-gray-700 text-white"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label htmlFor="password" className="text-sm font-medium text-gray-300">
                  Mot de passe
                </label>
                <Link href="/admin/auth/forgot-password" className="text-xs text-purple-400 hover:text-purple-300">
                  Mot de passe oublié?
                </Link>
              </div>
              <div className="relative">
                <LockKeyhole className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="pl-10 pr-10 bg-gray-800 border-gray-700 text-white"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            
            <div className="pt-2">
              <Button
                type="submit"
                className="w-full bg-purple-600 hover:bg-purple-700"
                disabled={isLoading}
              >
                {isLoading ? "Connexion en cours..." : "Se connecter"}
              </Button>
            </div>
          </CardContent>
        </form>
        <CardFooter className="justify-center pt-0">
          <div className="text-center text-sm text-gray-500">
            Zone réservée au personnel autorisé
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}