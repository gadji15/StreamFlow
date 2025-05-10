import { useState } from 'react'
import { signInWithEmail, signUpWithEmail } from '../lib/supabaseAuth'

export default function AuthForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const fn = isSignUp ? signUpWithEmail : signInWithEmail
    const { error } = await fn(email, password)
    setLoading(false)
    if (error) setError(error.message)
    else window.location.reload()
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
      {error && <p style={{color: 'red'}}>{error}</p>}
    </form>
  )
}