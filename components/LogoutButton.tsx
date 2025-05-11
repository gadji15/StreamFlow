import { signOut } from '../lib/supabaseAuth'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useToast } from '@/hooks/use-toast'

export default function LogoutButton() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const handleLogout = async () => {
    setLoading(true)
    await signOut()
    setLoading(false)
    toast({
      title: "Déconnexion réussie",
      description: "À bientôt !",
      status: "info",
      duration: 4000,
    })
    router.push('/login')
  }

  return (
    <button onClick={handleLogout} disabled={loading}>
      {loading ? 'Déconnexion...' : 'Se déconnecter'}
    </button>
  )
}