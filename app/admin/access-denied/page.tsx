'use client';

import Link from 'next/link';
import { ShieldAlert } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AccessDeniedPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#181E29] via-[#09090B] to-[#1C1232] px-4">
      <motion.div
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, type: 'spring' }}
        className="flex flex-col items-center bg-black/80 backdrop-blur-lg rounded-2xl p-10 shadow-2xl w-full max-w-md border border-zinc-800"
      >
        <ShieldAlert className="h-16 w-16 text-red-500 mb-6 animate-bounce" />
        <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-3 tracking-tight text-center drop-shadow-lg">
          Accès refusé
        </h1>
        <p className="text-base text-zinc-300 mb-8 text-center max-w-xs">
          Vous n’avez pas l’autorisation d’accéder à cette page.<br />
          <span className="text-zinc-400">Si vous pensez qu’il s’agit d’une erreur, contactez un administrateur.</span>
        </p>
        <Link
          href="/"
          className="inline-block px-8 py-3 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 text-white font-semibold shadow-lg hover:scale-105 hover:brightness-110 transition-all"
        >
          Retour à l’accueil
        </Link>
      </motion.div>
    </main>
  );
}