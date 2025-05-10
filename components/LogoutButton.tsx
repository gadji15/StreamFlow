import { signOut } from '../lib/supabaseAuth'
import { useRouter } from 'next/router'
import { useState } from 'react'

export default function LogoutButton() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleLogout = async () => {
    setLoading(true)
    await signOut()
    setLoading(false)
    router.push('/login')
  }

  return (
    <button onClick={handleLogout} disabled={loading}>
      {loading ? 'Déconnexion...' : 'Se déconnecter'}
    </button>
  )
}