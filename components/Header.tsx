import Link from 'next/link'
import { useCurrentUser } from '../hooks/useCurrentUser'
import LogoutButton from './LogoutButton'
import { useEffect, useState } from 'react'
import { getProfile } from '../lib/supabaseProfiles'

/**
 * Header d’application :
 * - Navigation principale (films, séries, profil)
 * - Affiche l’utilisateur connecté (email, avatar)
 * - Affiche un lien admin si l’utilisateur a le rôle "admin"
 * - Bouton de déconnexion
 */
export default function Header() {
  const user = useCurrentUser()
  const [profile, setProfile] = useState<any>(null)

  useEffect(() => {
    if (user?.id) {
      getProfile(user.id).then(({ data }) => setProfile(data))
    }
  }, [user])

  return (
    <header
      style={{
        padding: '1rem',
        borderBottom: '1px solid #eee',
        marginBottom: 24,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap'
      }}
    >
      <nav style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
        <Link href="/films">Films</Link>
        <Link href="/series">Séries</Link>
        <Link href="/profil">Profil</Link>
        {/* Affiche le lien admin si le rôle est "admin" */}
        {profile?.role === 'admin' && (
          <Link href="/admin" style={{ color: '#C43' }}>Admin</Link>
        )}
      </nav>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {user ? (
          <>
            {/* Affiche l’avatar si disponible */}
            {profile?.avatar_url && (
              <img
                src={profile.avatar_url}
                alt="avatar"
                style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover', marginRight: 8 }}
              />
            )}
            <span style={{ marginRight: 6, fontSize: 14, color: '#555' }}>
              Connecté : <b>{user.email}</b>
            </span>
            <LogoutButton />
          </>
        ) : (
          <Link href="/login">Connexion</Link>
        )}
      </div>
    </header>
  )
}