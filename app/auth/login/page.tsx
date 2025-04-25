"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Eye, EyeOff, Mail, Lock, AlertTriangle, ArrowRight } from "lucide-react";
import { signInUser } from "@/lib/auth";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    
    try {
      if (!email || !password) {
        throw new Error("Veuillez remplir tous les champs");
      }
      
      await signInUser(email, password);
      router.push("/");
    } catch (error: any) {
      console.error("Login error:", error);
      
      if (error.message.includes("wrong-password") || error.message.includes("user-not-found")) {
        setError("Adresse e-mail ou mot de passe incorrect");
      } else if (error.message.includes("too-many-requests")) {
        setError("Trop de tentatives de connexion. Veuillez réessayer plus tard");
      } else {
        setError(error.message);
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-surface flex flex-col justify-center p-4">
      <div className="w-full max-w-md mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <Image
            src="/logo.png"
            alt="StreamFlow"
            width={200}
            height={60}
            className="mx-auto mb-6"
          />
          <h1 className="text-2xl font-bold mb-2">Connectez-vous à votre compte</h1>
          <p className="text-gray-400">
            Accédez à des milliers de films et séries sur StreamFlow
          </p>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-surface border border-gray-800 rounded-xl p-6 shadow-xl"
        >
          {error && (
            <div className="mb-6 p-3 bg-red-900/30 border border-red-800 rounded-lg flex items-start">
              <AlertTriangle className="w-5 h-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-200">{error}</p>
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="email" className="block text-sm font-medium mb-2">
                Adresse e-mail
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-surface-light border border-gray-700 rounded-lg py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  placeholder="votre.email@exemple.com"
                  disabled={isLoading}
                  autoComplete="email"
                />
              </div>
            </div>
            
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <label htmlFor="password" className="text-sm font-medium">
                  Mot de passe
                </label>
                <Link href="/auth/forgot-password" className="text-xs text-primary hover:underline">
                  Mot de passe oublié ?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-surface-light border border-gray-700 rounded-lg py-3 pl-10 pr-10 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  placeholder="••••••••••"
                  disabled={isLoading}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            
            <button
              type="submit"
              className="w-full bg-primary hover:bg-primary-dark text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  Se connecter
                  <ArrowRight className="ml-2" size={18} />
                </>
              )}
            </button>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-400">
              Pas encore de compte ?{" "}
              <Link href="/auth/register" className="text-primary hover:underline font-medium">
                Créer un compte
              </Link>
            </p>
          </div>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-8 text-center"
        >
          <p className="text-xs text-gray-500">
            En vous connectant, vous acceptez nos {" "}
            <Link href="/terms" className="underline hover:text-gray-400">
              Conditions d'utilisation
            </Link>
            {" "} et notre {" "}
            <Link href="/privacy" className="underline hover:text-gray-400">
              Politique de confidentialité
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}