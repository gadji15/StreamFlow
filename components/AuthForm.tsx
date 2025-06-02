import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { signInWithEmail, signUpWithEmail } from '../lib/supabaseAuth'
import { createProfile } from '../lib/supabaseProfiles'
import { useToast } from '@/hooks/use-toast'

export default function AuthForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    if (isSignUp) {
      const { data, error } = await signUpWithEmail(email, password)
      if (error) {
        toast({
          title: "Erreur d'inscription",
          description: error.message,
        } as any)
        setLoading(false)
        return
      }
      // Créer le profil utilisateur après inscription (optionnel)
      const userId = data?.user?.id
      if (userId) await createProfile({ id: userId, full_name: '', role: 'user' })
      toast({
        title: "Inscription réussie",
        description: "Bienvenue sur la plateforme !",
      } as any)
      router.push('/') // ou autre page d'accueil
    } else {
      const { error } = await signInWithEmail(email, password)
      if (error) {
        toast({
          title: "Erreur de connexion",
          description: error.message,
        } as any)
        setLoading(false)
        return
      }
      toast({
        title: "Connexion réussie",
        description: "Bienvenue sur StreamFlow !",
      } as any)
      router.push('/') // ou autre page d'accueil
    }
    setLoading(false)
  }

  return (
    <form onSubmit={handleAuth}>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        required
      />
      <input
        type="password"
        placeholder="Mot de passe"
        value={password}
        onChange={e => setPassword(e.target.value)}
        required
      />
      <button type="submit" disabled={loading}>
        {isSignUp ? 'Créer un compte' : 'Se connecter'}
      </button>
      <button type="button" onClick={() => setIsSignUp(!isSignUp)}>
        {isSignUp ? 'Déjà inscrit ? Se connecter' : 'Pas de compte ? Créer un compte'}
      </button>
    </form>
  )
}