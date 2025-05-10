'use client';

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useCurrentUser } from '../hooks/useCurrentUser'
import LogoutButton from './LogoutButton'
import { useEffect, useState } from 'react'
import { getProfile } from '../lib/supabaseProfiles'
import { Film, Tv, User, Sparkles, Shield, Home } from 'lucide-react'

export default function Header() {
  const pathname = usePathname()
  const user = useCurrentUser()
  const [profile, setProfile] = useState<any>(null)

  useEffect(() => {
    if (user?.id) {
      getProfile(user.id).then(({ data }) => setProfile(data))
    }
  }, [user])

  // Liste des liens de la navbar
  const links = [
    { href: '/', label: 'Accueil', icon: <Home className="w-4 h-4 mr-1" /> },
    { href: '/films', label: 'Films', icon: <Film className="w-4 h-4 mr-1" /> },
    { href: '/series', label: 'Séries', icon: <Tv className="w-4 h-4 mr-1" /> },
    { href: '/profil', label: 'Profil', icon: <User className="w-4 h-4 mr-1" /> },
  ];

  return (
    <header className="sticky top-0 z-40 bg-gradient-to-b from-black/80 to-black/50 border-b border-gray-800 shadow-lg">
      <div className="max-w-7xl mx-auto flex justify-between items-center px-4 py-3">
        {/* Logo */}
        <Link href="/" className="flex items-center font-bold text-xl text-amber-400 tracking-tight hover:scale-105 transition-transform">
          StreamFlow
        </Link>
        {/* Navigation */}
        <nav className="flex gap-1 md:gap-3 items-center">
          {links.map(link => (
            <Link
              key={link.href}
              href={link.href}
              className={`
                flex items-center px-3 py-1.5 rounded-lg transition-all
                ${pathname === link.href
                  ? 'bg-amber-400 text-black shadow font-semibold'
                  : 'text-gray-300 hover:bg-amber-400/20 hover:text-amber-400'}
              `}
            >
              {link.icon}
              {link.label}
            </Link>
          ))}
          {/* Lien VIP/Exclusif */}
          {profile?.is_vip && (
            <Link
              href="/exclusif"
              className="flex items-center px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-400 to-yellow-500 text-black font-semibold shadow hover:scale-105 transition-transform"
            >
              <Sparkles className="w-4 h-4 mr-1" />
              VIP
            </Link>
          )}
          {/* Lien admin */}
          {profile?.role === 'admin' && (
            <Link
              href="/admin"
              className="flex items-center px-3 py-1.5 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold shadow hover:scale-105 transition-transform"
            >
              <Shield className="w-4 h-4 mr-1" />
              Admin
            </Link>
          )}
        </nav>
        {/* Utilisateur */}
        <div className="flex items-center gap-3">
          {user ? (
            <>
              {profile?.avatar_url && (
                <img
                  src={profile.avatar_url}
                  alt="avatar"
                  className="w-8 h-8 rounded-full object-cover border border-amber-400"
                />
              )}
              <span className="text-sm text-gray-300 mr-2">
                {user.email}
              </span>
              <LogoutButton />
            </>
          ) : (
            <Link
              href="/login"
              className="px-4 py-1.5 rounded-lg bg-amber-400 text-black font-semibold hover:bg-amber-500 transition"
            >
              Connexion
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}