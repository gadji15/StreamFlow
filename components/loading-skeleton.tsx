'use client';

import { Loader2 } from 'lucide-react';

export default function LoadingScreen() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh]">
      <Loader2 className="h-16 w-16 animate-spin text-indigo-600" />
      <p className="mt-4 text-lg text-gray-400">Chargement...</p>
    </div>
  );
}