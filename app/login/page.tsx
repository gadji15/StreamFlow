"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { motion } from "framer-motion"

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [rememberMe, setRememberMe] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle login/register logic
    console.log(isLogin ? "Login" : "Register", { email, password, name })
  }

  const toggleForm = () => {
    setIsLogin(!isLogin)
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <Link href="/" className="inline-block">
            <span className="text-3xl font-bold bg-gradient-to-r from-purple-500 to-blue-500 text-transparent bg-clip-text font-poppins">
              StreamFlow
            </span>
          </Link>
          <h2 className="mt-6 text-3xl font-extrabold text-white">
            {isLogin ? "Connexion à votre compte" : "Créer un compte"}
          </h2>
          <p className="mt-2 text-sm text-gray-400">
            {isLogin ? "Ou " : "Déjà un compte? "}
            <button
              onClick={toggleForm}
              className="font-medium text-purple-500 hover:text-purple-400 transition-colors duration-300"
            >
              {isLogin ? "créer un compte" : "se connecter"}
            </button>
          </p>
        </div>

        <motion.div
          key={isLogin ? "login" : "register"}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="mt-8 bg-gray-900/50 backdrop-blur-sm py-8 px-6 shadow-xl rounded-xl border border-gray-800"
        >
          <form className="space-y-6" onSubmit={handleSubmit}>
            {!isLogin && (
              <div>
                <Label htmlFor="name" className="form-label">
                  Nom complet
                </Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  required={!isLogin}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="form-input mt-1"
                  placeholder="John Doe"
                />
              </div>
            )}

            <div>
              <Label htmlFor="email" className="form-label">
                Adresse email
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="form-input mt-1"
                placeholder="exemple@email.com"
              />
            </div>

            <div>
              <Label htmlFor="password" className="form-label">
                Mot de passe
              </Label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete={isLogin ? "current-password" : "new-password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="form-input mt-1"
                placeholder="••••••••"
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Checkbox
                  id="remember-me"
                  checked={rememberMe}
                  onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                  className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-700 rounded"
                />
                <Label htmlFor="remember-me" className="ml-2 block text-sm text-gray-300">
                  Se souvenir de moi
                </Label>
              </div>

              {isLogin && (
                <div className="text-sm">
                  <Link
                    href="/forgot-password"
                    className="font-medium text-purple-500 hover:text-purple-400 transition-colors duration-300"
                  >
                    Mot de passe oublié?
                  </Link>
                </div>
              )}
            </div>

            <div>
              <Button type="submit" className="w-full btn-primary py-2.5">
                {isLogin ? "Se connecter" : "S'inscrire"}
              </Button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-700"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-gray-900 text-gray-400">Ou continuer avec</span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-3 gap-3">
              <Button
                variant="outline"
                className="w-full border border-gray-700 bg-gray-800 hover:bg-gray-700 text-white py-2"
              >
                Google
              </Button>
              <Button
                variant="outline"
                className="w-full border border-gray-700 bg-gray-800 hover:bg-gray-700 text-white py-2"
              >
                Facebook
              </Button>
              <Button
                variant="outline"
                className="w-full border border-gray-700 bg-gray-800 hover:bg-gray-700 text-white py-2"
              >
                Apple
              </Button>
            </div>
          </div>
        </motion.div>

        <p className="mt-6 text-center text-sm text-gray-400">
          En vous connectant, vous acceptez nos{" "}
          <Link
            href="/cgu"
            className="font-medium text-purple-500 hover:text-purple-400 transition-colors duration-300"
          >
            Conditions Générales d'Utilisation
          </Link>{" "}
          et notre{" "}
          <Link
            href="/confidentialite"
            className="font-medium text-purple-500 hover:text-purple-400 transition-colors duration-300"
          >
            Politique de Confidentialité
          </Link>
          .
        </p>
      </div>
    </div>
  )
}
