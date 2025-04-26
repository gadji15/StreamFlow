"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Mail, ArrowLeft } from "lucide-react"
import { resetPassword } from "@/lib/firebase/auth"
import { getAdminByEmail } from "@/lib/firebase/firestore/admins"

export default function AdminForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess(false)
    setIsLoading(true)
    
    try {
      // Validate input
      if (!email) {
        throw new Error("Veuillez saisir votre adresse e-mail")
      }
      
      // Check if user is an admin
      const adminUser = await getAdminByEmail(email)
      if (!adminUser) {
        throw new Error("Cette adresse e-mail n'est pas associée à un compte administrateur")
      }
      
      // Send password reset email
      await resetPassword(email)
      
      // Show success message
      setSuccess(true)
    } catch (error: any) {
      console.error("Password reset error:", error)
      
      // User-friendly error messages
      if (error.message.includes("auth/user-not-found")) {
        setError("Aucun compte associé à cette adresse e-mail")
      } else if (error.message.includes("auth/invalid-email")) {
        setError("Adresse e-mail invalide")
      } else {
        setError(error.message)
      }
    } finally {
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
          <CardTitle className="text-xl">Réinitialisation du mot de passe</CardTitle>
          <CardDescription className="text-gray-400">
            Entrez votre adresse e-mail pour recevoir un lien de réinitialisation
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleResetPassword}>
          <CardContent className="space-y-4">
            {error && (
              <div className="p-3 rounded-md bg-red-900/50 border border-red-700 text-red-200 text-sm">
                {error}
              </div>
            )}
            
            {success && (
              <div className="p-3 rounded-md bg-green-900/50 border border-green-700 text-green-200 text-sm">
                Un e-mail de réinitialisation a été envoyé à {email}. Veuillez vérifier votre boîte de réception.
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
                  disabled={isLoading || success}
                />
              </div>
            </div>
            
            <div className="pt-2">
              <Button
                type="submit"
                className="w-full bg-purple-600 hover:bg-purple-700"
                disabled={isLoading || success}
              >
                {isLoading ? "Envoi en cours..." : "Envoyer le lien de réinitialisation"}
              </Button>
            </div>
          </CardContent>
        </form>
        <CardFooter className="justify-center pt-0">
          <Link href="/admin/auth/login" className="text-sm text-purple-400 hover:text-purple-300 flex items-center">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Retour à la page de connexion
          </Link>
        </CardFooter>
      </Card>
    </div>
  )
}