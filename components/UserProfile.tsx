import { useEffect, useState } from 'react'
import { useCurrentUser } from '../hooks/useCurrentUser'
import { getProfile, updateProfile } from '../lib/supabaseProfiles'

export default function UserProfile() {
  const user = useCurrentUser()
  const [profile, setProfile] = useState<any>(null)
  const [fullName, setFullName] = useState('')
  const [role, setRole] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (user?.id) {
      getProfile(user.id).then(({ data }) => {
        setProfile(data)
        setFullName(data?.full_name ?? '')
        setRole(data?.role ?? '')
      })
    }
  }, [user])

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user?.id) return
    setLoading(true)
    setMessage('')
    const { error } = await updateProfile(user.id, { full_name: fullName })
    setLoading(false)
    setMessage(error ? error.message : 'Profil mis à jour !')
  }

  if (!user) return <p>Connectez-vous pour voir votre profil.</p>
  if (!profile) return <p>Chargement du profil...</p>

  return (
    <div style={{ border: '1px solid #eee', borderRadius: 8, padding: 16, margin: '1rem 0' }}>
      <h3>Mon profil</h3>
      <form onSubmit={handleUpdate}>
        <label>
          Nom complet :
          <input value={fullName} onChange={e => setFullName(e.target.value)} />
        </label>
        <br />
        <label>
          Rôle : <b>{role}</b>
        </label>
        <br />
        <button type="submit" disabled={loading}>
          Enregistrer
        </button>
      </form>
      {message && <p>{message}</p>}
    </div>
  )
}