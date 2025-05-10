'use client';

import Link from 'next/link'
import { useCurrentUser } from '../hooks/useCurrentUser'
import LogoutButton from './LogoutButton'
import { useEffect, useState } from 'react'
import { getProfile } from '../lib/supabaseProfiles'
import { Film, Tv, User, Sparkles, LogIn, LogOut, Shield } from 'lucide-react'

export default function Header() {
  const user = useCurrentUser()
  const [profile, setProfile] = useState<any>(null)

  useEffect(() => {
    if (user?.id) {
      getProfile(user.id).then(({ data }) => setProfile(data))
    }
  }, [user])

  return (
    <header className="w-full bg-gradient-to-r from-[#16151b] via-[#191724] to-[#1f212e] border-b border-[#232336] shadow-sm py-2 px-0 flex justify-center items-center z-40">
      <div className="w-full max-w-7xl flex justify-between items-center px-4">
        {/* Logo/brand */}
        <Link href="/" className="flex items-center gap-2 group">
          <Sparkles className="w-6 h-6 text-amber-400 group-hover:rotate-12 transition-transform" />
          <span className="text-xl font-bold text-white tracking-tight group-hover:text-amber-400 transition-colors">StreamFlow</span>
        </Link>
        {/* Main nav */}
        <nav className="flex gap-6 items-center">
          <Link
            href="/films"
            className="flex items-center gap-1 text-gray-300 hover:text-amber-400 transition-colors font-medium"
          >
            <Film className="w-5 h-5" /> Films
          </Link>
          <Link
            href="/series"
            className="flex items-center gap-1 text-gray-300 hover:text-amber-400 transition-colors font-medium"
          >
            <Tv className="w-5 h-5" /> Séries
          </Link>
          <Link
            href="/profil"
            className="flex items-center gap-1 text-gray-300 hover:text-amber-400 transition-colors font-medium"
          >
            <User className="w-5 h-5" /> Profil
          </Link>
          {profile?.role === 'admin' && (
            <Link
              href="/admin"
              className="flex items-center gap-1 text-rose-500 hover:text-rose-400 transition-colors font-bold"
              title="Administration"
            >
              <Shield className="w-5 h-5" /> Admin
            </Link>
          )}
        </nav>
        {/* Auth/User section */}
        <div className="flex items-center gap-3">
          {user ? (
            <>
              {profile?.avatar_url && (
                <img
                  src={profile.avatar_url}
                  alt="avatar"
                  className="w-8 h-8 rounded-full object-cover border border-amber-400"
                  style={{ marginRight: 6 }}
                />
              )}
              <span className="text-sm text-white/80 mr-2">
                <User className="inline-block w-4 h-4 mr-1 text-gray-400" />
                <b>{user.email}</b>
              </span>
              <LogoutButton />
            </>
          ) : (
            <Link
              href="/login"
              className="flex items-center gap-1 px-3 py-1 rounded bg-amber-400 text-black font-semibold hover:bg-amber-300 transition-colors"
            >
              <LogIn className="w-4 h-4" /> Connexion
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}