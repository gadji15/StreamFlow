"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { signIn } from "@/lib/firebase/auth";
import { useToast } from "@/components/ui/toaster";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({
        title: "Erreur",
        description: "Veuillez saisir votre email et votre mot de passe.",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      const result = await signIn(email, password);
      
      if (result.success && result.user) {
        // Stocker les infos dans localStorage si "Se souvenir de moi" est coché
        if (rememberMe) {
          localStorage.setItem("isLoggedIn", "true");
          localStorage.setItem("userId", result.user.uid);
          localStorage.setItem("userEmail", result.user.email || "");
          
          // Stocker isVIP pour le middleware (simulation)
          if (result.userData?.isVIP) {
            localStorage.setItem("isVIP", "true");
          }
        }
        
        // Définir les cookies pour le middleware
        document.cookie = `isLoggedIn=true; path=/; max-age=${rememberMe ? 30 * 24 * 60 * 60 : 60 * 60}`;
        
        if (result.userData?.isVIP) {
          document.cookie = `isVIP=true; path=/; max-age=${rememberMe ? 30 * 24 * 60 * 60 : 60 * 60}`;
        }
        
        // Afficher un toast de succès
        toast({
          title: "Connexion réussie",
          description: "Vous êtes maintenant connecté.",
        });
        
        // Rediriger vers la page de provenance ou vers l'accueil
        const from = searchParams.get("from") || "/";
        router.push(from);
      } else {
        toast({
          title: "Erreur de connexion",
          description: result.error || "Vérifiez vos identifiants et réessayez.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Login error:", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la connexion.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg max-w-md w-full">
      <h2 className="text-2xl font-bold mb-6">Connexion</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="votre@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading}
            required
          />
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label htmlFor="password">Mot de passe</Label>
            <Link 
              href="/mot-de-passe-oublie" 
              className="text-sm text-indigo-400 hover:text-indigo-300"
            >
              Mot de passe oublié ?
            </Link>
          </div>
          
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              required
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Checkbox
            id="remember"
            checked={rememberMe}
            onCheckedChange={(checked) => 
              setRememberMe(checked === true)
            }
            disabled={isLoading}
          />
          <Label 
            htmlFor="remember" 
            className="text-sm cursor-pointer"
          >
            Se souvenir de moi
          </Label>
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
          Pas encore de compte ?{" "}
          <Link href="/inscription" className="text-indigo-400 hover:text-indigo-300">
            Créer un compte
          </Link>
        </p>
      </div>
    </div>
  );
}
