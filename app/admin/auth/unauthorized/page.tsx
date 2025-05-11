'use client';

import Link from 'next/link';
import { ShieldAlert, ArrowLeftCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';

export default function AccessDeniedPage() {
  const { userData } = useSupabaseAuth();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#0f172a] via-indigo-900 to-purple-900 px-4">
      <motion.div
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.7, type: 'spring' }}
        className="flex flex-col items-center bg-white/10 backdrop-blur-md rounded-xl p-10 shadow-2xl w-full max-w-md"
      >
        <ShieldAlert className="h-16 w-16 text-red-500 mb-4 animate-bounce" />
        <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-2 tracking-tight">
          Accès refusé
        </h1>
        <p className="text-lg text-gray-300 mb-4 text-center">
          {userData
            ? (
              <>
                Désolé <span className="font-semibold">{userData.displayName || userData.email}</span>,<br />
                vous n’avez pas les droits administrateur pour accéder à cette page.
              </>
            )
            : <>Vous n’êtes pas autorisé à accéder à cette partie du site.</>
          }
        </p>
        <motion.div
          whileHover={{ scale: 1.08, rotate: -3 }}
          transition={{ type: 'spring', stiffness: 300 }}
          className="mb-2"
        >
          <Link href="/" className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-full shadow-lg transition-all">
            <ArrowLeftCircle className="h-5 w-5" />
            Retour à l’accueil
          </Link>
        </motion.div>
        <p className="text-xs text-gray-400 mt-2 italic text-center">
          Si vous pensez qu’il s’agit d’une erreur, contactez un administrateur.
        </p>
      </motion.div>
    </div>
  );
}
