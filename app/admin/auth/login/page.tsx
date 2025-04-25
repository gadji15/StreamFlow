"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Eye, EyeOff, LogIn, Shield, Lock } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Link from "next/link"

export default function AdminLogin() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [otpRequired, setOtpRequired] = useState(false)
  const [otp, setOtp] = useState("")

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      // Simuler une vérification d'authentification
      if (email !== "admin@streamflow.com" || password !== "admin123") {
        throw new Error("Email ou mot de passe incorrect")
      }

      // Simuler un délai pour l'authentification
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Simuler une redirection vers l'OTP si l'authentification réussit
      setOtpRequired(true)
    } catch (error) {
      console.error("Error during login:", error)
      setError((error as Error).message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleOtpVerification = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      // Simuler une vérification OTP
      if (otp !== "123456") {
        throw new Error("Code d'authentification incorrect")
      }

      // Simuler un délai pour la vérification
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Stocker l'état d'authentification dans localStorage
      localStorage.setItem("adminAuthenticated", "true")
      localStorage.setItem("adminUser", JSON.stringify({ 
        email, 
        name: "Admin", 
        role: "super_admin",
        lastLogin: new Date().toISOString()
      }))

      // Rediriger vers le tableau de bord admin
      router.push("/admin")
    } catch (error) {
      console.error("Error during OTP verification:", error)
      setError((error as Error).message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 p-4">
      <div className="w-full max-w-md bg-gray-900 rounded-xl shadow-xl border border-gray-800 overflow-hidden">
        {!otpRequired ? (
          <>
            <div className="p-8">
              <div className="text-center mb-8">
                <Link href="/" className="inline-block">
                  <span className="text-2xl font-bold bg-gradient-to-r from-purple-500 to-blue-500 text-transparent bg-clip-text">
                    StreamFlow
                  </span>
                  <span className="text-white text-sm ml-1">Admin</span>
                </Link>
                <h1 className="text-2xl font-semibold text-white mt-6">Connexion administrateur</h1>
                <p className="text-gray-400 mt-2">Accédez au panneau d'administration</p>
              </div>

              {error && (
                <Alert className="mb-6 bg-red-900/20 border-red-800 text-red-400">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleLogin} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-gray-300">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-gray-800 border-gray-700 text-white"
                    placeholder="votre-email@exemple.com"
                    autoComplete="email"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="password" className="text-gray-300">
                      Mot de passe
                    </Label>
                    <Link href="/admin/auth/reset-password" className="text-sm text-purple-400 hover:text-purple-300">
                      Mot de passe oublié?
                    </Link>
                  </div>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="bg-gray-800 border-gray-700 text-white pr-10"
                      placeholder="••••••••"
                      autoComplete="current-password"
                      required
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-300"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <span className="animate-spin mr-2">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="h-4 w-4"
                        >
                          <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                        </svg>
                      </span>
                      Connexion en cours...
                    </>
                  ) : (
                    <>
                      <LogIn className="h-4 w-4 mr-2" />
                      Se connecter
                    </>
                  )}
                </Button>
              </form>
            </div>

            <div className="p-6 bg-gray-950/50 border-t border-gray-800 text-center">
              <div className="flex items-center justify-center text-gray-400 text-sm">
                <Shield className="h-4 w-4 mr-2 text-purple-500" />
                Accès sécurisé avec authentification à deux facteurs
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="p-8">
              <div className="text-center mb-8">
                <Link href="/" className="inline-block">
                  <span className="text-2xl font-bold bg-gradient-to-r from-purple-500 to-blue-500 text-transparent bg-clip-text">
                    StreamFlow
                  </span>
                  <span className="text-white text-sm ml-1">Admin</span>
                </Link>
                <h1 className="text-2xl font-semibold text-white mt-6">Vérification en deux étapes</h1>
                <p className="text-gray-400 mt-2">
                  Entrez le code à 6 chiffres de votre application d'authentification
                </p>
              </div>

              {error && (
                <Alert className="mb-6 bg-red-900/20 border-red-800 text-red-400">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleOtpVerification} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="otp" className="text-gray-300">
                    Code de vérification
                  </Label>
                  <Input
                    id="otp"
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="bg-gray-800 border-gray-700 text-white text-center text-xl tracking-widest"
                    placeholder="123456"
                    maxLength={6}
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    required
                  />
                  <p className="text-gray-500 text-xs mt-2">
                    Note: Pour la démo, utilisez le code 123456
                  </p>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <span className="animate-spin mr-2">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="h-4 w-4"
                        >
                          <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                        </svg>
                      </span>
                      Vérification...
                    </>
                  ) : (
                    <>
                      <Lock className="h-4 w-4 mr-2" />
                      Vérifier
                    </>
                  )}
                </Button>

                <div className="text-center">
                  <button
                    type="button"
                    className="text-purple-400 hover:text-purple-300 text-sm"
                    onClick={() => setOtpRequired(false)}
                  >
                    Retour à la connexion
                  </button>
                </div>
              </form>
            </div>

            <div className="p-6 bg-gray-950/50 border-t border-gray-800 text-center">
              <div className="flex items-center justify-center text-gray-400 text-sm">
                <Shield className="h-4 w-4 mr-2 text-purple-500" />
                Protection renforcée avec authentification à deux facteurs
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}