"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Shield, Mail } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function ResetPassword() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      // Simuler un délai de traitement
      await new Promise((resolve) => setTimeout(resolve, 1500))
      
      // Simuler l'envoi du lien de réinitialisation
      setIsSubmitted(true)
    } catch (error) {
      console.error("Error during password reset:", error)
      setError("Une erreur est survenue. Veuillez réessayer.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 p-4">
      <div className="w-full max-w-md bg-gray-900 rounded-xl shadow-xl border border-gray-800 overflow-hidden">
        <div className="p-8">
          <div className="text-center mb-8">
            <Link href="/" className="inline-block">
              <span className="text-2xl font-bold bg-gradient-to-r from-purple-500 to-blue-500 text-transparent bg-clip-text">
                StreamFlow
              </span>
              <span className="text-white text-sm ml-1">Admin</span>
            </Link>
            <h1 className="text-2xl font-semibold text-white mt-6">Réinitialisation du mot de passe</h1>
            <p className="text-gray-400 mt-2">
              {isSubmitted
                ? "Un lien de réinitialisation a été envoyé à votre adresse email"
                : "Entrez votre adresse email pour réinitialiser votre mot de passe"}
            </p>
          </div>

          {error && (
            <Alert className="mb-6 bg-red-900/20 border-red-800 text-red-400">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {isSubmitted ? (
            <div className="text-center space-y-6">
              <div className="flex justify-center">
                <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center">
                  <Mail className="h-8 w-8 text-purple-400" />
                </div>
              </div>
              
              <div className="space-y-2">
                <p className="text-white">Vérifiez votre boîte de réception</p>
                <p className="text-gray-400 text-sm">
                  Nous avons envoyé un lien de réinitialisation à{" "}
                  <span className="text-purple-400">{email}</span>
                </p>
              </div>

              <Button
                onClick={() => router.push("/admin/auth/login")}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour à la connexion
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-300">
                  Adresse email
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
                    Envoi en cours...
                  </>
                ) : (
                  "Envoyer le lien de réinitialisation"
                )}
              </Button>

              <div className="text-center">
                <Link
                  href="/admin/auth/login"
                  className="text-purple-400 hover:text-purple-300 text-sm flex items-center justify-center"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Retour à la connexion
                </Link>
              </div>
            </form>
          )}
        </div>

        <div className="p-6 bg-gray-950/50 border-t border-gray-800 text-center">
          <div className="flex items-center justify-center text-gray-400 text-sm">
            <Shield className="h-4 w-4 mr-2 text-purple-500" />
            Votre sécurité est notre priorité
          </div>
        </div>
      </div>
    </div>
  )
}