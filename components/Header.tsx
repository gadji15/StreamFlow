import Link from 'next/link'
import { useCurrentUser } from '../hooks/useCurrentUser'
import LogoutButton from './LogoutButton'

export default function Header() {
  const user = useCurrentUser()

  return (
    <header style={{ padding: '1rem', borderBottom: '1px solid #eee', marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div>
        <Link href="/films" style={{ marginRight: 16 }}>Films</Link>
        <Link href="/series" style={{ marginRight: 16 }}>Séries</Link>
        <Link href="/profil">Profil</Link>
      </div>
      <div>
        {user ? (
          <>
            <span style={{ marginRight: 12 }}>Connecté : {user.email}</span>
            <LogoutButton />
          </>
        ) : (
          <Link href="/login">Connexion</Link>
        )}
      </div>
    </header>
  )
}